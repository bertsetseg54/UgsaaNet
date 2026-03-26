"use client";
import React, { useState } from "react";
import Link from "next/link";
import { User, Trash2, Edit, ChevronRight, X } from "lucide-react";

export default function ProfileCard({ profile, onDelete, onEdit }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!profile) return null;
  const { _id, name, parentName, gender } = profile;
  const displayImage = profile.pic || profile.imageUrl;

  const isFemale = gender === "female";
  const themeStyles = isFemale
    ? "border-rose-50 bg-gradient-to-t from-rose-50/50 to-white shadow-rose-100/50 hover:border-rose-200"
    : "border-blue-50 bg-gradient-to-t from-blue-50/50 to-white shadow-blue-100/50 hover:border-blue-200";

  const accentColor = isFemale ? "text-rose-600" : "text-blue-600";
  const dividerColor = isFemale ? "border-rose-100" : "border-blue-100";
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/persons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: _id.toString() }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        onDelete(_id);
        setIsModalOpen(false);
      } else {
        alert(result.message || "Устгахад алдаа гарлаа.");
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
      <div className="group relative w-[114px] md:w-44 flex-none">
        <Link href={`/person/${_id}`} className="block h-full">
          <div
            className={`relative h-full border-2 rounded-2xl p-3 flex flex-col items-center transition-all duration-300 shadow-md active:scale-95 ${themeStyles}`}
          >
            {/* Profile Photo */}
            <div className="mb-3">
              <div
                className={`w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden bg-white border-2 shadow-inner flex items-center justify-center ${dividerColor}`}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    className="w-full h-full object-cover"
                    alt={name}
                  />
                ) : (
                  <User size={24} className="text-slate-300" />
                )}
              </div>
            </div>

            {/* Name & Parent */}
            <div className="text-center w-full mb-3">
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mb-1">
                {parentName || "Тэргүүн"}
              </p>
              <h3 className="text-[11px] md:text-[14px] font-black text-slate-800 leading-tight truncate px-1">
                {name}
              </h3>
            </div>

            {/* Bottom Section */}
            <div className={`w-full pt-2 border-t mt-auto ${dividerColor}`}>
              <div
                className={`flex items-center justify-center gap-1 font-black ${accentColor}`}
              >
                <span className="text-[9px] md:text-[11px] uppercase tracking-tighter">
                  Үзэх
                </span>
                <ChevronRight size={10} strokeWidth={3} />
              </div>
            </div>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(profile);
            }}
            className={`p-1.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border text-slate-400 transition-all active:scale-90 ${
              isFemale
                ? "hover:text-rose-500 border-rose-100"
                : "hover:text-blue-500 border-blue-100"
            }`}
          >
            <Edit size={12} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border border-slate-100 text-slate-400 hover:text-rose-600 transition-all active:scale-90"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-sm rounded-[32px] md:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
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
                  className="py-3 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest"
                >
                  Болих
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="py-3 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50"
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
