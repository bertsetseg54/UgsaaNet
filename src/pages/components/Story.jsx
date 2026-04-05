"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Fingerprint, Search, X, Home, BookOpen, Plus, LogOut,
  Trash2, Edit3, Image as ImageIcon, ChevronLeft, ArrowRight,
  AlertCircle, CheckCircle2, Check, ChevronDown, Clock, Camera
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Story() {
  const [stories, setStories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({ title: "", date: "", content: "" });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [sortOrder, setSortOrder] = useState("desc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: 'confirm', message: '' });

  const fileInputRef = useRef(null);
  const router = useRouter();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchStories = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      if (!user.familyId) {
        setStories([]);
        showToast("Нэвтэрнэ үү", "error");
        return;
      }
      const url = `/api/stories?familyId=${encodeURIComponent(user.familyId)}`;
      const res = await fetch(url);
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      setStories([]);
      showToast("Алдаа гарлаа", "error");
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const filteredStories = useMemo(() => {
    let result = [...stories].filter(s => 
      (s.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.date || "").toString().includes(searchQuery)
    );
    return result.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [stories, searchQuery, sortOrder]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, date, content } = formData;
    if (!title || !date || !content) return showToast("Мэдээллээ бүрэн бөглөнө үү", "error");

    const currentUser = JSON.parse(localStorage.getItem("user_data") || "{}");
    setIsSubmitLoading(true);
    try {
      let imageUrl = editingStory?.image || "";
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
      }

      const method = editingStory ? "PUT" : "POST";
      const url = editingStory ? `/api/stories/${editingStory._id}` : `/api/stories`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: imageUrl, familyId: currentUser.familyId }),
      });

      if (response.ok) {
        closeModal();
        fetchStories();
        showToast(editingStory ? "Шинэчиллээ" : "Хадгаллаа");
      }
    } catch (err) { showToast("Алдаа гарлаа", "error"); } finally { setIsSubmitLoading(false); }
  };

  const performDelete = async () => {
    const storyId = deleteModal.id;
    try {
      const user = JSON.parse(localStorage.getItem("user_data"));
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId: user.familyId }),
      });
      if (response.ok) {
        fetchStories();
        setDeleteModal({ open: false });
        showToast("Устгагдлаа");
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20 md:pb-8 relative font-sans">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-2 rounded-xl shadow-xl border backdrop-blur-md animate-in slide-in-from-top-2 ${toast.type === "error" ? "bg-red-50/90 border-red-100 text-red-600" : "bg-emerald-50/90 border-emerald-100 text-emerald-600"}`}>
          {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          <span className="text-[9px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Fingerprint size={18} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col gap-0 leading-[0.8]">
              <span className="text-[12px] font-[1000] uppercase tracking-tighter text-slate-800">Угсаа</span>
              <span className="text-[12px] font-[1000] uppercase tracking-tighter text-amber-500">нет</span>
            </div>
          </Link>
          <div className="flex-1 max-w-sm relative">
            <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Хайх..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-100/50 rounded-full py-1.5 pl-9 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all" />
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setIsModalOpen(true)} className="hidden md:flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all">
                <Plus size={14} strokeWidth={3} /> Нэмэх
             </button>
             <button onClick={() => { localStorage.clear(); router.push("/start"); }} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg transition-all"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
             <Link href="/" className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-amber-500 shadow-sm"><ChevronLeft size={18} /></Link>
             <div>
                <h1 className="text-xl font-[1000] uppercase tracking-tighter text-slate-800 italic">Гэр Бүлийн Дурсамж</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Нийт {stories.length}</p>
             </div>
          </div>
          
          <div className="relative">
            <button onClick={() => setIsSortOpen(!isSortOpen)} className="w-full md:w-auto flex items-center justify-between gap-3 bg-white border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
              <div className="flex items-center gap-1.5"><Clock size={12} className="text-amber-500" /> {sortOrder === "desc" ? "Шинэ нь эхэнд" : "Хуучин нь эхэнд"}</div>
              <ChevronDown size={12} className={isSortOpen ? "rotate-180" : ""} />
            </button>
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                <button onClick={() => { setSortOrder("desc"); setIsSortOpen(false); }} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase hover:bg-slate-50">Шинэ нь эхэнд</button>
                <button onClick={() => { setSortOrder("asc"); setIsSortOpen(false); }} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase hover:bg-slate-50">Хуучин нь эхэнд</button>
              </div>
            )}
          </div>
        </div>

        {isPageLoading ? (
           <div className="flex flex-col items-center py-20 gap-2">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
           </div>
        ) : filteredStories.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
              <BookOpen size={32} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-[1000] text-slate-800 uppercase">Хоосон байна</h3>
              <button onClick={() => setIsModalOpen(true)} className="mt-4 bg-amber-500 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95">Шинээр нэмэх</button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((s) => (
              <div key={s._id} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-52 relative bg-slate-100">
                  {s.image ? <img src={s.image} className="w-full h-full object-cover" alt={s.title} /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-[1000] text-amber-600 uppercase shadow-sm">
                    {s.date} он
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-[1000] text-slate-800 mb-2 tracking-tight group-hover:text-amber-500 transition-colors">{s.title}</h3>
                  <p className="text-slate-500 text-xs italic line-clamp-2 mb-6 opacity-80">"{s.content}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex gap-1.5">
                       <button onClick={() => { setEditingStory(s); setFormData({title: s.title, date: s.date, content: s.content}); setImagePreview(s.image); setIsModalOpen(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-amber-500 rounded-lg transition-all"><Edit3 size={16} /></button>
                       <button onClick={() => setDeleteModal({ open: true, id: s._id, type: 'confirm' })} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                    <Link href={`/story/${s._id}`} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-800 bg-slate-100 px-4 py-2 rounded-xl hover:bg-amber-500 hover:text-white transition-all">Унших <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-white to-transparent">
        <div className="bg-slate-900 rounded-2xl p-1.5 shadow-2xl flex items-center justify-between">
          <Link href="/" className="p-3 text-amber-400"><Home size={22} /></Link>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl mx-2">
            <Plus size={16} strokeWidth={4} /> Түүх Нэмэх
          </button>
          <Link href="/story" className="p-3 text-white/60 hover:text-amber-400 transition-colors">
            <BookOpen size={22} />
          </Link>
        </div>
      </nav>


      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
             <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                <h2 className="text-xl font-[1000] uppercase tracking-tighter text-slate-800">{editingStory ? "Засах" : "Шинэ Дурсамж"}</h2>
                <button type="button" onClick={closeModal} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500"><X size={18} /></button>
             </div>
             
             <div className="p-5 space-y-5 overflow-y-auto no-scrollbar flex-1">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                   {imagePreview ? (
                      <div className="w-full h-40 rounded-2xl overflow-hidden relative border-2 border-slate-50">
                         <img src={imagePreview} className="w-full h-full object-cover" />
                      </div>
                   ) : (
                      <div className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400">
                         <Camera size={24} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Зураг сонгох</span>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Огноо</label>
                      <input name="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} placeholder="Огноо" className="w-full px-4 py-2.5 bg-slate-50 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-amber-100" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Гарчиг</label>
                      <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Гарчиг" className="w-full px-4 py-2.5 bg-slate-50 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-amber-100" />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Түүх</label>
                   <textarea name="content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Түүхээ энд бичнэ үү..." className="w-full p-4 bg-slate-50 rounded-2xl font-serif italic text-sm min-h-[120px] outline-none border-2 border-transparent focus:border-amber-100" />
                </div>
             </div>

             <div className="p-5 bg-white border-t border-slate-50 flex gap-3 shrink-0">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-[9px] font-black uppercase text-slate-400">Болих</button>
                <button type="submit" disabled={isSubmitLoading} className="flex-[2] py-3 bg-slate-900 text-white font-black rounded-xl text-[9px] uppercase tracking-widest shadow-lg hover:bg-amber-500 transition-all">
                  {isSubmitLoading ? "Хадгалж байна..." : "Хадгалах"}
                </button>
             </div>
          </form>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tighter">Устгах уу?</h3>
            <p className="text-slate-500 text-xs mb-6">Энэ үйлдлийг буцаах боломжгүй.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false })} className="flex-1 py-2 text-xs font-bold bg-slate-100 rounded-lg">Үгүй</button>
              <button onClick={performDelete} className="flex-1 py-2 text-xs font-bold bg-red-500 text-white rounded-lg">Устгах</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}