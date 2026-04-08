"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Trash2, ArrowRight, Users } from "lucide-react";

export default function ProfileCard({ profile, profiles, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!profile) return null;
  
  // Талбаруудыг RegisterForm-той ижилсүүлэв
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
    <div className="group relative w-[165px] sm:min-w-[185px] flex-shrink-0 snap-start px-0.5">
      <div className="bg-white border border-slate-100 rounded-[1.8rem] p-2.5 hover:shadow-xl hover:border-amber-200 transition-all duration-300 group relative shadow-sm">
        
        <Link 
          href={`/person/${_id}`} 
          className="absolute top-2.5 right-2.5 p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-amber-500 group-hover:text-white  transition-all "
        >
          <ArrowRight size={16} strokeWidth={3} />
        </Link>
        
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border-2 border-white shadow-md">
            {displayImage ? (
              <img src={displayImage} className="w-full h-full object-cover" alt={name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                <Users size={24} />
              </div>
            )}
          </div>

          <div className="text-center w-full mt-0.5 px-1">
            <p className="text-[8px] font-black text-amber-600/80 uppercase tracking-tighter leading-none mb-1">
              {father ? `${father.name}-ын` : (parentName || "Ургийн тэргүүн")}
            </p>
            <h1 className="text-[11px] sm:text-[12px] font-[1000] text-slate-800 group-hover:text-amber-600 truncate uppercase italic leading-tight">
              {name}
            </h1>
            <p className="text-[7px] font-black text-slate-400 uppercase mt-1 bg-slate-50/80 px-2 py-0.5 rounded-lg inline-block tracking-widest">
              {job || "Мэргэжил тодорхойгүй"}
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 text-center">
          <div className="bg-white rounded-[2rem] p-6 max-w-[280px] w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Trash2 size={24} />
            </div>
            <h3 className="text-sm font-black text-slate-800 mb-2 uppercase italic">Гишүүн устгах</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-6 leading-relaxed">Та "{name}"-г устгахдаа итгэлтэй байна уу?</p>
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase hover:bg-slate-200 transition-colors">Болих</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-200 hover:bg-red-600 transition-colors">
                {isDeleting ? "..." : "Устгах"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}