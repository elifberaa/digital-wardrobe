"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, ArrowLeft, User as UserIcon, Shirt, Home, Wand2 } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 pb-28 md:pb-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <Link href="/" className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Profilim</h1>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center"
        >
          <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-violet-600 font-bold">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '👤'}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            {user?.displayName || "Kullanıcı"}
          </h2>
          <p className="text-slate-500 mb-8">{user?.email}</p>

          <button
            onClick={handleSignOut}
            className="w-full md:w-auto px-8 py-3.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-2xl flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Güvenli Çıkış Yap
          </button>
        </motion.div>
      </div>

      {/* MOBİL ALT NAVİGASYON */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200 z-50">
        <div className="flex justify-around items-center h-16 pb-2 safe-area-pb">
          <Link href="/" className="flex flex-col items-center gap-1 p-2">
            <Home className="w-6 h-6 text-slate-400" />
            <span className="text-[10px] text-slate-500">Ana</span>
          </Link>
          <Link href="/wardrobe" className="flex flex-col items-center gap-1 p-2">
            <Shirt className="w-6 h-6 text-slate-400" />
            <span className="text-[10px] text-slate-500">Dolap</span>
          </Link>
          <Link href="/ai-assistant" className="flex flex-col items-center gap-1 p-2">
            <Wand2 className="w-6 h-6 text-slate-400" />
            <span className="text-[10px] text-slate-500">AI</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 p-2">
            <UserIcon className="w-6 h-6 text-slate-900" />
            <span className="text-[10px] font-semibold text-slate-900">Profil</span>
          </Link>
        </div>
      </nav>
      
      <style jsx global>{`
       .safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </main>
  );
}
