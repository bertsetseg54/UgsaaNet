import { Geist } from "next/font/google";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Start() {
  return (
    <div
      className={`${geistSans.variable} font-sans relative w-full h-screen overflow-hidden`}
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url('/garag.jpg')",
        }}
      ></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        {/* Animated Text Section */}
        <div className="space-y-6 max-w-4xl">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter italic">
              MONGOLIA
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl md:text-3xl text-gray-200 font-light leading-relaxed">
              "Үндэс нь гүн бол мөчир нь бат"
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              Цэвэр цуст Монголын ирээдүйг хамтдаа бүтээцгээе...
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none">
          {/* Нэвтрэх товчлуур - Үндсэн үйлдэл */}
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold tracking-wide transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95 text-center min-w-[160px]"
          >
            Нэвтрэх
          </Link>

          {/* Бүртгүүлэх товчлуур - Туслах үйлдэл */}
          <Link
            href="/signup"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl border-2 border-white/10 text-white/80 font-semibold transition-all hover:border-white hover:text-white hover:bg-white/5 active:scale-95 text-center min-w-[160px]"
          >
            Бүртгүүлэх
          </Link>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="absolute bottom-6 w-full z-10 text-center px-4">
        <div className="flex flex-col items-center gap-3">
          {/* Scroll Indicator Dot */}
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-white/0 to-white/50 mb-2"></div>

          <p className="text-white/40 text-xs md:text-sm font-medium tracking-widest uppercase">
            © 2026 All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
