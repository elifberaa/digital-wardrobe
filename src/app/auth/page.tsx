"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Giriş mi, Kayıt mı?
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Giriş Yapma İşlemi
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Yeni Kayıt İşlemi
        await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // Başarılı olursa ana sayfaya (Dashboard) yönlendir
      router.push("/");
      
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error("Auth Hatası:", err);
      // Kullanıcıya daha tatlı hata mesajları gösterelim
      if (err.code === 'auth/invalid-credential') setError("E-posta veya şifre hatalı.");
      else if (err.code === 'auth/email-already-in-use') setError("Bu e-posta zaten kullanımda.");
      else if (err.code === 'auth/weak-password') setError("Şifre en az 6 karakter olmalı.");
      else setError("Bir hata oluştu. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* Geri Dön Butonu */}
      <div className="max-w-md w-full mb-6">
        <Link href="/" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
          ← Ana Sayfaya Dön
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {isLogin ? "Tekrar Hoş Geldin! 👋" : "Aramıza Katıl ✨"}
          </h2>
          <p className="text-slate-500 mt-2">
            {isLogin ? "Dijital dolabına ulaşmak için giriş yap." : "Kendi dijital dolabını oluşturmak için kayıt ol."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">E-posta Adresin</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
              placeholder="isim@ornek.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Şifren</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full p-4 rounded-xl font-bold text-white transition-all ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
          >
            {loading ? "Bekleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm">
            {isLogin ? "Henüz hesabın yok mu?" : "Zaten bir hesabın var mı?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(""); }} 
              className="ml-2 text-indigo-600 font-bold hover:underline outline-none"
            >
              {isLogin ? "Yeni Kayıt Oluştur" : "Giriş Yap"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}