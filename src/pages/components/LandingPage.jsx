"use client";
import { useState, useEffect, useMemo } from "react";
import ProfileCard from "./ProfileCard";
import RegisterForm from "./RegisterForm";
import { useRouter } from "next/navigation";
import {
  Fingerprint, Plus, LogOut, Search, BookOpen, Home, 
  Users, UserPlus, LayoutGrid, ArrowRight, ScrollText, 
  Copy, Check, Edit3, Trash2, X, ChevronRight, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showFamilyId, setShowFamilyId] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: 'confirm', message: '' });

  const router = useRouter();

  // Мэдээлэл татах функц
  const fetchProfiles = async (fId) => {
    try {
      setLoading(true);
      const targetId = fId || familyId;
      const url = targetId ? `/api/persons?familyId=${encodeURIComponent(targetId)}` : "/api/persons";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProfiles(data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem("user_data");
    if (!storedData) {
      router.push("/start");
      return;
    }
    const user = JSON.parse(storedData);
    if (user.familyId) {
      setFamilyId(user.familyId);
      fetchProfiles(user.familyId);
    }
  }, []);

  // Ургийн ID хуулах функц
  const handleCopyID = () => {
    if (!familyId) return;
    navigator.clipboard.writeText(familyId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  //УСТГАХ ФУНКЦ 
  const handleDelete = (id) => {
    setDeleteModal({ open: true, id, type: 'confirm' });
  };

  const performDelete = async () => {
    const id = deleteModal.id;
    try {
      const res = await fetch('/api/persons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, familyId }),
      });
      const data = await res.json();

      if (data.success) {
        // Жагсаалтыг шинэчлэх
        setProfiles(prev => prev.filter(p => p._id !== id));
        setDeleteModal({ open: true, type: 'message', message: 'Амжилттай устгагдлаа' });
      } else {
        setDeleteModal({ open: true, type: 'message', message: 'Устгахад алдаа гарлаа: ' + data.message });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteModal({ open: true, type: 'message', message: 'Сервертэй холбогдоход алдаа гарлаа' });
    }
  };
  // Хайлт болон Үеэр бүлэглэх логик
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => 
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profiles, searchQuery]);

  const groupedByGeneration = useMemo(() => {
    return filteredProfiles.reduce((acc, p) => {
      const gen = p.generation || 1;
      if (!acc[gen]) acc[gen] = [];
      acc[gen].push(p);
      return acc;
    }, {});
  }, [filteredProfiles]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-32 font-sans">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* LOGO: Хурууны хээ + Ургийн хэлхээ */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Fingerprint size={22} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col gap-1 leading-[0.8] mb-1">
              <span className="text-[14px] font-[1000] uppercase tracking-tighter text-slate-800">Угсаа</span>
              <span className="text-[14px] font-[1000] uppercase tracking-tighter text-amber-500">нет</span>
            </div>
          </Link>

          {/* COMPUTER RESPONSIVE: ID хуулах хэсэг */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 hover:bg-white transition-all">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ургийн код:</span>
            <code className="text-xs font-bold text-amber-600 font-mono tracking-widest">{showFamilyId ? (familyId || "---") : "••••••••••"}</code>
            <button 
              onClick={() => setShowFamilyId(!showFamilyId)} 
              className="p-1.5 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-500 transition-all active:scale-90"
              title={showFamilyId ? "Нуух" : "Харагдуулах"}
            >
              {showFamilyId ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button 
              onClick={handleCopyID} 
              className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500 transition-all active:scale-90"
              title="ID Хуулах"
            >
              {copySuccess ? <Check size={14} strokeWidth={3} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>

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

          {/* SEARCH */}
          <div className="flex-1 max-w-md relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Гишүүн хайх..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-100/50 rounded-full py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-amber-500/10 transition-all border border-transparent focus:bg-white focus:border-amber-100" 
            />
          </div>

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
                <div>
                  <h2 className="text-2xl font-[1000] text-slate-800 tracking-tight leading-none italic">Миний Ургийн бичиг</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">
                    Нийт <span className="text-amber-600">{profiles.length}</span> гишүүн бүртгэлтэй
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsRegisterOpen(true)} 
                className="hidden lg:flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                <Plus size={18} strokeWidth={4} /> Гишүүн нэмэх
              </button>
            </div>
            
            {/* MOBILE/TABLET: Code copy and story section */}
            <div className="lg:hidden flex flex-col sm:flex-row items-center justify-center gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm w-full max-w-full overflow-hidden">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Ургийн код:
                </span>
                <code className="flex-1 text-xs font-bold text-amber-600 font-mono truncate text-center">
                  {showFamilyId ? (familyId || "---") : "••••••••••"}
                </code>

                <button 
                  onClick={() => setShowFamilyId(!showFamilyId)} 
                  className="shrink-0 p-2 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-500 transition-all active:scale-90"
                  title={showFamilyId ? "Нуух" : "Харагдуулах"}
                >
                  {showFamilyId ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 transition-all rounded-xl md:hover:text-red-500 active:text-red-500 md:hover:bg-red-50 active:bg-red-50"
              >
                  <BookOpen size={16} />
                </Link>
            </div>
          </div>
        </div>
      </header>
      <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-100">
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

        {/* GENERATIONS SECTIONS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ургийн модыг ачаалж байна...</span>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
              <UserPlus size={40} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase">Илэрц олдсонгүй</h3>
            <p className="text-sm text-slate-500 mb-6">Гишүүн нэмэх товчийг дарж ургийн гишүүдээ бүртгүүлээрэй.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {Object.keys(groupedByGeneration).sort((a,b) => Number(a)-Number(b)).map((gen) => (
              <section key={gen} className="relative">
                <div className="flex items-center justify-between mb-10 px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-10 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full shadow-lg shadow-amber-100"></div>
                    <h2 className="font-[1000] text-xl md:text-2xl uppercase tracking-tighter text-slate-800">
                      {gen === "1" ? "Ургийн Тэргүүн" : `${gen}-р үеийнхэн`}
                    </h2>
                  </div>
                </div>

                {/* HORIZONTAL SCROLLABLE LIST */}
                <div className="flex overflow-x-auto py-6 gap-8 no-scrollbar snap-x px-2">
                  {groupedByGeneration[gen].map((p) => (
                    <div key={p._id} className="snap-start min-w-[320px] md:min-w-[380px]">
                      {/* PROFILE CARD */}
                      <div className="bg-white border border-slate-100 rounded-[3rem] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative">
                        <Link href={`/person/${p._id}`} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm z-10">
                          <ArrowRight size={18} />
                        </Link>
                        <div className="flex items-center gap-6 mb-8">
                           <div className="w-24 h-24 bg-slate-50 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl group-hover:rotate-3 transition-transform">
                             {p.pic ? (
                               <img src={p.pic} className="w-full h-full object-cover" alt={p.name} />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50"><Users size={32} /></div>
                             )}
                           </div>
                           <div>
                             <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-amber-500 transition-colors">{p.name}</h3>
                             <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mt-2">{p.job || "Мэргэжил тодорхойгүй"}</p>
                           </div>
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
                      </div>
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

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-10 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="bg-slate-900 border border-slate-800 rounded-full p-2 shadow-2xl flex items-center justify-center gap-8">
          <Link href="/" className="p-4 text-amber-400"><Home size={24} /></Link>
          <div clasasName="flex items-center rounded-full bg-slate-800/50 px-4 py-2">
              <button onClick={() => setIsRegisterOpen(true)} className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full font-[1000] text-[10px] uppercase tracking-widest shadow-xl active:scale-95"><Plus size={18} strokeWidth={4} /> Гишүүн Нэмэх</button>
          </div>
          <Link href="/story" className="p-4 text-white/60"><BookOpen size={24} /></Link>
        </div>
      </nav>

      {/* MODALS */}
      {isRegisterOpen && (
        <RegisterForm 
          isOpen={isRegisterOpen} 
          setIsOpen={setIsRegisterOpen} 
          onProfileAdded={() => fetchProfiles()} 
        />
      )}
      
      {isEditOpen && (
        <RegisterForm 
          isOpen={isEditOpen} 
          setIsOpen={setIsEditOpen} 
          editData={editingProfile} 
          onUpdate={() => fetchProfiles()} 
        />
      )}

      {/* DELETE MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            {deleteModal.type === 'confirm' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="text-red-500" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Устгах баталгаажуулалт</h3>
                </div>
                <p className="text-slate-600 mb-6">Та энэ гишүүнийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ open: false })}
                    className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Үгүй
                  </button>
                  <button
                    onClick={() => {
                      setDeleteModal({ open: false });
                      performDelete();
                    }}
                    className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                  >
                    Тийм, устгах
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check className="text-blue-500" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Мэдэгдэл</h3>
                </div>
                <p className="text-slate-600 mb-6">{deleteModal.message}</p>
                <button
                  onClick={() => setDeleteModal({ open: false })}
                  className="w-full py-2.5 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  OK
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { background-color: #FDFDFD; }
      `}</style>
    </div>
  );
}