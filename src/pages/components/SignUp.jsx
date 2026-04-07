import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft, User, Mail, Lock, Eye, EyeOff, Sparkles,
  ChevronRight, Hash, Users, CheckCircle2, QrCode, X
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // QR Scanner logic
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render((decodedText) => {
        setFormData(prev => ({ ...prev, familyCode: decodedText }));
        setShowScanner(false);
        scanner.clear();
      }, (err) => {
        // Уншиж байх явцад гарсан жижиг алдааг (камер хөдлөх г.м) үл тоомсорлоно
      });

      return () => {
        scanner.clear().catch(error => console.error("Scanner clear error:", error));
      };
    }
  }, [showScanner]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Нууц үг хоорондоо таарахгүй байна.");
      return;
    }

    if (familyMode === "create" && !formData.familyName) {
      setError("Ургийн нэрийг оруулна уу");
      return;
    }

    if (familyMode === "join" && !formData.familyCode) {
      setError("Ургийн кодыг оруулна уу");
      return;
    }

    let familyId = familyMode === "create" 
      ? `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      : formData.familyCode.trim();

    try {
      setLoading(true);
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          familyId,
          familyName: familyMode === "create" ? formData.familyName : null,
          role: familyMode === "create" ? "admin" : "member",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Алдаа гарлаа");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_data", JSON.stringify({
          name: formData.name,
          email: formData.email,
          familyId,
          role: familyMode === "create" ? "admin" : "member",
        }));
        setShowSuccessModal(true);
      }
    } catch (err) {
      setError("Серверийн алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 py-8">
      
      {/* QR SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 relative overflow-hidden">
            <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 z-10 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4 text-center text-slate-800">QR код уншуулах</h3>
            <div id="reader" className="overflow-hidden rounded-2xl"></div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => router.push("/")}></div>
          <div className="relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-300">
            <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="text-green-500" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Амжилттай!</h3>
            <p className="text-slate-500 mb-8 text-sm">Таны бүртгэл амжилттай үүслээ.</p>
            <button onClick={() => router.push("/")} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all">
              Үргэлжлүүлэх
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-lg">
        <button onClick={() => router.push("/")} className="group mb-6 inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-sm font-medium">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Буцах</span>
        </button>

        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white p-6 md:p-10">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-50 text-indigo-500">
              <Sparkles size={24} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Шинэ бүртгэл</h2>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button type="button" onClick={() => setFamilyMode("create")} className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${familyMode === "create" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
              Шинэ ураг үүсгэх
            </button>
            <button type="button" onClick={() => setFamilyMode("join")} className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${familyMode === "join" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
              Кодоор нэгдэх
            </button>
          </div>

          {error && <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-xs font-medium text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {familyMode === "create" ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ургийн овог</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input type="text" name="familyName" placeholder="Жишээ: Боржигон" value={formData.familyName} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ургийн код</label>
                <div className="flex gap-2">
                  <div className="relative group flex-1">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="text" name="familyCode" placeholder="Ургийн нэвтрэх код" value={formData.familyCode} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
                  </div>
                  <button type="button" onClick={() => setShowScanner(true)} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors shadow-sm">
                    <QrCode size={20} />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нэр</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input type="text" name="name" placeholder="Таны нэр" value={formData.name} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Имэйл</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input type="email" name="email" placeholder="mail@example.com" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нууц үг</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500" size={18} />
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="••••" value={formData.password} onChange={handleChange} required className="w-full pl-12 pr-10 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Давтах</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500" size={18} />
                  <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="••••" value={formData.confirmPassword} onChange={handleChange} required className="w-full pl-12 pr-10 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-4 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><span>Бүртгүүлэх</span><ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
            <p className="text-slate-400 font-medium">Бүртгэлтэй юу? <a href="/login" className="ml-1 text-indigo-600 font-bold hover:underline">Нэвтрэх</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}