"use client";
import React from "react";
import { User, ChevronRight } from "lucide-react";

const FamilySection = ({ data }) => {
  const son = ["Хүү"];
  const daughter = ["Охин"];

  if (!data || data.length === 0) return null;
  console.log("ahduu", data);
  return (
    <section className="w-full p-6">
      <h2>Гэр бүл</h2>
      <div className="flex flex-row items-start gap-2 overflow-x-auto pb-4 no-scrollbar snap-x">
        {data.map((person, index) => {
          const isMale = person.gender === "male";
          const title = isMale ? son[index] : daughter[index];

          return (
            <div
              key={person._id || index}
              className="flex flex-row items-center shrink-0 snap-start"
            >
              {/* Карт - Бүгд ижил хэмжээтэй (w-32) */}
              <div className="flex flex-col items-center w-32 p-3 bg-white rounded-2xl border border-amber-100/50 shadow-sm transition-all hover:border-amber-300">
                {/* Жижигхэн цол/нэршил */}
                <span
                  className={`text-[8px] font-black uppercase tracking-tighter mb-2 ${
                    isMale ? "text-amber-600" : "text-rose-400"
                  }`}
                >
                  {title || "Хүү"}
                </span>

                {/* Дугуй зураг */}
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 mb-2 shrink-0 ${
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
                  <h3 className="text-[10px] font-bold text-slate-800 truncate leading-tight">
                    {person.name}
                  </h3>
                  <p className="text-[8px] text-slate-400 font-medium mt-1">
                    {person.generation}-р үе
                  </p>
                </div>
              </div>

              {/* Хойшоо заасан сум (Сүүлийн элементээс бусад дээр) */}
              {index !== data.length - 1 && (
                <div className="px-1 text-amber-200">
                  <ChevronRight size={16} strokeWidth={3} />
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

export default FamilySection;
