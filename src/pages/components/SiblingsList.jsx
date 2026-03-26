"use client";
import React from "react";
import { useRouter } from "next/router";
import { User, ChevronRight } from "lucide-react";

const SiblingsList = ({ data }) => {
  const router = useRouter();

  if (!data || data.length === 0) {
    return (
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest p-6 text-center">
        Бүртгэгдээгүй
      </p>
    );
  }

  return (
    <section className="w-full">
      <div className="flex flex-row items-center gap-1 overflow-x-auto pb-4 no-scrollbar snap-x">
        {data.map((person, index) => {
          const isMale = person.gender === "male";
          return (
            <div
              key={person._id || index}
              className="flex flex-row items-center shrink-0 snap-start"
            >
              {/* Карт дээр дарахад тухайн хүн рүү шилжинэ */}
              <button
                onClick={() => router.push(`/person/${person._id}`)}
                className="flex flex-col items-center w-28 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md active:scale-95 group"
              >
                {/* Зураг */}
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 mb-2 shrink-0 transition-transform group-hover:scale-110 ${
                    isMale ? "border-blue-100" : "border-rose-100"
                  }`}
                >
                  {person?.pic ? (
                    <img
                      src={person.pic}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <User size={18} />
                    </div>
                  )}
                </div>

                {/* Нэр */}
                <div className="text-center w-full">
                  <h3 className="text-[10px] font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-600">
                    {person.name}
                  </h3>
                  <p className="text-[8px] text-slate-400 font-medium mt-1 uppercase">
                    {person.generation}-р үе
                  </p>
                </div>
              </button>

              {/* Сум */}
              {index !== data.length - 1 && (
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

export default SiblingsList;
