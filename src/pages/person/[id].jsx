"use client";
import React, { useEffect, useState } from "react";
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

  const findAncestors = (currentId, allPersons) => {
    let result = [];
    let current = allPersons.find((p) => p._id === currentId);
    while (current && current.parentId) {
      const parent = allPersons.find((p) => p._id === current.parentId);
      if (!parent) break;
      result.push(parent);
      current = parent;
    }
    return result;
  };

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchData = async () => {
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router.isReady]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-50">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Уншиж байна...</p>
      </div>
    );

  if (!person) return <div className="text-center py-20 uppercase text-xs tracking-widest font-bold">Мэдээлэл олдсонгүй</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-6 px-4 md:px-8 antialiased text-slate-800">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/landingPage"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black mb-6 uppercase tracking-wider"
        >
          ← БУЦАХ
        </Link>

        {/* Ancestors Section - Scrollable on mobile */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 mb-6 overflow-hidden">
          <h3 className="text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 mb-4 text-slate-400">
            <Users size={14} /> Өвөг дээдэс
          </h3>
          <div className="overflow-x-auto pb-2">
            <ParentsList data={ancestors} />
          </div>
        </section>

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-6">
          <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Photo & Gen */}
            <div className="w-full md:w-auto flex flex-col items-center shrink-0">
              <div className="w-40 h-52 md:w-44 md:h-56 border-4 border-slate-50 shadow-inner overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={person.pic || "/api/placeholder/160/200"}
                  alt={person.name}
                  className="w-full h-full object-cover filter contrast-125"
                />
              </div>
              <div className="mt-4 text-center">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Удмын хэлхээ</span>
                <p className="text-lg font-serif italic font-bold text-amber-700">{person.generation}-р үе</p>
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 w-full space-y-6">
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 font-serif uppercase tracking-tight">
                  {person.name}
                </h1>
                <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100">
                  {person.profession || "Мэргэжил тодорхойгүй"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-10 pt-6 border-t border-slate-50">
                <InfoItem icon={<Calendar size={16}/>} label="Хугацаа" value={`${person.birthyear || "????"} ${person.deathyear ? `— ${person.deathyear}` : ""}`} />
                <InfoItem icon={<User size={16}/>} label="Хүйс" value={person.gender === "male" ? "Эрэгтэй" : "Эмэгтэй"} />
                <div className="sm:col-span-2">
                   <InfoItem icon={<MapPin size={16}/>} label="Төрсөн нутаг" value={person.bornplace || "Мэдээлэл байхгүй"} />
                </div>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="px-6 py-8 md:px-10 bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <ScrollText size={15} className="text-slate-400" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Намтар түүх</h2>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-slate-700 text-justify whitespace-pre-wrap font-serif">
              {person.barimt || "Энэхүү хүний намтар түүх одоогоор бүртгэгдээгүй байна."}
            </p>
          </div>

          {/* Spouse */}
          {person.spouse?.name && (
            <div className="p-6 md:px-10 border-t border-slate-100 bg-white">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-full">
                    <Heart size={16} className="text-rose-500" fill="currentColor" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">Гэр бүлийн хүн</label>
                    <p className="text-sm font-bold text-slate-900">{person.spouse.lastname} {person.spouse.name}</p>
                  </div>
                </div>
                {person.spouse.barimt && (
                  <p className="flex-1 bg-white border border-slate-100 p-3 rounded-xl italic text-[11px] text-slate-500 leading-snug">
                    "{person.spouse.barimt}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Location */}
        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center gap-3 mb-8">
          <MapPin size={14} className="text-indigo-400" />
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Одоогийн хаяг:</span>
          <span className="text-xs font-bold text-indigo-900">{person.currentplace || "Бүртгэгдээгүй"}</span>
        </div>

        {/* Family Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FamilyBlock icon={<Users size={14}/>} title="Ах дүүс" count={siblings.length}>
            <SiblingsList data={siblings} />
          </FamilyBlock>
          <FamilyBlock icon={<Users size={14}/>} title="Үр хүүхэд" count={children.length}>
            <FamilySection data={children} />
          </FamilyBlock>
        </div>

        <footer className="mt-16 pb-12 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-60">
            Дижитал Угийн Бичиг • Архив №{person.id || "001"}
          </p>
        </footer>
      </div>

      {/* --- MOBILE FIXED NAV --- */}
      <nav className="md:hidden fixed bottom-6 left-0 right-0 px-6 z-50">
        <div className="max-w-[400px] mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 shadow-2xl flex items-center justify-between">
          <Link href="/landingPage" className="p-4 text-white/50 hover:text-white transition-colors">
            <HomeIcon size={20} />
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-amber-500 text-slate-900 px-5 py-3 rounded-full shadow-lg hover:bg-amber-400 transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Түүх нэмэх</span>
          </button>
          <Link href="/story" className="p-4 text-white/50 hover:text-white transition-colors">
            <BookOpen size={20} />
          </Link>
        </div>
      </nav>

      <RegisterForm isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
}

// Туслах компонентууд кодыг цэвэрхэн байлгахад тусална
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-slate-300">{icon}</div>
      <div>
        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</label>
        <p className="text-sm font-bold text-slate-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function FamilyBlock({ icon, title, count, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-800">
          {icon} {title}
        </h3>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">{count} хүн</span>
      </div>
      <div className="text-sm">{children}</div>
    </section>
  );
}