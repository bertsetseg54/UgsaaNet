"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Crown, User, BookOpen } from "lucide-react";
import SiblingsList from "../components/SiblingsList";
import FamilySection from "../components/FamilySection";
import Link from "next/link";

export default function PersonProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [person, setPerson] = useState(null);
  const [parent, setParent] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      const res = await fetch(user.familyId ? `/api/persons?familyId=${encodeURIComponent(user.familyId)}` : "/api/persons");
      const data = await res.json();

      if (data.success) {
        const found = data.data.find((p) => p._id === id);
        if (found) {
          setPerson(found);
          // Дээд үеийг олох (Parent)
          if (found.parentId) {
            const foundParent = data.data.find((p) => p._id === found.parentId);
            setParent(foundParent);
          }
          // Ах дүүсийг шүүх
          setSiblings(data.data.filter((p) => p.parentId === found.parentId && p._id !== found._id));
          // Үр хүүхдийг шүүх
          setChildren(data.data.filter((p) => p.parentId === found._id));
        }
      }
    } catch (err) {
      console.error("Дата татахад алдаа гарлаа:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (router.isReady) fetchData();
  }, [router.isReady, fetchData]);

  if (loading || !person) return <div className="p-20 text-center text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] animate-pulse">Уншиж байна...</div>;

  // Ургийн тэргүүн мөн эсэхийг шалгах (1-р үе эсвэл isHead flag)
  const isHeadOfFamily = Number(person.generation) === 1 || person.isHead;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-3 px-3 antialiased">
      <div className="max-w-3xl mx-auto pb-10">
        <Link href="/landingPage" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-600 text-[9px] font-black uppercase tracking-widest mb-3 transition-colors">
          <ArrowLeft size={10} /> БУЦАХ
        </Link>

        {/* Profile Card */}
        <div className={`bg-white border rounded-[2.5rem] overflow-hidden shadow-sm mb-4 transition-all ${isHeadOfFamily ? 'border-amber-200 ring-4 ring-amber-50' : 'border-slate-100'}`}>
          <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            
            {/* Image Section */}
            <div className="shrink-0 relative">
              <div className={`w-36 h-48 md:w-44 md:h-56 bg-slate-50 border-4 shadow-2xl rounded-[2rem] overflow-hidden transition-all ${isHeadOfFamily ? 'border-amber-400' : 'border-white'}`}>
                {person.pic ? (
                  <img src={person.pic} className="w-full h-full object-cover" alt={person.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                    <User size={48} />
                  </div>
                )}
              </div>
              
              {/* Generation Badge */}
              <div className="absolute -bottom-3 -right-3 bg-slate-900 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-4 border-white shadow-xl">
                <span className="text-[14px] font-black leading-none">{person.generation}</span>
                <span className="text-[7px] font-black uppercase opacity-60">үе</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 w-full">
              <div className="mb-6">
                {/* Ургийн тэргүүн Badge */}
                {isHeadOfFamily && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-3 shadow-lg shadow-amber-200 animate-in fade-in zoom-in duration-500">
                    <Crown size={12} fill="currentColor" /> Ургийн тэргүүн
                  </div>
                )}
                
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic leading-none mb-2 tracking-tight">
                  {person.name}
                </h1>
                
                <div className="inline-block px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {person.job || "Мэргэжилгүй"} 
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                <InfoItem label="Төрсөн он" value={person.birthyear} />
                <InfoItem label="Хүйс" value={person.gender === "male" ? "Эрэгтэй" : "Эмэгтэй"} />
                <div className="col-span-2">
                  <InfoItem label="Төрсөн нутаг" value={person.bornplace} />
                </div>
              </div>
            </div>
          </div>

          {/* Biography / Намтар */}
          <div className="px-6 md:px-10 py-6 bg-slate-50/50 border-t border-slate-50">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={14} className="text-amber-500" />
              <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Намтар түүх</h2>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-600 font-medium italic whitespace-pre-wrap">
              {person.about || person.barimt || "Намтар түүх бүртгэгдээгүй байна."}
            </p>
          </div>
        </div>

        {/* Family Structure */}
        <div className="space-y-4">
          
          {/* Дээд үе - Хэрэв 1-р үе биш бол харуулна */}
          {!isHeadOfFamily && (
            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm">
               <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" /> Дээд үе (Эцэг / Эх)
               </h3>
               {parent ? (
                 <Link href={`/person/${parent._id}`} className="flex items-center gap-4 p-3 hover:bg-amber-50 rounded-2xl transition-all border border-slate-100 hover:border-amber-200 group">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                      <img src={parent.pic || "/api/placeholder/56/56"} alt={parent.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-[12px] font-black text-slate-800 uppercase group-hover:text-amber-700 transition-colors tracking-tight">{parent.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{parent.generation}-р үеийн төлөөлөл</div>
                    </div>
                 </Link>
               ) : (
                 <div className="text-[10px] text-slate-400 italic font-medium p-2 bg-slate-50 rounded-xl text-center">Дээд үеийн мэдээлэл бүртгэгдээгүй.</div>
               )}
            </div>
          )}

          {/* Доод үе болон Ах дүүс */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FamilyBlock title="Ах дүүс" count={siblings.length}>
              <SiblingsList data={siblings} />
            </FamilyBlock>
            <FamilyBlock title="Үр хүүхэд" count={children.length}>
              <FamilySection data={children} />
            </FamilyBlock>
          </div>
        </div>
      </div>
    </div>
  );
}

// Туслах компонентууд
function InfoItem({ label, value }) {
  return (
    <div>
      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">{label}</label>
      <p className="text-[14px] font-bold text-slate-800">{value || "---"}</p>
    </div>
  );
}

function FamilyBlock({ title, count, children }) {
  return (
    <section className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
        <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-widest">{title}</h3>
        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black">{count}</span>
      </div>
      <div className="min-h-[60px]">
        {children}
      </div>
    </section>
  );
}