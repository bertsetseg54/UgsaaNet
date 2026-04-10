// "use client";
// import { useState, useEffect, useMemo, useRef } from "react";
// import RegisterForm from "./RegisterForm";
// import { useRouter } from "next/navigation";
// import ProfileCard from "./ProfileCard";
// import {
//   Fingerprint, Plus, LogOut, Search, BookOpen, Home, 
//   Users, ArrowRight, Copy, Check, Edit3, Trash2, Eye, ChevronRight, EyeOff, QrCode, X, ChevronDown
// } from "lucide-react"; 
// import Link from "next/link";
// import { QRCodeSVG } from "qrcode.react";

// export default function LandingPage() {
//   const [profiles, setProfiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingProfile, setEditingProfile] = useState(null);
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [isRegisterOpen, setIsRegisterOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [familyId, setFamilyId] = useState("");
//   const [copySuccess, setCopySuccess] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [showFamilyId, setShowFamilyId] = useState(false);
//   const [showQR, setShowQR] = useState(false);
//   const [selectedParentId, setSelectedParentId] = useState(null);
  
//   const [expandedParentId, setExpandedParentId] = useState(null);
//   const expandedRef = useRef(null);

//   const handleCardClick = (profileId) => {
//     if (expandedParentId === profileId) {
//       setExpandedParentId(null);
//     } else {
//       setExpandedParentId(profileId);
//     }
//   };

//   const isChildOfSelected = (child, allProfiles, selectedId) => {
//     if (!selectedId) return true;
    
//     const selectedPerson = allProfiles.find(p => p._id === selectedId);
//     if (!selectedPerson) return true;

//     const childGen = Number(child.generation);
//     const selectedGen = Number(selectedPerson.generation);

//     if (childGen <= selectedGen) return true;

//     if (childGen === selectedGen + 1) {
//       return child.parentId === selectedId;
//     }

//     return false;
//   };

//   useEffect(() => {
//     if (expandedParentId && expandedRef.current) {
//       const timer = setTimeout(() => {
//         // 200ms-ийн дараа Ref байсаар байгаа эсэхийг дахин шалгана
//         if (expandedRef.current) {
//           expandedRef.current.scrollIntoView({ 
//             behavior: 'smooth', 
//             block: 'nearest', 
//             inline: 'center' 
//           });
//         }
//       }, 200);

//       // Component unmount болох эсвэл ID өөрчлөгдөхөд таймерыг цэвэрлэнэ
//       return () => clearTimeout(timer);
//     }
//   }, [expandedParentId]);

//   const [alertModal, setAlertModal] = useState({ 
//     open: false, id: null, type: 'confirm', message: '', title: '' 
//   });

//   const router = useRouter();

//   const hasHeadOfFamily = useMemo(() => {
//     return profiles.some(p => Number(p.generation) === 1);
//   }, [profiles]);

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(familyId);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error("Хуулж чадсангүй: ", err);
//     }
//   };

//   const fetchProfiles = async (fId) => {
//     try {
//       setLoading(true);
//       const targetId = fId || familyId;
//       if (!targetId) return;

//       const url = `/api/persons?familyId=${encodeURIComponent(targetId)}`;
//       const res = await fetch(url);
//       const data = await res.json();
      
//       if (data.success) {
//         setProfiles(data.data);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const storedData = localStorage.getItem("user_data");
//     if (!storedData) {
//       router.push("/start");
//       return;
//     }
//     const user = JSON.parse(storedData);
//     if (user.familyId) {
//       setFamilyId(user.familyId);
//       fetchProfiles(user.familyId);
//     }
//   }, []);

//   const handleSuccessAction = (msg) => {
//     fetchProfiles(familyId);
//     setIsRegisterOpen(false);
//     setIsEditOpen(false);
//     setEditingProfile(null);
//     setAlertModal({ 
//       open: true, 
//       type: 'message', 
//       title: 'Амжилттай', 
//       message: msg || 'Мэдээлэл амжилттай хадгалагдлаа' 
//     });
//   };

//   const handleCopyID = () => {
//     if (!familyId) return;
//     navigator.clipboard.writeText(familyId);
//     setCopySuccess(true);
//     setTimeout(() => setCopySuccess(false), 2000);
//   };

//   const handleDelete = (id) => {
//     setAlertModal({ 
//       open: true, id, type: 'confirm', 
//       title: 'Устгах баталгаажуулалт', 
//       message: 'Та энэ гишүүнийг устгахдаа итгэлтэй байна уу?' 
//     });
//   };

//   const handleLogoutClick = () => {
//     setAlertModal({ 
//       open: true, 
//       type: 'logout', 
//       title: 'Системээс гарах', 
//       message: 'Та системээс гарахдаа итгэлтэй байна уу?' 
//     });
//   };

//   const performDelete = async () => {
//     const id = alertModal.id;
//     try {
//       const res = await fetch('/api/persons', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id, familyId }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setProfiles(prev => prev.filter(p => p._id !== id));
//         if (expandedParentId === id) setExpandedParentId(null);
//         setAlertModal({ 
//           open: true, type: 'message', title: 'Мэдэгдэл', message: 'Амжилттай устгагдлаа' 
//         });
//       }
//     } catch (err) {
//       setAlertModal({ open: true, type: 'message', title: 'Алдаа', message: 'Алдаа гарлаа' });
//     }
//   };

//   const performLogout = () => {
//     localStorage.clear();
//     router.push("/start");
//   };

//   const filteredProfiles = useMemo(() => {
//     let result = profiles;
//     if (selectedParentId) {
//       result = profiles.filter(p => p.parentId === selectedParentId);
//     }
//     return result.filter((p) => 
//       (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) &&
//       isChildOfSelected(p, profiles, expandedParentId)
//     );
//   }, [profiles, searchQuery, selectedParentId, expandedParentId]);

//   const groupedByGeneration = useMemo(() => {
//     return filteredProfiles.reduce((acc, p) => {
//       const gen = p.generation || 1;
//       if (!acc[gen]) acc[gen] = [];
//       acc[gen].push(p);
//       return acc;
//     }, {});
//   }, [filteredProfiles]);
  

//   return (
//     <div className="min-h-screen bg-[#F9FAFB] text-slate-700 font-sans">
//       <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-3 py-2">
//         <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
//             <Link href="/" onClick={() => {setSelectedParentId(null); setExpandedParentId(null);}} className="flex items-center gap-2 shrink-0">
//               <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-sm"><Fingerprint size={18} strokeWidth={2.5} /></div>
//                 <div className="hidden sm:flex flex-col leading-none font-bold uppercase text-[11px]">
//                   <span className="text-slate-700">Угсаа</span><span className="text-amber-500">Нет</span>
//                 </div>
//             </Link>
//             <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shrink-0 overflow-hidden">
//               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Ургийн Код:</span>
//               <code className="text-[10px] font-bold text-amber-600 font-mono w-[80px] truncate block text-center">
//                 {showFamilyId ? familyId : "••••••"}
//               </code>
//               <div className="flex items-center gap-1 shrink-0">
//                 <button onClick={() => setShowFamilyId(!showFamilyId)} className="text-slate-400 hover:text-amber-500 transition-colors p-0.5">
//                   {showFamilyId ? <Eye size={12} /> : <EyeOff size={12} />}
//                 </button>
//                 <button onClick={handleCopyID} className="text-slate-400 hover:text-amber-500 transition-colors p-0.5">
//                   {copySuccess ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
//                 </button>
//                 <button onClick={() => setShowQR(true)} className="ml-1 p-1 bg-slate-100 text-slate-500 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors">
//                   <QrCode size={18} />
//                 </button>
//               </div>
//             </div>
            // <Link href="/story" className="hidden md:flex items-center border rounded-xl gap-1.5 px-4 py-2  text-slate-500 hover:text-amber-600 transition-colors">
            //     <BookOpen size={16} />
            //     <span className="text-[12px] font-bold uppercase tracking-wider">Түүх</span>
            //   </Link>
//             <div className="flex-1 max-w-[500px] flex items-center gap-2">
//               <div className="relative flex-1">
//                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input type="text" placeholder="Хайх..." value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full bg-slate-100/80 rounded-lg py-1.5 pl-9 pr-4 text-[11px] font-bold outline-none focus:bg-white border border-transparent focus:border-amber-200 transition-all"/>
//               </div>
//               <button onClick={() => setShowQR(true)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors shrink-0 block lg:hidden">
//                 <QrCode size={18} />
//               </button>
//             </div>
//             <div className="flex items-center gap-2 shrink-0">
//               <button onClick={handleLogoutClick} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
//                 <LogOut size={20} />
//               </button>
//             </div>
//         </div>
//       </header>

      // <main className="max-w-7xl mx-auto px-4 pt-16 pb-20">
      //   {selectedParentId && (
      //     <div className="mb-4 flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-1">
      //       <span className="text-[10px] font-bold uppercase text-slate-500 px-2 tracking-wide">
      //         {profiles.find(p => p._id === selectedParentId)?.name}-ийн салбар
      //       </span>
      //       <button onClick={() => setSelectedParentId(null)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
      //     </div>
      //   )}

      //   {!loading && (
      //     <div className="mb-6">
      //       <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
      //         <div className="flex items-center gap-3">
      //           <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 shrink-0">
      //             <Users size={20} />
      //           </div>
      //           <div className="leading-tight">
      //             <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Миний Ургийн Мод</h2>
      //             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{profiles.length} гишүүн</p>
      //           </div>
      //         </div>
      //         <button onClick={() => setIsRegisterOpen(true)} className="hidden lg:flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-sm">
      //           <Plus size={14} strokeWidth={4} /> Гишүүн нэмэх
      //         </button>
      //       </div>
      //     </div>
      //   )}

      //  {loading ? (
      //     <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
      //   ) : profiles.length === 0 ? (
      //     <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-center animate-in fade-in zoom-in-95 duration-500">
      //       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-inner">
      //         <Users size={32} />
      //       </div>
      //       <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Ургийн мод хоосон байна</h3>
      //       <button onClick={() => setIsRegisterOpen(true)} className="flex items-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl active:scale-95">
      //         <Plus size={16} strokeWidth={4} /> Анхны гишүүнээ нэмэх
      //       </button>
      //     </div>
      //   ) : (
      //     <div className="flex flex-col"> 
      //       {Object.keys(groupedByGeneration).sort((a,b) => Number(a)-Number(b)).map((gen) => (
      //         <section key={gen} className="relative">
      //           <div className="flex justify-between items-center gap-2 px-1">
      //             <div className="flex items-center gap-2">
      //               <span className="flex items-center justify-center h-5 px-1.5 rounded bg-amber-100 text-black font-bold text-[9px] font-black">
      //                 {gen}
      //               </span>
      //               <h2 className="font-bold text-[11px] uppercase text-slate-500 tracking-widest">
      //                 {gen === "1" ? "Тэргүүн" : `${gen}-р үе`}
      //               </h2>
      //               <div className="flex-1 h-[1px] bg-slate-100"></div>
      //             </div>
      //             <div> 
      //               <Link href={`/generation/${gen}`} className="text-amber-500 hover:text-amber-600 flex gap-1 items-center">
      //                 <span className="text-[12px] font-bold uppercase tracking-widest">Үзэх</span>
      //                 <ArrowRight size={14} />
      //               </Link>
      //             </div>
      //           </div>
                
      //           {/* Хүн дээр дарахад хүүхдийн мэдээлэл харуулах хэсэг */}
      //           <div className="flex overflow-x-auto gap-2 no-scrollbar snap-x px-1 pb-3">
      //            {groupedByGeneration[gen].map((p) => {
      //               const children = profiles.filter(c => c.parentId === p._id);
      //               const isExpanded = expandedParentId === p._id;
      //               const isRelatedToSelection = expandedParentId === p._id || p.parentId === expandedParentId;

      //               return (
      //                 <div 
      //                   key={p._id} 
      //                   className="flex flex-col items-center shrink-0 snap-start relative cursor-pointer"
      //                   onClick={() => handleCardClick(p._id)}
      //                   ref={isExpanded ? expandedRef : null}
      //                 >
      //                   <div className={`relative transition-all duration-300 rounded-[1.5rem] border-2 ${
      //                     isRelatedToSelection 
      //                       ? 'border-amber-500 bg-amber-50/30' 
      //                       : 'border-transparent'
      //                   } ${isExpanded ? 'z-20 shadow-lg' : ''}`}> 
                          
      //                     <ProfileCard 
      //                       profile={p} 
      //                       profiles={profiles}
      //                       onDelete={(id) => handleDelete(id)}
      //                       onEdit={(data) => { setEditingProfile(data); setIsEditOpen(true); }}
      //                     />
                          
      //                     {/* Хүүхэдтэй эсвэл хүүхэдгүйг заах хэсэг */}
      //                     <div 
      //                       className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md border shadow-sm transition-all flex items-center gap-1
      //                         ${isExpanded ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-400 border-slate-100 hover:text-amber-600'}`}
      //                     >
      //                       <span className="text-[9px] font-black">
      //                         {children.length > 0 ? `${children.length} хүүхэд` : "Хүүхэдгүй"}
      //                       </span>
      //                       {children.length > 0 && (
      //                         <ChevronDown size={10} className={`${isExpanded ? 'rotate-180' : ''}`} />
      //                       )}
      //                     </div>
      //                   </div>
      //                 </div>
      //               );
      //             })}
      //           </div>
      //         </section>
      //       ))}
      //     </div>
      //   )}
      // </main>

//       <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-white to-transparent">
//         <div className="bg-slate-900 rounded-2xl p-1.5 shadow-2xl flex items-center justify-between">
//           <button onClick={() => {setExpandedParentId(null); setSelectedParentId(null);}} className="p-3 text-white/60 hover:text-amber-400"><Home size={22} /></button>
//           <button onClick={() => setIsRegisterOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 rounded-xl font-black text-[10px] uppercase mx-2 shadow-xl">
//             <Plus size={16} strokeWidth={4} /> Гишүүн Нэмэх
//           </button>
//           <Link href="/story" className="p-3 text-amber-400"><BookOpen size={22} /></Link>
//         </div>
//       </nav>

//       {showQR && (
//           <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-[110] p-6 animate-in fade-in duration-200">
//             <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center relative animate-in zoom-in-95">
//               <button 
//                 onClick={() => setShowQR(false)} 
//                 className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
//               >
//                 <X size={18} />
//               </button>
//               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Ургийн QR Код</h3>
//               <div className="bg-white p-4 rounded-2xl border-[6px] border-slate-50 inline-block mb-6">
//                 <QRCodeSVG value={familyId} size={160} level="H" />
//               </div>
//               <div 
//                 onClick={handleCopy}
//                 className="bg-slate-50 rounded-xl p-3 border border-slate-100 cursor-pointer hover:bg-slate-100 active:scale-95 transition-all relative group"
//               >
//                 <p className="text-[8px] font-bold text-slate-400 uppercase mb-1 tracking-widest flex items-center justify-center gap-1">
//                   {copied ? <span className="text-green-500">Амжилттай хуулагдлаа!</span> : "Ургийн Код (Дараад хуулна уу)"}
//                   {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
//                 </p>
//                 <p className="text-xs font-bold text-amber-600 font-mono break-all">{familyId}</p>
//               </div>
//             </div>
//           </div>
//         )}

//       {alertModal.open && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[120] p-6 animate-in fade-in duration-300">
//           <div className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50 relative overflow-hidden animate-in zoom-in-95 duration-300">
//             <div className="text-center">
//               <div className="mb-2 flex justify-center">
//                 {alertModal.type === 'message' ? (
//                   <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 ">
//                     <Check size={32} strokeWidth={3} />
//                   </div>
//                 ) : alertModal.type === 'logout' ? (
//                   <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
//                     <LogOut size={32} strokeWidth={2.5} />
//                   </div>
//                 ) : (
//                   <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
//                     <Trash2 size={32} strokeWidth={2.5} />
//                   </div>
//                 )}
//               </div>
//               <h3 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-widest">{alertModal.title}</h3>
//               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-8 leading-relaxed px-2">{alertModal.message}</p>
//               <div className="flex gap-3">
//                 {alertModal.type === 'message' ? (
//                   <button onClick={() => setAlertModal({ ...alertModal, open: false })} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg active:scale-95">Ойлголоо</button>
//                 ) : (
//                   <>
//                     <button onClick={() => setAlertModal({ ...alertModal, open: false })} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] hover:bg-slate-200 transition-all">Болих</button>
//                     <button onClick={alertModal.type === 'logout' ? performLogout : performDelete} className={`flex-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] shadow-lg active:scale-95 transition-all ${alertModal.type === 'logout' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'}`}>Тийм</button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {isRegisterOpen && <RegisterForm isOpen={isRegisterOpen} setIsOpen={setIsRegisterOpen} onProfileAdded={() => handleSuccessAction('Бүртгэгдлээ')} hasHeadOfFamily={hasHeadOfFamily} familyId={familyId} />}
//       {isEditOpen && <RegisterForm isOpen={isEditOpen} setIsOpen={setIsEditOpen} editData={editingProfile} onUpdate={() => handleSuccessAction('Шинэчлэгдлээ')} hasHeadOfFamily={hasHeadOfFamily} familyId={familyId} />}
//     </div>
//   );
// }
"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import RegisterForm from "./RegisterForm";
import { useRouter } from "next/navigation";
import ProfileCard from "./ProfileCard";
import {
  Fingerprint, Plus, LogOut, Search, BookOpen, Home, 
  Users, ArrowRight, Copy, Check, Edit3, Trash2, Eye, ChevronRight, EyeOff, QrCode, X, ChevronDown
} from "lucide-react"; 
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function LandingPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFamilyId, setShowFamilyId] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  
  const [expandedParentId, setExpandedParentId] = useState(null);
  const expandedRef = useRef(null);

  const handleCardClick = (profileId) => {
  if (expandedParentId === profileId) {
    // Хэрэв дарсан хүн нь аль хэдийн идэвхтэй бол, түүний эцэг рүү нь буцна
    const person = profiles.find(p => p._id === profileId);
    setExpandedParentId(person ? person.parentId : null);
  } else {
    setExpandedParentId(profileId);
  }
};

  const isChildOfSelected = (child, allProfiles, selectedId) => {
    if (!selectedId) return true;
    const selectedPerson = allProfiles.find(p => p._id === selectedId);
    if (!selectedPerson) return true;
    const childGen = Number(child.generation);
    const selectedGen = Number(selectedPerson.generation);
    if (childGen <= selectedGen) return true;
    if (childGen === selectedGen + 1) {
      return child.parentId === selectedId;
    }
    return false;
  };

  useEffect(() => {
    if (expandedParentId && expandedRef.current) {
      const timer = setTimeout(() => {
        if (expandedRef.current) {
          expandedRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'center' 
          });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [expandedParentId]);

  const [alertModal, setAlertModal] = useState({ 
    open: false, id: null, type: 'confirm', message: '', title: '' 
  });

  const router = useRouter();

  const hasHeadOfFamily = useMemo(() => {
    return profiles.some(p => Number(p.generation) === 1);
  }, [profiles]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(familyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Хуулж чадсангүй: ", err);
    }
  };

  const fetchProfiles = async (fId) => {
    try {
      setLoading(true);
      const targetId = fId || familyId;
      if (!targetId) return;
      const url = `/api/persons?familyId=${encodeURIComponent(targetId)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProfiles(data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem("user_data");
    if (!storedData) {
      router.push("/start");
      return;
    }
    const user = JSON.parse(storedData);
    if (user.familyId) {
      setFamilyId(user.familyId);
      fetchProfiles(user.familyId);
    }
  }, []);

  const handleSuccessAction = (msg) => {
    fetchProfiles(familyId);
    setIsRegisterOpen(false);
    setIsEditOpen(false);
    setEditingProfile(null);
    setAlertModal({ 
      open: true, 
      type: 'message', 
      title: 'Амжилттай', 
      message: msg || 'Хадгалагдлаа' 
    });
  };
  // Тухайн хүний дээд үеийн бүх хүмүүсийн ID-г олж авах (Зам тодорхойлох)
const getSelectedPath = (targetId, allProfiles) => {
  const path = new Set();
  let currentId = targetId;
  while (currentId) {
    path.add(currentId);
    const person = allProfiles.find(p => p._id === currentId);
    currentId = person ? person.parentId : null;
  }
  return path;
};

const activePath = useMemo(() => getSelectedPath(expandedParentId, profiles), [expandedParentId, profiles]);
  const handleCopyID = () => {
    if (!familyId) return;
    navigator.clipboard.writeText(familyId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDelete = (id) => {
    setAlertModal({ 
      open: true, id, type: 'confirm', 
      title: 'Устгах', 
      message: 'Та итгэлтэй байна уу?' 
    });
  };

  const handleLogoutClick = () => {
    setAlertModal({ 
      open: true, 
      type: 'logout', 
      title: 'Гарах', 
      message: 'Та гарахдаа итгэлтэй байна уу?' 
    });
  };

  const performDelete = async () => {
    const id = alertModal.id;
    try {
      const res = await fetch('/api/persons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, familyId }),
      });
      const data = await res.json();
      if (data.success) {
        setProfiles(prev => prev.filter(p => p._id !== id));
        if (expandedParentId === id) setExpandedParentId(null);
        setAlertModal({ 
          open: true, type: 'message', title: 'Мэдэгдэл', message: 'Устгагдлаа' 
        });
      }
    } catch (err) {
      setAlertModal({ open: true, type: 'message', title: 'Алдаа', message: 'Алдаа гарлаа' });
    }
  };

  const performLogout = () => {
    localStorage.clear();
    router.push("/start");
  };

 const filteredProfiles = useMemo(() => {
  return profiles.filter((p) => {
    const gen = Number(p.generation);
    if (gen <= 2) return true; // 1 болон 2-р үе үргэлж харагдана
    return activePath.has(p.parentId); // Бусад нь зөвхөн сонгогдсон хүний хүүхэд бол харагдана
  });
}, [profiles, activePath]);

  const groupedByGeneration = useMemo(() => {
    const groups = filteredProfiles.reduce((acc, p) => {
      const gen = p.generation || 1;
      if (!acc[gen]) acc[gen] = [];
      acc[gen].push(p);
      return acc;
    }, {});
    return groups;
  }, [filteredProfiles]);

  
  

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-700 font-sans">
      {/* Header - Padding багасгасан */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <Link href="/" onClick={() => {setSelectedParentId(null); setExpandedParentId(null);}} className="flex items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-sm"><Fingerprint size={16} strokeWidth={2.5} /></div>
                <div className="hidden sm:flex flex-col leading-none font-bold uppercase text-[10px]">
                  <span className="text-slate-700">Угсаа</span><span className="text-amber-500">Нет</span>
                </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shrink-0">
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Ургийн код:</span>
              <code className="text-[10px] font-bold text-amber-600 font-mono w-[65px] truncate block text-center">
                {showFamilyId ? familyId : "••••••"}
              </code>
              <button onClick={() => setShowFamilyId(!showFamilyId)} className="text-slate-400 hover:text-amber-500 p-0.5">
                {showFamilyId ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              <button onClick={handleCopyID} className="text-slate-400 hover:text-amber-500 p-0.5">
                {copySuccess ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
              <button onClick={() => setShowQR(true)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hidden md:block shrink-0">
                <QrCode size={16} />
              </button>
            </div>
            <Link href="/story" className="hidden md:flex items-center border rounded-xl gap-1.5 px-4 py-2  text-slate-500 hover:text-amber-600 transition-colors">
                <BookOpen size={16} />
                <span className="text-[12px] font-bold uppercase tracking-wider">Түүх</span>
              </Link>

            <div className="flex-1 max-w-[400px] flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Гишүүн хайх..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-bold outline-none focus:bg-white border border-transparent focus:border-amber-200 transition-all"/>
              </div>
              <button onClick={() => setShowQR(true)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg shrink-0 block md:hidden">
                <QrCode size={16} />
              </button>
            </div>

            <button onClick={handleLogoutClick} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
        </div>
      </header>

      {/* Main - Top padding багасгасан */}
      <main className="max-w-7xl mx-auto px-4 pt-10 pb-18">
          {selectedParentId && (
            <div className="mb-3 flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 px-2 tracking-wide">
                {profiles.find(p => p._id === selectedParentId)?.name}-ийн салбар
              </span>
              <button onClick={() => setSelectedParentId(null)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
            </div>
          )}

          {!loading && (
            <div className="mb-2 pt-2 md:pt-4">
              <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 shrink-0">
                    <Users size={18} />
                  </div>
                  <div className="leading-tight">
                    <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Миний Ургийн Мод</h2>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{profiles.length} гишүүн</p>
                  </div>
                </div>
                <button onClick={() => setIsRegisterOpen(true)} className="hidden lg:flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-sm">
                  <Plus size={12} strokeWidth={4} /> Гишүүн нэмэх
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-3">
                <Users size={28} />
              </div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-2">Ургийн мод хоосон байна</h3>
              <button onClick={() => setIsRegisterOpen(true)} className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg">
                <Plus size={14} strokeWidth={4} /> Анхны гишүүнээ нэмэх
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1"> {/* Үе хоорондын зайг багасгасан (gap-2) */}
              {Object.keys(groupedByGeneration)
                .sort((a, b) => Number(a) - Number(b))
                .map((gen) => {
                  if (groupedByGeneration[gen].length === 0) return null;

                  return (
                    <section key={gen} className="relative animate-in fade-in duration-300">
                      {/* Generation Header - Margin багасгасан */}
                      <div className="flex justify-between items-center gap-2 px-1 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-4 px-1.5 rounded bg-amber-100 text-black font-bold text-[8px] font-black">
                            {gen}
                          </span>
                          <h2 className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">
                            {gen === "1" ? "Ургийн Тэргүүн" : `${gen}-р үе`}
                          </h2>
                          <div className="flex-1 h-[1px] bg-slate-50"></div>
                        </div>
                        <div> 
                          <Link href={`/generation/${gen}`} className="text-amber-500/70 hover:text-amber-600 flex gap-1 items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Үзэх</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                      
                      {/* Cards Row - Padding bottom багасгасан */}
                      <div className="flex overflow-x-auto gap-2 no-scrollbar snap-x px-1 pb-1">
                        {groupedByGeneration[gen].map((p) => {
                          const children = profiles.filter(c => c.parentId === p._id);
                          const isExpanded = expandedParentId === p._id;
                          const isSelectedInPath = activePath.has(p._id);
                          
                          // Эхний 2 үе эсвэл сонгогдсон мөчир тод харагдана
                          const isBright = 
                            Number(gen) === 1 || 
                            isSelectedInPath || 
                            (Number(gen) === 2 && !expandedParentId);

                          return (
                            <div 
                              key={p._id} 
                              className={`flex flex-col items-center shrink-0 snap-start relative cursor-pointer transition-all duration-300 ${
                                isBright ? 'opacity-100' : 'opacity-45 grayscale-[0.5] scale-95'
                              }`}
                              onClick={() => handleCardClick(p._id)}
                              ref={isExpanded ? expandedRef : null}
                            >
                              <div className={`relative transition-all duration-300 rounded-[1.4rem] border-2 ${
                                isExpanded 
                                  ? 'border-amber-500 shadow-md ring-2 ring-amber-500/5' 
                                  : isSelectedInPath ? 'border-amber-300/50' : 'border-transparent'
                              }`}> 
                                
                                <ProfileCard 
                                  profile={p} 
                                  profiles={profiles}
                                  onDelete={(id) => handleDelete(id)}
                                  onEdit={(data) => { setEditingProfile(data); setIsEditOpen(true); }}
                                />
                                
                                <div 
                                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-lg border shadow-sm transition-all flex items-center gap-1 z-20 min-w-[70px] justify-center
                                    ${isExpanded 
                                      ? 'bg-amber-500 text-white border-amber-600' 
                                      : 'bg-white text-slate-900 border-slate-100'
                                    }`}
                                >
                                  <span className="text-[8px] font-bold uppercase whitespace-nowrap">
                                    {children.length > 0 ? `${children.length} хүүхэд` : "Хүүхэдгүй"}
                                  </span>

                                  {children.length > 0 && (
                                    <ChevronDown 
                                      size={9} 
                                      strokeWidth={4} 
                                      className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'text-amber-500'}`} 
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
            </div>
          )}
        </main>


      {/* Navigation - Өндөр багасгасан */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pt-2 bg-gradient-to-t from-white via-white/80 to-transparent">
        <div className="bg-slate-900 rounded-xl p-1 shadow-xl flex items-center justify-between">
          <button onClick={() => {setExpandedParentId(null); setSelectedParentId(null);}} className="p-2.5 text-white/60"><Home size={20} /></button>
          <button onClick={() => setIsRegisterOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 text-white py-2 rounded-lg font-black text-[9px] uppercase mx-1 shadow-lg">
            <Plus size={14} strokeWidth={4} /> Нэмэх
          </button>
          <Link href="/story" className="p-2.5 text-amber-400"><BookOpen size={20} /></Link>
        </div>
      </nav>

      {/* Modals - Padding багасгасан */}
     {showQR && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[110] p-3 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] text-center relative animate-in zoom-in-95 duration-300">
            
            {/* Хаах товч */}
            <button 
              onClick={() => setShowQR(false)} 
              className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Гарчиг */}
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
              Ургийн QR Код
            </h3>

            {/* QR Код */}
            <div className="bg-white p-2 rounded-[2rem] border-[6px] border-slate-50 inline-block mb-4 shadow-inner">
              <QRCodeSVG value={familyId} size={200} level="H" />
            </div>

            {/* Код хуулах хэсэг - Урт код багтаахаар сайжруулсан */}
            <div 
              onClick={handleCopy} 
              className={`group rounded-2xl p-4 border transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center min-h-[80px] ${
                copied 
                  ? 'bg-green-50 border-green-100' 
                  : 'bg-slate-50 border-slate-100 hover:border-amber-200 hover:bg-white'
              }`}
            >
              <p className={`text-[9px] font-black uppercase mb-2 tracking-wider ${
                copied ? 'text-green-600' : 'text-slate-400'
              }`}>
                {copied ? "Амжилттай хуулагдлаа" : "Код дээр дарж хуулна уу"}
              </p>
              
              {/* break-all нь хэт урт текстийг автоматаар тасална */}
              <p className="text-base font-black text-slate-900 font-mono tracking-wider break-all leading-tight max-w-full">
                {familyId}
              </p>
            </div>
            
            <p className="mt-6 text-[10px] text-slate-400 font-medium">
              Бусад гишүүд энэ кодыг уншуулан <br/> таны урагт нэгдэх боломжтой.
            </p>
          </div>
        </div>
      )}

      {alertModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[1.5rem] p-5 max-w-xs w-full shadow-2xl text-center">
            <div className="mb-3 flex justify-center">
              {alertModal.type === 'message' ? <Check size={28} className="text-emerald-500" /> : alertModal.type === 'logout' ? <LogOut size={28} className="text-amber-500" /> : <Trash2 size={28} className="text-red-500" />}
            </div>
            <h3 className="text-[11px] font-black text-slate-800 mb-1 uppercase">{alertModal.title}</h3>
            <p className="text-[10px] font-bold text-slate-400 mb-5">{alertModal.message}</p>
            <div className="flex gap-2">
              {alertModal.type === 'message' ? (
                <button onClick={() => setAlertModal({ ...alertModal, open: false })} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase">Ойлголоо</button>
              ) : (
                <>
                  <button onClick={() => setAlertModal({ ...alertModal, open: false })} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-black text-[9px] uppercase">Болих</button>
                  <button onClick={alertModal.type === 'logout' ? performLogout : performDelete} className={`flex-1 py-2.5 text-white rounded-xl font-black text-[9px] uppercase ${alertModal.type === 'logout' ? 'bg-amber-500' : 'bg-red-500'}`}>Тийм</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isRegisterOpen && <RegisterForm isOpen={isRegisterOpen} setIsOpen={setIsRegisterOpen} onProfileAdded={() => handleSuccessAction('Бүртгэгдлээ')} hasHeadOfFamily={hasHeadOfFamily} familyId={familyId} />}
      {isEditOpen && <RegisterForm isOpen={isEditOpen} setIsOpen={setIsEditOpen} editData={editingProfile} onUpdate={() => handleSuccessAction('Шинэчлэгдлээ')} hasHeadOfFamily={hasHeadOfFamily} familyId={familyId} />}
    </div>
  );
}