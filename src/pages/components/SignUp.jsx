
// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Sparkles, ChevronRight } from "lucide-react";

// export default function SignUp() {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);
//   const [familyMode, setFamilyMode] = useState("create"); // "create" или "join"
//   const [formData, setFormData] = useState({
//     name: "", email: "", password: "", confirmPassword: "", familyName: "", familyCode: "",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => { setMounted(true); }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.password !== formData.confirmPassword) {
//       setError("Нууц үг хоорондоо таарахгүй байна.");
//       return;
//     }
    
//     let familyId = "";
    
//     if (familyMode === "create") {
//       if (!formData.familyName) {
//         setError("Ургийн нэрийг оруулна уу");
//         return;
//       }
//       // Шинэ ураг үүсгэх - UUID ашиглаж URL-safe болгох
//       familyId = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     } else {
//       if (!formData.familyCode) {
//         setError("Ургийн кодыг оруулна уу");
//         return;
//       }
//       familyId = formData.familyCode.trim();
//     }
    
//     try {
//       setLoading(true);
//       setError("");
      
//       const res = await fetch("/api/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: formData.name, 
//           email: formData.email, 
//           password: formData.password,
//           familyId,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.message || "Алдаа гарлаа");
//       } else {
//         // ✅ LocalStorage-д хадгалах
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("user_data", JSON.stringify({ 
//           name: formData.name, 
//           email: formData.email,
//           familyId,
//         }));
        
//         alert("Амжилттай бүртгэгдлээ 🎉");
//         router.push("/"); // Үндсэн нүүр рүү (index.js)
//       }
//     } catch (err) {
//       setError("Серверийн алдаа");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!mounted) return null;

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 py-12 selection:bg-indigo-100 relative">
//       <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-linear-to-br from-blue-50/50 to-transparent blur-3xl"></div>
//         <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-linear-to-tr from-indigo-50/50 to-transparent blur-3xl"></div>
//       </div>

//       <div className="relative z-10 w-full max-w-120">
//         <button onClick={() => router.push("/")} className="group mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium outline-none">
//           <div className="p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:-translate-x-1 transition-all">
//             <ArrowLeft size={16} />
//           </div>
//           Буцах
//         </button>

//         <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] border border-white p-8 md:p-12 relative">
//           <div className="mb-10 text-center">
//             <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-linear-to-br from-indigo-50 to-blue-50 text-indigo-500">
//               <Sparkles size={24} />
//             </div>
//             <h2 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Шинэ бүртгэл</h2>
//             <p className="text-slate-400 mt-2 text-sm font-medium">Өөрийн аяллаа өнөөдөр эхлүүлээрэй</p>
//           </div>

//           {error && <div className="mb-6 p-4 rounded-2xl bg-red-50/50 border border-red-100 text-red-500 text-xs font-medium text-center">{error}</div>}

//           {/* Family Mode Selection */}
//           <div className="mb-6 flex gap-3">
//             <button
//               type="button"
//               onClick={() => setFamilyMode("create")}
//               className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
//                 familyMode === "create"
//                   ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
//                   : "bg-slate-100 text-slate-500 hover:bg-slate-200"
//               }`}
//             >
//               Шинэ ураг үүсгэх
//             </button>
//             <button
//               type="button"
//               onClick={() => setFamilyMode("join")}
//               className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
//                 familyMode === "join"
//                   ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
//                   : "bg-slate-100 text-slate-500 hover:bg-slate-200"
//               }`}
//             >
//               Ургийн кодоор нэмүүлэх
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="space-y-4">
//               {/* Family Name - Create Mode */}
//               {familyMode === "create" && (
//                 <div className="space-y-1.5">
//                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ургийн нэр</label>
//                   <div className="relative group">
//                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
//                     <input type="text" name="familyName" placeholder="Та ямар ургийн хүн вэ?" value={formData.familyName} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
//                   </div>
//                 </div>
//               )}

//               {/* Family Code - Join Mode */}
//               {familyMode === "join" && (
//                 <div className="space-y-1.5">
//                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ургийн код</label>
//                   <div className="relative group">
//                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
//                     <input type="text" name="familyCode" placeholder="Ургийн эзэнээс авсан код" value={formData.familyCode} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
//                   </div>
//                   <p className="text-[9px] text-slate-400 ml-1">Ургийн эзэнээ холбоод код авна уу</p>
//                 </div>
//               )}

//               <div className="space-y-1.5">
//                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нэр</label>
//                 <div className="relative group">
//                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
//                   <input type="text" name="name" placeholder="Таны нэр" value={formData.name} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Имэйл</label>
//                 <div className="relative group">
//                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
//                   <input type="email" name="email" placeholder="example@mail.com" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нууц үг</label>
//                 <div className="relative group">
//                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
//                   <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
//                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500">
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нууц үг давтах</label>
//                 <div className="relative group">
//                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
//                   <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
//                 </div>
//               </div>
//             </div>

//             <button type="submit" disabled={loading} className="w-full relative group mt-4">
//               <div className="absolute inset-0 bg-indigo-600 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></div>
//               <div className="relative flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70">
//                 {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><span>Бүртгүүлэх</span><ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
//               </div>
//             </button>
//           </form>

//           <div className="mt-10 pt-8 border-t border-slate-50 text-center">
//             <p className="text-slate-400 text-sm font-medium">Бүртгэлтэй юу? <a href="/login" className="ml-2 text-indigo-600 font-bold underline">Нэвтрэх</a></p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Sparkles, ChevronRight, Loader2, Users } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [familyMode, setFamilyMode] = useState("create"); 
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", familyName: "", familyCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Нууц үг хоорондоо таарахгүй байна.");
      return;
    }
    
    let familyId = familyMode === "create" 
      ? `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      : formData.familyCode.trim();

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, familyId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Алдаа гарлаа");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_data", JSON.stringify({ name: formData.name, email: formData.email, familyId }));
        router.push("/");
      }
    } catch (err) {
      setError("Серверийн алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F1F5F9] px-4 py-10 selection:bg-indigo-100">
      <div className="w-full max-w-[480px]">
        <button onClick={() => router.push("/")} className="group mb-6 inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all text-sm font-bold">
          <div className="p-2 rounded-full bg-white shadow-sm border border-slate-200 group-hover:-translate-x-1 transition-transform">
            <ArrowLeft size={16} />
          </div>
          Буцах
        </button>

        <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-12 relative overflow-hidden">
          <div className="mb-8 text-center relative z-10">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-50 text-indigo-600">
              <Sparkles size={28} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Шинэ бүртгэл</h2>
            <p className="text-slate-400 mt-2 text-sm font-medium">Ургийн түүхээ өнөөдөр эхлүүлээрэй</p>
          </div>

          {/* Mode Switcher */}
          <div className="mb-8 flex p-1.5 bg-slate-100 rounded-2xl relative z-10">
            <button
              onClick={() => setFamilyMode("create")}
              className={`flex-1 py-3 px-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-wider transition-all ${
                familyMode === "create" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Шинэ ураг үүсгэх
            </button>
            <button
              onClick={() => setFamilyMode("join")}
              className={`flex-1 py-3 px-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-wider transition-all ${
                familyMode === "join" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Ургийн код ашиглах
            </button>
          </div>

          {error && (
             <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
               {error}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Conditional Family Fields */}
            <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">
                  {familyMode === "create" ? "Ургийн нэр" : "Ургийн код"}
                </label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="text" 
                    name={familyMode === "create" ? "familyName" : "familyCode"} 
                    placeholder={familyMode === "create" ? "Жишээ: Боржигон" : "Кодоо оруулна уу"} 
                    value={familyMode === "create" ? formData.familyName : formData.familyCode} 
                    onChange={handleChange} 
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-indigo-100 rounded-xl outline-none focus:border-indigo-400 transition-all text-slate-700 text-sm font-bold" 
                  />
                </div>
              </div>
            </div>

            {/* User Info Fields */}
            <div className="grid grid-cols-1 gap-4">
              <InputField label="Таны нэр" icon={<User size={18}/>} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Нэр"/>
              <InputField label="Имэйл" icon={<Mail size={18}/>} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@mail.com"/>
              
              <div className="relative group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Нууц үг</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} name="password" 
                    value={formData.password} onChange={handleChange} required 
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-400 transition-all text-sm font-medium" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <InputField label="Нууц үг давтах" icon={<Lock size={18}/>} type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"/>
            </div>

            <button 
              type="submit" disabled={loading} 
              className="w-full mt-4 py-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Бүртгүүлэх <ChevronRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm font-medium">Бүртгэлтэй юу? <a href="/login" className="ml-2 text-indigo-600 font-black hover:underline">Нэвтрэх</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component for SignUp
function InputField({ label, icon, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
          {icon}
        </div>
        <input 
          {...props} 
          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-400 transition-all text-sm font-medium" 
        />
      </div>
    </div>
  );
}