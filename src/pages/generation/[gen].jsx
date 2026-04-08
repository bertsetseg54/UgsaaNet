"use client";
import { useState, useEffect, useMemo } from "react"; // useMemo нэмэв
import { useParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  ArrowLeft,
  Users,
  SearchX,
  Sparkles,
  Loader2,
  Fingerprint,
  Search,
} from "lucide-react";
import Link from "next/link";
import ProfileCard from "../components/ProfileCard";

export default function GenerationPage() {
  const router = useRouter();
  const params = useParams();
  const gen = params?.gen;
  const [searchQuery, setSearchQuery] = useState("");

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const INITIAL_DISPLAY_COUNT = 10;

  useEffect(() => {
    if (!gen) return;
    const fetchGenProfiles = async () => {
      try {
        setLoading(true);
        const stored = localStorage.getItem("user_data");
        const user = stored ? JSON.parse(stored) : {};
        
        const url = user.familyId
          ? `/api/persons?familyId=${encodeURIComponent(user.familyId)}`
          : "/api/persons";
          
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          const filtered = data.data.filter(
            (p) => Number(p.generation) === Number(gen)
          );
          filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          setProfiles(filtered);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGenProfiles();
  }, [gen]);

  // Хайлтаар шүүх хэсэг
  const filteredBySearch = useMemo(() => {
    return profiles.filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profiles, searchQuery]);

  // Шүүгдсэн илэрцээс харуулах тоог тооцох
  const displayedProfiles = isExpanded
    ? filteredBySearch
    : filteredBySearch.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-16 flex items-center gap-4">
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
                <Fingerprint size={18} strokeWidth={2.5} />
              </div>
              <div className="hidden md:flex flex-col leading-none font-bold uppercase text-[10px]">
                <span className="text-slate-700">Угсаа</span>
                <span className="text-amber-500">Нет</span>
              </div>
            </Link>
          </div>

          <div className="flex-1 flex justify-center max-w-md mx-auto">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Хайх..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 rounded-xl py-2 pl-9 pr-4 text-[11px] font-bold outline-none focus:bg-white border border-transparent focus:border-amber-200 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <h1 className="text-[12px] font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                {gen === "1" ? "Тэргүүн үе" : `${gen}-р үе`}
              </h1>
              <div className="flex items-center justify-end gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {filteredBySearch.length} гишүүн
                </span>
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 shrink-0">
              <span className="text-lg font-black text-white font-mono">{gen}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-3 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
              <Loader2 className="absolute text-amber-500 animate-pulse" size={16} />
            </div>
            <p className="mt-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] ml-[0.5em]">
              Уншиж байна
            </p>
          </div>
        ) : filteredBySearch.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-2 w-full">
              {displayedProfiles.map((profile) => (
                <div key={profile._id} className="w-full">
                  <ProfileCard profile={profile} profiles={profiles} />
                </div>
              ))}
            </div>
            {filteredBySearch.length > INITIAL_DISPLAY_COUNT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-20 group flex items-center gap-3 px-8 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-amber-300 hover:bg-amber-50 transition-all"
              >
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                  {isExpanded
                    ? "Хурааж харах"
                    : `Бүх хүнийг харах (${filteredBySearch.length})`}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </button>
            )}
          </div>
        ) : (
          /* Empty State - Хайлтаар юу ч олдоогүй үед */
          <div className="max-w-sm mx-auto flex flex-col items-center justify-center py-16 px-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center mt-10">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
              <SearchX size={32} className="text-slate-200" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg">Илэрц олдсонгүй</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              "{searchQuery}" нэртэй гишүүн олдсонгүй. Өөрөөр хайж үзнэ үү.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-8 text-amber-600 text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                Хайлтыг цэвэрлэх
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="pb-2 bg-white border-t font-bold border-slate-50 mt-auto">
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <p className="text-[10px] font-gray-900 text-slate-900 uppercase tracking-[0.2em] ml-[0.4em]">© 2026 UgsaaNet</p>
          </div>
        </div>
      </footer>
    </div>
  );
}