"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, SearchX, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import ProfileCard from "../components/ProfileCard";

export default function GenerationPage() {
  const params = useParams();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Шинэ state-үүд ---
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_DISPLAY_COUNT = 12; // Эхний ээлжинд харуулах хүний тоо

  const genId = params?.gen || params?.id;

  useEffect(() => {
    if (!genId) return;
    const fetchGenProfiles = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user_data") || "{}");
        const url = user.familyId 
          ? `/api/persons?familyId=${encodeURIComponent(user.familyId)}`
          : "/api/persons";
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          const filtered = data.data.filter(
            (p) => Number(p.generation) === Number(genId)
          );
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          setProfiles(filtered);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGenProfiles();
  }, [genId]);

  // Харуулах профайлуудыг тооцоолох
  const displayedProfiles = isExpanded
    ? profiles
    : profiles.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      {/* Header хэсэг хэвээрээ... */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-500 hover:text-amber-600 transition-all font-bold text-xs md:text-sm group shrink-0"
          >
            <div className="p-1.5 md:p-2 bg-slate-50 rounded-full group-hover:bg-amber-50 transition-colors">
              <ChevronLeft size={18} className="md:w-5 md:h-5" />
            </div>
            <span className="hidden xs:inline">Буцах</span>
          </button>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-4xl font-light text-slate-300 font-serif leading-none">
                {genId < 10 ? `0${genId}` : genId}
              </span>
              <div className="flex flex-col items-start leading-none md:leading-tight">
                <h1 className="text-sm md:text-xl font-bold text-slate-800 tracking-tight">
                  Үеийнхэн
                </h1>
                <span className="text-[7px] md:text-[9px] font-bold text-amber-500 uppercase tracking-[0.2em] md:tracking-[0.3em] ml-0.5">
                  Generation
                </span>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1.5 px-1">
              <span className="text-[8px] md:text-[10px] text-slate-400 font-medium">
                Нийт{" "}
                <span className="text-slate-900 font-bold">
                  {profiles.length}
                </span>{" "}
                гишүүн
              </span>
              <div className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-amber-400/60" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 mt-6 md:mt-10 mb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <div className="w-8 h-8 border-2 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Уншиж байна...
            </p>
          </div>
        ) : profiles.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Grid хэсэг */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6 w-full justify-items-center">
              {displayedProfiles.map((profile) => (
                <div
                  key={profile._id}
                  className="w-full flex justify-center transition-transform duration-300 hover:scale-[1.02]"
                >
                  <ProfileCard
                    profile={profile}
                    onDelete={() => {}}
                    onEdit={() => {}}
                  />
                </div>
              ))}
            </div>

            {/* --- Хураах/Дэлгэх Товчлуур --- */}
            {profiles.length > INITIAL_DISPLAY_COUNT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-12 flex flex-col items-center gap-2 group transition-all"
              >
                <div className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full shadow-sm group-hover:border-amber-400 group-hover:text-amber-600 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isExpanded
                      ? "Хураах"
                      : `Бүх хүнийг үзэх (${profiles.length})`}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </div>
                {!isExpanded && (
                  <div className="w-px h-8 bg-linear-to-b from-slate-200 to-transparent" />
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-slate-50/40 rounded-2xl md:rounded-3xl border border-dashed border-slate-200 px-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <SearchX size={28} className="text-slate-300" />
            </div>
            <h3 className="text-slate-800 font-bold uppercase text-xs md:text-sm tracking-wider text-center">
              Мэдээлэл олдсонгүй
            </h3>
            <p className="text-slate-400 text-[10px] md:text-xs mt-1 text-center">
              Энэ үед одоогоор бүртгэлтэй хүн байхгүй байна.
            </p>
            <Link
              href="/landingPage"
              className="mt-6 px-5 py-2 md:py-2.5 bg-slate-900 text-white text-[9px] md:text-[10px] font-bold uppercase rounded-lg md:rounded-xl hover:bg-amber-600 transition-all active:scale-95"
            >
              Буцах
            </Link>
          </div>
        )}
      </main>

      {/* Footer хэсэг хэвээрээ... */}
      <footer className="w-full py-6 md:py-8 border-t border-slate-100 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-500/30" />
            <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.4em]">
              © 2026 Digital Archive
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
