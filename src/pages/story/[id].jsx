"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Calendar, User } from "lucide-react";

export default function StoryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchStory = async () => {
      try {
        const res = await fetch(`/api/stories/${id}`);
        if (!res.ok) throw new Error("Алдаа гарлаа");
        const data = await res.json();
        setStory(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFD] gap-4">
        <div className="w-8 h-8 border-2 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Уншиж байна...
        </p>
      </div>
    );

  if (!story)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] gap-6 px-6 pb-24 md:pb-12">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Түүх олдсонгүй
        </p>
        <Link
          href="/story"
          className="px-8 py-3 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-amber-700 transition-colors"
        >
          Буцах
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 md:pb-12">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-3 md:px-8 py-3 flex items-center justify-between gap-3">
          <Link
            href="/story"
            className="flex items-center gap-2 p-2 -ml-2 text-slate-400 hover:text-amber-600 transition-colors"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </Link>
          <h1 className="flex-1 text-center text-sm md:text-lg font-black text-slate-900 line-clamp-2">
            {story.title}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 md:px-6 pt-20 md:pt-24">
        {/* Hero Image */}
        {story.image && (
          <div className="rounded-xl md:rounded-2xl overflow-hidden h-64 md:h-96 mb-6 md:mb-8 shadow-lg">
            <img
              src={story.image}
              className="w-full h-full object-cover"
              alt={story.title}
            />
          </div>
        )}

        {/* Story Meta */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 md:mb-8">
          {story.date && (
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-amber-50 border border-amber-200 rounded-lg w-fit">
              <Calendar size={14} className="text-amber-600" />
              <span className="text-[10px] md:text-xs font-bold text-amber-700 uppercase tracking-wider">
                {story.date}
              </span>
            </div>
          )}
          {story.author && (
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-lg w-fit">
              <User size={14} className="text-slate-600" />
              <span className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wider">
                {story.author}
              </span>
            </div>
          )}
        </div>

        {/* Story Title */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 md:mb-8 leading-tight tracking-tight">
          {story.title}
        </h1>

        {/* Story Content */}
        <article className="prose prose-sm md:prose-base lg:prose-lg max-w-none mb-12">
          <div className="border-l-4 border-amber-400 pl-4 md:pl-6 py-2">
            <p className="text-sm md:text-base lg:text-lg text-slate-700 leading-relaxed md:leading-8 whitespace-pre-line font-serif">
              {story.content}
            </p>
          </div>
        </article>

        {/* Back Button */}
        <div className="pb-12 md:pb-6">
          <Link
            href="/story"
            className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-colors"
          >
            <ChevronLeft size={16} />
            Бүх түүхүүдрүү
          </Link>
        </div>
      </main>

      <style jsx global>{`
        .safe-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
}