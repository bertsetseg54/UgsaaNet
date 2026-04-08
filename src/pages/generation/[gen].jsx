"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  ArrowLeft,
  Users,
  SearchX,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import ProfileCard from "../components/ProfileCard";

export default function GenerationPage() {
  const router = useRouter();
  const params = useParams();
  const gen = params?.gen;

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

  const displayedProfiles = isExpanded
    ? profiles
    : profiles.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className="min-h-dvh bg-[#F8F9FB] flex flex-col font-sans">
      {/* Header - Glassmorphism UI */}
      <header className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group p-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 transition-all active:scale-95"
          >
            <ArrowLeft size={20} className="text-slate-600 group-hover:text-amber-500" />
          </button>

          <div className="flex flex-col items-center">
             <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <h1 className="text-[14px] font-[1000] text-slate-800 uppercase tracking-tight italic">
                      {gen === "1" ? "Тэргүүн үе" : `${gen}-р үе`}
                    </h1>
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Users size={10} className="text-amber-600" />
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{profiles.length} гишүүн</span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                    <span className="text-xl font-black text-white font-mono">{gen?.toString().padStart(1, '0')}</span>
                </div>
             </div>
          </div>

          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 pt-10 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-amber-100 rounded-2xl"></div>
                <div className="absolute inset-0 border-4 border-amber-500 rounded-2xl animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">
              Уншиж байна...
            </p>
          </div>
        ) : profiles.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Grid - Зайг (gap-8) ихэсгэж илүү агаартай болгосон */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-10 gap-x-6 w-full">
              {displayedProfiles.map((profile, index) => (
                <div
                  key={profile._id}
                  className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProfileCard
                    profile={profile}
                    profiles={profiles} // Profiles дамжуулахгүй бол овог харагдахгүй байж магадгүй
                    onDelete={() => {}}
                    onEdit={() => {}}
                  />
                </div>
              ))}
            </div>

            {/* Expand Button - Загварлаг товч */}
            {profiles.length > INITIAL_DISPLAY_COUNT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-20 group flex items-center gap-4 px-10 py-4 bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200 hover:bg-amber-500 transition-all active:scale-95"
              >
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                  {isExpanded
                    ? "Хурааж харах"
                    : `Бүх хүнийг харах (${profiles.length})`}
                </span>
                <div className={`text-white transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={18} strokeWidth={3} />
                </div>
              </button>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="max-w-md mx-auto flex flex-col items-center justify-center py-20 px-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-transform">
              <SearchX size={48} className="text-slate-200" />
            </div>
            <h3 className="text-slate-800 font-black text-xl uppercase italic tracking-tight">
              Одоогоор хоосон байна
            </h3>
            <p className="text-slate-400 text-[11px] font-bold mt-4 leading-relaxed uppercase tracking-wide">
              Энэ үеийн гишүүд хараахан бүртгэгдээгүй байна.
            </p>
            <Link
              href="/"
              className="mt-10 w-full py-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-amber-100"
            >
              Буцах
            </Link>
          </div>
        )}
      </main>

      {/* Footer Decoration */}
      <footer className="py-16 bg-white border-t border-slate-50">
        <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                <Sparkles size={20} />
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">УгсааНет</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Таны гэр бүлийн дижитал түүх</p>
            </div>
        </div>
      </footer>
    </div>
  );
}