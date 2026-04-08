"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { 
  ArrowLeft, Crown, User, BookOpen, Edit3, Trash2, 
  CheckCircle2, X, Calendar, Heart, Cross, 
  Sparkles
} from "lucide-react"; 
import RegisterForm from "../components/RegisterForm";
import Link from "next/link";

export default function PersonProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [person, setPerson] = useState(null);
  const [parent, setParent] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, message: "", type: "" });

  const fetchData = useCallback(async () => {
    if (!router.isReady || !id) return;
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user_data");
      const user = JSON.parse(userStr || "{}");
      
      const res = await fetch(`/api/persons?familyId=${encodeURIComponent(user.familyId)}`);
      const data = await res.json();
      
      if (data.success) {
        const found = data.data.find(p => p._id === id);
        if (found) {
          setPerson(found);
          setParent(data.data.find(p => p._id === found.parentId) || null);
          setSiblings(data.data.filter(p => p.parentId === found.parentId && p._id !== found._id));
          setChildren(data.data.filter(p => p.parentId === found._id));
          // Хуудас солигдоход дээшээ гүйлгэх
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) { 
      console.error("Дата авахад алдаа гарлаа:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [id, router.isReady]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      const res = await fetch(`/api/persons`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: person._id, familyId: user.familyId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsDeleteModalOpen(false);
        setSuccessModal({ open: true, message: "Мэдээллийг амжилттай устгалаа", type: "delete" });
      }
    } catch (err) { 
      console.error(err);
    }
  };

  const handleUpdateSuccess = () => {
    setIsEditOpen(false);
    fetchData();
    setSuccessModal({ open: true, message: "Мэдээллийг амжилттай шинэчлэлээ", type: "edit" });
  };

  const closeSuccessModal = () => {
    setSuccessModal({ ...successModal, open: false });
    if (successModal.type === "delete") router.push("/landingPage");
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Уншиж байна...</div>
    </div>
  );

  if (!person) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-bold text-slate-500">Хэрэглэгч олдсонгүй.</p>
      <Link href="/landingPage" className="text-amber-500 font-black text-xs uppercase">Буцах</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <div className="max-w-3xl mx-auto w-full pt-3 px-3 flex-grow pb-12">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center gap-3 mb-6">
          <Link href="/landingPage" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> БУЦАХ
          </Link>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-amber-400 hover:text-amber-600 font-black text-[10px] uppercase tracking-wider shadow-sm transition-all"
            >
              <Edit3 size={14} /> <span>Засах</span>
            </button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-red-500 hover:border-red-200 hover:bg-red-50 font-black text-[10px] uppercase tracking-wider shadow-sm transition-all">
              <Trash2 size={14} /> <span>Устгах</span>
            </button>
          </div>
        </div>

        {/* Profile Card Section */}
        <div className={`bg-white border rounded-[2.5rem] overflow-hidden shadow-sm mb-6 ${Number(person.generation) === 1 ? 'border-amber-200 ring-4 ring-amber-50/50' : 'border-slate-100'}`}>
          <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="shrink-0 relative">
              <div className={`w-36 h-48 md:w-44 md:h-56 bg-slate-50 border-4 shadow-2xl rounded-[2rem] overflow-hidden transition-transform hover:scale-[1.02] duration-500 ${Number(person.generation) === 1 ? 'border-amber-400' : 'border-white'}`}>
                {(person.pic || person.imageUrl) ? (
                  <img src={person.pic || person.imageUrl} className="w-full h-full object-cover" alt={person.name} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300">
                    <User size={48} strokeWidth={1.5} />
                    <span className="text-[8px] font-black uppercase mt-2 tracking-widest opacity-50">Зураггүй</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-4 border-white shadow-xl font-black">
                <span className="text-[14px] leading-none">{person.generation}</span>
                <span className="text-[7px] uppercase opacity-60">үе</span>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
                {Number(person.generation) === 1 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-[9px] font-black uppercase shadow-lg shadow-amber-100">
                    <Crown size={10} fill="currentColor" /> Ургийн тэргүүн
                  </div>
                )}
                {person.deathyear && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-white rounded-full text-[9px] font-black uppercase">
                    <Cross size={10} /> Тэнгэрт хальсан
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic mb-1 tracking-tight">{person.name}</h1>
              <div className="inline-block px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase mb-6 tracking-widest">
                {person.job || "Мэргэжил тодорхойгүй"}
              </div>
              
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 pt-6 border-t border-slate-50 text-left">
                <InfoItem label="Төрсөн он" value={person.birthyear} />
                <InfoItem label="Хүйс" value={person.gender === "male" ? "Эрэгтэй" : "Эмэгтэй"} />
                <InfoItem label="Төрсөн нутаг" value={person.bornplace} />
                <InfoItem 
                  label={person.deathyear ? "Нас барсан он" : "Одоогийн хаяг"} 
                  value={person.deathyear || person.currentplace} 
                  highlight={!!person.deathyear} 
                />
              </div>
            </div>
          </div>

          {person.spouse && person.spouse.name && (
            <div className="px-6 md:px-10 py-4 bg-rose-50/30 border-t border-rose-100/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                  <Heart size={18} fill="currentColor" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] leading-none block mb-1">Гэр бүлийн хүн</label>
                  <p className="text-[14px] font-black text-rose-950 uppercase italic leading-tight">
                    {person.spouse.lastname} {person.spouse.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 md:px-10 py-6 bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={14} className="text-amber-500" />
              <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Намтар түүх</h2>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-600 font-medium italic whitespace-pre-wrap">
              {person.about || person.barimt || "Намтар түүх бүртгэгдээгүй байна."}
            </p>
          </div>
        </div>

        {/* Family Tree Connections */}
        <div className="space-y-3">
          {person.parentId && parent && (
            <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm">
              <h3 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Дээд үе (Эцэг / Эх)
              </h3>
              <Link href={`/person/${parent._id}`} className="flex items-center gap-4 p-2.5 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                  {parent.pic ? <img src={parent.pic} className="w-full h-full object-cover" alt={parent.name} /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={20} /></div>}
                </div>
                <div>
                  <div className="text-[14px] font-black uppercase text-slate-800 group-hover:text-amber-600 transition-colors leading-none mb-1">{parent.name}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{parent.generation}-р үе</div>
                </div>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FamilyBlock title="Ах дүүс" count={siblings.length}>
              <div className="space-y-1">
                {siblings.map(sib => (
                  <Link key={sib._id} href={`/person/${sib._id}`} className="flex items-center gap-3 p-2 hover:bg-amber-50/50 rounded-xl transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-white shadow-sm">
                      {sib.pic ? <img src={sib.pic} className="w-full h-full object-cover" alt={sib.name} /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={16} /></div>}
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-amber-600 truncate">{sib.name}</span>
                  </Link>
                ))}
                {siblings.length === 0 && <p className="text-[10px] text-slate-300 italic py-2 px-2">Бүртгэлгүй</p>}
              </div>
            </FamilyBlock>

            <FamilyBlock title="Үр хүүхэд" count={children.length}>
              <div className="space-y-1">
                {children.map(child => (
                  <Link key={child._id} href={`/person/${child._id}`} className="flex items-center gap-3 p-2 hover:bg-amber-50/50 rounded-xl transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-white shadow-sm">
                      {child.pic ? <img src={child.pic} className="w-full h-full object-cover" alt={child.name} /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={16} /></div>}
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-amber-600 truncate">{child.name}</span>
                  </Link>
                ))}
                {children.length === 0 && <p className="text-[10px] text-slate-300 italic py-2 px-2">Бүртгэлгүй</p>}
              </div>
            </FamilyBlock>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center text-white font-black text-[10px]">U</div>
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">UgsaaNet</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Бүх эрх хуулиар хамгаалагдсан</p>
        </div>
      </footer>

      {/* MODALS Implementation stays mostly same but with refined styling */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
               <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-black uppercase mb-2 tracking-tight">Засварлах уу?</h3>
            <p className="text-[12px] text-slate-500 mb-8 font-medium px-4">Та энэ гишүүний мэдээлэлд өөрчлөлт оруулах гэж байна.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setIsEditModalOpen(false); setIsEditOpen(true); }} 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all active:scale-95"
              >
                Мэдээлэл засах
              </button>
              <button onClick={() => setIsEditModalOpen(false)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em]">Болих</button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && <RegisterForm isOpen={isEditOpen} setIsOpen={setIsEditOpen} editData={person} onUpdate={handleUpdateSuccess} />}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 -rotate-3">
               <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black uppercase mb-2 text-red-600 tracking-tight">Устгах уу?</h3>
            <p className="text-[13px] text-slate-500 mb-8 font-medium italic">"{person.name}"-ийн мэдээллийг бүрмөсөн устгах уу?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-red-600 transition-all active:scale-95">Тийм, устгах</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em]">Болих</button>
            </div>
          </div>
        </div>
      )}

      {successModal.open && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-3xl">
            <div className="w-20 h-20 text-emerald-500 rounded-full flex items-center justify-center bg-emerald-50 mx-auto mb-6">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2 tracking-tighter">Амжилттай</h3>
            <p className="text-[13px] text-slate-400 mb-10 font-medium leading-relaxed">{successModal.message}</p>
            <button onClick={closeSuccessModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-600 transition-all">ОЙЛГОЛОО</button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, highlight = false }) {
  return (
    <div className="group">
      <label className={`block text-[9px] font-black uppercase mb-1 tracking-widest opacity-70 ${highlight ? 'text-red-400' : 'text-slate-400'}`}>
        {label}
      </label>
      <p className={`text-[13px] font-bold transition-colors leading-tight ${highlight ? 'text-red-700' : 'text-slate-800 group-hover:text-amber-600'}`}>
        {value || "---"}
      </p>
    </div>
  );
}

function FamilyBlock({ title, count, children }) {
  return (
    <section className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
        <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full shadow-sm shadow-amber-200" /> {title}
        </h3>
        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black shadow-lg ring-4 ring-slate-50">{count}</span>
      </div>
      <div className="min-h-[40px]">{children}</div>
    </section>
  );
}