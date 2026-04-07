"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import RegisterForm from "./RegisterForm";
import { useRouter } from "next/navigation";
import ProfileCard from "./ProfileCard";
import {
  Fingerprint, Plus, LogOut, Search, BookOpen, Home, 
  Users, ArrowRight, Copy, Check, Edit3, Trash2, Eye, ChevronRight, EyeOff, QrCode, X, ChevronDown
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
  const [selectedParentId, setSelectedParentId] = useState(null);
  
  // Хүүхдүүдийг дэлгэж харах төлөв болон Ref
  const [expandedParentId, setExpandedParentId] = useState(null);
  const expandedRef = useRef(null);

  // Дэлгэгдсэн хэсэг рүү зөөлөн очих эффект
  useEffect(() => {
    if (expandedParentId && expandedRef.current) {
      setTimeout(() => {
        expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 200);
    }
  }, [expandedParentId]);

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
      if (!targetId) return;

      const url = `/api/persons?familyId=${encodeURIComponent(targetId)}`;
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

  const handleSuccessAction = (msg) => {
    fetchProfiles(familyId);
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
      const data = await res.json();
      if (data.success) {
        setProfiles(prev => prev.filter(p => p._id !== id));
        if (expandedParentId === id) setExpandedParentId(null);
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
    let result = profiles;
    if (selectedParentId) {
      result = profiles.filter(p => p.parentId === selectedParentId);
    }
    return result.filter((p) => 
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profiles, searchQuery, selectedParentId]);

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-2 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
            <Link href="/" onClick={() => setSelectedParentId(null)} className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg"><Fingerprint size={18} strokeWidth={2.5} /></div>
                <div className="hidden sm:flex flex-col leading-[0.8] font-[1000] uppercase text-[12px]">
                  <span className="text-slate-800">Угсаа</span><span className="text-amber-500">нет</span>
                </div>
            </Link>
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ургийн код</span>
              <code className="text-xs font-bold text-amber-600 font-mono min-w-[8rem]">{showFamilyId ? familyId : "••••••••"}</code>
              <button onClick={() => setShowFamilyId(!showFamilyId)} className="p-1 hover:text-amber-500 transition-colors">{showFamilyId ? <Eye size={14} /> : <EyeOff size={14} />}</button>
              <button onClick={handleCopyID} className="p-1 hover:text-amber-500 transition-colors">{copySuccess ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}</button>
              <button onClick={() => setShowQR(true)} className="p-1 hover:text-indigo-500 border-l border-slate-200 ml-1 pl-2 transition-colors"><QrCode size={14} /></button>
            </div>
            <Link href="/story" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all">
              <BookOpen size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Түүх</span>
            </Link>
            <div className="flex-1 max-w-[200px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Хайх..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/60 rounded-full py-1.5 pl-9 pr-4 text-[11px] outline-none focus:bg-white border border-transparent focus:border-amber-100 transition-all"/>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleLogoutClick} className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                <LogOut size={20} />
              </button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-28">
        {selectedParentId && (
          <div className="mb-4 flex items-center justify-between bg-amber-50 p-3 rounded-2xl border border-amber-100 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-amber-600" />
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-tight">
                {profiles.find(p => p._id === selectedParentId)?.name}-ийн хүүхдүүд
              </span>
            </div>
            <button 
              onClick={() => setSelectedParentId(null)}
              className="px-3 py-1 bg-white rounded-lg text-[9px] font-black uppercase text-slate-500 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1"
            >
              <X size={12} /> Буцах
            </button>
          </div>
        )}

        {!loading && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-800 leading-tight uppercase tracking-tight italic">Миний Ураг</h2>
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Нийт {profiles.length} гишүүн</p>
                </div>
              </div>
              <button onClick={() => setIsRegisterOpen(true)} className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-slate-100">
                <Plus size={14} strokeWidth={4} /> Гишүүн нэмэх
              </button>
            </div>
          </div>
        )}

       {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div> 
            {Object.keys(groupedByGeneration).sort((a,b) => Number(a)-Number(b)).map((gen) => (
              <section key={gen}>
                <div className="flex items-center gap-2 px-2 mb-4">
                  <div className="w-1 h-3.5 bg-amber-500 rounded-full"></div>
                  <h2 className="font-black text-[10px] uppercase text-slate-800 tracking-wider">
                    {gen === "1" ? "Ургийн Тэргүүн" : `${gen}-р үе`}
                  </h2>
                  <div className="flex-1 border-t border-slate-200"></div>
                  <Link href={`/generation/${gen}`} className="text-amber-500 hover:text-amber-600 flex gap-1 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Үзэх</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                
                <div className="flex overflow-x-auto gap-3 no-scrollbar snap-x px-1 pb-4">
                  {groupedByGeneration[gen].map((p) => {
                    const children = profiles.filter(c => c.parentId === p._id);
                    const isExpanded = expandedParentId === p._id;

                    return (
                      <div key={p._id} className="flex flex-col items-center gap-3 shrink-0 snap-center relative">
                        <div className="relative group">
                          <ProfileCard 
                            profile={p} 
                            profiles={profiles}
                            onDelete={(id) => handleDelete(id)}
                            onEdit={(data) => { setEditingProfile(data); setIsEditOpen(true); }}
                          />
                          
                          {children.length > 0 && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedParentId(isExpanded ? null : p._id);
                              }}
                              className={`absolute bottom-2 right-2 p-1.5 shadow-sm rounded-lg border transition-all z-10 cursor-pointer flex flex-col items-center justify-center gap-1
                                ${isExpanded ? 'bg-amber-500 text-white border-amber-600' : 'bg-white/90 text-amber-600 border-slate-100 hover:bg-amber-500 hover:text-white'}`}
                              title="Хүүхдүүдийг харах"
                            >
                              <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              <span className="text-[10px] font-bold">{children.length}</span>
                            </div>
                          )}
                        </div>

                        {isExpanded && (
                          <div 
                            ref={expandedRef}
                            className="mt-2 p-3 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 w-full min-w-[200px]"
                          >
                            <div className="flex flex-col gap-2">
                              {children.map(child => (
                                <div key={child._id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                                   <div className="w-6 h-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">
                                     {child.name?.charAt(0)}
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-700 truncate flex-1">{child.name}</span>
                                   <Link href={`/person/${child._id}`} className="p-1.5 bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all flex items-center justify-center">
                                    <ArrowRight size={14} />
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
            
            {filteredProfiles.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Гишүүн олдсонгүй</p>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-white via-white/80 to-transparent">
        <div className="bg-slate-900 rounded-2xl p-1.5 shadow-2xl flex items-center justify-between max-w-md mx-auto">
          <Link href="/" onClick={() => setSelectedParentId(null)} className="p-3.5 text-amber-400"><Home size={22} /></Link>
          <button onClick={() => setIsRegisterOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest mx-2">
            <Plus size={16} strokeWidth={4} /> Гишүүн Нэмэх
          </button>
          <Link href="/story" className="p-3.5 text-white/60"><BookOpen size={22} /></Link>
        </div>
      </nav>

      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center relative">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400"><X size={18} /></button>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6">Ургийн QR Код</h3>
            <div className="bg-white p-4 rounded-2xl border-4 border-slate-50 inline-block mb-6">
              <QRCodeSVG value={familyId} size={180} level="H" />
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
               <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Ургийн Код</p>
               <p className="text-sm font-bold text-amber-600 font-mono break-all">{familyId}</p>
            </div>
          </div>
        </div>
      )}

      {alertModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-6">
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 
                ${alertModal.type === 'message' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                {alertModal.type === 'message' ? <Check size={24} /> : 
                 alertModal.type === 'logout' ? <LogOut size={24} /> : <Trash2 size={24} />}
              </div>
              <h3 className="text-base font-black text-slate-800 mb-1 uppercase">{alertModal.title}</h3>
              <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase">{alertModal.message}</p>
              
              <div className="flex gap-2 w-full">
                {alertModal.type === 'message' ? (
                  <button onClick={() => setAlertModal({ ...alertModal, open: false })} className="w-full py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase">Ойлголоо</button>
                ) : (
                  <>
                    <button onClick={() => setAlertModal({ ...alertModal, open: false })} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase">Болих</button>
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

      {isRegisterOpen && (
        <RegisterForm 
          isOpen={isRegisterOpen} 
          setIsOpen={setIsRegisterOpen} 
          onProfileAdded={() => handleSuccessAction('Шинэ гишүүн амжилттай бүртгэгдлээ')} 
          hasHeadOfFamily={hasHeadOfFamily}
          familyId={familyId}
        />
      )}
      {isEditOpen && (
        <RegisterForm 
          isOpen={isEditOpen} 
          setIsOpen={setIsEditOpen} 
          editData={editingProfile} 
          onUpdate={() => handleSuccessAction('Мэдээлэл амжилттай шинэчлэгдлээ')} 
          hasHeadOfFamily={hasHeadOfFamily}
          familyId={familyId}
        />
      )}
    </div>
  );
}