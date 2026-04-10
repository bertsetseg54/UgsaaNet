"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Fingerprint, Search, X, Home, BookOpen, Plus, LogOut,
  Trash2, Edit3, Image as ImageIcon, ChevronLeft, ArrowRight,
  Camera, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Story() {
  const [stories, setStories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
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

  const fileInputRef = useRef(null);
  const router = useRouter();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchStories = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const storedData = localStorage.getItem("user_data");
      if (!storedData) return router.push("/login");
      const user = JSON.parse(storedData);
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
      // Файлын хэмжээг шалгах (жишээ нь 2MB-аас ихгүй)
      if (selectedFile.size > 2 * 1024 * 1024) {
        showToast("Зургийн хэмжээ хэтэрхий том байна (Max 2MB)", "error");
        return;
      }
      setFile(selectedFile);
      if (imagePreview && !imagePreview.startsWith('http')) {
        URL.revokeObjectURL(imagePreview);
      }
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
    setIsSubmitLoading(true);
    try {
      let finalImageUrl = editingStory?.image || "";
      if (file) {
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image }),
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadJson = await uploadRes.json();
        finalImageUrl = uploadJson.url;
      }
      const method = editingStory ? "PUT" : "POST";
      const url = editingStory ? `/api/stories/${editingStory._id}` : `/api/stories`;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: finalImageUrl, familyId: userData.familyId }),
      });
      if (response.ok) { closeModal(); fetchStories(); showToast(editingStory ? "Шинэчиллээ" : "Хадгаллаа"); }
    } catch (err) { showToast("Алдаа гарлаа", "error"); } finally { setIsSubmitLoading(false); }
  };

  // DELETE ФУНКЦ ЗАСАГДСАН
  const performDelete = async () => {
    if (!deleteModal.id) return;
    setIsSubmitLoading(true);
    try {
      const res = await fetch(`/api/stories/${deleteModal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId: userData.familyId }),
      });
      if (res.ok) { 
        fetchStories(); 
        setDeleteModal({ open: false, id: null }); 
        showToast("Дурсамж устлаа"); 
      } else {
        showToast("Устгахад алдаа гарлаа", "error");
      }
    } catch (err) { 
      showToast("Серверийн алдаа", "error"); 
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-16 relative font-sans">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[350] flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-xl border backdrop-blur-md ${toast.type === "error" ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
          <span className="text-[9px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-3 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-white"><Fingerprint size={16} strokeWidth={2.5} /></div>
            <div className="hidden sm:flex flex-col leading-none font-[1000] uppercase text-[10px]">
               <span className="text-slate-800">Угсаа</span><span className="text-amber-500">нет</span>
            </div>
          </Link>
          
          <div className="flex-1 max-w-xs relative">
            <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Хайх..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-100/50 rounded-full py-1.5 pl-8 pr-3 text-[11px] outline-none" 
            />
          </div>

          <button onClick={() => setShowLogoutConfirm(true)} className="p-1.5 text-slate-400 bg-slate-50 rounded-md"><LogOut size={16} /></button>
        </div>
      </header>

     <main className="max-w-7xl mx-auto px-2 pt-13 ">
        <div className="flex items-center justify-between mb-3 px-1">
           <div className="flex items-center gap-2">
              <Link href="/" className="p-1 bg-slate-50 rounded text-slate-400"><ChevronLeft size={16} /></Link>
              <div>
                 <h1 className="text-[12px] font-black md:text-sm uppercase text-slate-800 leading-tight">
                     Гэр Бүлийн Дурсамж
                  </h1>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                  {stories.length} түүх
                </p>
              </div>
           </div>
           <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
             <Plus size={12} /> Нэмэх
           </button>
        </div>

        {isPageLoading ? (
           <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <BookOpen size={20} className="text-slate-300 mb-2" />
            <p className="text-[9px] font-black text-slate-400 uppercase">Одоогоор түүх алга</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredStories.map((s) => (
              <div key={s._id} className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col">
                {/* ЗУРГИЙГ БҮТНЭЭР НЬ ХАРАГДУУЛАХ ХЭСЭГ */}
                <div className="h-32 sm:h-40 relative bg-slate-50 flex items-center justify-center p-1">
                  {s.image ? (
                    <img 
                      src={s.image} 
                      className="max-w-full max-h-full object-contain" // Энэ нь зургийг бүтнээр нь багтаана
                      alt={s.title} 
                    />
                  ) : (
                    <div className="text-slate-200"><ImageIcon size={20} /></div>
                  )}
                  <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[7px] font-bold text-white uppercase">{s.date}</div>
                </div>
                
                <div className="p-2 flex-1 flex flex-col">
                  <h3 className="text-[11px] font-black text-slate-800 truncate uppercase mb-0.5">{s.title}</h3>
                  <p className="text-slate-500 text-[9px] line-clamp-1 mb-2 leading-tight">"{s.content}"</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
                    <div className="flex gap-0.5">
                       <button onClick={() => { setEditingStory(s); setFormData({title: s.title, date: s.date, content: s.content}); setImagePreview(s.image); setIsModalOpen(true); }} className="p-1 text-slate-400 hover:text-amber-500"><Edit3 size={12} /></button>
                       <button onClick={() => setDeleteModal({ open: true, id: s._id })} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                    <Link href={`/story/${s._id}`} className="p-1 text-slate-800 hover:text-amber-500 transition-colors"><ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL (ADD/EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
             <div className="px-3 py-2 border-b border-slate-50 flex justify-between items-center bg-white">
                <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-800">{editingStory ? "Засварлах" : "Шинэ Түүх"}</h2>
                <button type="button" onClick={closeModal} className="p-1 text-slate-400"><X size={16} /></button>
             </div>
             <div className="p-4 space-y-3 overflow-y-auto flex-1 no-scrollbar">
                <div className="cursor-pointer group relative" onClick={() => fileInputRef.current.click()}>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                   {imagePreview ? (
                      <div className="w-full h-36 bg-slate-50 rounded-lg flex items-center justify-center p-1 border border-slate-100">
                         <img src={imagePreview} className="max-w-full max-h-full object-contain" alt="Preview" />
                      </div>
                   ) : (
                      <div className="w-full h-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-amber-300 transition-colors">
                         <Camera size={16} />
                         <span className="text-[8px] font-black uppercase">Зураг сонгох</span>
                      </div>
                   )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <input value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} placeholder="Огноо (2024)" className="w-full px-2 py-2 bg-slate-50 rounded text-[11px] outline-none border border-transparent focus:border-amber-100" />
                   <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Гарчиг" className="w-full px-2 py-2 bg-slate-50 rounded text-[11px] outline-none border border-transparent focus:border-amber-100" />
                </div>
                <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Түүхээ бичээрэй..." className="w-full p-2 bg-slate-50 rounded text-[11px] min-h-[100px] outline-none border border-transparent focus:border-amber-100 resize-none" />
             </div>
             <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 text-[9px] font-black uppercase text-slate-400">Болих</button>
                <button type="submit" disabled={isSubmitLoading} className="flex-[2] py-2 bg-slate-900 text-white font-black rounded text-[9px] uppercase active:scale-95 transition-all">
                  {isSubmitLoading ? "Уншиж байна..." : "Хадгалах"}
                </button>
             </div>
          </form>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-[260px] w-full shadow-2xl text-center">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
               <AlertCircle size={20} />
            </div>
            <h3 className="text-xs font-black text-slate-800 mb-1 uppercase">Устгах уу?</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mb-5 leading-tight">Та энэ дурсамжийг бүрмөсөн устгахдаа итгэлтэй байна уу?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal({ open: false, id: null })} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-black text-[9px] uppercase">Болих</button>
              <button onClick={performDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-black text-[9px] uppercase">Устгах</button>
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

      {/* LOGOUT CONFIRM */} 
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-center">
          <div className="bg-white rounded-[2rem] p-6 max-w-[280px] w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <LogOut size={24} />
            </div>
            <h3 className="text-sm font-black text-slate-800 mb-2 uppercase italic">Гарах</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-6 leading-relaxed">Та системээс гарахдаа итгэлтэй байна уу?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase">Болих</button>
              <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-200">Гарах</button>
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