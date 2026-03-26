import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StoryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchStory = async () => {
      try {
        // Энд API-ийн замаа зөв зааж өгөх хэрэгтэй
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

  if (loading) return <div className="p-20 text-center font-black animate-pulse">УНШИЖ БАЙНА...</div>;
  if (!story) return <div className="p-20 text-center">Түүх олдсонгүй.</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/story" className="text-xs font-black uppercase text-slate-400 hover:text-indigo-600 mb-10 inline-block">
          ← Буцах
        </Link>

        {story.image && (
          <div className="rounded-[3rem] overflow-hidden h-[400px] mb-12 shadow-2xl">
            <img src={story.image} className="w-full h-full object-cover" alt="" />
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-black text-sm">
            {story.date}
          </span>
        </div>

        <h1 className="text-5xl font-[1000] text-slate-900 mb-8 leading-tight tracking-tighter">
          {story.title}
        </h1>

        <div className="border-l-4 border-indigo-100 pl-8">
          <p className="text-xl text-slate-600 leading-relaxed whitespace-pre-line font-medium italic">
            {story.content}
          </p>
        </div>
      </div>
    </div>
  );
}