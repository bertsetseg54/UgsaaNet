"use client";
import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  User,
  Users,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  ScrollText,
  ChevronDown,
} from "lucide-react";
import ParentsList from "../components/ParentsList";
import SiblingsList from "../components/SiblingsList";
import FamilySection from "../components/FamilySection";

export default function PersonProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allP, setAllP] = useState([]);

  function findAncestors(currentId, allPersons) {
    let ancestors = [];
    let currentPerson = allPersons.find((p) => p._id === currentId);

    // Тухайн хүн байгаа бөгөөд түүнд эцэг (parentId) байгаа тохиолдолд давтана
    while (currentPerson && currentPerson.parentId) {
      // parentId-гаар эцгийг нь хайж олох
      const parent = allPersons.find((p) => p._id === currentPerson.parentId);

      if (parent) {
        ancestors.push(parent); // Эцгийг жагсаалтад нэмэх
        currentPerson = parent; // Дараагийн шатанд эцгийнх нь эцгийг хайхаар тохируулах
      } else {
        // Хэрэв parentId байгаа боловч жагсаалтад олдохгүй бол зогсооно
        break;
      }
    }

    return ancestors;
  }
  const [ovog, setOvog] = useState();
  function findSiblings(currentPerson, allPersons) {
    if (!currentPerson || !currentPerson.parentId) {
      return []; // Хэрэв эцэг эх нь тодорхойгүй бол ах дүү олдохгүй
    }

    return allPersons.filter(
      (person) =>
        person.parentId === currentPerson.parentId && // Эцэг эх нь ижил байх
        person._id !== currentPerson._id // Өөрийг нь хасах
    );
  }
  const [siblings, setSiblings] = useState([]);
  const [family, setFamily] = useState([]);
  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchAndFilterData = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/persons");
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          setAllP(data.data);

          const foundPerson = data.data.find((p) => p._id === id);
          const result = findAncestors(foundPerson._id, data.data);
          setOvog(result);
          // const sibResult = findSiblings(foundPerson._id, data.data);
          const sibResult = data.data.filter(
            (person) =>
              person.parentId === foundPerson.parentId &&
              person._id !== foundPerson._id
          );
          setSiblings(sibResult);
          if (foundPerson) {
            setPerson(foundPerson);
          } else {
          }
          const famResult = data.data.filter(
            (person) =>
              person.parentId === foundPerson._id &&
              person._id !== foundPerson._id
          );
          setFamily(famResult);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterData();
  }, [id, router.isReady]);

  // Loading хэсэг
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 opacity-50">
        <div className="w-8 h-8 border-2 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Уншиж байна...
        </p>
      </div>
    );

  // Error/Empty хэсэг
  if (!person)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-6 px-6 text-center">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Мэдээлэл олдсонгүй (ID: {id})
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg"
        >
          Нүүр хуудас руу буцах
        </button>
      </div>
    );
  return (
    <div className="min-h-screen bg-[#F2F2F2] py-6 px-3 md:px-6 antialiased text-slate-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-bold"
          >
            <ArrowLeft size={14} />
            ЖАГСААЛТ РУУ БУЦАХ
          </button>
        </div>
        <section className="bg-white border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Users size={14} /> Өвөг дээдэс
            </h3>
          </div>
          <div className="text-xs bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">
            <ParentsList data={ovog} />
          </div>
        </section>
        <div className="bg-white border border-slate-300 shadow-sm rounded-sm overflow-hidden">
          {/* Top Section: Photo and Basic Specs */}
          <div className="p-6 md:p-10 border-b border-slate-100">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              {/* Profile Image - Fixed Size, No Hover */}
              <div className="shrink-0 mx-auto md:mx-0">
                <div className="w-40 h-52 border border-slate-200 bg-slate-50 p-1">
                  <img
                    src={person.pic || "/api/placeholder/160/200"}
                    className="w-full h-full object-cover grayscale-[30%]"
                    alt={person.name}
                  />
                </div>
                <div className="mt-3 text-center border-t border-slate-100 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    Удмын хэлхээ
                  </span>
                  <p className="text-sm font-bold">{person.generation}-р үе</p>
                </div>
              </div>

              {/* Identity & Core Details */}
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
          </div>

          {/* Biography Section - Optimized for Long Text */}
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

          {/* Spouse - Integrated Footer Style */}
          {person.spouse && person.spouse.name && (
            <div className="px-6 md:px-10 py-6 border-t border-slate-100 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            </div>
          )}
        </div>
        <div className="mt-4 p-4 bg-white border border-slate-200 flex items-center gap-3">
          <MapPin size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Одоогийн хаяг:
          </span>
          <span className="text-xs font-semibold">
            {person.currentplace || "Бүртгэгдээгүй"}
          </span>
        </div>
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
                {family.length} хүн
              </span>
            </div>
            <div className="text-sm">
              <FamilySection data={family} />
            </div>
          </section>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
            Дижитал Угийн Бичиг - Архив №{person.id || "001"}
          </p>
        </div>
      </div>
    </div>
  );
}
