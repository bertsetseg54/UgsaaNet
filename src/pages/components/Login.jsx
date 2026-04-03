import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Hash,
  Users,
  ChevronRight,
} from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loginMode, setLoginMode] = useState("admin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    familyName: "",
    familyCode: "",
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
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          familyIdentifier:
            loginMode === "admin" ? formData.familyName : formData.familyCode,
          mode: loginMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend-ээс ирсэн тодорхой алдаа байвал түүнийг, байхгүй бол ерөнхий алдаа харуулна
        setError(data.message || "Имэйл эсвэл нууц үг буруу байна.");
      } else {
        // АМЖИЛТТАЙ: Token хадгалах
        localStorage.setItem("token", data.token);

        // БҮХ ӨГӨГДЛИЙГ НЭГТГЭЖ ХАДГАЛАХ (Undefined алдаанаас сэргийлнэ)
        const userDataToStore = {
          name: data.user?.name || "Хэрэглэгч",
          email: formData.email,
          familyId: data.familyId || data.user?.familyId, // Backend-ээс ирсэн ID
          role: loginMode,
        };

        localStorage.setItem("user_data", JSON.stringify(userDataToStore));

        // Нүүр хуудас руу шилжих
        router.push("/");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Серверийн алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 py-8 md:py-12 selection:bg-indigo-100">
      <div className="relative z-10 w-full max-w-md md:max-w-lg">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="group mb-6 inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium outline-none"
        >
          <div className="p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span>Буцах</span>
        </button>

        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-white p-6 md:p-10 relative">
          <div className="mb-6 md:mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-50 text-indigo-500 shadow-sm">
              <LogIn size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Нэвтрэх
            </h2>
          </div>

          {/* Switcher - SignUp-тай яг ижилхэн */}
          <div className="flex bg-slate-100 p-1 rounded-xl md:rounded-2xl mb-6 md:mb-8">
            <button
              type="button"
              onClick={() => setLoginMode("admin")}
              className={`flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                loginMode === "admin"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Ураг үүсгэгч
            </button>
            <button
              type="button"
              onClick={() => setLoginMode("member")}
              className={`flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                loginMode === "member"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Ургийн гишүүн
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl bg-red-50 border border-red-100 text-red-500 text-[11px] md:text-xs font-medium text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Dynamic Field */}
              {loginMode === "admin" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Ургийн нэр
                  </label>
                  <div className="relative group">
                    <Users
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      name="familyName"
                      placeholder="Жишээ: Алтан ураг"
                      value={formData.familyName}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Ургийн код
                  </label>
                  <div className="relative group">
                    <Hash
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      name="familyCode"
                      placeholder="Ургийн нэвтрэх код"
                      value={formData.familyCode}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-slate-600 text-sm"
                    />
                  </div>
                </div>
              )}

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
