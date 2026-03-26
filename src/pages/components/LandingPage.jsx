"use client";
import { useState, useEffect } from "react";
import ProfileCard from "./ProfileCard";
import RegisterForm from "./RegisterForm";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Fingerprint,
  Plus,
  LogOut,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [userName, setUserName] = useState("Хэрэглэгч");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  // --- DATA FETCH ---
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/persons");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProfiles(data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromState = (id) => {
    setProfiles((prev) => prev.filter((p) => p._id !== id));
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setIsEditOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/start");
  };

  useEffect(() => {
    fetchProfiles();

    const storedData = localStorage.getItem("user_data");
    if (storedData) {
      try {
        const user = JSON.parse(storedData);
        setUserName(user.name || user.email?.split("@")[0]);
      } catch {
        console.error("User parse error");
      }
    }

    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#F8F9FA]" />;

  // 🔍 SAFE FILTER
  const filteredProfiles = profiles.filter((person) =>
    (person.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 📦 GROUP
  const groupedByGeneration = filteredProfiles.reduce((acc, person) => {
    const gen = Number(person.generation) || 1;
    if (!acc[gen]) acc[gen] = [];
    acc[gen].push(person);
    return acc;
  }, {});

  const sortedGenerations = Object.keys(groupedByGeneration).sort(
    (a, b) => Number(a) - Number(b)
  );

  const visibleGenerations = showAll
    ? sortedGenerations
    : sortedGenerations.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#2D3436]">
      {/* 🔥 HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-2">
          {/* TOP */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Fingerprint className="text-amber-600" />
              </div>
              <h1 className="font-black text-lg">Ургийн Хэлхээ</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-sm font-bold text-slate-500">
                {userName}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-400 hover:text-red-500 text-sm"
              >
                <LogOut size={16} />
              </button>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl hover:bg-amber-500"
              >
                <Plus size={16} />
                Нэмэх
              </button>
            </div>
          </div>

          {/* 🔍 SEARCH */}
          <div className="mt-4 flex items-center gap-4">
            <Link
              href="/story"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm"
            >
              📖 Түүх намтар
            </Link>

            <div className="flex-1 max-w-md relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Нэрээр хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border rounded-xl py-2 pl-10 pr-10 text-sm focus:ring-2 focus:ring-amber-500/20"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 📦 MAIN */}
      <div className="grow pt-32 md:pt-36">
        <main className="max-w-6xl mx-auto px-6 pb-12">
          {loading ? (
            <div className="text-center py-20">Уншиж байна...</div>
          ) : sortedGenerations.length > 0 ? (
            <div className="space-y-8">
              {visibleGenerations.map((gen) => (
                <section key={gen}>
                  <div className="flex justify-between mb-3">
                    <span className="font-bold">Үе {gen}</span>
                    {!searchQuery && (
                      <Link href={`/generation/${gen}`}>Бүгдийг үзэх</Link>
                    )}
                  </div>

                  <div className="flex gap-4 overflow-x-auto">
                    {groupedByGeneration[gen].map((profile) => (
                      <ProfileCard
                        key={profile._id}
                        profile={profile}
                        onDelete={handleDeleteFromState}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {sortedGenerations.length > 4 && (
                <div className="text-center">
                  <button onClick={() => setShowAll(!showAll)}>
                    <ChevronDown
                      className={`mx-auto transition-transform ${
                        showAll ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">Илэрц олдсонгүй</div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <RegisterForm
        isOpen={isRegisterOpen}
        setIsOpen={setIsRegisterOpen}
        onProfileAdded={fetchProfiles}
      />

      <RegisterForm
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        editData={editingProfile}
        onUpdate={fetchProfiles}
      />
    </div>
  );
}
