"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Fingerprint, Search, X, Home, BookOpen, Plus, LogOut,
  Trash2, Edit3, Image as ImageIcon, ChevronLeft, ArrowRight,
  AlertCircle, CheckCircle2, Clock, Camera, ChevronDown, Copy, Check, QrCode, Users, Share2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export default function Story() {
  const [stories, setStories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  
  // LOGOUT MODAL STATE
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [formData, setFormData] = useState({ title: "", date: "", content: "" });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingStory, setEditingStory] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const [userData, setUserData] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
      setUserData(user);
      if (!user.familyId) return router.push("/start");
      const res = await fetch(`/api/stories?familyId=${encodeURIComponent(user.familyId)}`);
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("Алдаа гарлаа", "error");
    } finally {
      setIsPageLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const handleLogout = () => {
    localStorage.removeItem("user_data");
    router.push("/login");
  };

  const handleCopyCode = () => {
    if (!userData?.familyId) return;
    navigator.clipboard.writeText(userData.familyId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

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
    if (!formData.title || !formData.date || !formData.content) {
      return showToast("Мэдээллээ бүрэн бөглөнө үү", "error");
    }

    const currentUser = JSON.parse(localStorage.getItem("user_data") || "{}");
    setIsSubmitLoading(true);

    try {
      let finalImageUrl = editingStory?.image || "";
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadJson = await uploadRes.json();
        finalImageUrl = uploadJson.url;
      }

      const method = editingStory ? "PUT" : "POST";
      const url = editingStory ? `/api/stories/${editingStory._id}` : `/api/stories`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: finalImageUrl, familyId: currentUser.familyId }),
      });

      if (response.ok) {
        closeModal();
        fetchStories();
        showToast(editingStory ? "Шинэчиллээ" : "Хадгаллаа");
      }
    } catch (err) {
      showToast("Алдаа гарлаа", "error");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const performDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user_data"));
      const res = await fetch(`/api/stories/${deleteModal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId: user.familyId }),
      });
      if (res.ok) {
        fetchStories();
        setDeleteModal({ open: false });
        showToast("Устгагдлаа");
      }
    } catch (err) { showToast("Алдаа", "error"); }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 relative font-sans shadow-xl">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 px-4 py-2 rounded-xl shadow-xl border backdrop-blur-md ${toast.type === "error" ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
          <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg"><Fingerprint size={18} strokeWidth={2.5} /></div>
            <div className="hidden sm:flex flex-col leading-[0.8] font-[1000] uppercase text-[12px]">
               <span className="text-slate-800">Угсаа</span><span className="text-amber-500">нет</span>
            </div>
          </Link>
          
          {/* SEARCH (Always visible on mobile now) */}
          <div className="flex-1 max-w-sm relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Хайх..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-100/50 rounded-full py-1.5 pl-9 pr-4 text-xs outline-none focus:bg-slate-100 transition-all" 
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => { localStorage.clear(); router.push("/start"); }} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div className="flex items-center gap-3">
              <Link href="/" className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-amber-500 hover:text-white transition-all"><ChevronLeft size={18} /></Link>
              <div>
                 <h1 className="text-xl font-[1000] uppercase italic text-slate-800">Гэр Бүлийн Дурсамж</h1>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Нийт {stories.length} түүх</p>
              </div>
           </div>
           <button onClick={() => setIsModalOpen(true)} className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg">
             <Plus size={14} strokeWidth={3} /> Шинэ дурсамж нэмэх
           </button>
        </div>

        {isPageLoading ? (
           <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-dashed border-slate-200 rounded-[3rem] text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-2xl">
              <BookOpen size={32} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Одоогоор түүх алга</h3>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl active:scale-95">
              <Plus size={16} strokeWidth={4} /> Анхны түүхээ нэмэх
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
            {filteredStories.map((s) => (
              <div key={s._id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
                <div className="h-48 relative bg-slate-100">
                  {/* DISPLAY SAVED IMAGE */}
                  {s.image ? (
                    <img src={s.image} className="w-full h-full object-cover" alt={s.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-[9px] font-black text-amber-600 uppercase shadow-sm">{s.date} он</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black text-slate-800 mb-2 truncate group-hover:text-amber-500 transition-colors">{s.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-6 italic opacity-80">"{s.content}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex gap-1.5">
                       <button onClick={() => { setEditingStory(s); setFormData({title: s.title, date: s.date, content: s.content}); setImagePreview(s.image); setIsModalOpen(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-amber-500 rounded-lg transition-colors"><Edit3 size={16} /></button>
                       <button onClick={() => setDeleteModal({ open: true, id: s._id })} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <Link href={`/story/${s._id}`} className="text-[9px] font-black uppercase text-slate-800 bg-slate-100 px-4 py-2 rounded-xl flex items-center gap-2 group-hover:bg-amber-500 group-hover:text-white transition-all">Унших <ArrowRight size={14} /></Link>
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
          <Link href="/" className="p-3 text-white/60 hover:text-amber-400"><Home size={22} /></Link>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 rounded-xl font-black text-[10px] uppercase mx-2 shadow-xl">
            <Plus size={16} strokeWidth={4} />Түүх Нэмэх
          </button>
          <Link href="/story" className="p-3 text-amber-400"><BookOpen size={22} /></Link>
        </div>
      </nav>
      {/* STORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
             {/* Modal Content - (Keep existing input fields) */}
             <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tighter">{editingStory ? "Засах" : "Шинэ Дурсамж"}</h2>
                <button type="button" onClick={closeModal} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={18} /></button>
             </div>
             <div className="p-5 space-y-5 overflow-y-auto no-scrollbar flex-1">
                {/* Image Picker */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                   {imagePreview ? (
                      <div className="w-full h-44 rounded-2xl overflow-hidden relative border-2 border-slate-50">
                         <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                           <Camera size={24} />
                         </div>
                      </div>
                   ) : (
                      <div className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:border-amber-500 transition-all">
                         <Camera size={24} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Зураг сонгох</span>
                      </div>
                   )}
                </div>
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-4">
                   <input value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} placeholder="Огноо: 1995" className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-amber-500" />
                   <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Гарчиг" className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-amber-500" />
                </div>
                <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Түүхээ энд бичнэ үү..." className="w-full p-4 bg-slate-50 rounded-2xl font-serif text-sm min-h-[150px] outline-none border border-transparent focus:border-amber-500" />
             </div>
             <div className="p-5 bg-white border-t border-slate-50 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-[9px] font-black uppercase text-slate-400">Болих</button>
                <button type="submit" disabled={isSubmitLoading} className="flex-[2] py-3 bg-slate-900 text-white font-black rounded-xl text-[9px] uppercase shadow-lg disabled:opacity-50">
                  {isSubmitLoading ? "Хадгалж байна..." : "Хадгалах"}
                </button>
             </div>
          </form>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">Устгахдаа итгэлтэй байна уу?</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mb-6">
              Энэ дурсамжийг устгавал дахин сэргээх боломжгүй болохыг анхаарна уу.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ open: false, id: null })} 
                className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all"
              >
                Болих
              </button>
              <button 
                onClick={performDelete} 
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL (Stay the same) */}
      {showQRModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Гэр бүлийн код</h3>
              <button onClick={() => setShowQRModal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={16} /></button>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-center mb-6">
              <QRCodeSVG value={userData?.familyId || ""} size={180} level="H" />
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-5 py-3 rounded-2xl mb-4">
              <code className="text-lg font-black text-slate-800">{userData?.familyId}</code>
              <button onClick={handleCopyCode} className="text-indigo-600">{copySuccess ? <CheckCircle2 size={20} /> : <Copy size={20} />}</button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-white to-transparent">
        <div className="bg-slate-900 rounded-2xl p-1.5 shadow-2xl flex items-center justify-between">
          <Link href="/" className="p-3 text-white/60 hover:text-amber-400"><Home size={22} /></Link>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 rounded-xl font-black text-[10px] uppercase mx-2 shadow-xl">
            <Plus size={16} strokeWidth={4} /> Түүх Нэмэх
          </button>
          <Link href="/story" className="p-3 text-amber-400"><BookOpen size={22} /></Link>
        </div>
      </nav>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}