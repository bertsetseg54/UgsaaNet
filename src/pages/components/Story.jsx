"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Fingerprint,
  Search,
  X,
  Home,
  BookOpen,
  Plus,
  LogOut,
  Trash2,
  Edit3,
  Image as ImageIcon,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Story() {
  const [stories, setStories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    content: "",
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Алдааг зассан хэсэг
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingStory, setEditingStory] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState({ id: null, title: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const openDeleteModal = (id, title) => {
    setSelectedStory({ id, title }); // Устгах түүхийн мэдээллийг хадгалах
    setIsDeleteModalOpen(true); // Модалийг харуулах
  };
  // Мэдэгдэл харуулах функц
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const fetchStories = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      const url = user.familyId 
        ? `/api/stories?familyId=${encodeURIComponent(user.familyId)}`
        : "/api/stories";
      const res = await fetch(url);
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setStories([]);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024)
        return showToast("Файлын хэмжээ 5MB-аас бага байх ёстой", "error");
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStory(null);
    setFormData({ title: "", date: "", content: "" });
    setFile(null);
    setImagePreview(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/start");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, date, content } = formData;
    if (!title || !date || !content)
      return showToast("Мэдээллээ бүрэн бөглөнө үү", "error");

    setIsSubmitLoading(true);
    try {
      let imageUrl = editingStory?.image || "";

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
      }

      const method = editingStory ? "PUT" : "POST";
      const url = editingStory
        ? `/api/stories/${editingStory._id}`
        : `/api/stories`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          image: imageUrl,
          familyId: JSON.parse(localStorage.getItem("user_data") || "{}").familyId
        }),
      });

      if (response.ok) {
        closeModal();
        fetchStories();
        showToast(
          editingStory ? "Амжилттай шинэчиллээ" : "Шинэ дурсамж нэмэгдлээ"
        );
      }
    } catch (err) {
      showToast("Сервертэй холбогдоход алдаа гарлаа", "error");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      date: story.date,
      content: story.content,
    });
    setImagePreview(story.image || null);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedStory.id) return;

    setIsDeleting(true); // Loading эхлүүлэх
    try {
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      const res = await fetch(`/api/stories/${selectedStory.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          familyId: user.familyId 
        }),
      });

      if (res.ok) {
        // Жагсаалтаас хасах
        setStories((prev) => prev.filter((s) => s._id !== selectedStory.id));
        showToast("Дурсамж амжилттай устлаа");
        setIsDeleteModalOpen(false); // Амжилттай болвол модалийг хаах
      } else {
        throw new Error();
      }
    } catch (err) {
      showToast("Устгах үед алдаа гарлаа", "error");
    } finally {
      setIsDeleting(false); // Loading зогсоох
    }
  };

  const filteredStories = useMemo(() => {
    return stories
      .filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.date.toString().includes(searchQuery)
      )
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [stories, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 pb-32 relative">
      {/* --- TOAST NOTIFICATION --- */}
      {toast.show && (
        <div
          className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "error"
              ? "bg-red-50/90 border-red-100 text-red-600"
              : "bg-emerald-50/90 border-emerald-100 text-emerald-600"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          <span className="text-xs font-black uppercase tracking-widest">
            {toast.message}
          </span>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-3 flex items-center justify-between gap-4 md:gap-10">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
              <Fingerprint size={20} className="text-white" />
            </div>
            <span className="hidden md:block font-black text-sm uppercase tracking-tighter">
              Ургийн Хэлхээ
            </span>
          </Link>

          <div className="flex-1 max-w-md relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Дурсамж хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/50 border-none rounded-2xl py-2.5 pl-12 pr-10 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* НҮҮР ХУУДАСНЫ ХОЛБООС (Буцааж нэмэв) */}
            <Link
              href="/landingPage"
              className="hidden lg:block text-[11px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest"
            >
              Нүүр
            </Link>

            {/* Зааглагч зураас - Зөвхөн компьютер дээр харагдана */}
            <div className="h-4 w-px bg-slate-200 hidden lg:block" />
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex items-center bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all hover:bg-slate-800 tracking-widest"
            >
              + Түүх нэмэх
            </button>

            {/* ГАРАХ ТОВЧ */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors active:scale-90"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE NAV --- */}
      <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-1.5 shadow-2xl flex items-center justify-between">
          <Link href="/landingPage" className="p-4 text-slate-400">
            <Home size={22} />
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-[1.8rem] shadow-lg shadow-slate-200/50 hover:bg-slate-800 transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              Түүх нэмэх
            </span>
          </button>
          <Link href="/story" className="p-4 text-indigo-600">
            <BookOpen size={22} />
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-32">
        {/* --- SIMPLE HEADER --- */}
        <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
          <a 
          href="/landingPage"
            className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 transition-all active:scale-75 flex items-center justify-center"
            aria-label="Буцах"
          >
            <ChevronLeft
              size={22}
              strokeWidth={2.5}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
          </a>
          <h1 className="text-xl font-[1000] uppercase tracking-tighter text-slate-900">
            Цадиг <span className="text-indigo-600">Тууж</span>
          </h1>
          <div className="relative min-w-[160px]">
            {/* Trigger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-2xl px-5 py-3 shadow-sm hover:border-indigo-300 transition-all"
            >
              <span>
                {sortOrder === "desc" ? "Шинэ нь эхэнд" : "Хуучин нь эхэнд"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Custom Menu */}
            {isOpen && (
              <>
                {/* Арын хэсэгт дарахад хаагдана */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOpen(false)}
                />

                <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-[1.5rem] shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => {
                      setSortOrder("desc");
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-5 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      sortOrder === "desc"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Шинэ нь эхэнд
                  </button>
                  <div className="h-px bg-slate-50 mx-4" />
                  <button
                    onClick={() => {
                      setSortOrder("asc");
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-5 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      sortOrder === "asc"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Хуучин нь эхэнд
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        {isPageLoading ? (
          <div className="py-20 text-center animate-pulse text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Уншиж байна...
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredStories.map((s) => (
              <div
                key={s._id}
                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* 1. Image Section (Дээд талд нь) */}
                <div className="h-64 relative overflow-hidden bg-slate-50">
                  {s.image ? (
                    <img
                      src={s.image}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={s.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <ImageIcon size={40} strokeWidth={1.5} />
                    </div>
                  )}
                  {/* Огноог зураг дээр нь Badge болгож тавив */}
                  <div className="absolute top-5 left-5 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      {s.date}
                    </span>
                  </div>
                </div>

                {/* 2. Text Content (Доод талд нь) */}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <h2 className="text-xl font-black text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                    {s.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed italic font-serif line-clamp-3 mb-6">
                    "{s.content}"
                  </p>

                  {/* 3. Actions (Mobile дээр шууд харагдана, Desktop дээр гоё харагдана) */}
                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(s._id, s.title)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <Link
                      href={`/story/${s._id}`}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 group/btn"
                    >
                      Дэлгэрэнгүй
                      <ArrowRight
                        size={14}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              Дурсамж олдсонгүй
            </p>
          </div>
        )}
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md transition-all">
          {/* Modal Container */}
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-in slide-in-from-bottom duration-300"
          >
            {/* Header - Fixed */}
            <div className="px-8 py-6 md:px-12 md:py-8 border-b border-slate-50 flex justify-between items-center shrink-0">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-[1000] uppercase italic text-slate-900 leading-none">
                  {editingStory ? "Засах" : "Шинэ"}{" "}
                  <span className="text-indigo-600">Дурсамж</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {editingStory
                    ? "Мэдээллээ шинэчлэх"
                    : "Түүхээ архивлаж үлдээх"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-12 h-12 md:w-10 md:h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-8">
              {/* Image Upload Area */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                  Зураг оруулах
                </label>
                <div
                  onClick={() => document.getElementById("file-input").click()}
                  className="group h-48 md:h-56 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-200 transition-all overflow-hidden relative"
                >
                  <input
                    type="file"
                    id="file-input"
                    hidden
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <span className="bg-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl">
                          Солих
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                        <ImageIcon size={28} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black uppercase text-slate-600">
                          Дарж зураг сонгоно уу
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                          JPG, PNG (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                    Огноо
                  </label>
                  <input
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    placeholder="жнь: 1995 он"
                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:bg-white focus:border-indigo-100 focus:shadow-sm transition-all"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                    Гарчиг
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Түүхийн нэр"
                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:bg-white focus:border-indigo-100 focus:shadow-sm transition-all"
                    required
                  />
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                  Түүхэн бичвэр
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Энд нандин дурсамжаа дэлгэрэнгүй бичээрэй..."
                  className="w-full p-6 md:p-8 bg-slate-50 rounded-[2.5rem] font-serif italic text-base outline-none min-h-[180px] md:min-h-[200px] border-2 border-transparent focus:bg-white focus:border-indigo-100 focus:shadow-sm transition-all resize-none leading-relaxed"
                  required
                />
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="px-8 py-8 md:px-12 bg-slate-50/50 flex flex-row gap-4 items-center shrink-0 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors tracking-widest"
              >
                Болих
              </button>
              <button
                type="submit"
                disabled={isSubmitLoading}
                className="flex-[2.5] py-5 bg-indigo-600 text-white font-[1000] rounded-2xl text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center"
              >
                {isSubmitLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : editingStory ? (
                  "Өөрчлөлт хадгалах"
                ) : (
                  "Архивт нэмэх"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all">
          {/* Overlay */}
          <div
            className="absolute inset-0"
            onClick={() => setIsDeleteModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-[340px] rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-slate-50 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              {/* Simple Icon - Илүү дутуу эффектгүй */}
              <div className="w-14 h-14 md:w-16 md:h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-6 h-6 md:w-7 md:h-7" />
              </div>

              {/* Text Content - Фонтуудыг жигдлэв */}
              <div className="mb-8">
                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                  Түүх <span className="text-rose-500">устгах</span>
                </h3>
                <p className="text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  "{selectedStory.title}" <br />
                  <span className="font-medium lowercase tracking-normal text-slate-400/80">
                    бүрмөсөн устгах уу?
                  </span>
                </p>
              </div>

              {/* Action Buttons - Responsive Padding */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-4 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                >
                  Болих
                </button>

                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95 flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Устгах"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
