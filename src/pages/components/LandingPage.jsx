"use client";
import { useState, useEffect } from "react";
import ProfileCard from "./ProfileCard";
import RegisterForm from "./RegisterForm";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Fingerprint,
  Plus,
  LogOut,
  Search,
  X,
  ArrowRight,
  BookOpen,
  Home,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [userName, setUserName] = useState("Хэрэглэгч");
  const [searchQuery, setSearchQuery] = useState("");
  const [familyId, setFamilyId] = useState("");

  const router = useRouter();

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const url = familyId 
        ? `/api/persons?familyId=${encodeURIComponent(familyId)}`
        : "/api/persons";
      const res = await fetch(url);

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProfiles(data.data);
      } else {
        setProfiles([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Syntax error fixed: removed unnecessary braces
  const handleDeleteFromState = (id) => {
    setProfiles((prev) => prev.filter((p) => p._id !== id));
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setIsEditOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/start");
  };

  useEffect(() => {
    const storedData = localStorage.getItem("user_data");
    if (storedData) {
      try {
        const user = JSON.parse(storedData);
        setUserName(user.name || user.email?.split("@")[0] || "Хэрэглэгч");
        // familyId-г зөвхөн хүчин төгөлдөр бол ашиглах
        const fId = user.familyId || "";
        if (fId && /^[a-zA-Z0-9_-]+$/.test(fId)) {
          setFamilyId(fId);
        } else if (fId) {
          // Хүчин төгөлдөр биш familyId - localStorage цэвэрлэн дахин нэвтрэх шаардлага
          console.warn("Invalid familyId detected, clearing storage");
          localStorage.clear();
          router.push("/start");
          return;
        }
      } catch {
        console.error("User parse error");
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (familyId && mounted) {
      fetchProfiles();
    }
  }, [familyId, mounted]);

  if (!mounted) return <div className="min-h-screen bg-[#FDFDFD]" />;

  const filteredProfiles = profiles.filter((person) =>
    (person.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByGeneration = filteredProfiles.reduce((acc, person) => {
    const gen = Number(person.generation) || 1;
    if (!acc[gen]) acc[gen] = [];
    acc[gen].push(person);
    return acc;
  }, {});
  const isActive = (path) => usePathname === path;

  const sortedGenerations = Object.keys(groupedByGeneration).sort(
    (a, b) => Number(a) - Number(b)
  );

  const visibleGenerations = showAll
    ? sortedGenerations
    : sortedGenerations.slice(0, 4);
  const RegisterButton = ({ className = "" }) => (
    <button
      onClick={() => setIsRegisterOpen(true)}
      className={`group flex items-center gap-2 bg-slate-900 text-white 
      px-6 py-3.5 rounded-[1.8rem]
      shadow-lg shadow-slate-200/50 md:hover:bg-slate-800 active:bg-slate-800 
      transition-all active:scale-95 shrink-0 ${className}`}
    >
      <Plus size={16} strokeWidth={3} className="text-amber-400 shrink-0" />

      <div className="flex flex-col items-start leading-none text-left">
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          Шинэ бүртгэл
        </span>
      </div>
    </button>
  );

  const ShareFamilyButton = ({ className = "" }) => (
    <button
      onClick={() => {
        if (familyId) {
          navigator.clipboard.writeText(familyId);
          alert("✅ Ургийн код хуулагдлаа!\n\n" + familyId);
        }
      }}
      className={`text-[10px] md:text-[11px] uppercase font-black text-slate-500 md:hover:text-amber-600 transition-colors px-3 py-2 rounded-lg md:hover:bg-amber-50 active:bg-amber-50 ${className}`}
      title={familyId || "Loading..."}
    >
      📋 Код хуулах
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* LOGO ХЭСЭГ */}
            <div className="flex items-center shrink-0">
              <Link
                href="/"
                className="flex items-center gap-3 group text-amber-600"
              >
                {/* Зөвхөн энэ икон Mobile дээр харагдана */}
                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center transition-colors md:group-hover:bg-amber-200">
                  <Fingerprint size={20} className="text-amber-500" />
                </div>

                {/* Текст: md (768px)-ээс доош хэмжээнд HIDDEN байна */}
                <span className="hidden md:block font-black text-sm uppercase tracking-tighter text-amber-600">
                  Ургийн Хэлхээ
                </span>
              </Link>
            </div>

            {/* ХАЙЛТЫН ХЭСЭГ */}
            <div className="flex-1 max-w-md relative group">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-full py-2 md:py-1.5 pl-9 pr-8 text-sm focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* БАРУУН ТАЛЫН ЦЭСҮҮД */}
            <div className="flex items-center gap-2">
              <Link
                href="/story"
                className="text-[10px] md:text-[11px] uppercase font-black text-slate-500 hover:text-amber-600 transition-colors hidden lg:block"
              >
                Түүх намтар
              </Link>
              <div className="h-4 w-px bg-slate-200 hidden lg:block" />

              {/* Share Family Code Button */}
              <ShareFamilyButton className="hidden md:block" />

              {/* Өмнөх RegisterButton - Mobile дээр нуугдсан хэвээр */}
              <RegisterButton className="hidden md:flex" />

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 transition-all rounded-xl md:hover:text-red-500 active:text-red-500 md:hover:bg-red-50 active:bg-red-50"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>
      <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-between transition-all">
          {/* Нүүр хуудас */}
          <Link href="/" className={"p-4  text-amber-600"}>
            <Home size={22} />
          </Link>

          {/* Төв хэсэг: Түүх нэмэх товчлуур */}
          <RegisterButton />

          {/* Түүх намтар хуудас */}
          <Link
            href="/story"
            className={`p-4 rounded-full transition-all duration-300 ${
              isActive("/story")
                ? "text-indigo-600 bg-indigo-50/50"
                : "text-slate-400 md:hover:text-slate-600 active:text-slate-600"
            }`}
          >
            <BookOpen size={22} strokeWidth={isActive("/story") ? 3 : 2} />
          </Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        {/* НИЙТ ТОО - Энгийн бөгөөд ойлгомжтой */}
        {!loading && profiles.length > 0 && (
          <div className="mb-6 px-1">
            <h1 className="text-xl font-bold text-slate-800">Ургийн хэлхээ</h1>
            <p className="text-sm text-slate-500 font-medium">
              Нийт {profiles.length} гишүүн бүртгэлтэй байна
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {visibleGenerations.map((gen) => {
              const isFirstGen = gen === "1";
              const count = groupedByGeneration[gen].length;

              return (
                <section key={gen} className="animate-in fade-in duration-500">
                  {/* ҮЕИЙН ГАРЧИГ - Энгийн стиль */}
                  <div className="flex items-center justify-between mb-4 px-1 border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`font-bold text-sm uppercase tracking-wide ${
                          isFirstGen ? "text-amber-600" : "text-slate-700"
                        }`}
                      >
                        {isFirstGen ? "Ургийн тэргүүн" : `${gen}-р үе`}
                      </h2>
                      <span className="text-xs font-medium text-slate-400">
                        ({count})
                      </span>
                    </div>

                    {!searchQuery && (
                      <Link
                        href={`/generation/${gen}`}
                        className="text-xs font-semibold text-slate-400 md:hover:text-amber-600 active:text-amber-600 flex items-center gap-1 transition-colors"
                      >
                        Бүгдийг харах
                        <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>

                  {/* КАРТНУУД - Энгийн жагсаалт */}
                  <div className="relative">
                    <div className="flex overflow-x-auto py-2 px-1 gap-3 no-scrollbar scroll-smooth snap-x">
                      {groupedByGeneration[gen].map((profile) => (
                        <div
                          key={profile._id}
                          className={`flex-none snap-start transition-all duration-300 md:hover:scale-[1.02] ${
                            isFirstGen
                              ? "ring-2 ring-amber-100 rounded-2xl"
                              : ""
                          }`}
                        >
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
              );
            })}
          </div>
        )}

        {/* БУСАД ҮЕИЙГ ХАРАХ ТОВЧ - Энгийн */}
        {sortedGenerations.length > 4 && (
          <div className="flex justify-center pt-8 pb-24">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-500 md:hover:bg-slate-50 active:bg-slate-50 transition-all"
            >
              {showAll ? "ХУРААХ" : "ДЭЛГЭРЭНГҮЙ ҮЗЭХ"}
              <ChevronDown size={14} className={showAll ? "rotate-180" : ""} />
            </button>
          </div>
        )}
      </main>

      {/* Forms */}
      <RegisterForm
        isOpen={isRegisterOpen}
        setIsOpen={setIsRegisterOpen}
        onProfileAdded={fetchProfiles}
      />

      {isEditOpen && (
        <RegisterForm
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          editData={editingProfile}
          onUpdate={fetchProfiles}
        />
      )}

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
