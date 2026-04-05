"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Crown } from "lucide-react";
import SiblingsList from "../components/SiblingsList";
import FamilySection from "../components/FamilySection";
import Link from "next/link";

export default function PersonProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [person, setPerson] = useState(null);
  const [parent, setParent] = useState(null); // Дээд үе
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-3 px-3 antialiased">
      <div className="max-w-3xl mx-auto pb-10">
        <Link href="/landingPage" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-600 text-[9px] font-black uppercase tracking-widest mb-3 transition-colors">
          <ArrowLeft size={10} /> БУЦАХ
        </Link>

        {/* Profile Card */}
        <div className={`bg-white border rounded-[2rem] overflow-hidden shadow-sm mb-4 transition-all ${person.isHead ? 'border-amber-200 ring-2 ring-amber-50' : 'border-slate-100'}`}>
          <div className="p-5 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            
            {/* Image Section */}
            <div className="shrink-0 relative">
              <div className={`w-32 h-40 md:w-40 md:h-52 bg-slate-50 border-2 shadow-xl rounded-2xl overflow-hidden transition-all ${person.isHead ? 'border-amber-400 ring-4 ring-amber-100' : 'border-white'}`}>
                <img src={person.pic || "/api/placeholder/160/200"} className="w-full h-full object-cover" alt={person.name} />
              </div>
              
              {/* Generation Badge */}
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white w-9 h-9 rounded-xl flex flex-col items-center justify-center border-2 border-white shadow-lg">
                <span className="text-[12px] font-black leading-none">{person.generation}</span>
                <span className="text-[6px] font-black uppercase">үе</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="mb-4">
                {/* Ургийн тэргүүн Badge - Нэрийн дээр */}
                {person.isHead && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-[9px] font-black uppercase tracking-wider mb-2 shadow-sm animate-bounce">
                    <Crown size={10} fill="currentColor" /> Ургийн тэргүүн
                  </div>
                )}
                
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic leading-tight mb-1">
                  {person.name}
                </h1>
                
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-tight">
                  {person.profession || "Мэргэжилгүй"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <InfoItem label="Төрсөн он" value={person.birthyear} />
                <InfoItem label="Хүйс" value={person.gender === "male" ? "Эрэгтэй" : "Эмэгтэй"} />
                <div className="col-span-2 md:col-span-1">
                  <InfoItem label="Төрсөн нутаг" value={person.bornplace} />
                </div>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="px-5 py-4 border-t border-slate-100">
            <h2 className="text-[8px] font-black uppercase text-slate-400 mb-2 tracking-widest">Намтар түүх</h2>
            <p className="text-[12px] leading-relaxed text-slate-700 font-serif italic">
              {person.barimt || "Намтар түүх бүртгэгдээгүй байна."}
            </p>
          </div>
        </div>

        {/* Family Structure */}
        <div className="space-y-3">
          
          {/* Дээд үе (Parent) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
             <h3 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-[0.1em]">Дээд үе (Эцэг / Эх)</h3>
             {parent ? (
               <Link href={`/person/${parent._id}`} className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-xl transition-all border border-dashed border-slate-200 hover:border-amber-200 group">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                    <img src={parent.pic || "/api/placeholder/48/48"} alt={parent.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-slate-800 uppercase group-hover:text-amber-700 transition-colors">{parent.name}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{parent.generation}-р үеийн төлөөлөл</div>
                  </div>
               </Link>
             ) : (
               <div className="text-[10px] text-slate-400 italic font-medium p-2">Дээд үеийн мэдээлэл бүртгэгдээгүй.</div>
             )}
          </div>

          {/* Доод үе болон Ах дүүс */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{label}</label>
      <p className="text-[12px] font-black text-slate-800">{value || "---"}</p>
    </div>
  );
}

function FamilyBlock({ title, count, children }) {
  return (
    <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-2">
        <h3 className="text-[9px] font-black uppercase text-slate-800 tracking-wider">{title}</h3>
        <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[8px] font-bold">{count}</span>
      </div>
      <div className="min-h-[50px]">
        {children}
      </div>
    </section>
  );
}