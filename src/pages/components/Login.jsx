// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import {
//   ArrowLeft,
//   LogIn,
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   ChevronRight,
// } from "lucide-react";

// export default function Login() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

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

//   // 🔥 Backend-тэй холбосон submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await fetch("/api/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.message || "Нэвтрэхэд алдаа гарлаа");
//       } else {
//         // ✅ Token-г localStorage-д хадгалах (эсвэл cookie ашиглаж болно)
//         if (data.token) localStorage.setItem("token", data.token);

//         // ✅ Landing page руу redirect
//         router.push("/landingPage");
//       }
//     } catch (err) {
//       console.error("LOGIN ERROR:", err);
//       setError("Серверийн алдаа");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 py-12 selection:bg-indigo-100">
//       <div className="relative z-10 w-full max-w-[450px]">
//         <button
//           onClick={handleBack}
//           className="group mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all duration-300 text-sm font-medium outline-none"
//         >
//           <ArrowLeft size={16} />
//           Буцах
//         </button>

//         <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] border border-white p-8 md:p-12">
//           <div className="mb-10 text-center">
//             <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500">
//               <LogIn size={24} />
//             </div>
//             <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
//               Тавтай морил
//             </h2>
//             <p className="text-slate-400 mt-2 text-sm font-medium">
//               Өөрийн бүртгэлээр нэвтэрнэ үү
//             </p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 rounded-2xl bg-red-50/50 border border-red-100 text-red-500 text-xs font-medium text-center">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="space-y-4">
//               {/* Email */}
//               <div className="space-y-1.5">
//                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
//                   Имэйл хаяг
//                 </label>
//                 <div className="relative group">
//                   <Mail
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
//                     size={18}
//                   />
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="example@mail.com"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-0 focus:border-blue-200 transition-all placeholder:text-slate-300 text-slate-600"
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
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
//                     size={18}
//                   />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     placeholder="••••••••"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-0 focus:border-blue-200 transition-all text-slate-600"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors"
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
//               className="w-full py-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-2xl transition-all disabled:opacity-70"
//             >
//               {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
//             </button>
//           </form>

//           <p className="mt-10 text-center text-slate-400 text-sm">
//             Шинэ хэрэглэгч үү?{" "}
//             <a
//               href="/signup"
//               className="text-blue-600 hover:text-blue-700 font-bold underline"
//             >
//               Бүртгэл үүсгэх
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Нэвтрэхэд алдаа гарлаа");
      } else {
        // ✅ Token болон user_data хадгалах
        if (data.token) localStorage.setItem("token", data.token);
        const userData = {
          email: formData.email,
          name: data.user?.name || formData.email,
          familyId: data.familyId,
          ...data.user
        };
        localStorage.setItem("user_data", JSON.stringify(userData));

        // ✅ Үндсэн нүүр (index.js) рүү шилжинэ, тэндээс LandingPage харагдана
        router.push("/"); 
      }
    } catch (err) {
      setError("Серверийн алдаа");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 py-12 selection:bg-indigo-100">
      <div className="relative z-10 w-full max-w-[450px]">
        <button onClick={() => router.push("/")} className="group mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium outline-none">
          <ArrowLeft size={16} /> Буцах
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] border border-white p-8 md:p-12">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500">
              <LogIn size={24} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Тавтай морил</h2>
            <p className="text-slate-400 mt-2 text-sm font-medium">Өөрийн бүртгэлээр нэвтэрнэ үү</p>
          </div>

          {error && <div className="mb-6 p-4 rounded-2xl bg-red-50/50 border border-red-100 text-red-500 text-xs font-medium text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Имэйл хаяг</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type="email" name="email" placeholder="example@mail.com" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-200 transition-all text-slate-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нууц үг</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-200 transition-all text-slate-600" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 hover:bg-black text-white font-semibold rounded-2xl transition-all disabled:opacity-70">
              {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-400 text-sm">Шинэ хэрэглэгч үү? <a href="/signup" className="text-blue-600 font-bold underline">Бүртгэл үүсгэх</a></p>
        </div>
      </div>
    </div>
  );
}