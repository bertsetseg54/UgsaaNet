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
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Уншиж байна...</p>
      </div>
    );

  if (!story)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] gap-4 px-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Түүх олдсонгүй</p>
        <Link href="/story" className="px-6 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Буцах</Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-12">
      {/* HEADER - Өндөр болон padding багасгасан */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
          <Link href="/story" className="p-1 -ml-1 text-slate-400 hover:text-amber-600 transition-colors">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="flex-1 text-center text-sm font-black text-slate-900 line-clamp-1">
            {story.title}
          </h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-16 md:pt-20">
        {/* Hero Image - Зайг нь багасгасан */}
        {story.image && (
          <div className="rounded-xl overflow-hidden h-48 md:h-80 mb-4 shadow-md">
            <img src={story.image} className="w-full h-full object-cover" alt={story.title} />
          </div>
        )}

        {/* Story Meta - Бага зайтай */}
        <div className="flex flex-wrap gap-2 mb-3">
          {story.date && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md w-fit">
              <Calendar size={12} className="text-amber-600" />
              <span className="text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                {story.date} онд
              </span>
            </div>
          )}
          {story.author && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md w-fit">
              <User size={12} className="text-slate-600" />
              <span className="text-[9px] md:text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                {story.author}
              </span>
            </div>
          )}
        </div>

        {/* Story Title - Зайг хумисан */}
        <h1 className="text-lg md:text-2xl font-black text-slate-900 mb-3 leading-snug tracking-tight">
          {story.title}
        </h1>

        {/* Story Content - Доторх зай (padding) багасгасан */}
        <article className="prose prose-sm max-w-none mb-6">
          <div className="border-l-3 border-amber-400 pl-4 py-1">
            <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line font-serif">
              {story.content}
            </p>
          </div>
        </article>

        {/* Back Button */}
        <div className="pb-4">
          <Link
            href="/story"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            <ChevronLeft size={14} />
            Буцах
          </Link>
        </div>
      </main>
    </div>
  );
}