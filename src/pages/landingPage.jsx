"use client";
import { useState, useEffect } from "react";
import ProfileCard from "./components/ProfileCard";
import RegisterForm from "./components/RegisterForm";
import {
  ChevronRight,
  Fingerprint,
  ChevronDown,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Хайлтын утга
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAll, setShowAll] = useState(false);

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
    setProfiles((prev) => prev.filter((p) => p._id !== id));
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setIsEditOpen(true);
  };

  // Хайлтаар шүүх логик
  const filteredProfiles = profiles.filter((person) =>
    person.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Үеэр бүлэглэх (Шүүгдсэн өгөгдөл дээр)
  const groupedByGeneration = (filteredProfiles || []).reduce((acc, person) => {
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
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                <Fingerprint size={18} className="text-amber-600 md:size-5" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] leading-none mb-1">
                  Digital Archive
                </span>
                <h1 className="text-md md:text-xl font-black text-slate-900 leading-none tracking-tight">
                  Ургийн Хэлхээ
                </h1>
              </div>
            </div>

            {/* --- SEARCH BAR --- */}
            <div className="flex-1 max-w-md relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search
                  size={16}
                  className="text-slate-400 group-focus-within:text-amber-500 transition-colors"
                />
              </div>
              <input
                type="text"
                placeholder="Нэрээр хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/50 border border-slate-200 rounded-xl py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="group relative flex items-center justify-center h-10 md:h-12 pl-2 pr-4 md:pl-2.5 md:pr-6 bg-slate-900 rounded-xl md:rounded-2xl transition-all duration-500 hover:bg-amber-500 hover:shadow-[0_8px_25px_-8px_rgba(245,158,11,0.6)] active:scale-95 shrink-0 overflow-hidden"
            >
              {/* Дотоод Shimmer эффект (Hover үед гүйх гэрэл) */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

              <div className="flex items-center gap-2 md:gap-3 relative z-10">
                {/* Икон хэсэг - Цагаан Glassmorphism */}
                <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/10 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <Plus
                    size={16}
                    className="text-white group-hover:rotate-90 transition-transform duration-500"
                    strokeWidth={3}
                  />
                </div>

                {/* Текст хэсэг */}
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] md:text-[13px] font-black text-white uppercase tracking-wider">
                    Бүртгэл
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow flex flex-col pt-24 md:pt-32">
        <main className="max-w-6xl w-full mx-auto px-6 pb-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Уншиж байна...
              </p>
            </div>
          ) : sortedGenerations.length > 0 ? (
            <div className="space-y-8">
              {visibleGenerations.map((gen) => (
                <section
                  key={gen}
                  className="group animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          ҮЕ
                        </span>
                        <span className="text-sm font-black text-slate-800 tabular-nums leading-none">
                          {gen}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {groupedByGeneration[gen].length} гишүүн
                      </span>
                    </div>
                    {!searchQuery && (
                      <Link
                        href={`/generation/${gen}`}
                        className="text-[10px] font-bold text-slate-400 hover:text-amber-600 transition-colors flex items-center gap-1 uppercase tracking-wider"
                      >
                        Бүгдийг үзэх <ChevronRight size={12} />
                      </Link>
                    )}
                  </div>

                  <div className="relative overflow-hidden">
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

              {/* Show More */}
              {!searchQuery && sortedGenerations.length > 4 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="group flex flex-col items-center gap-2"
                  >
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-amber-600 transition-colors">
                      {showAll ? "Хураах" : "Бүгдийг харах"}
                    </span>
                    <div className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center group-hover:border-amber-400 transition-all">
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 group-hover:text-amber-600 transition-transform ${
                          showAll ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* --- EMPTY SEARCH STATE --- */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
                Илэрц олдсонгүй
              </h3>
              <p className="text-slate-400 text-xs mt-1 italic">
                "{searchQuery}" нэртэй хүн байхгүй байна.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline"
              >
                Хайлтыг цэвэрлэх
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer & Modals... (Хэвээрээ) */}
      <footer className="w-full py-8 border-t border-slate-100 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-amber-500/30" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">
            © 2026 Digital Archive
          </p>
        </div>
      </footer>

      <RegisterForm
        isOpen={isRegisterOpen}
        setIsOpen={setIsRegisterOpen}
        onProfileAdded={fetchProfiles}
      />
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
