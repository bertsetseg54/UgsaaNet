"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export default function Story() {
  const [stories, setStories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    content: "",
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingStory, setEditingStory] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch {
      setStories([]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStory(null);
    setFormData({ title: "", date: "", content: "" });
    setFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.content)
      return alert("Мэдээллээ бүрэн бөглөнө үү");

    setLoading(true);
    try {
      let imageUrl = editingStory?.image || "";
      if (file) {
        const data = new FormData();
        data.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
      }

      const method = editingStory ? "PUT" : "POST";
      const url = editingStory
        ? `/api/stories/${editingStory._id}`
        : `/api/stories`;

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: imageUrl }),
      });

      closeModal();
      fetchStories();
    } catch {
      alert("Алдаа гарлаа");
    } finally {
      setLoading(false);
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

  const handleDelete = async (id) => {
    if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
    try {
      await fetch(`/api/stories/${id}`, { method: "DELETE" });
      fetchStories();
    } catch {
      alert("Устгах үед алдаа гарлаа");
    }
  };

  const processedStories = useMemo(() => {
    let filtered = [...stories];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) || s.date.toString().includes(q)
      );
    }
    filtered.sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );
    return filtered;
  }, [stories, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* NAVIGATION */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex shrink-0 w-full md:w-auto justify-between items-center">
            <Link
              href="/landingPage"
              className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-all"
            >
              ← Нүүр
            </Link>
            <h1 className="md:hidden text-lg font-black uppercase italic tracking-tighter">
              Цадиг <span className="text-indigo-600">Тууж</span>
            </h1>
          </div>

          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Огноо эсвэл гарчиг хайх..."
                className="w-full px-6 py-4 bg-slate-100/80 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:bg-white focus:border-indigo-500/20 transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3 shrink-0 w-full sm:w-auto">
              <select
                className="flex-1 sm:w-40 px-5 py-4 bg-slate-100/80 rounded-2xl text-[10px] font-black uppercase cursor-pointer outline-none border-2 border-transparent"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Шинэ нь эхэнд</option>
                <option value="asc">Хуучин нь эхэнд</option>
              </select>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:w-40 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                + Нэмэх
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* GRID CARDS */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {processedStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {processedStories.map((s) => (
              <div
                key={s._id}
                className="relative group bg-white rounded-[2.5rem] p-3 border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col h-full"
              >
                {/* ACTION BUTTONS (Visible on Hover) */}
                <div className="absolute top-6 right-6 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(s);
                    }}
                    className="p-3 bg-white/90 backdrop-blur-md text-indigo-600 rounded-2xl shadow-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(s._id);
                    }}
                    className="p-3 bg-white/90 backdrop-blur-md text-red-500 rounded-2xl shadow-lg hover:bg-red-500 hover:text-white transition-all active:scale-90"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <Link href={`/story/${s._id}`} className="flex flex-col h-full">
                  <div className="h-60 w-full rounded-4xl overflow-hidden relative mb-6">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200 font-black text-[10px] tracking-widest uppercase italic">
                        Memory
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-indigo-600 shadow-sm">
                      {s.date}
                    </div>
                  </div>

                  <div className="px-4 pb-6 flex flex-col flex-1">
                    <h2 className="text-xl font-black text-slate-800 mb-3 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {s.title}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium italic border-l-2 border-indigo-50 pl-4 mb-6">
                      "{s.content}"
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:gap-4 transition-all">
                      Дэлгэрэнгүй <span>→</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
            <p className="text-slate-300 font-black text-xl uppercase tracking-widest italic">
              Түүх олдсонгүй
            </p>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 sm:p-12 overflow-y-auto">
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-3xl font-[1000] text-slate-900 uppercase italic leading-none">
                  {editingStory ? "Түүх засах" : "Шинэ"}{" "}
                  <span className="text-indigo-600">дурсамж</span>
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div
                  onClick={() => document.getElementById("file-upload").click()}
                  className="h-48 rounded-[2.5rem] border-4 border-dashed border-slate-100 flex items-center justify-center bg-slate-50 overflow-hidden relative cursor-pointer hover:bg-slate-100 transition-all group"
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-3xl mb-2 block group-hover:scale-125 transition-transform">
                        📸
                      </span>
                      <p className="font-black text-slate-400 text-[10px] tracking-widest uppercase">
                        Зураг сонгох
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
                      Огноо
                    </label>
                    <input
                      type="text"
                      placeholder="жнь: 1995"
                      className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition-all text-sm"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
                      Гарчиг
                    </label>
                    <input
                      type="text"
                      placeholder="Түүхийн нэр"
                      className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition-all text-sm"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
                    Түүхэн бичвэр
                  </label>
                  <textarea
                    placeholder="Энд түүхээ дэлгэрэнгүй бичээрэй..."
                    className="w-full p-8 bg-slate-50 rounded-[2.5rem] font-medium min-h-40 outline-none text-base leading-relaxed border-2 border-transparent focus:border-indigo-100 transition-all"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex flex-col sm:flex-row gap-4">
              <button
                onClick={closeModal}
                className="flex-1 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
              >
                Болих
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-2 py-5 bg-indigo-600 text-white font-black rounded-3xl text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading
                  ? "Хадгалж байна..."
                  : editingStory
                  ? "Засах"
                  : "Архивт нэмэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
