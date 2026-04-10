"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { motion } from "framer-motion";
import { LogOut, User as UserIcon, Shirt, Plus, Wand2 } from "lucide-react";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Gardırobun hazırlanıyor</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50 p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl"
        >
          <div className="mb-8 inline-flex p-4 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-violet-100">
            <Shirt className="w-12 h-12 text-violet-600" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter">
            Dolabın artık <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">cebininde</span>
          </h1>
          <p className="text-slate-600 mb-10 text-lg md:text-xl leading-relaxed">
            Ne giyeceğini düşünme. Kıyafetlerini yükle, AI senin için kombin yapsın. Stilini dijitalleştir.
          </p>
          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-slate-900/20 transition-all"
            >
              Ücretsiz Başla
            </motion.button>
          </Link>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-4 z-50 mb-8 flex justify-between items-center p-4 bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-lg shadow-slate-900/5"
        >
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              Selam, {user.displayName?.split(' ')[0] || 'dostum'} 👋
            </h1>
            <p className="text-sm text-slate-500">Bugün nasıl hissediyorsun?</p>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Link href="/profile" className="hidden md:flex items-center gap-2 text-slate-500 hover:text-violet-600 font-medium px-4 py-2.5 rounded-xl hover:bg-violet-50 transition-all">
              <UserIcon className="w-4 h-4" />
              <span>Profilim</span>
            </Link>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-medium px-4 py-2.5 rounded-xl hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Çıkış</span>
            </button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link href="/wardrobe" className="group block h-full bg-white p-8 rounded-3xl border border-slate-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Shirt className="w-7 h-7 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Dolabım</h2>
              <p className="text-slate-500">Tüm kıyafetlerini gör, düzenle ve kategorize et.</p>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2">
            <Link href="/ai-assistant" className="group block h-full bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 p-8 rounded-3xl shadow-2xl shadow-violet-900/20 hover:shadow-violet-900/40 transition-all duration-300 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/30 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <Wand2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">AI Stil Asistanı</h2>
                <p className="text-violet-200">Hava durumuna, etkinliğine ve moduna göre kombin önerisi al.</p>
              </div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link href="/add-item" className="group block h-full bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 transition-all duration-300">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7 text-slate-600 group-hover:text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Hızlı Ekle</h2>
              <p className="text-slate-500">Yeni aldığın parçayı 10 saniyede dolaba at.</p>
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}