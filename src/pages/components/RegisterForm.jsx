"use client";
import { useState, useEffect } from "react";
import {
  X,
  Camera,
  Heart,
  MapPin,
  Briefcase,
  FileText,
  Calendar,
  User2,
  Users,
  Sparkles,
  Binary,
  Check,
  History,
  ScrollText,
  Search,
} from "lucide-react";

export default function RegisterForm({
  isOpen,
  setIsOpen,
  onProfileAdded,
  editData,
  onUpdate,
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isDeceased, setIsDeceased] = useState(false);
  const [isMarried, setIsMarried] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allPersons, setAllPersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRoot, setIsRoot] = useState(false);

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
    profession: "",
    barimt: "",
    spouse: { name: "", lastname: "", barimt: "" },
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/persons")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setAllPersons(data.data);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({ ...initialState, ...editData });
      setImagePreview(editData.pic || editData.imageUrl);
      setIsDeceased(!!editData.deathyear);
      setIsMarried(!!(editData.spouse && editData.spouse.name));
      setIsRoot(!editData.parentId);
      if (editData.parentId) {
        const parent = allPersons.find((p) => p._id === editData.parentId);
        if (parent) setSearchQuery(parent.name);
      }
    } else if (isOpen) {
      setFormData(initialState);
      setImagePreview(null);
      setIsDeceased(false);
      setIsMarried(false);
      setIsRoot(false);
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
    setIsRoot(false);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const finalData = {
      ...formData,
      pic: imagePreview,
      spouse: isMarried ? formData.spouse : null,
      deathyear: isDeceased ? formData.deathyear : null,
      parentId: isRoot ? "" : formData.parentId,
      generation: isRoot ? "1" : formData.generation,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        onClick={() => !loading && setIsOpen(false)}
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
      />

      <div className="relative z-110 bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <History className="text-amber-500" size={18} />
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              {editData ? "Мэдээлэл засах" : "Шинэ бүртгэл"}
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-100 rounded-md text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div className="relative group cursor-pointer w-20 h-20">
              <div className="w-full h-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center transition-all group-hover:border-amber-400">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <Camera size={20} className="text-slate-300" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                name="pic"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                Нэр
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-amber-500 outline-none transition-all"
                placeholder="Бүтэн нэр..."
              />
            </div>

            {/* Parent Search - Simplified (No extra border) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Дээд үе (Эцэг/Эх)
                </label>
                {/* Үеийг харуулах жижиг badge */}
                <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">
                      Тодорхойлогдсон үе
                    </span>
                    <div className="w-px h-2.5 bg-slate-200 mx-0.5" />{" "}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-amber-600">
                      {formData.generation + "-р үе"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-2.5 text-slate-400">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  disabled={isRoot}
                  placeholder={isRoot ? "Тэргүүн өвөг (1-р үе)" : "Хайх..."}
                  value={searchQuery}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-amber-500 outline-none transition-all disabled:opacity-50"
                />

                {/* Тэргүүн өвөг чагтлах хэсэг */}
                <div className="mt-2 flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="rootCheck"
                    checked={isRoot}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsRoot(checked);
                      if (checked) {
                        setSearchQuery("");
                        setFormData((p) => ({
                          ...p,
                          parentId: "",
                          generation: "1",
                        }));
                      }
                    }}
                    className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                  />
                  <label
                    htmlFor="rootCheck"
                    className="text-[11px] text-slate-500 cursor-pointer"
                  >
                    Ургийн тэргүүн (Дээд үе хайх шаардлагагүй)
                  </label>
                </div>

                {showDropdown && searchQuery && !isRoot && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 shadow-2xl rounded-xl max-h-50 overflow-y-auto p-1.5 text-sm animate-in fade-in zoom-in-95 duration-200">
                    {allPersons
                      .filter((p) =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((p) => (
                        <div
                          key={p._id}
                          onClick={() => handleSelectParent(p)}
                          className="group p-2.5 hover:bg-amber-50 rounded-lg cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700 group-hover:text-amber-700 transition-colors">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span className="opacity-60">Эцэг/Эх:</span>
                              <span className="font-medium text-slate-500 italic">
                                {p.parentName || "Үндсэн өвөг"}
                              </span>
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                              {p.generation}-р үе
                            </span>
                          </div>
                        </div>
                      ))}

                    {/* Хэрэв илэрц олдохгүй бол */}
                    {allPersons.filter((p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-xs italic">
                        Илэрц олдсонгүй...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Gender & Status */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Хүйс
                </label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, gender: g }))}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                        formData.gender === g
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-400"
                      }`}
                    >
                      {g === "male" ? "Эрэгтэй" : "Эмэгтэй"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Төлөв
                </label>
                <button
                  type="button"
                  onClick={() => setIsDeceased(!isDeceased)}
                  className={`w-full py-1.5 px-3 rounded-lg border text-[11px] font-medium transition-all flex justify-between items-center ${
                    isDeceased
                      ? "bg-slate-800 text-white"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {isDeceased ? "Нас барсан" : "Мэнд сэрүүн"}
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDeceased ? "bg-red-400" : "bg-green-400"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                Төрсөн огноо
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  name="birthyear"
                  placeholder="Он"
                  value={formData.birthyear}
                  onChange={handleChange}
                  className="px-3 py-2 text-sm bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-amber-500 outline-none transition-all text-center"
                />
                <input
                  name="birthmonth"
                  placeholder="Сар"
                  value={formData.birthmonth}
                  onChange={handleChange}
                  className="px-3 py-2 text-sm bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-amber-500 outline-none transition-all text-center"
                />
                <input
                  name="birthday"
                  placeholder="Өдөр"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="px-3 py-2 text-sm bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-amber-500 outline-none transition-all text-center"
                />
              </div>
            </div>

            {/* Marriage Toggle - Simple */}
            <div className="pt-2">
              <div
                onClick={() => setIsMarried(!isMarried)}
                className={`flex items-center justify-between p-3 cursor-pointer rounded-lg border transition-all ${
                  isMarried
                    ? "bg-amber-50 border-amber-200"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart
                    size={14}
                    className={isMarried ? "text-amber-500" : "text-slate-300"}
                    fill={isMarried ? "currentColor" : "none"}
                  />
                  <span className="text-[11px] font-semibold text-slate-700">
                    Гэрлэсэн эсэх
                  </span>
                </div>
                <div
                  className={`w-7 h-4 rounded-full relative transition-all ${
                    isMarried ? "bg-amber-500" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                      isMarried ? "left-3.5" : "left-0.5"
                    }`}
                  />
                </div>
              </div>

              {isMarried && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                  <input
                    placeholder="Ханийн овог"
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        spouse: { ...p.spouse, lastname: e.target.value },
                      }))
                    }
                    value={formData.spouse?.lastname || ""}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-100 rounded-md outline-none"
                  />
                  <input
                    placeholder="Ханийн нэр"
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        spouse: { ...p.spouse, name: e.target.value },
                      }))
                    }
                    value={formData.spouse?.name || ""}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-100 rounded-md outline-none"
                  />
                </div>
              )}
            </div>

            {/* Other info */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <input
                name="bornplace"
                placeholder="Төрсөн нутаг"
                value={formData.bornplace}
                onChange={handleChange}
                className="px-3 py-2 text-sm bg-slate-50 border border-transparent rounded-lg outline-none focus:bg-white focus:border-amber-500"
              />
              <input
                name="profession"
                placeholder="Мэргэжил"
                value={formData.profession}
                onChange={handleChange}
                className="px-3 py-2 text-sm bg-slate-50 border border-transparent rounded-lg outline-none focus:bg-white focus:border-amber-500"
              />
            </div>

            <textarea
              name="barimt"
              value={formData.barimt}
              onChange={handleChange}
              rows={2}
              placeholder="Товч намтар, тэмдэглэл..."
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-transparent rounded-lg outline-none focus:bg-white focus:border-amber-500 resize-none transition-all"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-50 flex gap-3 bg-slate-50/20">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-2 text-xs font-medium text-slate-400"
          >
            Болих
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-2 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-md shadow-amber-100 transition-all active:scale-95"
          >
            {loading ? "Түр хүлээнэ үү..." : editData ? "Хадгалах" : "Бүртгэх"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
