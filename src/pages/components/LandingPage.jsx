"use client";
import { useState, useEffect, useMemo } from "react";
import RegisterForm from "./RegisterForm";
import { useRouter } from "next/navigation";
import {
  Fingerprint, Plus, LogOut, Search, BookOpen, Home, 
  Users, UserPlus, ArrowRight, Copy, Check, Edit3, Trash2, Eye, EyeOff, QrCode, X
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
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Fingerprint size={18} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[12px] font-black uppercase text-slate-800">Угсаа</span>
              <span className="text-[12px] font-black uppercase text-amber-500">нет</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ургийн код</span>
            <code className="text-xs font-bold text-amber-600 font-mono min-w-[8rem]">{showFamilyId ? familyId : "••••••••"}</code>
            <button onClick={() => setShowFamilyId(!showFamilyId)} className="p-1 hover:text-amber-500">{showFamilyId ? <Eye size={14} /> : <EyeOff size={14} />}</button>
            <button onClick={handleCopyID} className="p-1 hover:text-amber-500">{copySuccess ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}</button>
            <button onClick={() => setShowQR(true)} className="p-1 hover:text-indigo-500 border-l border-slate-200 ml-1 pl-2"><QrCode size={14} /></button>
          </div>

          <Link href="/story" className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:bg-amber-500 hover:text-white transition-all text-slate-600">
            <BookOpen size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Түүх</span>
          </Link>

          <div className="flex-1 max-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Хайх..." value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-100/50 rounded-full py-1.5 pl-9 pr-4 text-xs outline-none focus:bg-white border-transparent border focus:border-amber-100 transition-all" 
            />
          </div>

          <button onClick={handleLogoutClick} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-15 pb-24">
        {!loading && (
          <div className="mb-3 space-y-3">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500"><Users size={22} /></div>
                <div>
                  <h2 className="text-md font-black text-slate-800 leading-tight italic">Миний Ургийн бичиг</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Нийт {profiles.length} гишүүн</p>
                </div>
              </div>
              <button onClick={() => setIsRegisterOpen(true)} className="hidden lg:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg">
                <Plus size={14} strokeWidth={4} /> Гишүүн нэмэх
              </button>
            </div>
            
            <div className="lg:hidden flex flex-col gap-2">
              <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ургийн код</span>
                  <code className="text-sm font-bold text-amber-600 font-mono mt-1">{showFamilyId ? familyId : "••••••••"}</code>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setShowFamilyId(!showFamilyId)} className="p-2 text-slate-400">{showFamilyId ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                  <button onClick={() => setShowQR(true)} className="p-2 text-indigo-500"><QrCode size={18} /></button>
                  <button onClick={handleCopyID} className="p-2 text-amber-500">{copySuccess ? <Check size={18} /> : <Copy size={18} />}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : profiles.length === 0 ? (
          /* ХҮН БАЙХГҮЙ ҮЕД ХАРАГДАХ ХЭСЭГ */
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-dashed border-slate-200 rounded-[3rem] animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-inner">
              <Users size={32} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Одоогоор хүн алга</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center leading-relaxed mb-6">
              Та гэр бүлийн гишүүдээ нэмж <br/> ургийн бичгээ хөтөлж эхэлнэ үү.
            </p>
            <button 
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-amber-100 active:scale-95"
            >
              <Plus size={16} strokeWidth={4} /> Эхний гишүүнийг нэмэх
            </button>
          </div>
        ) : (
          /* ГИШҮҮДИЙН ЖАГСААЛТ */
          <div className="space-y-3"> 
            {Object.keys(groupedByGeneration).sort((a,b) => Number(a)-Number(b)).map((gen) => (
              <section key={gen}>
                <div className="flex items-center gap-2 px-1 mb-2">
                  <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                  <h2 className="font-black text-[12px] uppercase text-slate-800">{gen === "1" ? "Ургийн Тэргүүн" : `${gen}-р үе`}</h2>
                </div>

                <div className="flex overflow-x-auto gap-1.5 no-scrollbar snap-x px-1">
                  {groupedByGeneration[gen].map((p) => (
                    <div key={p._id} className="snap-start min-w-[260px] md:min-w-[300px]">
                      <div className="bg-white border border-slate-100 rounded-[2rem] p-4 hover:shadow-xl transition-all duration-300 group relative">
                        <Link href={`/person/${p._id}`} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm z-10">
                          <ArrowRight size={14} />
                        </Link>
                        
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0">
                             {p.pic ? <img src={p.pic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><Users size={20} /></div>}
                           </div>
                           <div className="min-w-0 pr-6">
                             <h3 className="text-sm font-black text-slate-800 group-hover:text-amber-500 truncate leading-none">{p.name}</h3>
                             <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">{p.profession || "Мэргэжилгүй"}</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-50">
                           <span className="text-[8px] font-bold text-slate-300 uppercase italic">Төрсөн: {p.birthYear || "---"}</span>
                           <div className="flex gap-1">
                             <button onClick={() => { setEditingProfile(p); setIsEditOpen(true); }} className="p-1.5 bg-slate-50 text-slate-400 hover:text-amber-500 rounded-lg transition-all"><Edit3 size={14} /></button>
                             <button onClick={() => handleDelete(p._id)} className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14} /></button>
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

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-white to-transparent">
        <div className="bg-slate-900 rounded-2xl p-1.5 shadow-2xl flex items-center justify-between">
          <Link href="/" className="p-3 text-amber-400"><Home size={22} /></Link>
          <button onClick={() => setIsRegisterOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl mx-2">
            <Plus size={16} strokeWidth={4} /> Гишүүн Нэмэх
          </button>
          <Link href="/story" className="p-3 text-white/60 hover:text-amber-400 transition-colors">
            <BookOpen size={22} />
          </Link>
        </div>
      </nav>

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center relative">
            <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-800"><X size={18} /></button>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Ургийн QR Код</h3>
            <div className="bg-white p-4 rounded-3xl border-4 border-slate-50 inline-block mb-6 shadow-inner">
              <QRCodeSVG value={familyId} size={200} level="H" />
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-2">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Таны Ургийн Код</p>
               <p className="text-lg font-bold text-amber-600 font-mono tracking-tighter">{familyId}</p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 leading-relaxed">Энэхүү кодыг уншуулж гэр бүлийн <br/> гишүүд таны үүсгэсэн урагт нэгдэнэ</p>
          </div>
        </div>
      )}

      {/* ALERT MODALS */}
      {alertModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 
                ${alertModal.type === 'message' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                {alertModal.type === 'message' ? <Check size={28} /> : 
                 alertModal.type === 'logout' ? <LogOut size={28} /> : <Trash2 size={28} />}
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">{alertModal.title}</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">{alertModal.message}</p>
              
              <div className="flex gap-2 w-full">
                {alertModal.type === 'message' ? (
                  <button onClick={() => setAlertModal({ open: false })} className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-amber-100">Ойлголоо</button>
                ) : (
                  <>
                    <button onClick={() => setAlertModal({ open: false })} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase">Үгүй</button>
                    <button 
                      onClick={alertModal.type === 'logout' ? performLogout : performDelete} 
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-red-100"
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
      `}</style>
    </div>
  );
}