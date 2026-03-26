"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Trash2,
  Edit,
  ChevronRight,
  AlertTriangle,
  X,
} from "lucide-react";

export default function ProfileCard({ profile, onDelete, onEdit }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!profile) return null;
  const { _id, name, parentName } = profile;
  const displayImage = profile.pic || profile.imageUrl;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // API-руу хүсэлт явуулахдаа ID-г маш тодорхой илгээх
      const res = await fetch("/api/persons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: _id.toString() }), // ID-г string болгож баталгаажуулах
      });

      const result = await res.json();

      if (res.ok && result.success) {
        onDelete(_id);
        setIsModalOpen(false);
      } else {
        // Хэрэв API-аас алдааны мессеж ирсэн бол түүнийг харуулах
        alert(result.message || "Устгахад алдаа гарлаа. ID шалгана уу.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative w-28 md:w-44 flex-none">
        <Link href={`/person/${_id}`} className="block h-full">
          <div className="relative h-full bg-white border border-slate-100 rounded-2xl p-3 flex flex-col items-center transition-all duration-300 hover:border-amber-300 hover:shadow-md active:scale-95">
            <div className="mb-3">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                {displayImage ? (
                  <img
                    src={displayImage}
                    className="w-full h-full object-cover"
                    alt={name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <User size={24} />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center w-full mb-3">
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">
                {parentName || "Тэргүүн"}
              </p>
              <h3 className="text-[11px] md:text-[14px] font-black text-slate-800 leading-tight truncate px-1">
                {name}
              </h3>
            </div>

            <div className="w-full pt-2 border-t border-slate-50 mt-auto">
              <div className="flex items-center justify-center gap-1 text-amber-600">
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-tighter">
                  Үзэх
                </span>
                <ChevronRight size={10} strokeWidth={3} />
              </div>
            </div>
          </div>
        </Link>

        {/* 🛠 Edit/Delete товчлуурууд */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(profile);
            }}
            className="p-1.5 md:p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 text-slate-400 hover:text-amber-500 active:scale-90 transition-all"
          >
            <Edit size={10} className="md:w-3.5 md:h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            className="p-1.5 md:p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 active:scale-90 transition-all"
          >
            <Trash2 size={10} className="md:w-3.5 md:h-3.5" />
          </button>
        </div>
      </div>

      {/* MODAL - Ultra Minimal Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-end md:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-sm rounded-4xl md:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={20} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Мэдээлэл устгах
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-800">"{name}"</span>
                  -г устгахдаа итгэлтэй байна уу?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  disabled={isDeleting}
                  onClick={() => setIsModalOpen(false)}
                  className="py-3 rounded-xl bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-widest"
                >
                  Болих
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="py-3 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "..." : "Устгах"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
