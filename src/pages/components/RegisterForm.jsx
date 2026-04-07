"use client";
import { useState, useEffect } from "react";
import {
  X,
  Camera,
  Heart,
  Search,
  History,
  Info,
  CalendarDays,
  XCircle,
  Loader2,
  Save,
  FileText, // Шинээр нэмэв
} from "lucide-react";

export default function RegisterForm({
  isOpen,
  setIsOpen,
  onProfileAdded,
  editData,
  onUpdate,
  hasHeadOfFamily,
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isDeceased, setIsDeceased] = useState(false);
  const [isMarried, setIsMarried] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allPersons, setAllPersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const initialState = {
    name: "",
    gender: "male",
    generation: "1",
    parentId: "",
    parentName: "",
    birthyear: "",
    birthmonth: "",
    birthday: "",
    deathyear: "",
    bornplace: "",
    currentplace: "",
    job: "", // profession-ийг job болгож өөрчлөв (LandingPage-тэй ижил байх хэрэгтэй)
    barimt: "",
    about: "", // Түүх намтар хэсэг
    spouse: { name: "", lastname: "", barimt: "" },
  };

  const [formData, setFormData] = useState(initialState);

  // ... (Бусад useEffect функцүүд хэвээрээ)
  useEffect(() => {
    if (isOpen) {
      const rawData = localStorage.getItem("user_data");
      if (rawData && rawData !== "undefined") {
        try {
          const user = JSON.parse(rawData);
          const url = user?.familyId
            ? `/api/persons?familyId=${encodeURIComponent(user.familyId)}`
            : "/api/persons";
          fetch(url)
            .then((res) => res.json())
            .then((data) => {
              if (data.success) setAllPersons(data.data);
            });
        } catch (e) {
          console.error("JSON parse error", e);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({ ...initialState, ...editData });
      setImagePreview(editData.pic || editData.imageUrl);
      setIsDeceased(!!editData.deathyear);
      setIsMarried(!!(editData.spouse && editData.spouse.name));
      if (editData.parentId) {
        const parent = allPersons.find((p) => p._id === editData.parentId);
        if (parent) setSearchQuery(parent.name);
      }
    } else if (isOpen) {
      setFormData(initialState);
      setImagePreview(null);
      setIsDeceased(false);
      setIsMarried(false);
      setSearchQuery("");
    }
  }, [editData, isOpen, allPersons]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "pic" && files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectParent = (parent) => {
    const nextGen = (parseInt(parent.generation) || 1) + 1;
    setFormData((prev) => ({
      ...prev,
      parentId: parent._id,
      generation: nextGen.toString(),
      parentName: parent.name,
    }));
    setSearchQuery(parent.name);
    setShowDropdown(false);
  };

  const clearParent = () => {
    setFormData((prev) => ({
      ...prev,
      parentId: "",
      generation: "1",
      parentName: "",
    }));
    setSearchQuery("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user_data") || "{}");
    const finalData = {
      ...formData,
      familyId: user.familyId,
      pic: imagePreview,
      spouse: isMarried ? formData.spouse : null,
      deathyear: isDeceased ? formData.deathyear : null,
    };
    try {
      const res = await fetch("/api/persons", {
        method: editData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editData ? { _id: editData._id, updateData: finalData } : finalData
        ),
      });
      if (res.ok) {
        editData ? onUpdate() : onProfileAdded();
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || (hasHeadOfFamily && formData.generation === "1" && !editData);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={() => !loading && setIsOpen(false)}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <div className="relative z-[110] bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-1.5 rounded-lg">
              <History className="text-amber-600" size={18} />
            </div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
              {editData ? "Мэдээлэл засах" : "Шинэ бүртгэл үүсгэх"}
            </h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Photo */}
          <div className="flex justify-center mb-2">
            <div className="relative group w-24 h-24">
              <div className="w-full h-full rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center group-hover:border-amber-400 transition-all">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <Camera size={24} className="text-slate-300" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleChange} name="pic" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Бүтэн нэр</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-amber-500 outline-none transition-all"
                placeholder="Жишээ: Болд"
              />
            </div>

            {/* Parent Search */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Дээд үе (Эцэг/Эх)</label>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                  {formData.generation}-р үе
                </span>
              </div>
              
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder={hasHeadOfFamily && formData.generation === "1" && !editData 
                    ? "Энд дарж дээд үеэ хайж сонгоно уу..." 
                    : "Хайх... (Сонгохгүй бол 1-р үе болно)"}
                  value={searchQuery}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-all ${
                    hasHeadOfFamily && formData.generation === "1" && !editData && !searchQuery
                      ? "border-amber-300 ring-4 ring-amber-500/5"
                      : "border-slate-100 focus:border-amber-500 focus:bg-white"
                  }`}
                />
                
                {hasHeadOfFamily && formData.generation === "1" && !editData && !searchQuery && (
                   <p className="text-[10px] text-amber-600 font-bold mt-1.5 ml-1 flex items-center gap-1">
                     <Info size={12} /> Ургийн тэргүүн байгаа тул дээд үеэ сонгоно уу.
                   </p>
                )}

                {searchQuery && (
                  <button type="button" onClick={clearParent} className="absolute right-3 top-3 text-slate-300 hover:text-slate-500">
                    <X size={16} />
                  </button>
                )}

                {showDropdown && searchQuery && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 shadow-xl rounded-xl max-h-48 overflow-y-auto p-1 text-sm">
                    {allPersons
                      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((p) => (
                        <div
                          key={p._id}
                          onClick={() => handleSelectParent(p)}
                          className="p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <div className="font-semibold text-slate-700">{p.name}</div>
                            <div className="text-[10px] text-slate-400 uppercase">{p.generation}-р үе</div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gender & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Хүйс</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, gender: g }))}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        formData.gender === g ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {g === "male" ? "Эрэгтэй" : "Эмэгтэй"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Мэнд сэрүүн эсэх</label>
                <button
                  type="button"
                  onClick={() => setIsDeceased(!isDeceased)}
                  className={`w-full py-2 px-4 rounded-xl border flex items-center justify-between transition-all ${
                    isDeceased ? "bg-slate-100 border-slate-200" : "bg-green-50 border-green-100"
                  }`}
                >
                  <span className={`text-xs font-bold ${isDeceased ? "text-slate-600" : "text-green-700"}`}>
                    {isDeceased ? "Нас барсан" : "Мэнд сэрүүн"}
                  </span>
                  <div className={`w-8 h-4 rounded-full relative ${isDeceased ? "bg-slate-400" : "bg-green-500"}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isDeceased ? "left-4.5" : "left-0.5"}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Төрсөн он</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-2.5 text-slate-300" size={16} />
                  <input
                    name="birthyear"
                    placeholder="YYYY"
                    value={formData.birthyear}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white"
                  />
                </div>
              </div>
              {isDeceased && (
                <div className="space-y-1.5 animate-in slide-in-from-right-2">
                  <label className="text-[11px] font-bold text-red-500 uppercase tracking-wider ml-1">Нас барсан он</label>
                  <input
                    name="deathyear"
                    placeholder="YYYY"
                    value={formData.deathyear || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm bg-red-50/30 border border-red-100 rounded-xl outline-none focus:bg-white"
                  />
                </div>
              )}
            </div>

            {/* Places */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Төрсөн нутаг</label>
                <input
                  name="bornplace"
                  value={formData.bornplace}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Одоогийн хаяг</label>
                <input
                  name="currentplace"
                  value={formData.currentplace}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Marriage */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsMarried(!isMarried)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isMarried ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart size={16} className={isMarried ? "text-rose-500" : "text-slate-300"} fill={isMarried ? "currentColor" : "none"} />
                  <span className={`text-xs font-bold ${isMarried ? "text-rose-700" : "text-slate-600"}`}>Гэрлэсэн эсэх</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${isMarried ? "bg-rose-500" : "bg-slate-300"}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMarried ? "left-6" : "left-1"}`} />
                </div>
              </button>

              {isMarried && (
                <div className="mt-3 p-4 bg-rose-50/30 border border-rose-100 rounded-xl space-y-3 animate-in fade-in zoom-in-95">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Овог"
                      value={formData.spouse?.lastname || ""}
                      onChange={(e) => setFormData(p => ({ ...p, spouse: { ...p.spouse, lastname: e.target.value }}))}
                      className="px-3 py-2 text-sm bg-white border border-rose-100 rounded-lg outline-none"
                    />
                    <input
                      placeholder="Нэр"
                      value={formData.spouse?.name || ""}
                      onChange={(e) => setFormData(p => ({ ...p, spouse: { ...p.spouse, name: e.target.value }}))}
                      className="px-3 py-2 text-sm bg-white border border-rose-100 rounded-lg outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Profession / Job */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Мэргэжил</label>
              <input
                name="job" // profession байсныг job болгож өөрчлөв
                value={formData.job}
                onChange={handleChange}
                placeholder="Жишээ: Инженер"
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-amber-500"
              />
            </div>

            {/* Biography (Namtar) - Шинээр нэмэгдсэн хэсэг */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 ml-1">
                <FileText size={14} className="text-slate-400" />
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Түүх намтар</label>
              </div>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Тухайн хүний амьдралын замнал, гавьяа шагнал гэх мэт..."
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-amber-500 min-h-[120px] resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 bg-slate-50/80">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-2.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
          >
            Цуцлах
          </button>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            className={`flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              editData ? "bg-blue-600 shadow-blue-100" : "bg-amber-500 shadow-amber-100"
            }`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {editData ? "Мэдээлэл шинэчлэх" : "Бүртгэл хадгалах"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}