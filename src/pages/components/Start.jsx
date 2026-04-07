import { Geist } from "next/font/google";
import Link from "next/link";
import { Info } from "lucide-react"; // Икон нэмэхэд илүү гоё харагдана

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Start() {
  return (
    <div
      className={`${geistSans.variable} font-sans relative w-full h-screen overflow-hidden bg-[#050505] text-white select-none flex flex-col`}
    >
      {/* Background with Darker Overlay for better contrast */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-[subtle-zoom_40s_infinite_alternate] transition-transform duration-[3000ms]"
        style={{
          // Зөвлөмж: /heritage.jpg гэх мэт илүү гүн өнгөтэй, чанартай зураг ашиглаарай
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(5,5,5,1) 95%), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
        }}
      ></div>

      {/* Glassy Grain Effect Overlay (Optional) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Top Navigation */}
     {/* Top Navigation */}
      <nav className="relative z-20 w-full max-w-7xl mx-auto px-8 py-8 flex justify-end">
        <Link 
          href="/work" 
          className="
            flex items-center gap-2 
            text-[10px] sm:text-[11px] 
            uppercase tracking-[0.3em] 
            text-white/60 font-bold 
            transition-all duration-500 
            backdrop-blur-md 
            px-6 py-3 
            rounded-full 
            border border-white/10 
            bg-white/5 
            hover:bg-white/10 
            hover:border-white/30 
            hover:text-white 
            hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]
          "
        >
          <Info className="w-3.5 h-3.5 text-indigo-300" />
          <span>Хэрхэн ажилладаг вэ?</span>
        </Link>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow w-full max-w-5xl mx-auto px-6">
        
        {/* Branding Header */}
        <header className="mb-16 opacity-40">
          <div className="text-[10px] tracking-[0.8em] font-light uppercase border-b border-white/10 pb-2">
            Mongolian Heritage • EST. 2026
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col items-center text-center space-y-12">
          <div className="space-y-8">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-extralight tracking-tight text-white leading-[1.1] font-serif italic">
              "Үндэс нь гүн бол <br className="hidden sm:block" />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-slate-400">
                мөчир нь бат
              </span>"
            </h2>

            <div className="flex items-center justify-center gap-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20"></div>
              <p className="text-[10px] sm:text-xs text-gray-400 font-light tracking-[0.4em] uppercase">
                Удмын Түүх • Ирээдүйн Өв
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20"></div>
            </div>
          </div>

          {/* <p className="text-sm sm:text-base text-gray-400/80 max-w-md mx-auto font-light leading-relaxed tracking-wide px-4">
            Өөрийн ургийн бичгийг дижитал хэлбэрт шилжүүлж, <br className="hidden sm:block" />
            ирээдүй хойч үедээ бат бөх үндэс үлдээгээрэй.
          </p> */}
        </main>

        {/* Action Buttons */}
        <div className="mt-20 flex flex-col items-center gap-16 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-md">
            <Link
              href="/login"
              className="group relative w-full sm:w-48 py-4.5 rounded-full bg-white text-black text-[12px] font-bold uppercase tracking-widest transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 text-center shadow-2xl"
            >
              Нэвтрэх
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-48 py-4.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-2xl text-white text-[12px] font-bold uppercase tracking-widest transition-all duration-500 hover:bg-white/10 hover:border-white/50 active:scale-95 text-center"
            >
              Бүртгүүлэх
            </Link>
          </div>

          {/* Footer Bottom */}
          <footer className="opacity-50 text-center">
            <p className="text-[9px] text-white tracking-[0.6em] text-xl uppercase font-medium">
              ©Br-Coding
            </p>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        @keyframes subtle-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
        
        /* Smooth Text Rendering */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Adjust button padding for extra refinement */
        .py-4.5 {
          padding-top: 1.125rem;
          padding-bottom: 1.125rem;
        }
      `}</style>
    </div>
  );
}