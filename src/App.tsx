import { useState, FormEvent, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@supabase/supabase-js";
import {
  User,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Search,
  CheckCircle2,
  Trophy,
  Copy,
  Check,
  Github,
  Swords,
  Users,
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
  p_club_name?: string; // Optional for club comparison
}

interface PlayerComparisonResult {
  success: boolean;
  clubs: SupabaseClub[];
  player1: string;
  player2: string;
}

interface ClubComparisonResult {
  success: boolean;
  players: SupabasePlayer[];
  club1: string;
  club2: string;
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
        "Supabase connection could not be established."
      );
    }
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

// Veritabanından gelen "İsim (ID)" formatındaki sondaki parantezi temizler
function stripId(name: string) {
  if (!name) return "";
  return name.replace(/\s*\(\d+\)\s*$/, "").trim();
}

function getInitials(name: string) {
  if (!name) return "?";
  const clean = stripId(name);
  const parts = clean.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
}

// Birden fazla oyuncunun son kulübünü toplu çeker (autocomplete için)
async function fetchLatestClubsForPlayers(playerIds: number[]): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  if (playerIds.length === 0) return result;

  try {
    const supabase = getSupabase();

    const promises = playerIds.map(async (pid) => {
      const { data, error } = await supabase.rpc("get_player_clubs", {
        p_id: pid,
      });
      if (!error && data && data.length > 0) {
        const latestClub = stripId(data[0].club_name);
        if (latestClub) result.set(pid, latestClub);
      }
    });

    await Promise.all(promises);
  } catch (err) {
    // Hata olursa sessizce boş dön
  }

  return result;
}

// Bir oyuncunun tüm geçmiş kulüplerini çeker (sonuç ekranı için)
async function fetchPlayerAllClubs(playerId: number): Promise<string[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("get_player_clubs", {
      p_id: playerId,
    });
    if (!error && data && data.length > 0) {
      return data.map((c: any) => stripId(c.club_name)).filter(Boolean);
    }
    return [];
  } catch (err) {
    return [];
  }
}

// Autocomplete for Players
function PlayerAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onSelectPlayer,
  disabled,
  isConfigured,
  onErrorClear
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSelectPlayer: (id: number, name: string) => void;
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
        if (!error && data && data.length > 0) {
          const playerIds = data.map((p: SupabasePlayer) => p.p_id);
          const clubMap = await fetchLatestClubsForPlayers(playerIds);
          const enriched = data.map((p: SupabasePlayer) => ({
            ...p,
            p_club_name: clubMap.get(p.p_id) || ""
          }));
          setResults(enriched);
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
    setQuery(stripId(player.p_name));
    onChange(stripId(player.p_name));
    onSelectPlayer(player.p_id, stripId(player.p_name));
    setIsOpen(false);
    onErrorClear();
  };

  return (
    <div className="w-full md:flex-1 space-y-2 min-w-0 relative" ref={wrapperRef}>
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
                Searching...
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
                      <p className="text-sm font-semibold text-neutral-200 truncate">{stripId(player.p_name)}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{stripId(player.p_club_name) || "No club info"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-xs text-neutral-500">
                No results found.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Autocomplete for Clubs
function ClubAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onSelectClub,
  disabled,
  isConfigured,
  onErrorClear
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSelectClub: (id: number, name: string) => void;
  disabled: boolean;
  isConfigured: boolean;
  onErrorClear: () => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SupabaseClub[]>([]);
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
        const { data, error } = await supabase
          .from('team_details')
          .select('club_id, club_name, logo_url')
          .ilike('club_name', `%${searchTerm}%`)
          .limit(10);

        if (error) {
          console.error("Kulüp arama hatası:", error.message);
          setResults([]);
        } else {
          setResults(data || []);
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

  const handleSelect = (club: SupabaseClub) => {
    setQuery(stripId(club.club_name));
    onChange(stripId(club.club_name));
    onSelectClub(club.club_id, stripId(club.club_name));
    setIsOpen(false);
    onErrorClear();
  };

  return (
    <div className="w-full md:flex-1 space-y-2 min-w-0 relative" ref={wrapperRef}>
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
                Searching...
              </div>
            ) : results.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                {results.map((club) => (
                  <li
                    key={club.club_id}
                    onClick={() => handleSelect(club)}
                    className="flex items-center gap-3 p-3 hover:bg-neutral-800/80 cursor-pointer transition-colors border-b border-neutral-800/50 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-500">
                      {club.logo_url ? (
                        <img src={club.logo_url} alt={club.club_name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Trophy className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-neutral-200 truncate">{stripId(club.club_name)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-xs text-neutral-500">
                No results found.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Shared Avatar state logic
function getAvatarState(isLoading: boolean, success: boolean, hasItems: boolean, errorMsg: string | null) {
  if (isLoading) {
    return {
      bg: "bg-indigo-950/20",
      borderColor: "#6366f1", // indigo-500
      textColor: "#6366f1",
      iconType: "loading",
      pulse: true,
    };
  }
  if (success && hasItems) {
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
}

// ----------------------------------------------------------------------
// Player Comparison Component
// ----------------------------------------------------------------------
function PlayerComparisonTab() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);
  const [commonClubs, setCommonClubs] = useState<SupabaseClub[]>([]);
  const [player1History, setPlayer1History] = useState<string[]>([]);
  const [player2History, setPlayer2History] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PlayerComparisonResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCompare = async (e: FormEvent) => {
    e.preventDefault();
    if (!player1Id || !player2Id) {
      setErrorMsg("Please select both players from the dropdown list.");
      return;
    }
    if (player1Id === player2Id) {
      setErrorMsg("Please select two different players.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setCommonClubs([]);
    setPlayer1History([]);
    setPlayer2History([]);

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("get_common_clubs", {
        p1_id: parseInt(String(player1Id)),
        p2_id: parseInt(String(player2Id)),
      });

      if (error) throw error;

      const clubsList = (data || []) as SupabaseClub[];
      setCommonClubs(clubsList);

      const [p1Clubs, p2Clubs] = await Promise.all([
        fetchPlayerAllClubs(player1Id!),
        fetchPlayerAllClubs(player2Id!)
      ]);
      setPlayer1History(p1Clubs);
      setPlayer2History(p2Clubs);

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
        setErrorMsg("No common clubs found between these two players.");
      }
    } catch (error: any) {
      setErrorMsg(
        error.message || "An error occurred during database query. Please check your connection and environment variables."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlayer1("");
    setPlayer2("");
    setPlayer1Id(null);
    setPlayer2Id(null);
    setCommonClubs([]);
    setPlayer1History([]);
    setPlayer2History([]);
    setResult(null);
    setErrorMsg(null);
    setIsLoading(false);
  };

  const avatar = getAvatarState(isLoading, !!result?.success, result?.clubs?.length ? result.clubs.length > 0 : false, errorMsg);

  return (
    <>
      <form onSubmit={handleCompare} className="flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-3 w-full mb-6">
          <PlayerAutocomplete
            label="Player 1"
            placeholder="Cristiano Ronaldo"
            value={player1}
            onChange={(val) => { setPlayer1(val); setPlayer1Id(null); }}
            onSelectPlayer={(id, name) => { setPlayer1(name); setPlayer1Id(id); }}
            disabled={isLoading}
            isConfigured={isSupabaseConfigured}
            onErrorClear={() => { if (errorMsg) setErrorMsg(null); }}
          />

          <div className="flex flex-col items-center justify-center shrink-0 my-1 md:my-0 md:mb-0.5 relative z-0">
            <motion.div
              layout
              animate={isLoading ? { scale: [1, 1.05, 1] } : {}}
              transition={isLoading ? { repeat: Infinity, duration: 1.5 } : {}}
              className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border border-neutral-800 shadow-lg transition-all duration-300 ${avatar.bg}`}
              style={{ borderColor: avatar.borderColor }}
            >
              {avatar.iconType === "loading" && (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Swords className="w-5 h-5 text-indigo-400" />
                </motion.div>
              )}
              {avatar.iconType === "match" && <Trophy className="w-5 h-5 text-indigo-400" />}
              {avatar.iconType === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
              {avatar.iconType === "default" && <Swords className="w-5 h-5 text-indigo-400/80" />}
              {avatar.pulse && <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />}
            </motion.div>
          </div>

          <PlayerAutocomplete
            label="Player 2"
            placeholder="Karim Benzema"
            value={player2}
            onChange={(val) => { setPlayer2(val); setPlayer2Id(null); }}
            onSelectPlayer={(id, name) => { setPlayer2(name); setPlayer2Id(id); }}
            disabled={isLoading}
            isConfigured={isSupabaseConfigured}
            onErrorClear={() => { if (errorMsg) setErrorMsg(null); }}
          />
        </div>

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
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Query Error</h4>
                <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          </motion.div>
        )}

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
                <AlertCircle className="w-5 h-5 text-neutral-500" />
                <span className="text-base font-semibold tracking-wide">Configuration Required</span>
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
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Common Club Found
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-400 mt-2">
                    {result.clubs.length} Common Club{result.clubs.length > 1 ? "s" : ""} Matched
                  </h2>
                </div>

                <div className="flex flex-col items-center justify-center gap-6 py-4">
                  {result.clubs.map((club, i) => (
                    <div key={club.club_id || i} className="flex flex-col items-center justify-center gap-2 group">
                      <div className="w-20 h-20 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                        {club.logo_url ? (
                          <img src={club.logo_url} alt={stripId(club.club_name)} className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.25)]" />
                        ) : (
                          <Trophy className="w-12 h-12 text-indigo-400" />
                        )}
                      </div>
                      <h3 className="font-bold text-white text-lg md:text-xl tracking-wide mt-1 text-center">
                        {stripId(club.club_name)}
                      </h3>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg text-center relative group/p1">
                    <p className="text-[11px] text-neutral-500 uppercase font-bold">Player 1</p>
                    <p className="font-semibold text-neutral-200 mt-1 text-sm md:text-base truncate cursor-pointer">{stripId(result.player1)}</p>
                    {player1History.length > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/p1:block z-50 pointer-events-none">
                        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 shadow-2xl min-w-[180px] max-w-[240px]">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Club History</p>
                          <div className="space-y-1">
                            {player1History.map((club, i) => (
                              <p key={i} className="text-xs text-neutral-300 truncate">• {club}</p>
                            ))}
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-neutral-800 border-r border-b border-neutral-700 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                      </div>
                    )}
                  </div>
                  <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg text-center relative group/p2">
                    <p className="text-[11px] text-neutral-500 uppercase font-bold">Player 2</p>
                    <p className="font-semibold text-neutral-200 mt-1 text-sm md:text-base truncate cursor-pointer">{stripId(result.player2)}</p>
                    {player2History.length > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/p2:block z-50 pointer-events-none">
                        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 shadow-2xl min-w-[180px] max-w-[240px]">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Club History</p>
                          <div className="space-y-1">
                            {player2History.map((club, i) => (
                              <p key={i} className="text-xs text-neutral-300 truncate">• {club}</p>
                            ))}
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-neutral-800 border-r border-b border-neutral-700 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-bold text-red-400">No Common Clubs Found</h4>
                    <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
                      {errorMsg || "No common club found between these two players."}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg">
                    <p className="text-[11px] text-neutral-500 font-bold uppercase text-center mb-2">{stripId(result.player1)}</p>
                    <div className="border-t border-neutral-800/50 pt-2 space-y-1">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Club History</p>
                      {player1History.length > 0 ? (
                        player1History.map((club, i) => <p key={i} className="text-xs text-neutral-400 truncate">• {club}</p>)
                      ) : (
                        <p className="text-xs text-neutral-600 italic">No data found</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg">
                    <p className="text-[11px] text-neutral-500 font-bold uppercase text-center mb-2">{stripId(result.player2)}</p>
                    <div className="border-t border-neutral-800/50 pt-2 space-y-1">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Club History</p>
                      {player2History.length > 0 ? (
                        player2History.map((club, i) => <p key={i} className="text-xs text-neutral-400 truncate">• {club}</p>)
                      ) : (
                        <p className="text-xs text-neutral-600 italic">No data found</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 px-5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold text-sm rounded-xl flex items-center justify-center gap-2 border border-neutral-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Match Again</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ----------------------------------------------------------------------
// Club Comparison Component
// ----------------------------------------------------------------------
function ClubComparisonTab() {
  const [club1, setClub1] = useState("");
  const [club2, setClub2] = useState("");
  const [club1Id, setClub1Id] = useState<number | null>(null);
  const [club2Id, setClub2Id] = useState<number | null>(null);
  const [commonPlayers, setCommonPlayers] = useState<SupabasePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClubComparisonResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [playerHistories, setPlayerHistories] = useState<Record<number, string[]>>({});
  const [expandedPlayerId, setExpandedPlayerId] = useState<number | null>(null);

  const handleCompare = async (e: FormEvent) => {
    e.preventDefault();
    if (!club1Id || !club2Id) {
      setErrorMsg("Please select both clubs from the dropdown list.");
      return;
    }
    if (club1Id === club2Id) {
      setErrorMsg("Please select two different clubs.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setCommonPlayers([]);

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("get_mutual_players_between_clubs", {
        c1_id: parseInt(String(club1Id), 10),
        c2_id: parseInt(String(club2Id), 10),
      });

      if (error) throw error;

      const playersList = (data || []) as SupabasePlayer[];
      setCommonPlayers(playersList);

      if (playersList.length > 0) {
        setResult({
          success: true,
          players: playersList,
          club1: club1.trim(),
          club2: club2.trim(),
        });
        
        Promise.all(
          playersList.map(async (p) => {
            const pId = p.p_id || (p as any).player_id || (p as any).id;
            if (!pId) return { id: null, history: [] };
            const history = await fetchPlayerAllClubs(pId);
            return { id: pId, history };
          })
        ).then(results => {
          const historiesMap: Record<number, string[]> = {};
          results.forEach(res => {
            if (res.id !== null) {
              historiesMap[res.id] = res.history;
            }
          });
          setPlayerHistories(historiesMap);
        });
      } else {
        setResult({
          success: false,
          players: [],
          club1: club1.trim(),
          club2: club2.trim(),
        });
        setErrorMsg("No common players found between these two clubs.");
      }
    } catch (error: any) {
      setErrorMsg(
        error.message || "An error occurred during database query. Please check your connection and ensure 'get_common_players' RPC exists."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setClub1("");
    setClub2("");
    setClub1Id(null);
    setClub2Id(null);
    setCommonPlayers([]);
    setResult(null);
    setErrorMsg(null);
    setIsLoading(false);
    setPlayerHistories({});
    setExpandedPlayerId(null);
  };

  const avatar = getAvatarState(isLoading, !!result?.success, result?.players?.length ? result.players.length > 0 : false, errorMsg);

  return (
    <>
      <form onSubmit={handleCompare} className="flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-3 w-full mb-6">
          <ClubAutocomplete
            label="Club 1"
            placeholder="Real Madrid"
            value={club1}
            onChange={(val) => { setClub1(val); setClub1Id(null); }}
            onSelectClub={(id, name) => { setClub1(name); setClub1Id(id); }}
            disabled={isLoading}
            isConfigured={isSupabaseConfigured}
            onErrorClear={() => { if (errorMsg) setErrorMsg(null); }}
          />

          <div className="flex flex-col items-center justify-center shrink-0 my-1 md:my-0 md:mb-0.5 relative z-0">
            <motion.div
              layout
              animate={isLoading ? { scale: [1, 1.05, 1] } : {}}
              transition={isLoading ? { repeat: Infinity, duration: 1.5 } : {}}
              className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border border-neutral-800 shadow-lg transition-all duration-300 ${avatar.bg}`}
              style={{ borderColor: avatar.borderColor }}
            >
              {avatar.iconType === "loading" && (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Users className="w-5 h-5 text-indigo-400" />
                </motion.div>
              )}
              {avatar.iconType === "match" && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
              {avatar.iconType === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
              {avatar.iconType === "default" && <Users className="w-5 h-5 text-indigo-400/80" />}
              {avatar.pulse && <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />}
            </motion.div>
          </div>

          <ClubAutocomplete
            label="Club 2"
            placeholder="Manchester United"
            value={club2}
            onChange={(val) => { setClub2(val); setClub2Id(null); }}
            onSelectClub={(id, name) => { setClub2(name); setClub2Id(id); }}
            disabled={isLoading}
            isConfigured={isSupabaseConfigured}
            onErrorClear={() => { if (errorMsg) setErrorMsg(null); }}
          />
        </div>

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
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Query Error</h4>
                <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          </motion.div>
        )}

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
                <AlertCircle className="w-5 h-5 text-neutral-500" />
                <span className="text-base font-semibold tracking-wide">Configuration Required</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span className="text-base font-semibold tracking-wide">Find Players</span>
              </>
            )}
          </button>
        )}
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 pt-6 border-t border-neutral-900 space-y-5"
          >
            {result.success && result.players && result.players.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Players Found
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-400 mt-2">
                    {result.players.length} Common Player{result.players.length > 1 ? "s" : ""} Matched
                  </h2>
                </div>

                <div className="flex flex-col gap-1 py-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {result.players.map((player, i) => {
                    // Fallback for different column names that the RPC might return
                    const rawName = player.p_name || (player as any).player_name || (player as any).name || (player as any).fullname || Object.values(player).find(v => typeof v === 'string');
                    const displayName = rawName ? stripId(String(rawName)) : "İsimsiz Oyuncu";
                    const pId = player.p_id || (player as any).player_id || (player as any).id;
                    const history = pId ? playerHistories[pId] : [];
                    const isExpanded = expandedPlayerId === pId;
                    
                    return (
                      <div 
                        key={pId || i} 
                        className="group/player flex flex-col px-3 py-2 hover:bg-neutral-800/40 rounded-xl transition-colors border border-transparent hover:border-neutral-700/50 cursor-pointer"
                        onClick={() => setExpandedPlayerId(isExpanded ? null : pId)}
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-indigo-500/50 group-hover/player:text-indigo-400 transition-colors" />
                          <span className="text-neutral-300 text-sm md:text-base cursor-pointer flex-1 font-medium group-hover/player:text-white transition-colors">
                            {displayName}
                          </span>
                        </div>
                        
                        {history && history.length > 0 && (
                          <div className={`${isExpanded ? 'block' : 'hidden'} mt-2 pt-2 border-t border-neutral-700/50`}>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5 px-1">Club History</p>
                            <div className="flex flex-wrap gap-1.5 px-1">
                              {history.map((club, idx) => (
                                <span key={idx} className="text-[11px] text-neutral-300 bg-neutral-900/80 px-2 py-0.5 rounded-md border border-neutral-800">
                                  {club}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg text-center">
                    <p className="text-[11px] text-neutral-500 uppercase font-bold">Club 1</p>
                    <p className="font-semibold text-neutral-200 mt-1 text-sm md:text-base truncate">{stripId(result.club1)}</p>
                  </div>
                  <div className="bg-neutral-900/20 border border-neutral-850 p-3 rounded-lg text-center">
                    <p className="text-[11px] text-neutral-500 uppercase font-bold">Club 2</p>
                    <p className="font-semibold text-neutral-200 mt-1 text-sm md:text-base truncate">{stripId(result.club2)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-bold text-red-400">No Common Players Found</h4>
                    <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
                      {errorMsg || "No common players found between these two clubs."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 px-5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold text-sm rounded-xl flex items-center justify-center gap-2 border border-neutral-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Match Again</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ----------------------------------------------------------------------
// Main Application Wrapper
// ----------------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState<'players' | 'clubs'>('players');

  return (
    <div className="min-h-screen bg-[#070708] text-neutral-100 flex flex-col items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-md md:max-w-xl flex flex-col items-stretch">
        
        {/* Simple Interface Card containing all elements */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-visible">
          
          {/* Subtle background gradient glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-20 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

          {/* Brand / Title Header inside the frame */}
          <header className="text-center mb-6 border-b border-neutral-900 pb-6">
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
              football matching system
            </p>
          </header>

          {/* Tab Navigation */}
          <div className="flex bg-neutral-900/60 p-1 rounded-xl mb-6 relative">
            <button
              onClick={() => setActiveTab('players')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${
                activeTab === 'players' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Compare Players
            </button>
            <button
              onClick={() => setActiveTab('clubs')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${
                activeTab === 'clubs' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Compare Clubs
            </button>
            {/* Sliding background indicator */}
            <motion.div
              layoutId="activeTabBackground"
              initial={false}
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-neutral-800 rounded-lg shadow-sm border border-neutral-700/50"
              animate={{
                left: activeTab === 'players' ? '4px' : 'calc(50% + 2px)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'players' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'players' ? 10 : -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'players' ? <PlayerComparisonTab /> : <ClubComparisonTab />}
            </motion.div>
          </AnimatePresence>

          {/* Developer Link */}
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

        </div>
      </div>
    </div>
  );
}
