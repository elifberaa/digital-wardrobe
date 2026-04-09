"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Yüklenme ekranı
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Sistem Yükleniyor...</div>;
  }

  // 1. Durum: Kullanıcı giriş yapmamışsa
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 text-center tracking-tight">Dijital Gardırobun</h1>
        <p className="text-slate-600 mb-10 text-center max-w-md text-lg">Ne giyeceğini düşünme, dolabını cebinde taşı. Hemen giriş yap ve kıyafetlerini dijitalleştir.</p>
        <Link href="/auth" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all">
          Giriş Yap veya Kayıt Ol
        </Link>
      </main>
    );
  }

  // 2. Durum: Kullanıcı giriş yapmışsa (Ana Menü)
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Hoş Geldin! 👋</h1>
            <p className="text-slate-500 mt-2">Bugün ne giymek istersin?</p>
          </div>
          <button onClick={() => signOut(auth)} className="text-red-500 font-semibold hover:bg-red-50 px-5 py-2.5 rounded-xl transition-colors">
            Çıkış Yap
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/wardrobe" className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">👗</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Dolabım</h2>
            <p className="text-slate-500">Kıyafetlerini görüntüle ve düzenle.</p>
          </Link>

          <Link href="/ai-assistant" className="group bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-3xl shadow-md hover:shadow-lg transition-all text-white">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">AI Kombin Asistanı</h2>
            <p className="text-indigo-100">Yapay zeka senin için kombin üretsin.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}