import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { findLocalPlayer, CLUBS, Club } from "./server/db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry user-agent if key is available
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Clean up player names for searching
function normalizeSearchTerm(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// REST API for checking player comparison
app.post("/api/compare", async (req, res) => {
  try {
    const { player1: rawP1, player2: rawP2 } = req.body;

    if (!rawP1 || !rawP2) {
      return res.status(400).json({
        success: false,
        error: "Lütfen iki futbolcu ismi giriniz.",
      });
    }

    const name1 = normalizeSearchTerm(rawP1);
    const name2 = normalizeSearchTerm(rawP2);

    if (name1 === name2) {
      return res.status(400).json({
        success: false,
        error: "Lütfen birbirinden farklı iki futbolcu giriniz.",
      });
    }

    // 1. Try local database lookup first
    const localP1 = findLocalPlayer(name1);
    const localP2 = findLocalPlayer(name2);

    if (localP1 && localP2) {
      // Both found locally. Let's find common teams.
      const commonTeams = localP1.teams.filter((t) => localP2.teams.includes(t));
      if (commonTeams.length > 0) {
        // Find the first common team club details
        const teamName = commonTeams[0];
        const clubDetails = CLUBS[teamName];

        if (clubDetails) {
          const years1 = localP1.activeYears[teamName] || "";
          const years2 = localP2.activeYears[teamName] || "";
          let tenureInfo = "";
          if (years1 && years2) {
            tenureInfo = `${localP1.displayName} bu kulüpte ${years1} yılları arasında, ${localP2.displayName} ise ${years2} yılları arasında forma giymiştir.`;
          } else {
            tenureInfo = `Her iki oyuncu da kariyerlerinde ${clubDetails.name} forması giymişlerdir.`;
          }

          return res.json({
            success: true,
            commonTeam: {
              name: clubDetails.name,
              shortName: clubDetails.shortName,
              primaryColor: clubDetails.primaryColor,
              secondaryColor: clubDetails.secondaryColor,
              textColor: clubDetails.textColor,
              logoEmoji: clubDetails.logoEmoji,
              description: `${localP1.displayName} ve ${localP2.displayName} için ortak takım bulundu! ${tenureInfo} Bu eşleşme yerel spor veritabanımızdan doğrulanmıştır.`,
            },
            player1: {
              name: localP1.displayName,
              teams: localP1.teams,
            },
            player2: {
              name: localP2.displayName,
              teams: localP2.teams,
            },
            source: "local_database",
          });
        }
      }
    }

    // 2. If local database doesn't resolve or find a match, use Gemini as the ultimate fallback database!
    if (!ai) {
      // If AI is not initialized (no key), we must rely only on local DB and return not found.
      const p1Label = localP1 ? localP1.displayName : rawP1;
      const p2Label = localP2 ? localP2.displayName : rawP2;

      return res.json({
        success: false,
        player1: { name: p1Label, teams: localP1?.teams || [] },
        player2: { name: p2Label, teams: localP2?.teams || [] },
        source: "local_database",
        error: `Yerel veritabanında '${p1Label}' ve '${p2Label}' arasında ortak bir kulüp bulunamadı ve Gemini API anahtarı yapılandırılmadığı için gelişmiş arama yapılamıyor.`,
      });
    }

    // Call Gemini API to query football knowledge base
    const prompt = `Sen profesyonel bir futbol tarihçisi ve veri analistisin. 
Sana iki futbolcu ismi veriyorum:
Oyuncu 1: "${rawP1}"
Oyuncu 2: "${rawP2}"

Görevin, bu iki futbolcunun kariyerlerinde ortaklaşa oynadıkları EN AZ BİR PROFESYONEL FUTBOL KULÜBÜ (milli takım hariç, sadece kulüp takımları) olup olmadığını bulmak.
Eğer ortak oynadıkları birden fazla kulüp varsa, en bilinenini seç. 

Aşağıdaki kurallara göre bir JSON çıktısı oluşturmalısın:
1. "success" alanı: Eğer ortak bir kulüp takımı varsa true, yoksa false olmalıdır.
2. "commonTeam" alanı: Eğer ortak takım varsa bu nesne doldurulmalı, yoksa boş veya null olmalıdır.
   - "name": Kulübün tam resmi adı (örn: "Galatasaray SK", "Real Madrid CF")
   - "shortName": Kulübün yaygın kısa adı (örn: "Galatasaray", "Real Madrid", "Chelsea")
   - "primaryColor": Kulübün ana rengi için bir Hex kodu (örn: Galatasaray için "#E30A17", Real Madrid için "#FFFFFF", Barcelona için "#004D98")
   - "secondaryColor": Kulübün ikincil rengi için bir Hex kodu (örn: Galatasaray için "#FDB912", Real Madrid için "#FEBE10", Chelsea için "#EE242C")
   - "textColor": Bu renklerin üzerinde okunabilecek kontrast bir yazı rengi Hex kodu (örn: "#FFFFFF" veya "#000000")
   - "logoEmoji": Bu kulübü simgeleyen bir futbol emojisi veya maskot emojisi (örn: Galatasaray için "🦁", Real Madrid için "👑", Beşiktaş için "🦅", Fenerbahçe için "🐤", genel için "⚽")
   - "description": Türkçe dilinde, iki oyuncunun bu kulüpteki dönemlerini açıklayan, birlikte oynayıp oynamadıklarını veya hangi yıllarda orada olduklarını belirten akıcı ve bilgilendirici bir açıklama yazısı. (Örn: "Cristiano Ronaldo 2009-2018, Karim Benzema ise 2009-2023 yılları arasında Real Madrid forması giymiştir. Birlikte birçok kupa kazanmışlardır.")
3. "player1NormalizedName": Oyuncu 1'in tam doğru yazılmış adı (örn: "Cristiano Ronaldo")
4. "player2NormalizedName": Oyuncu 2'in tam doğru yazılmış adı (örn: "Luka Modrić")
5. "player1Teams": Oyuncu 1'in kariyerinde oynadığı başlıca 4-5 kulübün listesi.
6. "player2Teams": Oyuncu 2'nin kariyerinde oynadığı başlıca 4-5 kulübün listesi.

Lütfen yanıtı sadece JSON formatında döndür.`;

    let response;
    let attempts = 0;
    const maxAttempts = 2;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                success: { type: Type.BOOLEAN },
                commonTeam: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    shortName: { type: Type.STRING },
                    primaryColor: { type: Type.STRING },
                    secondaryColor: { type: Type.STRING },
                    textColor: { type: Type.STRING },
                    logoEmoji: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: [
                    "name",
                    "shortName",
                    "primaryColor",
                    "secondaryColor",
                    "textColor",
                    "logoEmoji",
                    "description",
                  ],
                },
                player1NormalizedName: { type: Type.STRING },
                player2NormalizedName: { type: Type.STRING },
                player1Teams: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                player2Teams: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                "success",
                "player1NormalizedName",
                "player2NormalizedName",
                "player1Teams",
                "player2Teams",
              ],
            },
          },
        });
        break; // Success, break out of loop
      } catch (err: any) {
        lastError = err;
        attempts++;
        if (attempts < maxAttempts) {
          console.warn(`Gemini API attempt ${attempts} failed. Retrying in 1.5s...`, err.message);
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    if (!response) {
      const isUnavailable = lastError?.message?.includes("503") || lastError?.message?.includes("UNAVAILABLE") || lastError?.message?.includes("demand");
      const friendlyMessage = isUnavailable
        ? "Yapay zeka sistemi şu anda çok yoğun olduğundan isteğe yanıt veremedi. Lütfen birkaç saniye bekleyip tekrar deneyiniz."
        : `Yapay zeka sorgusu başarısız oldu: ${lastError?.message || "Bilinmeyen hata"}`;
      
      return res.status(503).json({
        success: false,
        error: friendlyMessage,
      });
    }

    const resultText = response.text?.trim() || "{}";
    const aiResult = JSON.parse(resultText);

    if (aiResult.success && aiResult.commonTeam) {
      return res.json({
        success: true,
        commonTeam: aiResult.commonTeam,
        player1: {
          name: aiResult.player1NormalizedName,
          teams: aiResult.player1Teams,
        },
        player2: {
          name: aiResult.player2NormalizedName,
          teams: aiResult.player2Teams,
        },
        source: "ai_search",
      });
    } else {
      return res.json({
        success: false,
        player1: {
          name: aiResult.player1NormalizedName || rawP1,
          teams: aiResult.player1Teams || [],
        },
        player2: {
          name: aiResult.player2NormalizedName || rawP2,
          teams: aiResult.player2Teams || [],
        },
        source: "ai_search",
        error: `${aiResult.player1NormalizedName || rawP1} ve ${
          aiResult.player2NormalizedName || rawP2
        } oyuncularının kariyerinde ortak oynadıkları bir profesyonel kulüp takımı bulunamadı.`,
      });
    }
  } catch (error: any) {
    console.error("Comparison error:", error);
    return res.status(500).json({
      success: false,
      error: "Sunucuda karşılaştırma yapılırken bir hata oluştu: " + error.message,
    });
  }
});

// Serve frontend assets
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
