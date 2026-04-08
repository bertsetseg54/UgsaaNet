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
  
  // Modal-уудын state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Анхааруулах modal
  const [isEditOpen, setIsEditOpen] = useState(false);           // Үндсэн засах form
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[10px] font-black text-slate-400 animate-pulse uppercase tracking-[0.2em]">Уншиж байна...</div>;
  if (!person) return <div className="min-h-screen flex items-center justify-center">Хэрэглэгч олдсонгүй.</div>;

  return (
    // flex-col болон min-h-screen ашиглан footer-ийг доор тулгав
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <div className="max-w-3xl mx-auto w-full pt-3 px-3 flex-grow pb-12">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <Link href="/landingPage" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> БУЦАХ
          </Link>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Засах товч: Анхааруулах модалыг нээнэ */}
            <button 
              onClick={() => setIsEditModalOpen(true)} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-amber-400 hover:text-amber-600 font-black text-[11px] uppercase tracking-wider shadow-sm transition-all"
            >
              <Edit3 size={15} /> <span>Засах</span>
            </button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-red-500 hover:border-red-200 hover:bg-red-50 font-black text-[11px] uppercase tracking-wider shadow-sm transition-all">
              <Trash2 size={15} /> <span>Устгах</span>
            </button>
          </div>
        </div>

        {/* Profile Card Section */}
        <div className={`bg-white border rounded-[2rem] overflow-hidden shadow-sm mb-4 ${Number(person.generation) === 1 ? 'border-amber-200 ring-4 ring-amber-50/50' : 'border-slate-100'}`}>
          <div className="p-5 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <div className="shrink-0 relative">
              <div className={`w-32 h-44 md:w-40 md:h-52 bg-slate-50 border-4 shadow-xl rounded-[1.5rem] overflow-hidden ${Number(person.generation) === 1 ? 'border-amber-400' : 'border-white'}`}>
                {(person.pic || person.imageUrl) ? <img src={person.pic || person.imageUrl} className="w-full h-full object-cover" alt={person.name} /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={40} /></div>}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-10 h-10 rounded-xl flex flex-col items-center justify-center border-4 border-white shadow-lg font-black">
                <span className="text-[12px]">{person.generation}</span><span className="text-[6px] uppercase opacity-60">үе</span>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                {Number(person.generation) === 1 && <div className="inline-flex gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-[9px] font-black uppercase shadow-lg shadow-amber-200"><Crown size={10} fill="currentColor" /> Ургийн тэргүүн</div>}
                {person.deathyear && <div className="inline-flex gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[9px] font-black uppercase"><Cross size={10} /> Буяны үйлс</div>}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic mb-1 tracking-tight">{person.name}</h1>
              <div className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase mb-4 tracking-[0.1em]">{person.job || "Мэргэжилгүй"}</div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 text-left">
                <InfoItem label="Хугацаа" value={`${person.birthyear || "????"} ${person.deathyear ? ` - ${person.deathyear}` : ""}`} />
                <InfoItem label="Хүйс" value={person.gender === "male" ? "Эрэгтэй" : "Эмэгтэй"} />
                <InfoItem label="Төрсөн нутаг" value={person.bornplace} />
                <InfoItem label={person.deathyear ? "Нас барсан" : "Одоогийн хаяг"} value={person.currentplace} highlight={!!person.deathyear} />
              </div>
            </div>
          </div>
          {/* Spouse, Bio, and Connections remain the same... */}
          {person.spouse && person.spouse.name && (
            <div className="px-5 md:px-8 py-3 bg-rose-50/40 border-t border-rose-100/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                  <Heart size={16} fill="currentColor" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-rose-400 uppercase tracking-widest leading-none">Гэр бүлийн хүн</label>
                  <p className="text-[12px] font-black text-rose-900 uppercase italic leading-tight">{person.spouse.lastname} {person.spouse.name}</p>
                </div>
              </div>
            </div>
          )}
          <div className="px-5 md:px-8 py-4 bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2"><BookOpen size={14} className="text-amber-500" /><h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Намтар түүх</h2></div>
            <p className="text-[12px] leading-relaxed text-slate-600 font-medium italic whitespace-pre-wrap">{person.about || person.barimt || "Намтар түүх бүртгэгдээгүй байна."}</p>
          </div>
        </div>

        {/* Family Tree Connections */}
        <div className="space-y-2">
          {person.parentId && parent && (
            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm">
              <h3 className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full" /> Дээд үе (Эцэг / Эх)</h3>
              <Link href={`/person/${parent._id}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl border border-slate-50 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                  {parent.pic ? <img src={parent.pic} className="w-full h-full object-cover" alt={parent.name} /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={20} /></div>}
                </div>
                <div>
                  <div className="text-[12px] font-black uppercase text-slate-800 group-hover:text-amber-600 transition-colors leading-none">{parent.name}</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{parent.generation}-р үе</div>
                </div>
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FamilyBlock title="Ах дүүс" count={siblings.length}>
              {siblings.map(sib => (
                <Link key={sib._id} href={`/person/${sib._id}`} className="flex border border-slate-50 items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg transition-all group mb-1">
                  <div className="w-8 h-8 rounded-md bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                    {sib.pic ? <img src={sib.pic} className="w-full h-full object-cover" alt={sib.name} /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={16} /></div>}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase group-hover:text-amber-600 truncate">{sib.name}</span>
                </Link>
              ))}
            </FamilyBlock>
            <FamilyBlock title="Үр хүүхэд" count={children.length}>
              {children.map(child => (
                <Link key={child._id} href={`/person/${child._id}`} className="flex border border-slate-50 items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg transition-all group mb-1">
                  <div className="w-8 h-8 rounded-md bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                    {child.pic ? <img src={child.pic} className="w-full h-full object-cover" alt={child.name} /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><User size={16} /></div>}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase group-hover:text-amber-600 truncate">{child.name}</span>
                </Link>
              ))}
            </FamilyBlock>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Анхааруулах Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[8px] z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <Sparkles size={28} />
            </div>
            <h3 className="text-lg font-black uppercase mb-1">Мэдээллийг шинэчлэх үү?</h3>
            <p className="text-[11px] text-slate-500 mb-6 font-medium">Та уг гишүүний мэдээллийг засаж, шинэчлэх гэж байна.</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setIsEditModalOpen(false); setIsEditOpen(true); }} 
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-colors"
              >
                Мэдээлэл засах
              </button>
              <button onClick={() => setIsEditModalOpen(false)} className="w-full py-3.5 bg-slate-50 text-slate-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]">Болих</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Жинхэнэ Засах Форм */}
      {isEditOpen && <RegisterForm isOpen={isEditOpen} setIsOpen={setIsEditOpen} editData={person} onUpdate={handleUpdateSuccess} />}

      {/* 3. Устгах Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[8px] z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <Trash2 size={28} />
            </div>
            <h3 className="text-lg font-black uppercase mb-1 text-red-600">Устгах уу?</h3>
            <p className="text-[12px] text-slate-500 mb-6 font-medium italic">"{person.name}"-ийн мэдээллийг системээс бүрмөсөн устгах уу?</p>
            <div className="flex flex-col gap-2">
              <button onClick={handleDelete} className="w-full py-3.5 bg-red-500 text-white rounded-xl text-[11px] font-black uppercase">Тийм, устгах</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-3.5 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-black uppercase">Болих</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Амжилтын Modal */}
      {successModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[12px] z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-3xl">
            <div className="w-16 h-16 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black uppercase mb-2">Амжилттай</h3>
            <p className="text-[12px] text-slate-400 mb-8 font-medium">{successModal.message}</p>
            <button onClick={closeSuccessModal} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em]">ОЙЛГОЛОО</button>
          </div>
        </div>
      )}

      {/* FOOTER: Одоо хамгийн доор тулж харагдана */}
      <footer className="pb-2 bg-white border-t border-slate-50 py-4 mt-auto">
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">© 2026 UgsaaNet</p>
        </div>
      </footer>
    </div>
  );
}

// InfoItem болон FamilyBlock функцууд хэвээрээ...
function InfoItem({ label, value, highlight = false }) {
  return (
    <div className="group">
      <label className={`block text-[8px] font-black uppercase mb-0.5 tracking-widest opacity-80 ${highlight ? 'text-red-400' : 'text-slate-400'}`}>
        {label}
      </label>
      <p className={`text-[12px] font-bold transition-colors leading-tight ${highlight ? 'text-red-700' : 'text-slate-800 group-hover:text-amber-600'}`}>
        {value || "---"}
      </p>
    </div>
  );
}

function FamilyBlock({ title, count, children }) {
  return (
    <section className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-2">
        <h3 className="text-[9px] font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> {title}
        </h3>
        <span className="px-2 py-0.5 bg-slate-900 text-white rounded-lg text-[9px] font-black shadow-sm ring-2 ring-slate-50">{count}</span>
      </div>
      <div className="min-h-[30px]">{children}</div>
    </section>
  );
}