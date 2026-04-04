"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  ChevronLeft,
  SearchX,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import ProfileCard from "../components/ProfileCard";

export default function GenerationPage() {
  const router = useRouter();
  const { gen } = router.query;
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const INITIAL_DISPLAY_COUNT = 12;

  useEffect(() => {
    if (!gen) return;
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
            (p) => Number(p.generation) === Number(gen)
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
  }, [gen]);

  const displayedProfiles = isExpanded
    ? profiles
    : profiles.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col pb-24 md:pb-12">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-3 md:px-8 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 p-2 -ml-2 text-slate-400 hover:text-amber-600 transition-colors"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>

          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-light text-slate-300 font-serif leading-none">
                {gen && (gen < 10 ? `0${gen}` : gen)}
              </span>
              <div className="flex flex-col items-start leading-tight">
                <h1 className="text-sm md:text-base font-black text-slate-900">
                  Үеийнхэн
                </h1>
                <span className="text-[7px] md:text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                  Үе {gen}
                </span>
              </div>
            </div>
            {profiles.length > 0 && (
              <div className="mt-1 text-[8px] md:text-[10px] text-slate-400 font-medium">
                {profiles.length} гишүүн
              </div>
            )}
          </div>

          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-3 md:px-8 pt-20 md:pt-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Уншиж байна...
            </p>
          </div>
        ) : profiles.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4 w-full">
              {displayedProfiles.map((profile) => (
                <div
                  key={profile._id}
                  className="w-full flex justify-center"
                >
                  <ProfileCard
                    profile={profile}
                    onDelete={() => {}}
                    onEdit={() => {}}
                  />
                </div>
              ))}
            </div>

            {/* Expand Button */}
            {profiles.length > INITIAL_DISPLAY_COUNT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-8 md:mt-12 flex flex-col items-center gap-3 group transition-all"
              >
                <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-md hover:border-amber-400 hover:text-amber-600 hover:shadow-lg transition-all">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isExpanded
                      ? "Хураах"
                      : `Бүх хүнийг үзэх (${profiles.length})`}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={14} strokeWidth={3} />
                  ) : (
                    <ChevronDown size={14} strokeWidth={3} />
                  )}
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl md:rounded-2xl border border-dashed border-slate-200 px-4 md:px-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg md:rounded-xl shadow-sm flex items-center justify-center mb-4">
              <Users size={28} className="text-slate-300" />
            </div>
            <h3 className="text-slate-800 font-bold text-xs md:text-sm tracking-wider text-center uppercase">
              Мэдээлэл олдсонгүй
            </h3>
            <p className="text-slate-400 text-[9px] md:text-xs mt-2 text-center">
              Энэ үед одоогоор бүртгэлтэй хүн байхгүй байна.
            </p>
            <Link
              href="/"
              className="mt-6 px-6 py-2.5 md:py-3 bg-amber-600 text-white text-[9px] md:text-xs font-bold uppercase tracking-wide rounded-lg md:rounded-xl hover:bg-amber-700 transition-colors active:scale-95"
            >
              Нүүр хуудас
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 md:py-8 border-t border-slate-100 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-3 md:px-8 flex flex-col items-center gap-1">
          <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            © 2026 UgsaaNet Digital Archive
          </p>
        </div>
      </footer>

      <style jsx global>{`
        .safe-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
