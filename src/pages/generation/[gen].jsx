"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // App Router ашиглаж байгаа бол useParams илүү тохиромжтой
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Users,
  SearchX,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import ProfileCard from "../components/ProfileCard";

export default function GenerationPage() {
  const router = useRouter();
  const params = useParams();
  const gen = params?.gen; // Dynamic route-оос gen-ийг авах

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const INITIAL_DISPLAY_COUNT = 12;

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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header - Илүү цэвэрхэн, Glassmorphism эффекттэй */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-all"
          >
            <div className="p-2 rounded-full group-hover:bg-amber-50 transition-colors">
              <ArrowLeft size={20} />
            </div>
            <span className="hidden sm:inline text-sm font-medium">Буцах</span>
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-slate-200 font-mono tracking-tighter">
                {gen?.toString().padStart(2, '0')}
              </span>
              <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
              <div className="text-center sm:text-left">
                <h1 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-tight">
                  {gen}-р үеийнхэн
                </h1>
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] leading-none">
                   Нийт {profiles.length} гишүүн
                </p>
              </div>
            </div>
          </div>

          <div className="w-10 sm:w-20" /> {/* Balance spacer */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 pt-8 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Ургийн хэлхээг уншиж байна
            </p>
          </div>
        ) : profiles.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Grid - Card хоорондын зайг илүү агаартай болгосон */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full">
              {displayedProfiles.map((profile) => (
                <div
                  key={profile._id}
                  className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <ProfileCard
                    profile={profile}
                    onDelete={() => {}}
                    onEdit={() => {}}
                  />
                </div>
              ))}
            </div>

            {/* Expand Button - Илүү минимал */}
            {profiles.length > INITIAL_DISPLAY_COUNT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-16 group relative flex items-center gap-3 px-8 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 transition-all active:scale-95"
              >
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  {isExpanded
                    ? "Хураах"
                    : `Бүх хүнийг харах (${profiles.length})`}
                </span>
                <div className={`text-amber-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={16} strokeWidth={3} />
                </div>
              </button>
            )}
          </div>
        ) : (
          /* Empty State - Илүү гоёмсог */
          <div className="max-w-md mx-auto flex flex-col items-center justify-center py-24 px-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <SearchX size={40} className="text-slate-300" />
            </div>
            <h3 className="text-slate-800 font-black text-lg uppercase tracking-tight">
              Мэдээлэл олдсонгүй
            </h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Энэ үед одоогоор бүртгэлтэй хүн байхгүй байна. Та шинээр гишүүн нэмэх боломжтой.
            </p>
            <Link
              href="/"
              className="mt-8 w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-500 transition-colors shadow-lg shadow-slate-200 active:scale-[0.98]"
            >
              Нүүр хуудас руу буцах
            </Link>
          </div>
        )}
      </main>

      {/* Footer - Минимал */}
      <footer className="mt-auto py-12 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">UgsaaNet</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Дижитал Ургийн Бичиг • 2026
          </p>
        </div>
      </footer>
    </div>
  );
}