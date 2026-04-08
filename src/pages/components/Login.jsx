"use client";
import { useState, useEffect } from "react";
// Хэрэв App Router ашиглаж байгаа бол 'next/navigation' болгож солино уу
import { useRouter } from "next/router"; 
import { ArrowLeft, LogIn, Mail, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => { 
    setMounted(true); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Серверээс ирж буй алдааны мессежийг харуулах, байхгүй бол default утга
        throw new Error(data.message || "Имэйл эсвэл нууц үг буруу байна.");
      }

      // Token болон User Data хадгалах
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_data", JSON.stringify({
        name: data.user?.name || "Хэрэглэгч",
        email: formData.email,
        familyId: data.familyId || data.user?.familyId,
      }));

      // Амжилттай бол Нүүр хуудас руу шилжих
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] text-black font-sans px-4 py-8 selection:bg-indigo-100">
      <div className="w-full max-w-md md:max-w-lg transition-all duration-500">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push("/")} 
          className="group mb-6 inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium"
        >
          <div className="p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span>Буцах</span>
        </button>

        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-50 text-indigo-500 shadow-sm">
              <LogIn size={24} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Нэвтрэх</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">Ургийн хэлхээндээ тавтай морил</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Имэйл хаяг</label>
              <div className="relative group">
                <Mail 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" 
                  size={18} 
                />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="mail@example.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Нууц үг</label>
              <div className="relative group">
                <Lock 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" 
                  size={18} 
                />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link (Нэмэлт) */}
            <div className="flex justify-end px-1">
              <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Нууц үг мартсан?</button>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Системд нэвтрэх</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm font-medium">
            <p className="text-slate-400">
              Шинэ хэрэглэгч үү?{" "}
              <Link href="/signup" className="text-indigo-600 font-bold hover:underline decoration-2 underline-offset-4">
                Бүртгүүлэх
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}