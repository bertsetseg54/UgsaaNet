"use client";
import React from "react";
import { useRouter } from "next/router";
import { User, ChevronRight } from "lucide-react";

const ParentsList = ({ data }) => {
  const router = useRouter();

  const fatherNershil = [
    "Аав",
    "Өвөө",
    "Элэнц өвөө",
    "Хуланц өвөө",
    "Элэн өвөө",
    "Хулан өвөө",
    "Холбоо өвөө",
    "Өндөр өвөө",
  ];
  const eejNershil = [
    "Ээж",
    "Эмээ",
    "Элэнц эмээ",
    "Хуланц эмээ",
    "Элэн эмээ",
    "Хулан эмээ",
    "Холбоо эмээ",
    "Өндөр эмээ",
  ];

  if (!data || data.length === 0) {
    return (
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest p-4 italic">
        Дээд үе тодорхойгүй
      </p>
    );
  }

  // Өвөг дээдсийг хамгийн дээрээс нь (хуланц өвөө гм) доош харуулахын тулд reverse хийнэ
  const reversedData = [...data].reverse();

  return (
    <section className="w-full">
      <div className="flex flex-row items-center gap-1 overflow-x-auto pb-4 no-scrollbar snap-x">
        {reversedData.map((person, index) => {
          const isMale = person.gender === "male";

          // Reverse хийсэн тул гарчиг (title)-ийг зөв оноохын тулд массивын уртыг ашиглана
          const titleIndex = reversedData.length - 1 - index;
          const title = isMale
            ? fatherNershil[titleIndex]
            : eejNershil[titleIndex];

          return (
            <div
              key={person._id || index}
              className="flex flex-row items-center shrink-0 snap-start"
            >
              {/* Карт - Click хийхэд шилжинэ */}
              <button
                onClick={() => router.push(`/person/${person._id}`)}
                className="flex flex-col items-center w-28 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md active:scale-95 group text-left"
              >
                {/* Жижигхэн цол/нэршил */}
                <span
                  className={`text-[8px] font-black uppercase tracking-tighter mb-2 ${
                    isMale ? "text-amber-600" : "text-rose-400"
                  }`}
                >
                  {title || "Өвөг"}
                </span>

                {/* Дугуй зураг */}
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 mb-2 shrink-0 transition-transform group-hover:scale-110 ${
                    isMale ? "border-amber-100" : "border-rose-50"
                  }`}
                >
                  {person?.pic ? (
                    <img
                      src={person.pic}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                      <User size={18} />
                    </div>
                  )}
                </div>

                {/* Нэр болон үе */}
                <div className="text-center w-full">
                  <h3 className="text-[10px] font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-600">
                    {person.name}
                  </h3>
                  <p className="text-[8px] text-slate-400 font-medium mt-1 uppercase">
                    {person.generation}-р үе
                  </p>
                </div>
              </button>

              {/* Хойшоо заасан сум (Сүүлийн элементээс бусад дээр) */}
              {index !== reversedData.length - 1 && (
                <div className="px-1 text-slate-200">
                  <ChevronRight size={14} strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default ParentsList;
