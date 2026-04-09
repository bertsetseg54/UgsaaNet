import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft, User, Mail, Lock, Eye, EyeOff, Sparkles,
  ChevronRight, Hash, Users, CheckCircle2, QrCode, X, Image as ImageIcon
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function SignUpPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [familyMode, setFamilyMode] = useState("create"); // "create" эсвэл "join"
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", familyName: "", familyCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScannerLoading, setIsScannerLoading] = useState(false);

  // ШИНЭ ФУНКЦ: Санамсаргүй Ургийн ID үүсгэх
  const generateFamilyId = () => {
    return "FAMILY_-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // QR Scanner Logic
  useEffect(() => {
    let html5QrCode = null;

    if (showScanner && mounted) {
      setIsScannerLoading(true);
      html5QrCode = new Html5Qrcode("reader");

      const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode.start(
        { facingMode: "environment" }, 
        qrConfig,
        (decodedText) => {
          setFormData(prev => ({ ...prev, familyCode: decodedText }));
          setShowScanner(false);
        },
        () => { /* Хайж байх үеийн алдааг үл тоомсорлоно */ }
      )
      .then(() => setIsScannerLoading(false))
      .catch((err) => {
        console.error("Camera start error:", err);
        setIsScannerLoading(false);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error(err));
      }
    };
  }, [showScanner, mounted]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const html5QrCode = new Html5Qrcode("reader");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      setFormData(prev => ({ ...prev, familyCode: decodedText }));
      setShowScanner(false);
    } catch (err) {
      alert("QR код уншиж чадсангүй.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    setError("Нууц үгүүд таарахгүй байна");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // Кодыг авах (Шинээр үүсгэх эсвэл нэгдэх)
    const targetFamilyId = familyMode === "create" ? generateFamilyId() : formData.familyCode.trim();

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      familyId: targetFamilyId, // Зөвхөн ID байна, role байхгүй
      familyName: familyMode === "create" ? formData.familyName : ""
    };

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      setShowSuccessModal(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      setError(data.message || "Бүртгэл амжилтгүй");
    }
  } catch (err) {
    setError("Холболтын алдаа гарлаа");
  } finally {
    setLoading(false);
  }
};

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center text-black font-sans bg-[#F8FAFC] px-4 py-8">
      
      {/* 1. QR SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden relative shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">QR код уншуулах</h3>
              <button onClick={() => setShowScanner(false)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="relative overflow-hidden rounded-2xl bg-black aspect-square">
                {isScannerLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 gap-3">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Камер бэлдэж байна...</span>
                  </div>
                )}
                <div id="reader" className="w-full h-full"></div>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <label className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer transition-all group">
                  <ImageIcon size={20} className="text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Зургийн цомгоос сонгох</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUCCESS MODAL */}
      {showSuccessModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"></div>
            
            <div className="relative bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] max-w-sm w-full text-center animate-in zoom-in-90 slide-in-from-bottom-10 duration-500">
              <div className="relative mx-auto w-24 h-24 mb-8">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                  <CheckCircle2 className="text-white" size={48} strokeWidth={3} />
                </div>
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Амжилттай!</h3>
              <p className="text-slate-500 mb-10 text-sm font-medium leading-relaxed">
                Таны ургийн бүртгэл үүслээ.<br/>
                <span className="text-indigo-500 font-bold">УгсааНет</span>-д тавтай морил.
              </p>
              
              <button 
                onClick={() => router.push("/")} 
                className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                Үргэлжлүүлэх
              </button>
            </div>
          </div>
        )}

      {/* 3. MAIN SIGNUP FORM */}
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
            {familyMode === "join" ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ургийн код</label>
                <div className="flex gap-2">
                  <div className="relative group flex-1">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" name="familyCode" placeholder="Код оруулна уу" value={formData.familyCode} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
                  </div>
                  <button type="button" onClick={() => setShowScanner(true)} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all">
                    <QrCode size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ургийн овог</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" name="familyName" placeholder="Жишээ: Боржигон" value={formData.familyName} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нэр</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" name="name" placeholder="Таны нэр" value={formData.name} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Имэйл</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="email" name="email" placeholder="mail@example.com" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Нууц үг</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="••••" value={formData.password} onChange={handleChange} required className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Давтах</label>
                <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="••••" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-4 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><span>Бүртгүүлэх</span><ChevronRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}