// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import {
//   ArrowLeft,
//   User,
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   Sparkles,
//   ChevronRight,
// } from "lucide-react";

// export default function SignUp() {
//   const router = useRouter();
  
//   const [mounted, setMounted] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleBack = (e) => {
//     e.preventDefault();
//     if (window.history.length > 1) {
//       window.history.back();
//     } else {
//       router.push("/");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       setError("Нууц үг хоорондоо таарахгүй байна.");
//       return;
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
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.message || "Алдаа гарлаа");
//       } else {
//         alert("Амжилттай бүртгэгдлээ 🎉");
//         router.push("/login"); // login page руу redirect
//       }
//     } catch (err) {
//       setError("Серверийн алдаа");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!mounted) return null;

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 py-12 selection:bg-indigo-100">
//       {/* Background Gradients */}
//       <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-blue-50/50 to-transparent blur-3xl"></div>
//         <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-gradient-to-tr from-indigo-50/50 to-transparent blur-3xl"></div>
//       </div>

//       <div className="relative z-10 w-full max-w-[480px]">
//         {/* Back Button */}
//         <button
//           onClick={handleBack}
//           className="group mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all duration-300 text-sm font-medium outline-none"
//         >
//           <div className="p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:shadow-md group-hover:-translate-x-1 transition-all">
//             <ArrowLeft size={16} />
//           </div>
//           Буцах
//         </button>

//         {/* Main Card */}
//         <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] border border-white p-8 md:p-12 relative">
//           {/* Header */}
//           <div className="mb-10 text-center">
//             <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-500">
//               <Sparkles size={24} />
//             </div>
//             <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
//               Шинэ бүртгэл
//             </h2>
//             <p className="text-slate-400 mt-2 text-sm font-medium">
//               Өөрийн аяллаа өнөөдөр эхлүүлээрэй
//             </p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 rounded-2xl bg-red-50/50 border border-red-100 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-2 text-center">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="space-y-4">
//               {/* Name */}
//               <div className="space-y-1.5">
//                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
//                   Нэр
//                 </label>
//                 <div className="relative group">
//                   <User
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
//                     size={18}
//                   />
//                   <input
//                     type="text"
//                     name="name"
//                     placeholder="Таны нэр"
//                     value={formData.name}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-0 focus:border-indigo-200 transition-all placeholder:text-slate-300 text-slate-600"
//                   />
//                 </div>
//               </div>

//               {/* Email */}
//               <div className="space-y-1.5">
//                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
//                   Имэйл
//                 </label>
//                 <div className="relative group">
//                   <Mail
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
//                     size={18}
//                   />
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="example@mail.com"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-0 focus:border-indigo-200 transition-all placeholder:text-slate-300 text-slate-600"
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div className="space-y-1.5">
//                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
//                   Нууц үг
//                 </label>
//                 <div className="relative group">
//                   <Lock
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
//                     size={18}
//                   />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     placeholder="••••••••"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-0 focus:border-indigo-200 transition-all text-slate-600"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>
//               {/* Confirm Password */}
//               <div className="space-y-1.5">
//                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
//                   Нууц үг давтах
//                 </label>
//                 <div className=" relative group">
//                   <Lock
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
//                     size={18}
//                   />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="confirmPassword"
//                     placeholder="••••••••"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-0 focus:border-indigo-200 transition-all text-slate-600"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full relative group mt-4"
//             >
//               <div className="absolute inset-0 bg-indigo-600 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></div>
//               <div className="relative flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70">
//                 {loading ? (
//                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
//                 ) : (
//                   <>
//                     <span>Бүртгүүлэх</span>
//                     <ChevronRight
//                       size={18}
//                       className="group-hover:translate-x-1 transition-transform"
//                     />
//                   </>
//                 )}
//               </div>
//             </button>
//           </form>

//           {/* Footer */}
//           <div className="mt-10 pt-8 border-t border-slate-50 text-center">
//             <p className="text-slate-400 text-sm font-medium">
//               Бүртгэлтэй юу?
//               <a
//                 href="/login"
//                 className="ml-2 text-indigo-600 hover:text-indigo-700 font-bold underline"
//               >
//                 Нэвтрэх
//               </a>
//             </p>
//           </div>
//         </div>

//         {/* Terms */}
//         <p className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed px-10">
//           Бүртгүүлснээр та манай Үйлчилгээний нөхцөл болон Нууцлалын бодлогыг
//           хүлээн зөвшөөрч буй хэрэг юм.
//         </p>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Sparkles, ChevronRight } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
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
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name, email: formData.email, password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Алдаа гарлаа");
      } else {
        // ✅ LocalStorage-д хадгалах
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_data", JSON.stringify({ name: formData.name, email: formData.email }));
        
        alert("Амжилттай бүртгэгдлээ 🎉");
        router.push("/"); // Үндсэн нүүр рүү (index.js)
      }
    } catch (err) {
      setError("Серверийн алдаа");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 py-12 selection:bg-indigo-100 relative">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-linear-to-br from-blue-50/50 to-transparent blur-3xl"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-linear-to-tr from-indigo-50/50 to-transparent blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-120">
        <button onClick={() => router.push("/")} className="group mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium outline-none">
          <div className="p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={16} />
          </div>
          Буцах
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] border border-white p-8 md:p-12 relative">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-linear-to-br from-indigo-50 to-blue-50 text-indigo-500">
              <Sparkles size={24} />
            </div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Шинэ бүртгэл</h2>
            <p className="text-slate-400 mt-2 text-sm font-medium">Өөрийн аяллаа өнөөдөр эхлүүлээрэй</p>
          </div>

          {error && <div className="mb-6 p-4 rounded-2xl bg-red-50/50 border border-red-100 text-red-500 text-xs font-medium text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нэр</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input type="text" name="name" placeholder="Таны нэр" value={formData.name} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Имэйл</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input type="email" name="email" placeholder="example@mail.com" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нууц үг</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нууц үг давтах</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full relative group mt-4">
              <div className="absolute inset-0 bg-indigo-600 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></div>
              <div className="relative flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70">
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><span>Бүртгүүлэх</span><ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </div>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-sm font-medium">Бүртгэлтэй юу? <a href="/login" className="ml-2 text-indigo-600 font-bold underline">Нэвтрэх</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}