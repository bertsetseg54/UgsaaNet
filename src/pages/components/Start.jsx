import { Geist } from "next/font/google";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Start() {
  return (
    <div
      className={`${geistSans.variable} font-sans relative w-full h-[100dvh] overflow-hidden bg-[#0a0a0a] text-white select-none flex flex-col`}
    >
      {/* Background with Slow Motion */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-[subtle-zoom_30s_infinite_alternate]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(10,10,10,1) 90%), url('/garag.jpg')",
        }}
      ></div>

      {/* Main UI Container */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Top Branding - Minimalist */}
        <header className="w-full flex justify-center opacity-30">
          <div className="text-[10px] tracking-[0.6em] font-medium uppercase border-b border-white/20 pb-1">
            EST. 2026
          </div>
        </header>

        {/* Hero Content - Focus on the Quote */}
        <main className="flex flex-col items-center text-center w-full space-y-8 md:space-y-12">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight tracking-tight text-white leading-tight font-serif">
              "Үндэс нь гүн бол <br className="sm:hidden" />{" "}
              <span className="font-serif text-indigo-200">мөчир нь бат</span>"
            </h2>

            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-8 bg-white/20"></div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-light tracking-[0.2em] uppercase">
                Future of Heritage
              </p>
              <div className="h-[1px] w-8 bg-white/20"></div>
            </div>
          </div>

          <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-[260px] sm:max-w-md mx-auto font-light leading-relaxed tracking-wide">
            Цэвэр цуст Монголын ирээдүйг <br className="hidden sm:block" />
            дижитал ертөнцөд хамтдаа бүтээцгээе.
          </p>
        </main>

        {/* Action Buttons - Clean & Modern */}
        <div className="flex flex-col items-center gap-12 w-full">
          <nav className="w-full max-w-[280px] sm:max-w-md flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative w-full sm:w-44 py-4 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-widest transition-all duration-300 hover:bg-indigo-50 active:scale-95 text-center shadow-xl"
            >
              Нэвтрэх
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-44 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white text-[11px] font-bold uppercase tracking-widest transition-all duration-300 hover:bg-white/10 hover:border-white/30 active:scale-95 text-center"
            >
              Бүртгүүлэх
            </Link>
          </nav>

          {/* Footer Bottom */}
          <footer className="flex flex-col items-center gap-4">
            <p className="text-[9px] text-white/20 tracking-[0.5em] uppercase font-medium">
              © MMXXVI Core Technology
            </p>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        @keyframes subtle-zoom {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.1);
          }
        }
        /* Mobile Viewport Fix */
        @supports (-webkit-touch-callout: none) {
          .h-[100dvh] {
            height: -webkit-fill-available;
          }
        }
      `}</style>
    </div>
  );
}
