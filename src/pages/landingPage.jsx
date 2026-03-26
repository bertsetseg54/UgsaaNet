"use client";
import { useState, useEffect } from "react";
import ProfileCard from "./components/ProfileCard";
import RegisterForm from "./components/RegisterForm";
import { ChevronRight, Fingerprint, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false); // Шинээр бүртгэх цонхны төлөв
  const [mounted, setMounted] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Өгөгдөл татах функц
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/persons");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProfiles(data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#F8F9FA]" />;

  const handleDeleteFromState = (id) => {
    setProfiles((prev) => prev.filter((p) => p._id !== id)); // Зөв нэр
  };
  // Засах функц
  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setIsEditOpen(true);
  };

  // Үеэр бүлэглэх логик
  const groupedByGeneration = (profiles || []).reduce((acc, person) => {
    const gen = Number(person.generation) || 1;
    if (!acc[gen]) acc[gen] = [];
    acc[gen].push(person);
    return acc;
  }, {});

  const sortedGenerations = Object.keys(groupedByGeneration).sort(
    (a, b) => Number(a) - Number(b)
  );

  const visibleGenerations = showAll
    ? sortedGenerations
    : sortedGenerations.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#2D3436] selection:bg-amber-100">
      {/* --- FIXED HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 md:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                <Fingerprint size={18} className="text-amber-600 md:size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] leading-none mb-1">
                  Digital Archive
                </span>
                <h1 className="text-lg md:text-2xl font-black text-slate-900 leading-none tracking-tight">
                  Алтан Ургийн{" "}
                  <span className="text-amber-500 italic md:not-italic">
                    Хэлхээ
                  </span>
                </h1>
              </div>
            </div>

            <button
              onClick={() => setIsRegisterOpen(true)}
              className="group flex items-center gap-2 md:gap-4 px-3 py-1.5 md:px-6 md:py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl hover:border-amber-500/50 hover:bg-amber-50/20 transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md hover:shadow-amber-100/50 shrink-0"
            >
              {/* Икон - Desktop дээр илүү том бөгөөд тод */}
              <div className="flex items-center justify-center w-6 h-6 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-amber-100 group-hover:border-amber-200 transition-all duration-300">
                <Plus
                  size={14}
                  className="text-slate-400 group-hover:text-amber-600 group-hover:scale-110 transition-all"
                  strokeWidth={3}
                />
              </div>

              <div className="flex flex-col items-start leading-none">
                {/* Үндсэн текст - Desktop дээр илүү том (md:text-[13px]) */}
                <span className="text-[10px] md:text-[13px] font-black text-slate-800 uppercase tracking-widest mb-0.5 md:mb-1 transition-colors group-hover:text-amber-700">
                  Бүртгэл нэмэх
                </span>
                {/* Тайлбар текст - Desktop дээр илүү уншигдахуйц */}
                <span className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-80">
                  Ургийн бичиг хөтлөх
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-grow flex flex-col pt-20 md:pt-28">
        <main className="max-w-6xl w-full mx-auto px-6 pb-12">
          {/* Desktop Description - mb-12-ыг mb-8 болгов */}
          <div className="hidden md:flex mb-8 border-l-2 border-amber-500/20 pl-4">
            <p className="text-xs font-medium text-slate-400 max-w-md leading-relaxed">
              Монгол түмний ураг төрлийн хэлхээ холбоог баримтжуулан, хойч үедээ
              өвлүүлэн үлдээх цахим сан.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : (
            /* space-y-12-ыг space-y-6 (Mobile) болон md:space-y-8 болгож багасгав */
            <div className="space-y-6 md:space-y-8">
              {visibleGenerations.map((gen) => (
                <section key={gen} className="group">
                  {/* mb-5-ыг mb-3 болгож гарчиг картууддаа ойртов */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex items-center gap-1.5 md:gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1 md:px-3 md:py-1.5 shadow-sm">
                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          ҮЕ
                        </span>
                        <span className="text-sm font-black text-slate-800 tabular-nums leading-none">
                          {gen}
                        </span>
                      </div>
                      <div className="h-4 md:h-6 w-[1px] bg-slate-200 rotate-[15deg]" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs md:text-sm font-black text-amber-600 tabular-nums">
                          {groupedByGeneration[gen].length}
                        </span>
                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Гишүүн
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/generation/${gen}`}
                      className="text-[10px] font-bold text-slate-400 hover:text-amber-600 transition-colors flex items-center gap-1 uppercase tracking-wider"
                    >
                      Бүгдийг үзэх <ChevronRight size={12} />
                    </Link>
                  </div>

                  <div className="relative overflow-hidden">
                    {/* pb-4-ийг pb-2 болгов (scroll-ын зай) */}
                    <div className="flex overflow-x-auto pb-2 gap-4 no-scrollbar scroll-smooth snap-x">
                      {groupedByGeneration[gen].map((profile) => (
                        <div key={profile._id} className="flex-none snap-start">
                          <ProfileCard
                            profile={profile}
                            onDelete={handleDeleteFromState}
                            onEdit={handleEdit}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
              {/* Show More Button */}
              {sortedGenerations.length > 4 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="group flex flex-col items-center gap-2 transition-all active:scale-95"
                  >
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-amber-600 transition-colors">
                      {showAll ? "Хураах" : "Бүгдийг харах"}
                    </span>
                    <div className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border border-slate-200 bg-white shadow-sm group-hover:border-amber-400 group-hover:shadow-md transition-all duration-300">
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 group-hover:text-amber-600 transition-transform duration-500 ${
                          showAll ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="w-full py-6 md:py-8 border-t border-slate-100 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-500/30" />
            <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.4em]">
              © 2026 Digital Archive
            </p>
          </div>
          <div className="h-px w-8 bg-slate-100 hidden md:block" />
        </div>
      </footer>

      {/* 1. Шинээр бүртгэх форм */}
      <RegisterForm
        isOpen={isRegisterOpen}
        setIsOpen={setIsRegisterOpen}
        onProfileAdded={fetchProfiles}
      />

      {/* 2. Мэдээлэл засах форм */}
      <RegisterForm
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        editData={editingProfile}
        onUpdate={fetchProfiles}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
