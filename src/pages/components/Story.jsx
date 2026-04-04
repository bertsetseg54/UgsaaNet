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
        showToast("Family ID олдсонгүй. Та эхлээд нэвтрэнэ үү", "error");
        return;
      }
      const url = `/api/stories?familyId=${encodeURIComponent(user.familyId)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Stories авах үед алдаа гарлаа");
      }
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setStories([]);
      showToast("Сервертэй холбогдоход алдаа гарлаа", "error");
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
    if (!title || !date || !content)
      return showToast("Мэдээллээ бүрэн бөглөнө үү", "error");

    const currentUser = JSON.parse(localStorage.getItem("user_data") || "{}");
    if (!currentUser.familyId)
      return showToast("Family ID олдсонгүй. Та эхлээд нэвтрэнэ үү", "error");

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

        if (!uploadRes.ok) {
          const errorPayload = await uploadRes.json().catch(() => null);
          throw new Error(errorPayload?.error || "Зураг upload-лахад алдаа гарлаа");
        }

        const uploadJson = await uploadRes.json();
        if (!uploadJson?.url) {
          throw new Error("Зураг серверээс буцаагдсангүй");
        }

        imageUrl = uploadJson.url;
      }

      const method = editingStory ? "PUT" : "POST";
      const url = editingStory ? `/api/stories/${editingStory._id}` : `/api/stories`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          image: imageUrl,
          familyId: currentUser.familyId
        }),
      });

      if (response.ok) {
        closeModal();
        fetchStories();
        showToast(editingStory ? "Амжилттай шинэчиллээ" : "Шинэ дурсамж нэмэгдлээ");
      }
    } catch (err) { showToast("Алдаа гарлаа", "error"); } finally { setIsSubmitLoading(false); }
  };

  const handleDelete = (storyId) => {
    setDeleteModal({ open: true, id: storyId, type: 'confirm' });
  };

  const performDelete = async () => {
    const storyId = deleteModal.id;
    try {
      const userData = localStorage.getItem("user_data");
      if (!userData) return;
      const user = JSON.parse(userData);

      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId: user.familyId }),
      });

      if (response.ok) {
        fetchStories();
        setDeleteModal({ open: true, type: 'message', message: 'Дурсамж амжилттай устгагдлаа' });
      } else {
        setDeleteModal({ open: true, type: 'message', message: 'Устгахад алдаа гарлаа' });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteModal({ open: true, type: 'message', message: 'Сервертэй холбогдоход алдаа гарлаа' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-28 md:pb-12 relative font-sans">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${toast.type === "error" ? "bg-red-50/90 border-red-100 text-red-600" : "bg-emerald-50/90 border-emerald-100 text-emerald-600"}`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Fingerprint size={22} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col gap-1 leading-[0.8] mb-1">
              <span className="text-[14px] font-[1000] uppercase tracking-tighter text-slate-800">Угсаа</span>
              <span className="text-[14px] font-[1000] uppercase tracking-tighter text-amber-500">нет</span>
            </div>
          </Link>
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Дурсамж хайх..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-100/50 rounded-full py-2.5 pl-11 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all" />
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsModalOpen(true)} className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg">
                <Plus size={16} strokeWidth={3} /> Дурсамж нэмэх
             </button>
             <button onClick={() => { localStorage.clear(); router.push("/start"); }} className="p-2.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition-all"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
             <Link href="/" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-amber-500 shadow-sm transition-all"><ChevronLeft size={20} /></Link>
             <div>
                <h1 className="text-2xl font-[1000] uppercase tracking-tighter text-slate-800 italic">Гэр бүлийн Дурсамж</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Нийт {stories.length} түүх хадгалагдсан</p>
             </div>
          </div>
          
          {/* SORT DROPDOWN */}
          <div className="relative inline-block">
            <button onClick={() => setIsSortOpen(!isSortOpen)} className="w-full md:w-auto flex items-center justify-between gap-4 bg-white border border-slate-100 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-amber-200 transition-all">
              <div className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> {sortOrder === "desc" ? "Шинэ нь эхэнд" : "Хуучин нь эхэнд"}</div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
            </button>
            {isSortOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => { setSortOrder("desc"); setIsSortOpen(false); }} className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors ${sortOrder === "desc" ? "text-amber-500 bg-amber-50/50" : "text-slate-500"}`}>Шинэ нь эхэнд</button>
                <button onClick={() => { setSortOrder("asc"); setIsSortOpen(false); }} className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors ${sortOrder === "asc" ? "text-amber-500 bg-amber-50/50" : "text-slate-500"}`}>Хуучин нь эхэнд</button>
              </div>
            )}
          </div>
        </div>

        {isPageLoading ? (
           <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ачаалж байна...</span>
           </div>
        ) : filteredStories.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 mb-6 shadow-sm"><BookOpen size={40} /></div>
              <h3 className="text-xl font-[1000] text-slate-800 mb-2 uppercase tracking-tighter">Дурсамж хоосон байна</h3>
              <p className="text-xs text-slate-400 mb-8 max-w-xs leading-relaxed">Та өөрийн ургийн түүхэнд үлдэх хамгийн нандин дурсамжуудаа энд нэмээрэй.</p>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-200 transition-all active:scale-95">Шинээр нэмэх</button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((s) => (
              <div key={s._id} className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all duration-500 relative">
                <div className="h-64 relative bg-slate-100 overflow-hidden">
                  {s.image ? <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={s.title} /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48} strokeWidth={1} /></div>}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-[1000] text-amber-600 uppercase shadow-sm tracking-widest">
                    {s.date}
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-xl font-[1000] text-slate-800 mb-4 tracking-tight leading-tight group-hover:text-amber-500 transition-colors">{s.title}</h3>
                  <p className="text-slate-500 text-sm italic font-serif line-clamp-3 mb-8 leading-relaxed opacity-80">"{s.content}"</p>
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingStory(s); setFormData({title: s.title, date: s.date, content: s.content}); setImagePreview(s.image); setIsModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-2xl transition-all"><Edit3 size={18} /></button>
                       <button onClick={() => handleDelete(s._id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18} /></button>
                    </div>
                    <Link href={`/story/${s._id}`} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-800 bg-slate-50 px-5 py-3 rounded-2xl hover:bg-amber-500 hover:text-white transition-all">Унших <ArrowRight size={16} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-10 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-full p-2 shadow-2xl flex items-center justify-between">
          <Link href="/" className="p-4 text-white/60"><Home size={22} /></Link>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full font-[1000] text-[10px] uppercase tracking-widest shadow-xl active:scale-95"><Plus size={18} strokeWidth={4} /> Нэмэх</button>
          <Link href="/story" className="p-4 text-amber-400 bg-white/10 rounded-full shadow-inner shadow-black/20"><BookOpen size={22} /></Link>
        </div>
      </nav>

      {/* MODAL: ADD / EDIT STORY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                <div>
                   <h2 className="text-2xl font-[1000] uppercase tracking-tighter text-slate-800">{editingStory ? "Засах" : "Шинэ Дурсамж"}</h2>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Түүхэн мөчөө мөнхөлж үлдээгээрэй</p>
                </div>
                <button type="button" onClick={closeModal} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={20} /></button>
             </div>
             
             <div className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-1">
                {/* IMAGE UPLOAD SECTION */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                   {imagePreview ? (
                      <div className="w-full h-56 rounded-[2rem] overflow-hidden relative border-4 border-slate-50">
                         <img src={imagePreview} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="text-white" size={32} />
                         </div>
                      </div>
                   ) : (
                      <div className="w-full h-48 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:bg-slate-100 hover:border-amber-200 transition-all">
                         <Camera size={32} strokeWidth={1.5} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Зураг сонгох</span>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Огноо</label>
                      <input name="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} placeholder="1995 он" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-100 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Гарчиг</label>
                      <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Төрсөн өдрийн баяр" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-100 transition-all" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Дэлгэрэнгүй түүх</label>
                   <textarea name="content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Тэр өдөр бид маш их баяртай байсан..." className="w-full p-8 bg-slate-50 rounded-[2.5rem] font-serif italic text-sm min-h-[180px] outline-none border-2 border-transparent focus:border-amber-100 transition-all leading-relaxed" />
                </div>
             </div>

             <div className="p-8 bg-white border-t border-slate-50 flex gap-4 shrink-0">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-[10px] font-[1000] uppercase text-slate-400 tracking-widest">Болих</button>
                <button type="submit" disabled={isSubmitLoading} className="flex-[2] py-4 bg-slate-900 text-white font-[1000] rounded-2xl text-[10px] uppercase shadow-xl shadow-slate-200 tracking-[0.2em] hover:bg-amber-500 transition-all active:scale-95">
                  {isSubmitLoading ? "Хадгалж байна..." : "Хадгалах"}
                </button>
             </div>
          </form>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            {deleteModal.type === 'confirm' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="text-red-500" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Устгах баталгаажуулалт</h3>
                </div>
                <p className="text-slate-600 mb-6">Та энэ дурсамжийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ open: false })}
                    className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Үгүй
                  </button>
                  <button
                    onClick={() => {
                      setDeleteModal({ open: false });
                      performDelete();
                    }}
                    className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                  >
                    Тийм, устгах
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check className="text-blue-500" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Мэдэгдэл</h3>
                </div>
                <p className="text-slate-600 mb-6">{deleteModal.message}</p>
                <button
                  onClick={() => setDeleteModal({ open: false })}
                  className="w-full py-2.5 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  OK
                </button>
              </>
            )}
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