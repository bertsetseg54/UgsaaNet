"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router"; // next/navigation биш next/router ашиглана
import { ArrowLeft, Crown, User, BookOpen, Edit3, Trash2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import RegisterForm from "../components/RegisterForm";
import Link from "next/link";

export default function PersonProfilePage() {
  const router = useRouter();
  const { id } = router.query; // URL-аас [id]-г шууд авна

  const [person, setPerson] = useState(null);
  const [parent, setParent] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, message: "", type: "" });

  const fetchData = useCallback(async () => {
    // router.isReady нь query утгууд бэлэн болсныг илтгэнэ
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
          // Дээд үе
          setParent(data.data.find(p => p._id === found.parentId) || null);
          // Ах дүүс
          setSiblings(data.data.filter(p => p.parentId === found.parentId && p._id !== found._id));
          // Хүүхдүүд
          setChildren(data.data.filter(p => p.parentId === found._id));
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
      if ((await res.json()).success) {
        setIsDeleteModalOpen(false);
        setSuccessModal({ open: true, message: "Мэдээллийг амжилттай устгалаа", type: "delete" });
      }
    } catch (err) { alert("Алдаа гарлаа"); }
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

  if (loading || !person) return <div className="p-20 text-center text-[10px] font-black text-slate-400 animate-pulse uppercase tracking-[0.2em]">Уншиж байна...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-3 px-3 antialiased">
      <div className="max-w-3xl mx-auto pb-10">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <Link href="/landingPage" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> БУЦАХ
          </Link>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setIsEditOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 hover:border-amber-400 hover:text-amber-600 font-black text-[11px] uppercase tracking-wider shadow-sm transition-all">
              <Edit3 size={15} /> <span>Засах</span>
            </button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-red-500 hover:border-red-200 hover:bg-red-50 font-black text-[11px] uppercase tracking-wider shadow-sm transition-all">
              <Trash2 size={15} /> <span>Устгах</span>
            </button>
          </div>
        </div>

        {/* Profile Card Section */}
        <div className={`bg-white border rounded-[2.5rem] overflow-hidden shadow-sm mb-6 ${Number(person.generation) === 1 ? 'border-amber-200 ring-8 ring-amber-50/50' : 'border-slate-100'}`}>
          <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="shrink-0 relative">
              <div className={`w-36 h-48 md:w-44 md:h-56 bg-slate-50 border-4 shadow-2xl rounded-[2rem] overflow-hidden ${Number(person.generation) === 1 ? 'border-amber-400' : 'border-white'}`}>
                {person.pic || person.imageUrl ? <img src={person.pic || person.imageUrl} className="w-full h-full object-cover" alt={person.name} /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={48} /></div>}
              </div>
              <div className="absolute -bottom-3 -right-3 bg-slate-900 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-4 border-white shadow-xl font-black">
                <span className="text-[14px]">{person.generation}</span><span className="text-[7px] uppercase opacity-60">үе</span>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
                {Number(person.generation) === 1 && <div className="inline-flex gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-amber-200"><Crown size={12} fill="currentColor" /> Ургийн тэргүүн</div>}
                {person.deathyear && <div className="inline-flex gap-2 px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase"><Cross size={12} /> Буяны үйлс</div>}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic mb-2 tracking-tight">{person.name}</h1>
              <div className="inline-block px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase mb-6 tracking-[0.1em]">{person.job || "Мэргэжилгүй"}</div>
              
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50 text-left">
                <InfoItem icon={<Calendar size={12} />} label="Хугацаа" value={`${person.birthyear || "????"} ${person.deathyear ? ` - ${person.deathyear}` : ""}`} />
                <InfoItem label="Хүйс" value={person.gender === "male" ? "Эрэгтэй" : "Эмэгтэй"} />
                <InfoItem label="Төрсөн нутаг" value={person.bornplace} />
                <InfoItem 
                  label={person.deathyear ? "Нас барсан хаяг" : "Одоогийн хаяг"} 
                  value={person.currentplace} 
                  highlight={person.deathyear}
                />
              </div>
            </div>
          </div>

          {/* Гэр бүлийн хүн - Spouse section */}
          {person.spouse && person.spouse.name && (
            <div className="px-6 md:px-10 py-5 bg-rose-50/40 border-t border-rose-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                  <Heart size={18} fill="currentColor" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Гэр бүлийн хүн</label>
                  <p className="text-[13px] font-black text-rose-900 uppercase italic leading-none">{person.spouse.lastname} {person.spouse.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Намтар түүх */}
          <div className="px-6 md:px-10 py-6 bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3"><BookOpen size={14} className="text-amber-500" /><h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Намтар түүх</h2></div>
            <p className="text-[13px] leading-relaxed text-slate-600 font-medium italic whitespace-pre-wrap">{person.about || person.barimt || "Намтар түүх бүртгэгдээгүй байна."}</p>
          </div>
        </div>

        {/* Connections Section */}
        <div className="space-y-4">
          {person.parentId && parent && (
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" /> Дээд үе (Эцэг / Эх)
              </h3>
              <Link href={`/person/${parent._id}`} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                  {parent.pic ? (
                    <img src={parent.pic} className="w-full h-full object-cover" alt={parent.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={24} /></div>
                  )}
                </div>
                <div>
                  <div className="text-[13px] font-black uppercase text-slate-800 group-hover:text-amber-600 transition-colors">{parent.name}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{parent.generation}-р үеийн төлөөлөл</div>
                </div>
              </Link>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ах дүүс хэсэг */}
            <FamilyBlock title="Ах дүүс" count={siblings.length}>
              <div className="space-y-2">
                {siblings.map((sib) => (
                  <Link key={sib._id} href={`/person/${sib._id}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                      {sib.pic ? (
                        <img src={sib.pic} className="w-full h-full object-cover" alt={sib.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={20} /></div>
                      )}
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-amber-600">{sib.name}</span>
                  </Link>
                ))}
              </div>
            </FamilyBlock>

            {/* Үр хүүхэд хэсэг */}
            <FamilyBlock title="Үр хүүхэд" count={children.length}>
              <div className="space-y-2">
                {children.map((child) => (
                  <Link key={child._id} href={`/person/${child._id}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                      {child.pic ? (
                        <img src={child.pic} className="w-full h-full object-cover" alt={child.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={20} /></div>
                      )}
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-amber-600">{child.name}</span>
                  </Link>
                ))}
              </div>
            </FamilyBlock>
          </div>
        </div>
      </div>

      {/* MODALS (RegisterForm, Delete, Success) */}
      {isEditOpen && <RegisterForm isOpen={isEditOpen} setIsOpen={setIsEditOpen} editData={person} onUpdate={handleUpdateSuccess} />}
      
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[8px] z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
               <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black uppercase mb-2 text-slate-900">Устгах уу?</h3>
            <p className="text-[13px] text-slate-500 mb-8 font-medium italic">"{person.name}"-ийн мэдээллийг бүрмөсөн устгах уу?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95">Тийм, устгах</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl text-[11px] font-black uppercase hover:bg-slate-200 transition-all">Болих</button>
            </div>
          </div>
        </div>
      )}

      {successModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[12px] z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-3xl animate-in zoom-in-95 fade-in duration-300">
            <div className="w-20 h-20 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase mb-3 text-slate-900">Амжилттай</h3>
            <p className="text-[13px] text-slate-400 mb-10 font-medium">{successModal.message}</p>
            <button onClick={closeSuccessModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95">ОЙЛГОЛОО</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Туслах функцууд
function InfoItem({ label, value }) {
  return (
    <div className="group">
      <label className={`block text-[9px] font-black uppercase mb-1.5 tracking-widest opacity-80 ${highlight ? 'text-red-400' : 'text-slate-400'}`}>
        {label}
      </label>
      <p className={`text-[13px] font-bold transition-colors ${highlight ? 'text-red-700' : 'text-slate-800 group-hover:text-amber-600'}`}>
        {value || "---"}
      </p>
    </div>
  );
}

function FamilyBlock({ title, count, children }) {
  return (
    <section className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-5 border-b border-slate-50 pb-4">
        <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> {title}
        </h3>
        <span className="px-3 py-1 bg-slate-900 text-white rounded-xl text-[10px] font-black shadow-sm ring-4 ring-slate-50">{count}</span>
      </div>
      <div className="min-h-[40px]">{children}</div>
    </section>
  );
}