"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  User,
  Users,
  Calendar,
  MapPin,
  Heart,
  ScrollText,
  Plus,
  BookOpen,
  HomeIcon,
  ArrowLeft
} from "lucide-react";
import ParentsList from "../components/ParentsList";
import SiblingsList from "../components/SiblingsList";
import FamilySection from "../components/FamilySection";
import Link from "next/link";
import RegisterForm from "../components/RegisterForm";

export default function PersonProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allPersons, setAllPersons] = useState([]);
  const [ancestors, setAncestors] = useState([]);
  const [siblings, setSiblings] = useState([]);
  const [children, setChildren] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Өвөг дээдсийг олох функц
  const findAncestors = (currentId, allPersonsList) => {
    let result = [];
    let current = allPersonsList.find((p) => p._id === currentId);
    while (current && current.parentId) {
      const parent = allPersonsList.find((p) => p._id === current.parentId);
      if (!parent) break;
      result.push(parent);
      current = parent;
    }
    return result;
  };

  // Мэдээлэл татах функц
  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      const url = user.familyId 
        ? `/api/persons?familyId=${encodeURIComponent(user.familyId)}`
        : "/api/persons";
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setAllPersons(data.data);
        const found = data.data.find((p) => p._id === id);
        if (found) {
          setPerson(found);
          setAncestors(findAncestors(found._id, data.data));
          setSiblings(
            data.data.filter(
              (p) => p.parentId === found.parentId && p._id !== found._id
            )
          );
          setChildren(data.data.filter((p) => p.parentId === found._id));
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (router.isReady) {
      fetchData();
    }
  }, [router.isReady, fetchData]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Уншиж байна...</p>
      </div>
    );

  if (!person) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <p className="uppercase text-xs tracking-widest font-bold text-slate-500">Мэдээлэл олдсонгүй</p>
        <Link href="/landingPage" className="mt-4 text-amber-600 font-bold text-xs uppercase hover:underline">← Буцах</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-40 pt-6 px-4 md:px-8 lg:px-12 antialiased text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-8">
            <Link
                href="/landingPage"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-600 transition-all text-[10px] font-black uppercase tracking-widest group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> БУЦАХ
            </Link>
        </div>

        {/* Ancestors Section - 1-р үе биш бол харуулна */}
        {Number(person.generation) !== 1 && (
          <section className="bg-white border border-slate-200 rounded-[2rem] p-6 mb-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-6 text-slate-400">
              <Users size={14} strokeWidth={3} className="text-amber-500" /> Өвөг дээдэс
            </h3>
            <div className="overflow-x-auto pb-2 no-scrollbar">
              <div className="min-w-max">
                  <ParentsList data={ancestors} />
              </div>
            </div>
          </section>
        )}

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-[3rem] overflow-hidden mb-8">
          <div className="p-8 md:p-14 flex flex-col md:flex-row gap-10 lg:gap-20 items-center md:items-start text-center md:text-left">
            
            {/* Photo & Gen */}
            <div className="shrink-0 relative">
              <div className="w-48 h-60 md:w-56 md:h-72 bg-slate-50 border-8 border-white shadow-2xl rounded-[2.5rem] overflow-hidden">
                  <img
                    src={person.pic || "/api/placeholder/160/200"}
                    alt={person.name}
                    className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-500"
                  />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-white w-16 h-16 rounded-3xl flex flex-col items-center justify-center shadow-xl border-4 border-white">
                  <span className="text-xl font-black leading-none">{person.generation}-р</span>
                  <span className="text-[9px] font-bold leading-none uppercase tracking-tighter">үе</span>
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 w-full flex flex-col justify-center">
              <div className="mb-8">
                {/* Ургийн тэргүүн шошго */}
                {Number(person.generation) === 1 && (
                  <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-amber-500 text-white rounded-full shadow-lg shadow-amber-200 border border-amber-400">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Ургийн Тэргүүн</span>
                  </div>
                )}
                
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic leading-none">
                  {person.name}
                </h1>
                <div className="inline-flex px-6 py-2 bg-amber-50 text-amber-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-amber-100/50 shadow-sm">
                  {person.profession || "Мэргэжил тодорхойгүй"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                <InfoItem icon={<Calendar size={18}/>} label="Төрсөн он сар" value={`${person.birthyear || "????"} ${person.deathyear ? `— ${person.deathyear}` : ""}`} />
                <InfoItem icon={<User size={18}/>} label="Хүйс" value={person.gender === "male" ? "Эрэгтэй" : "Эмэгтэй"} />
                <div className="sm:col-span-2">
                   <InfoItem icon={<MapPin size={18}/>} label="Төрсөн нутаг" value={person.bornplace || "Мэдээлэл байхгүй"} />
                </div>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="px-8 py-12 md:px-14 bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <ScrollText size={16} className="text-slate-400" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Намтар түүх</h2>
            </div>
            <p className="text-lg md:text-xl leading-relaxed text-slate-700 font-serif max-w-4xl italic whitespace-pre-wrap">
              {person.barimt || "Энэхүү хүний намтар түүх одоогоор бүртгэгдээгүй байна."}
            </p>
          </div>

          {/* Spouse */}
          {person.spouse?.name && (
            <div className="p-8 md:p-14 border-t border-slate-100 bg-white">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-rose-50/30 p-8 rounded-[2.5rem] border border-rose-100/30">
                <div className="flex items-center gap-5 shrink-0">
                  <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shadow-inner">
                    <Heart size={24} className="text-rose-400" fill="currentColor" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Гэр бүлийн хүн</label>
                    <p className="text-xl font-black text-slate-800">{person.spouse.lastname} {person.spouse.name}</p>
                  </div>
                </div>
                {person.spouse.barimt && (
                  <div className="relative flex-1">
                    <p className="pl-6 border-l-2 border-rose-100 italic text-sm text-slate-600 leading-relaxed">
                      {person.spouse.barimt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Location Badge */}
        <div className="inline-flex w-full md:w-auto p-5 bg-indigo-50/50 border border-indigo-100/50 rounded-[2rem] items-center gap-5 mb-12 shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
            <MapPin size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-2">Одоогийн хаяг</span>
            <span className="text-base font-black text-indigo-900">{person.currentplace || "Бүртгэгдээгүй"}</span>
          </div>
        </div>

        {/* Family Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <FamilyBlock icon={<Users size={18}/>} title="Ах дүүс" count={siblings.length}>
            <SiblingsList data={siblings} />
          </FamilyBlock>
          <FamilyBlock icon={<Users size={18}/>} title="Үр хүүхэд" count={children.length}>
            <FamilySection data={children} />
          </FamilyBlock>
        </div>

        {/* Footer */}
        <footer className="mt-24 pb-20 text-center">
            <div className="w-16 h-1 bg-slate-200 mx-auto mb-8 rounded-full opacity-30"></div>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.5em]">
                Дижитал Угийн Бичиг • Архив №{person._id?.slice(-4).toUpperCase() || "001"}
            </p>
        </footer>
      </div>

      {/* --- MOBILE FIXED NAV --- */}
      <nav className="md:hidden fixed bottom-8 font-white left-0 right-0 px-6 z-50">
        <div className="max-w-[450px] mx-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] p-3 shadow-2xl flex  items-center justify-between">
          <Link href="/landingPage" className="p-4 text-white/40 hover:text-amber-500 transition-all">
            <HomeIcon size={24} />
          </Link>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-amber-500 text-slate-900 px-7 py-4 rounded-[1.8rem] shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95 shrink-0"
          >
            <Plus size={18} strokeWidth={4} />
            <span className="text-[11px] font-black uppercase tracking-widest">Гишүүн нэмэх</span>
          </button>

          <Link href="/story" className="p-4 text-white/40 hover:text-amber-500 transition-all">
            <BookOpen size={24} />
          </Link>
        </div>
      </nav>

      {/* MODAL */}
      <RegisterForm 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onProfileAdded={fetchData} 
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-5 group">
      <div className="mt-1 text-amber-500/40 group-hover:text-amber-500 transition-colors">{icon}</div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{label}</label>
        <p className="text-base md:text-lg font-black text-slate-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function FamilyBlock({ icon, title, count, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-4 text-slate-800">
          <span className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-amber-500 shadow-inner">
            {icon}
          </span>
          {title}
        </h3>
        <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
          {count} хүн
        </span>
      </div>
      <div>{children}</div>
    </section>
  );
}