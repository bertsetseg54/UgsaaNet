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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFD] gap-2">
        <div className="w-6 h-6 border-2 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
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
    <div className="min-h-screen bg-[#FDFDFD] pb-8">
      {/* HEADER - Padding багасгасан */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-2 py-1.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <Link href="/story" className="p-1 text-slate-400 hover:text-amber-600 transition-colors">
            <ChevronLeft size={18} strokeWidth={3} />
          </Link>
          <h1 className="flex-1 text-center text-[11px] font-black text-slate-900 uppercase tracking-tighter line-clamp-1">
            {story.title}
          </h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 pt-12 md:pt-14">
        {/* HERO IMAGE - Зургийг бүтнээр нь (object-contain) */}
        {story.image && (
          <div className="rounded-xl overflow-hidden h-48 md:h-[450px] mb-3 border border-slate-100 bg-slate-50 flex items-center justify-center p-1">
            <img 
              src={story.image} 
              className="max-w-full max-h-full object-contain" 
              alt={story.title} 
              loading="lazy"
            />
          </div>
        )}

        {/* STORY META - Илүү жижиг, нягт */}
        <div className="flex flex-wrap gap-1.5 mb-2 px-1">
          {story.date && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded text-amber-700">
              <Calendar size={10} />
              <span className="text-[9px] font-bold uppercase tracking-tight">{story.date} он</span>
            </div>
          )}
          {story.author && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-600">
              <User size={10} />
              <span className="text-[9px] font-bold uppercase tracking-tight">{story.author}</span>
            </div>
          )}
        </div>

        {/* STORY TITLE - Хэмжээг багасгасан */}
        <h1 className="text-base md:text-xl font-black text-slate-900 mb-2 leading-tight tracking-tighter px-1 uppercase">
          {story.title}
        </h1>

        {/* STORY CONTENT - Padding болон margin хумисан */}
        <article className="max-w-none mb-6 px-1">
          <div className="border-l-2 border-amber-400 pl-3 py-0.5">
            <p className="text-[13px] md:text-base text-slate-700 leading-relaxed whitespace-pre-line font-serif opacity-95">
              {story.content}
            </p>
          </div>
        </article>

        {/* BACK BUTTON - Авсаархан */}
        <div className="pt-4 border-t border-slate-50 px-1">
          <Link
            href="/story"
            className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <ChevronLeft size={12} strokeWidth={3} />
            Буцах
          </Link>
        </div>
      </main>
    </div>
  );
}