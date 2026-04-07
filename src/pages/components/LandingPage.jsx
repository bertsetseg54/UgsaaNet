"use client";
import { useState, useEffect, useMemo } from "react";
import RegisterForm from "./RegisterForm";
import { useRouter } from "next/navigation";
import {
  Fingerprint, Plus, LogOut, Search, BookOpen, Home, 
  Users, ArrowRight, Copy, Check, Edit3, Trash2, Eye, EyeOff, QrCode, X
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

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
  const [showQR, setShowQR] = useState(false);
  
  const [alertModal, setAlertModal] = useState({ 
    open: false, id: null, type: 'confirm', message: '', title: '' 
  });

  const router = useRouter();

  const hasHeadOfFamily = useMemo(() => {
    return profiles.some(p => Number(p.generation) === 1);
  }, [profiles]);

  const fetchProfiles = async (fId) => {
    try {
      setLoading(true);
      const targetId = fId || familyId;
      const url = targetId ? `/api/persons?familyId=${encodeURIComponent(targetId)}` : "/api/persons";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setProfiles(data.data);
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

  const handleSuccessAction = (msg) => {
    fetchProfiles();
    setIsRegisterOpen(false);
    setIsEditOpen(false);
    setEditingProfile(null);
    setAlertModal({ 
      open: true, 
      type: 'message', 
      title: 'Амжилттай', 
      message: msg || 'Мэдээлэл амжилттай хадгалагдлаа' 
    });
  };

  const handleCopyID = () => {
    if (!familyId) return;
    navigator.clipboard.writeText(familyId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDelete = (id) => {
    setAlertModal({ 
      open: true, id, type: 'confirm', 
      title: 'Устгах баталгаажуулалт', 
      message: 'Та энэ гишүүнийг устгахдаа итгэлтэй байна уу?' 
    });
  };

  const handleLogoutClick = () => {
    setAlertModal({ 
      open: true, 
      type: 'logout', 
      title: 'Системээс гарах', 
      message: 'Та системээс гарахдаа итгэлтэй байна уу?' 
    });
  };

  const performDelete = async () => {
    const id = alertModal.id;
    try {
      const res = await fetch('/api/persons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, familyId }),
      });
      if ((await res.json()).success) {
        setProfiles(prev => prev.filter(p => p._id !== id));
        setAlertModal({ 
          open: true, type: 'message', title: 'Мэдэгдэл', message: 'Амжилттай устгагдлаа' 
        });
      }
    } catch (err) {
      setAlertModal({ open: true, type: 'message', title: 'Алдаа', message: 'Алдаа гарлаа' });
    }
  };

  const performLogout = () => {
    localStorage.clear();
    router.push("/start");
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()));
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      {/* HEADER - Updated for better responsiveness */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Fingerprint size={18} strokeWidth={2.5} />
            </div>
            <div className="hidden xs:flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-slate-800 tracking-tighter">Угсаа</span>
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-tighter">нет</span>
            </div>
          </Link>

          {/* Desktop Only ID View */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ургийн код</span>
            <code className="text-xs font-bold text-amber-600 font-mono min-w-[8rem]">{showFamilyId ? familyId : "••••••••"}</code>
            <button onClick={() => setShowFamilyId(!showFamilyId)} className="p-1 hover:text-amber-500 transition-colors">{showFamilyId ? <Eye size={14} /> : <EyeOff size={14} />}</button>
            <button onClick={handleCopyID} className="p-1 hover:text-amber-500 transition-colors">{copySuccess ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}</button>
            <button onClick={() => setShowQR(true)} className="p-1 hover:text-indigo-500 border-l border-slate-200 ml-1 pl-2 transition-colors"><QrCode size={14} /></button>
          </div>

          <div className="flex-1 max-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Хайх..." value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-100/60 rounded-full py-1.5 pl-9 pr-4 text-[11px] outline-none focus:bg-white border border-transparent focus:border-amber-100 transition-all" 
            />
          </div>

          <div className="flex items-center gap-1">
            <Link href="/story" className="hidden sm:flex p-2 text-slate-400 hover:text-amber-500 transition-colors">
              <BookOpen size={20} />
            </Link>
            <button onClick={handleLogoutClick} className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-28">
        {!loading && (
          <div className="mb-6 space-y-3">
            {/* Main Stats Card - Improved for Mobile */}
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-500 shrink-0"><Users size={22} /></div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-800 leading-tight uppercase tracking-tight italic">Миний Ураг</h2>
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Нийт {profiles.length} гишүүн</p>
                </div>
              </div>
              <button onClick={() => setIsRegisterOpen(true)} className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-slate-100">
                <Plus size={14} strokeWidth={4} /> Гишүүн нэмэх
              </button>
            </div>
            
            {/* Mobile/Responsive Family ID Card - This was breaking before */}
            <div className="lg:hidden">
              <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ургийн код</span>
                    <code className="text-xs sm:text-sm font-bold text-amber-600 font-mono mt-1 break-all">
                      {showFamilyId ? familyId : "••••••••••••"}
                    </code>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setShowFamilyId(!showFamilyId)} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl active:scale-95 transition-transform">{showFamilyId ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                    <button onClick={() => setShowQR(true)} className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl active:scale-95 transition-transform"><QrCode size={18} /></button>
                    <button onClick={handleCopyID} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl active:scale-95 transition-transform">{copySuccess ? <Check size={18} /> : <Copy size={18} />}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border border-dashed border-slate-200 rounded-[2.5rem] animate-in fade-in zoom-in duration-500 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-inner">
              <Users size={32} />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Одоогоор хүн алга</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 leading-relaxed max-w-[200px]">
              Гэр бүлийн гишүүдээ нэмж ургийн бичгээ хөтөлж эхэлнэ үү.
            </p>
            <button onClick={() => setIsRegisterOpen(true)} className="flex items-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-amber-100 active:scale-95">
              <Plus size={16} strokeWidth={4} /> Эхний гишүүнийг нэмэх
            </button>
          </div>
        ) : (
          <div className="space-y-6"> 
            {Object.keys(groupedByGeneration).sort((a,b) => Number(a)-Number(b)).map((gen) => (
              <section key={gen} className="animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 px-2 mb-4">
                  <div className="w-1 h-3.5 bg-amber-500 rounded-full"></div>
                  <h2 className="font-black text-[10px] sm:text-[11px] uppercase text-slate-800 tracking-wider">
                    {gen === "1" ? "Ургийн Тэргүүн" : `${gen}-р үе`}
                  </h2>
                  <div className="flex-1 h-[1px] bg-slate-100 ml-2"></div>
                </div>

                <div className="flex overflow-x-auto gap-3 no-scrollbar snap-x px-1 pb-4">
                  {groupedByGeneration[gen].map((p) => (
                    <div key={p._id} className="snap-start min-w-[280px] sm:min-w-[320px]">
                      <div className="bg-white border border-slate-100 rounded-[2rem] p-5 hover:shadow-xl hover:border-amber-100 transition-all duration-300 group relative">
                        <Link href={`/person/${p._id}`} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm z-10">
                          <ArrowRight size={14} />
                        </Link>
                        
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-14 h-14 sm:w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0">
                             {p.pic ? <img src={p.pic} className="w-full h-full object-cover" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><Users size={24} /></div>}
                           </div>
                           <div className="min-w-0 pr-6">
                             <h3 className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-amber-500 truncate leading-tight uppercase italic">{p.name}</h3>
                             <p className="text-[8px] sm:text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1.5 bg-amber-50 px-2 py-0.5 rounded-full inline-block">{p.profession || "Мэргэжилгүй"}</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-3.5 border-t border-slate-50">
                           <span className="text-[9px] font-bold text-slate-300 uppercase italic">Төрсөн: {p.birthYear || "---"}</span>
                           <div className="flex gap-1.5">
                             <button onClick={() => { setEditingProfile(p); setIsEditOpen(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><Edit3 size={15} /></button>
                             <button onClick={() => handleDelete(p._id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={15} /></button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAV - Simplified for better touch area */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-white via-white/80 to-transparent">
        <div className="bg-slate-900 rounded-2xl p-1.5 shadow-2xl flex items-center justify-between max-w-md mx-auto">
          <Link href="/" className="p-3.5 text-amber-400 active:scale-90 transition-transform"><Home size={22} /></Link>
          <button onClick={() => setIsRegisterOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl mx-2 active:scale-95 transition-transform">
            <Plus size={16} strokeWidth={4} /> Гишүүн Нэмэх
          </button>
          <Link href="/story" className="p-3.5 text-white/60 hover:text-amber-400 active:scale-90 transition-transform">
            <BookOpen size={22} />
          </Link>
        </div>
      </nav>

      {/* QR MODAL - Made more responsive */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-6">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center relative">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-800 transition-colors"><X size={18} /></button>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 mt-2">Ургийн QR Код</h3>
            <div className="bg-white p-3 sm:p-4 rounded-2xl border-4 border-slate-50 inline-block mb-6 shadow-inner">
              <QRCodeSVG value={familyId} size={180} level="H" />
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-2">
               <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Таны Ургийн Код</p>
               <p className="text-sm sm:text-base font-bold text-amber-600 font-mono tracking-tight break-all">{familyId}</p>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-4 leading-relaxed">Энэхүү кодыг уншуулж гэр бүлийн <br/> гишүүд таны үүсгэсэн урагт нэгдэнэ</p>
          </div>
        </div>
      )}

      {/* ALERT MODALS - Responsive sizing */}
      {alertModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-6">
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 
                ${alertModal.type === 'message' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                {alertModal.type === 'message' ? <Check size={24} /> : 
                 alertModal.type === 'logout' ? <LogOut size={24} /> : <Trash2 size={24} />}
              </div>
              <h3 className="text-base font-black text-slate-800 mb-1 uppercase tracking-tight leading-tight">{alertModal.title}</h3>
              <p className="text-[10px] font-bold text-slate-500 mb-6 leading-relaxed uppercase">{alertModal.message}</p>
              
              <div className="flex gap-2 w-full">
                {alertModal.type === 'message' ? (
                  <button onClick={() => setAlertModal({ open: false })} className="w-full py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-amber-100">Ойлголоо</button>
                ) : (
                  <>
                    <button onClick={() => setAlertModal({ open: false })} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase">Болих</button>
                    <button 
                      onClick={alertModal.type === 'logout' ? performLogout : performDelete} 
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-100"
                    >
                      {alertModal.type === 'logout' ? 'Гарах' : 'Устгах'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER / EDIT MODALS */}
      {isRegisterOpen && (
        <RegisterForm 
          isOpen={isRegisterOpen} 
          setIsOpen={setIsRegisterOpen} 
          onProfileAdded={() => handleSuccessAction('Шинэ гишүүн амжилттай бүртгэгдлээ')} 
          hasHeadOfFamily={hasHeadOfFamily}
        />
      )}
      {isEditOpen && (
        <RegisterForm 
          isOpen={isEditOpen} 
          setIsOpen={setIsEditOpen} 
          editData={editingProfile} 
          onUpdate={() => handleSuccessAction('Мэдээлэл амжилттай шинэчлэгдлээ')} 
          hasHeadOfFamily={hasHeadOfFamily}
        />
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 400px) {
          .xs\:flex { display: flex !important; }
        }
      `}</style>
    </div>
  );
}