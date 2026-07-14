import { useState, FormEvent, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@supabase/supabase-js";
import {
  User,
  Shield,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Search,
  CheckCircle2,
  Trophy,
  Copy,
  Check,
  Github,
} from "lucide-react";

interface SupabaseClub {
  club_id: number;
  club_name: string;
  logo_url: string;
}

interface SupabasePlayer {
  p_id: number;
  p_name: string;
  p_image_url: string;
  p_club_name: string;
}

interface ComparisonResult {
  success: boolean;
  clubs: SupabaseClub[];
  player1: string;
  player2: string;
}

// Lazy initialize Supabase to prevent startup crashes if variables are missing
let supabaseClient: any = null;

const isSupabaseConfigured = !!(
  (import.meta as any).env.VITE_SUPABASE_URL &&
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY
);

function getSupabase() {
  if (!supabaseClient) {
    const url = (import.meta as any).env.VITE_SUPABASE_URL;
    const anonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "Supabase bağlantısı kurulamadı."
      );
    }
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function PlayerAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  isConfigured,
  onErrorClear
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  isConfigured: boolean;
  onErrorClear: () => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SupabasePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !isConfigured) return;
    const handler = setTimeout(async () => {
      const searchTerm = query.trim();
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.rpc("search_players", {
          search_term: searchTerm
        });
        if (!error && data) {
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query, isOpen, isConfigured]);

  const handleSelect = (player: SupabasePlayer) => {
    setQuery(player.p_name);
    onChange(player.p_name);
    setIsOpen(false);
    onErrorClear();
  };

  return (
    <div className="flex-1 space-y-2 min-w-0 relative" ref={wrapperRef}>
      <label className="text-xs font-bold text-neutral-500 tracking-wider uppercase block truncate">
        {label}
      </label>
      <input
        type="text"
        required
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
          onErrorClear();
        }}
        className="w-full px-4 py-3 bg-neutral-900/40 border border-neutral-800/80 rounded-xl text-white placeholder-neutral-600 text-sm md:text-base focus:outline-none focus:border-indigo-500 focus:bg-neutral-900/80 transition-all duration-300 shadow-inner relative z-20"
      />
      
      <AnimatePresence>
        {isOpen && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute left-0 right-0 top-[100%] mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-30 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-4 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                <div className="animate-spin h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full" />
                Aranıyor...
              </div>
            ) : results.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                {results.map((player) => (
                  <li
                    key={player.p_id}
                    onClick={() => handleSelect(player)}
                    className="flex items-center gap-3 p-3 hover:bg-neutral-800/80 cursor-pointer transition-colors border-b border-neutral-800/50 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-500">
                      {player.p_image_url ? (
                        <img src={player.p_image_url} alt={player.p_name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(player.p_name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-neutral-200 truncate">{player.p_name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{player.p_club_name || "Kulüp bilgisi yok"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-xs text-neutral-500">
                Sonuç bulunamadı.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCompare = async (e: FormEvent) => {
    e.preventDefault();
    if (!player1.trim() || !player2.trim()) {
      setErrorMsg("Lütfen her iki futbolcunun adını da giriniz.");
      return;
    }

    if (player1.trim().toLowerCase() === player2.trim().toLowerCase()) {
      setErrorMsg("Lütfen iki farklı futbolcu ismi giriniz.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const supabase = getSupabase();
      
      // Call the RPC function 'get_common_clubs'
      const { data, error } = await supabase.rpc("get_common_clubs", {
        p1_name_input: player1.trim(),
        p2_name_input: player2.trim(),
      });

      if (error) {
        throw error;
      }

      const clubsList = (data || []) as SupabaseClub[];

      if (clubsList.length > 0) {
        setResult({
          success: true,
          clubs: clubsList,
          player1: player1.trim(),
          player2: player2.trim(),
        });
      } else {
        setResult({
          success: false,
          clubs: [],
          player1: player1.trim(),
          player2: player2.trim(),
        });
        setErrorMsg("Bu iki oyuncunun ortak oynadığı takım bulunamadı");
      }
    } catch (error: any) {
      console.error("Supabase RPC hatası:", error);
      setErrorMsg(
        error.message || "Veritabanından sorgulama yapılırken bir hata oluştu. Lütfen bağlantılarınızı ve ortam değişkenlerinizi kontrol edin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlayer1("");
    setPlayer2("");
    setResult(null);
    setErrorMsg(null);
    setIsLoading(false);
  };

  // Determine current active team colors or state for the middle avatar
  const getAvatarState = () => {
    if (isLoading) {
      return {
        bg: "bg-indigo-950/20",
        borderColor: "#6366f1", // indigo-500
        textColor: "#6366f1",
        iconType: "loading",
        pulse: true,
      };
    }
    if (result && result.success && result.clubs && result.clubs.length > 0) {
      return {
        bg: "bg-indigo-950/40",
        borderColor: "#6366f1",
        textColor: "#6366f1",
        iconType: "match",
        pulse: false,
      };
    }
    if (errorMsg) {
      return {
        bg: "bg-red-950/40",
        borderColor: "#ef4444", // red
        textColor: "#ef4444",
        iconType: "error",
        pulse: false,
      };
    }
    return {
      bg: "bg-neutral-900/40",
      borderColor: "#262626",
      textColor: "#6366f1",
      iconType: "default",
      pulse: false,
    };
  };

  const avatar = getAvatarState();

  return (
    <div className="min-h-screen bg-[#070708] text-neutral-100 flex flex-col items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-md md:max-w-xl flex flex-col items-stretch">
        
        {/* Simple Interface Card containing all elements */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Subtle background gradient glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-20 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Brand / Title Header inside the frame */}
          <header className="text-center mb-8 border-b border-neutral-900 pb-6">
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-2"
            >
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
                Match
              </span>
              <span className="text-neutral-400">Them</span>
            </motion.h1>
            <p className="text-xs md:text-sm text-neutral-500 mt-2 font-bold tracking-widest uppercase">
              football players matching system
            </p>
          </header>

          <form onSubmit={handleCompare} className="flex flex-col items-center">
            
            <div className="flex items-end gap-3 w-full mb-6">
              {/* Input 1 - Player 1 */}
              <PlayerAutocomplete
                label="1. Oyuncu"
                placeholder="Cristiano Ronaldo"
                value={player1}
                onChange={setPlayer1}
                disabled={isLoading}
                isConfigured={isSupabaseConfigured}
                onErrorClear={() => { if (errorMsg) setErrorMsg(null); }}
              />

              {/* Central Avatar Emblem */}
              <div className="flex flex-col items-center justify-center shrink-0 mb-0.5 relative z-0">
                <motion.div
                  layout
                  animate={isLoading ? { scale: [1, 1.05, 1] } : {}}
                  transition={isLoading ? { repeat: Infinity, duration: 1.5 } : {}}
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border border-neutral-800 shadow-lg transition-all duration-300 ${avatar.bg}`}
                  style={{
                    borderColor: avatar.borderColor,
                  }}
                >
                  {avatar.iconType === "loading" && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    >
                      <Shield className="w-5 h-5 text-indigo-400" />
                    </motion.div>
                  )}
                  {avatar.iconType === "match" && (
                    <Trophy className="w-5 h-5 text-indigo-400" />
                  )}
                  {avatar.iconType === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {avatar.iconType === "default" && (
                    <Shield className="w-5 h-5 text-indigo-400/80" />
                  )}

                  {avatar.pulse && (
                    <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
                  )}
                </motion.div>
              </div>

              {/* Input 2 - Player 2 */}
              <PlayerAutocomplete
                label="2. Oyuncu"
                placeholder="Karim Benzema"
                value={player2}
                onChange={setPlayer2}
                disabled={isLoading}
                isConfigured={isSupabaseConfigured}
                onErrorClear={() => { if (errorMsg) setErrorMsg(null); }}
              />
            </div>

            {/* Error Message for general/validation/API errors when there is no result object */}
            {errorMsg && !result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mb-5 overflow-hidden"
              >
                <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Sorgulama Hatası</h4>
                    <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
                      {errorMsg}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}


            {/* Bottom Button */}
            {!result && (
              <button
                type="submit"
                disabled={isLoading || !isSupabaseConfigured}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-neutral-800 disabled:to-neutral-900 disabled:text-neutral-500 text-white font-bold text-base rounded-xl transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/30 active:scale-[0.99] border border-indigo-500/20 disabled:border-neutral-800"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    <span className="text-base font-semibold tracking-wide">Matching...</span>
                  </>
                ) : !isSupabaseConfigured ? (
                  <>
                    <Shield className="w-5 h-5 text-neutral-500" />
                    <span className="text-base font-semibold tracking-wide">Yapılandırma Gerekli</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span className="text-base font-semibold tracking-wide">Try Matching</span>
                  </>
                )}
              </button>
            )}
          </form>

          {/* Developer Link */}
          {!result && !isLoading && (
            <div className="mt-8 text-center flex justify-center relative z-10">
              <a
                href="https://github.com/s0l0n3t"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800/80 hover:border-indigo-500/30 text-neutral-400 hover:text-white transition-all duration-300 text-xs font-medium cursor-pointer shadow-sm"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
                <span>@s0l0n3t</span>
              </a>
            </div>
          )}

          {/* Result Block & Feedback Screens */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 pt-6 border-t border-neutral-900 space-y-5"
              >
                {result.success && result.clubs && result.clubs.length > 0 ? (
                  // Success State
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" /> Ortak Takım Bulundu
                      </div>
                      <h2 className="text-lg font-semibold text-neutral-400 mt-2">
                        {result.clubs.length} Ortak Kulüp Eşleşti
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.clubs.map((club, i) => (
                        <div
                          key={club.club_id || i}
                          className="bg-neutral-900/50 border border-neutral-800/80 p-4 rounded-xl flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300 shadow-md group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-white/5 border border-neutral-800/50 flex items-center justify-center shrink-0 overflow-hidden p-1 group-hover:border-indigo-500/30 transition-all duration-300">
                            {club.logo_url ? (
                              <img src={club.logo_url} alt={club.club_name} className="w-full h-full object-contain" />
                            ) : (
                              <Trophy className="w-6 h-6 text-neutral-500" />
                            )}
                          </div>
                          <div className="text-left overflow-hidden">
                            <h3 className="font-bold text-white text-sm md:text-base truncate" title={club.club_name}>
                              {club.club_name}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg text-center">
                        <p className="text-[11px] text-neutral-500 uppercase font-bold">1. Oyuncu</p>
                        <p className="font-semibold text-neutral-200 mt-1 text-sm md:text-base truncate">{result.player1}</p>
                      </div>
                      <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg text-center">
                        <p className="text-[11px] text-neutral-500 uppercase font-bold">2. Oyuncu</p>
                        <p className="font-semibold text-neutral-200 mt-1 text-sm md:text-base truncate">{result.player2}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // No Match / Error State
                  <div className="space-y-4">
                    <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-left">
                        <h4 className="text-sm font-bold text-red-400">Ortak Takım Bulunamadı</h4>
                        <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
                          {errorMsg || "Bu iki oyuncunun ortak oynadığı takım bulunamadı"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg text-center">
                        <p className="text-[11px] text-neutral-500 font-bold uppercase">{result.player1}</p>
                        <p className="text-xs text-neutral-400 mt-1">Takım bulunamadı</p>
                      </div>
                      <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg text-center">
                        <p className="text-[11px] text-neutral-500 font-bold uppercase">{result.player2}</p>
                        <p className="text-xs text-neutral-400 mt-1">Takım bulunamadı</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset Trigger */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 px-5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold text-sm rounded-xl flex items-center justify-center gap-2 border border-neutral-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Yeni Kıyaslama Yap</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
