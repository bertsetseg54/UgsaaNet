import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Имэйл эсвэл нууц үг буруу байна.");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user_data",
          JSON.stringify({
            name: data.user?.name || "Хэрэглэгч",
            email: formData.email,
            familyId: data.familyId || data.user?.familyId,
          })
        );
        router.push("/");
      }
    } catch (err) {
      setError("Серверийн алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 py-8 md:py-12 selection:bg-indigo-100">
      <div className="relative z-10 w-full max-w-md md:max-w-lg">
        {/* Back Button - SignUp-тай ижил */}
        <button
          onClick={() => router.push("/")}
          className="group mb-6 inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium outline-none"
        >
          <div className="p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span>Буцах</span>
        </button>

        {/* Card Container - SignUp-тай ижил rounded болон shadow */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-white p-6 md:p-10 relative">
          <div className="mb-6 md:mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-50 text-indigo-500 shadow-sm">
              <LogIn size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Нэвтрэх
            </h2>
          </div>

          {/* Error Message - SignUp-тай ижил загвар */}
          {error && (
            <div className="mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl bg-red-50 border border-red-100 text-red-500 text-[11px] md:text-xs font-medium text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Имэйл
                </label>
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
                    className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600 text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Нууц үг
                </label>
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
                    className="w-full pl-12 pr-12 py-3 md:py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button - SignUp-тай ижил эффект */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative mt-4 overflow-hidden rounded-xl md:rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-center gap-2 py-3.5 md:py-4 bg-slate-900 hover:bg-black text-white font-bold transition-colors disabled:opacity-70">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Нэвтрэх</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer - SignUp-тай ижил */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
            <p className="text-slate-400 font-medium">
              Шинэ хэрэглэгч үү?{" "}
              <a
                href="/signup"
                className="ml-1 text-indigo-600 font-bold hover:underline transition-all"
              >
                Бүртгүүлэх
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
