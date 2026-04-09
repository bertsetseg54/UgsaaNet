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
    <div className="group relative w-[160px] sm:min-w-[175px] flex-shrink-0 snap-start">
      {/* Padding-ийг багасгасан (p-1.5) */}
      <div className="bg-white border border-slate-100 rounded-[1.5rem] p-1.5 hover:shadow-xl hover:border-amber-200 transition-all duration-300 group relative shadow-sm">
        
        <Link 
          href={`/person/${_id}`} 
          className="absolute top-1.5 right-1.5 p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all z-10"
        >
          <ArrowRight size={14} strokeWidth={3} />
        </Link>
        
        <div className="flex flex-col items-center gap-1">
          {/* Зургийн хэмжээг томруулсан (w-20 h-20) */}
          <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
            {displayImage ? (
              <img src={displayImage} className="w-full h-full object-cover" alt={name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                <Users size={28} />
              </div>
            )}
          </div>

          <div className="text-center w-full ">
            <p className="text-[7px] font-black text-amber-600/80 uppercase tracking-tighter leading-none mb-0.5">
              {father ? `${father.name}-ын` : (parentName || "Ургийн тэргүүн")}
            </p>
            <h1 className="text-[11px] font-[1000] text-slate-800 group-hover:text-amber-600 truncate uppercase leading-tight">
              {name}
            </h1>
            <p className="text-[6.5px] font-black text-slate-400 uppercase mt-0.5 bg-slate-50/80 px-1.5 py-0.5 rounded-md inline-block tracking-widest">
              {job || "Мэргэжилгүй"}
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 text-center">
          <div className="bg-white rounded-[2rem] p-5 max-w-[260px] w-full shadow-2xl border border-slate-100">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
               <Trash2 size={20} />
            </div>
            <h3 className="text-xs font-black text-slate-800 mb-1 uppercase">Устгах</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mb-4">"{name}"-г устгах уу?</p>
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-[9px] uppercase">Болих</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-black text-[9px] uppercase">
                {isDeleting ? "..." : "Устгах"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}