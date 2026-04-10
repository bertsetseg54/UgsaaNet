"use client";
import { useState, useEffect } from "react";
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
        throw new Error(data.message || "Имэйл эсвэл нууц үг буруу байна.");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_data", JSON.stringify({
        name: data.user?.name || "Хэрэглэгч",
        email: formData.email,
        familyId: data.familyId || data.user?.familyId,
      }));
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] text-black px-4 py-6">
      <div className="w-full max-w-[420px]">
        
        {/* Back Button - Compact */}
        <button 
          onClick={() => router.push("/")} 
          className="group mb-4 inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 text-xs font-bold transition-all"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Буцах</span>
        </button>

        <div className="bg-white rounded-[2rem] shadow-xl border border-white p-6 md:p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center p-2.5 mb-3 rounded-xl bg-indigo-50 text-indigo-500 shadow-sm">
              <LogIn size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Нэвтрэх</h2>
            <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Ургийн хэлхээндээ тавтай морил</p>
          </div>

          {/* Error Message - Compact */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-[10px] font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Имэйл хаяг</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="mail@example.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-xs" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Нууц үг</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-xs" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Системд нэвтрэх</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-50 text-center text-[12px] font-medium">
            <p className="text-slate-400 font-bold">
              Шинэ хэрэглэгч үү?{" "}
              <Link href="/signup" className="text-indigo-600 font-black hover:underline underline-offset-4">
                Бүртгүүлэх
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}