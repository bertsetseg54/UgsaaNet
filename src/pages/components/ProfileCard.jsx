"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Trash2, ArrowRight, Users } from "lucide-react";

export default function ProfileCard({ profile, profiles, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!profile) return null;
  
  const { _id, name, parentId, job, pic, imageUrl, parentName } = profile;
  const displayImage = pic || imageUrl;
  const father = profiles?.find(f => f._id === parentId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      const res = await fetch("/api/persons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: _id.toString(), familyId: user.familyId }),
      });
      if (res.ok) {
        onDelete(_id);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally { setIsDeleting(false); }
  };

  return (
    <div className="group relative w-[120px] sm:w-[160px] flex-shrink-0 snap-start">
      {/* Картын ерөнхий padding-ийг p-1 болгож багасгав */}
      <div className="bg-white border border-slate-100 rounded-[1.2rem] p-1 hover:shadow-lg hover:border-amber-200 transition-all duration-300 group relative shadow-sm">
        
        {/* Сумны товчлуурын хэмжээ болон байрлалыг шахав */}
        <Link 
          href={`/person/${_id}`} 
          className="absolute top-1 right-1 p-1 bg-slate-50/80 rounded-lg text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all z-10"
        >
          <ArrowRight size={12} strokeWidth={3} />
        </Link>
        
        <div className="flex flex-col items-center">
          {/* Зургийн гаднах margin-ийг mb-1 болгож багасгав */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-50 shadow-sm mb-1">
            {displayImage ? (
              <img src={displayImage} className="w-full h-full object-cover" alt={name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                <Users size={24} />
              </div>
            )}
          </div>

          <div className="text-center w-full px-1 pb-0.5">
            {/* Эцгийн нэр - мөр хоорондын зайг шахав */}
            <p className="text-[7px] font-black text-amber-600/80 uppercase tracking-tighter leading-none">
              {father ? `${father.name}-ын` : (parentName || "Ургийн тэргүүн")}
            </p>
            
            {/* Нэр - үсгийн хэмжээг бага зэрэг багасгаж, зайг хумив */}
            <h1 className="text-[10px] sm:text-[11px] font-[1000] text-slate-800 group-hover:text-amber-600 truncate uppercase leading-tight mt-0.5">
              {name}
            </h1>
            
            {/* Мэргэжил - padding болон margin-г багасгав */}
            <p className="text-[6px] font-black text-slate-400 uppercase mt-0.5 pb-2 bg-slate-50 px-1 py-0.5 rounded inline-block tracking-widest">
              {job || "Мэргэжилгүй"}
            </p>
          </div>
        </div>
      </div>

      {/* Устгах модаль хэсгийн зайг мөн шахав */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] p-4 max-w-[240px] w-full shadow-2xl text-center">
            <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
               <Trash2 size={16} />
            </div>
            <h3 className="text-[10px] font-black text-slate-800 mb-0.5 uppercase">Устгах</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mb-3">"{name}"</p>
            <div className="flex gap-1.5">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-black text-[9px] uppercase">Болих</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-black text-[9px] uppercase">
                {isDeleting ? "..." : "Тийм"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}