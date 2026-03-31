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
import Home from "..";
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

  // --- Find ancestors recursively ---
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
      <div className="flex flex-col items-center justify-center py-32 opacity-50">
        <div className="w-8 h-8 border-2 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Уншиж байна...
        </p>
      </div>
    );

  if (!person)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-6 px-6 text-center">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Мэдээлэл олдсонгүй (ID: {id})
        </div>
        <Link
          href="/landingPage"
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg"
        >
          Нүүр хуудас руу буцах
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-6 px-3 md:px-6 antialiased text-slate-800">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/landingPage"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-bold mb-6"
        >
          ← БУЦАХ
        </Link>

        {/* Ancestors Section */}
        <section className="bg-white border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
              <Users size={14} /> Өвөг дээдэс
            </h3>
          </div>
          <div className="text-sm">
            <ParentsList data={ancestors} />
          </div>
        </section>
        {/* --- MOBILE NAV --- */}
        <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-1.5 shadow-2xl flex items-center justify-between">
            <Link href="/landingPage" className="p-4 text-slate-400">
              <HomeIcon size={22} /> {/* Одоо энэ нь зүгээр икон болсон */}
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-[1.8rem] shadow-lg shadow-slate-200/50 hover:bg-slate-800 transition-all active:scale-95 shrink-0"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                Түүх нэмэх
              </span>
            </button>
            <Link href="/story" className="p-4 text-indigo-600">
              <BookOpen size={22} />
            </Link>
          </div>
        </nav>
        {/* Profile Info */}
        <div className="bg-white border border-slate-300 shadow-sm rounded-sm overflow-hidden mb-6">
          <div className="p-6 md:p-10 border-b border-slate-100 flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="w-40 h-52 border border-slate-200 bg-slate-50 p-1">
                <img
                  src={person.pic || "/api/placeholder/160/200"}
                  alt={person.name}
                  className="w-full h-full object-cover grayscale-30"
                />
              </div>
              <div className="mt-3 text-center border-t border-slate-100 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Удмын хэлхээ
                </span>
                <p className="text-sm font-bold">{person.generation}-р үе</p>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 leading-tight">
                  {person.name}
                </h1>
                <p className="text-xs font-medium text-amber-800 uppercase tracking-widest bg-amber-50 w-fit px-2 py-0.5 rounded">
                  {person.profession || "Мэргэжил тодорхойгүй"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Хугацаа
                    </label>
                    <p className="text-sm font-semibold">
                      {person.birthyear || "????"}{" "}
                      {person.deathyear && `— ${person.deathyear}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Хүйс
                    </label>
                    <p className="text-sm font-semibold">
                      {person.gender === "male" ? "Эрэгтэй" : "Эмэгтэй"}
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-start gap-3">
                  <MapPin size={16} className="text-slate-400 mt-0.5" />
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Төрсөн нутаг
                    </label>
                    <p className="text-sm font-semibold leading-relaxed text-slate-700">
                      {person.bornplace || "Мэдээлэл байхгүй"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="p-6 md:p-10 bg-[#FCFCFC]">
            <div className="flex items-center gap-2 mb-4">
              <ScrollText size={16} className="text-slate-400" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Намтар түүхийн тэмдэглэл
              </h2>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-[1.8] text-slate-700 text-justify whitespace-pre-wrap font-serif">
                {person.barimt ||
                  "Энэхүү хүний намтар түүх одоогоор бүртгэгдээгүй байна."}
              </p>
            </div>
          </div>

          {/* Spouse */}
          {person.spouse?.name && (
            <div className="px-6 md:px-10 py-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Heart
                  size={16}
                  className="text-rose-400"
                  fill="currentColor"
                />
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">
                    Гэр бүлийн хүн
                  </label>
                  <p className="text-sm font-bold text-slate-800">
                    {person.spouse.lastname} {person.spouse.name}
                  </p>
                </div>
              </div>
              {person.spouse.barimt && (
                <div className="sm:max-w-[50%] bg-slate-50 p-3 rounded italic text-xs text-slate-500 border-l-2 border-slate-200">
                  {person.spouse.barimt}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Address */}
        <div className="mt-4 p-4 bg-white border border-slate-200 flex items-center gap-3">
          <MapPin size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Одоогийн хаяг:
          </span>
          <span className="text-xs font-semibold">
            {person.currentplace || "Бүртгэгдээгүй"}
          </span>
        </div>

        {/* Siblings & Children */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> Ах дүүс
              </h3>
              <span className="text-[10px] text-slate-400">
                {siblings.length} хүн
              </span>
            </div>
            <div className="text-sm">
              <SiblingsList data={siblings} />
            </div>
          </section>

          <section className="bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> Үр хүүхэд
              </h3>
              <span className="text-[10px] text-slate-400">
                {children.length} хүн
              </span>
            </div>
            <div className="text-sm">
              <FamilySection data={children} />
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
            Дижитал Угийн Бичиг - Архив №{person.id || "001"}
          </p>
        </div>
      </div>
      <RegisterForm
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        // шаардлагатай бусад props...
      />
    </div>
  );
}
