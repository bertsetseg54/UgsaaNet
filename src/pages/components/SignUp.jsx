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
  const [familyMode, setFamilyMode] = useState("create");
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", familyName: "", familyCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScannerLoading, setIsScannerLoading] = useState(false);

  const generateFamilyId = () => {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let html5QrCode = null;
    if (showScanner && mounted) {
      setIsScannerLoading(true);
      html5QrCode = new Html5Qrcode("reader");
      const qrConfig = { fps: 10, qrbox: { width: 200, height: 200 } };
      html5QrCode.start(
        { facingMode: "environment" }, 
        qrConfig,
        (decodedText) => {
          setFormData(prev => ({ ...prev, familyCode: decodedText }));
          setShowScanner(false);
        },
        () => {}
      )
      .then(() => setIsScannerLoading(false))
      .catch((err) => {
        console.error(err);
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
      const targetFamilyId = familyMode === "create" ? generateFamilyId() : formData.familyCode.trim();
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        familyId: targetFamilyId,
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
        setTimeout(() => { router.push("/"); }, 1500);
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
    <div className="min-h-screen w-full flex items-center justify-center text-black bg-[#F8FAFC] px-3 py-4">
      
      {/* 1. QR SCANNER MODAL - Compact */}
      {showScanner && (
  <div className="fixed inset-0 z-[100] bg-black flex flex-col">
    {/* Дээд хэсэг: Буцах болон гарчиг */}
    <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
      <button 
        onClick={() => setShowScanner(false)} 
        className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
      >
        <ArrowLeft size={20} />
      </button>
      <h3 className="font-bold text-white text-xs uppercase tracking-[0.2em]">QR Уншуулах</h3>
      <div className="w-10"></div> {/* Тэнцвэржүүлэх хоосон зай */}
    </div>

    {/* Камерын хэсэг - Дэлгэц дүүрэн */}
    <div className="relative flex-1 flex items-center justify-center">
      {isScannerLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white/50 gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Камер бэлдэж байна...</span>
        </div>
      )}
      
      {/* Камерын харагдах талбай */}
      <div id="reader" className="w-full h-full [&_video]:object-cover"></div>

      {/* QR-ийн хүрээ (Scanning Overlay) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-2 border-white/30 rounded-[2rem] relative">
          {/* Булангуудын гэрэлтэлт */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
          
          {/* Scanning line animation */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan"></div>
        </div>
      </div>
    </div>

    {/* Доод хэсэг: Зургийн цомгоос сонгох */}
    <div className="absolute bottom-10 left-0 right-0 z-10 px-6 flex justify-center">
      <label className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl cursor-pointer hover:bg-white/20 transition-all active:scale-95">
        <ImageIcon size={20} className="text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Зургийн цомгоос сонгох</span>
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>
    </div>

    {/* Scanning Animation Style */}
    <style jsx>{`
      @keyframes scan {
        0% { top: 0%; opacity: 0; }
        50% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
      .animate-scan {
        animation: scan 2s linear infinite;
      }
    `}</style>
  </div>
)}

      {/* 2. SUCCESS MODAL - Compact */}
      {showSuccessModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>
            <div className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-[300px] w-full text-center">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <CheckCircle2 className="text-white" size={32} strokeWidth={3} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Амжилттай!</h3>
              <p className="text-slate-500 mb-6 text-xs font-medium">УгсааНет-д тавтай морил.</p>
              <button onClick={() => router.push("/")} className="w-full py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl">Үргэлжлүүлэх</button>
            </div>
          </div>
        )}

      {/* 3. MAIN FORM - Reduced size */}
      <div className="relative z-10 w-full max-w-[420px]">
        <button onClick={() => router.push("/")} className="group mb-2 inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 text-xs font-bold transition-all">
          <ArrowLeft size={14} className="group-hover:-translate-x-1" />
          <span>Буцах</span>
        </button>

        <div className="bg-white rounded-[2rem] shadow-xl border border-white p-5 md:p-7">
          <div className="mb-5 text-center">
            <div className="inline-flex items-center justify-center p-2 mb-3 rounded-xl bg-indigo-50 text-indigo-500">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Шинэ бүртгэл</h2>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
            <button type="button" onClick={() => setFamilyMode("create")} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${familyMode === "create" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>Шинэ ураг үүсгэх</button>
            <button type="button" onClick={() => setFamilyMode("join")} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${familyMode === "join" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>Ургийн кодоор нэгдэх</button>
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-[10px] font-bold text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            {familyMode === "join" ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ургийн код</label>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="text" name="familyCode" placeholder="Код оруулна уу" value={formData.familyCode} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs focus:bg-white" />
                  </div>
                  <button type="button" onClick={() => setShowScanner(true)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><QrCode size={18} /></button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ургийн овог</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" name="familyName" placeholder="Жишээ: Боржигон" value={formData.familyName} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs focus:bg-white" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Нэр</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" name="name" placeholder="Таны нэр" value={formData.name} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs focus:bg-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Имэйл</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="email" name="email" placeholder="mail@example.com" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs focus:bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Нууц үг</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="••••" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs focus:bg-white" />
                </div>
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Давтах</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="••••" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs focus:bg-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-2 py-3.5 bg-slate-900 text-white font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><span>Бүртгүүлэх</span><ChevronRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}