"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useRouter } from "next/navigation";

interface Item {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

export default function WardrobePage() {
  const [clothes, setClothes] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Dolabı Yükleme
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      
      try {
        const q = query(collection(db, "clothes"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedClothes: Item[] = [];
        querySnapshot.forEach((doc) => {
          fetchedClothes.push({ id: doc.id, ...doc.data() } as Item);
        });
        
        setClothes(fetchedClothes);
      } catch (error) {
        console.error("Hata:", error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Silme Fonksiyonu
  const handleDelete = async (itemId: string, imageUrl: string) => {
    // 1. Kullanıcıdan onay iste (yanlışlıkla silmeyi önlemek için)
    const isConfirmed = window.confirm("Bu kıyafeti dolaptan çıkarmak istediğine emin misin?");
    if (!isConfirmed) return;

    try {
      // 2. Veritabanından (Firestore) sil
      await deleteDoc(doc(db, "clothes", itemId));

      // 3. Fotoğrafı buluttan (Storage) sil (Depolama alanın dolmasın diye)
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (imgError) {
        console.log("Fotoğraf depodan silinirken küçük bir hata oldu:", imgError);
      }

      // 4. Ekranda anında güncelle (Sayfayı yenilemeye gerek kalmadan)
      setClothes((prevClothes) => prevClothes.filter((item) => item.id !== itemId));
      
    } catch (error) {
      console.error("Silme işlemi başarısız:", error);
      alert("Silinirken bir hata oluştu.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Dolap açılıyor...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Üst Menü */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-500 hover:text-indigo-600 font-bold text-xl transition-colors">← Geri</Link>
            <h1 className="text-3xl font-extrabold text-slate-800">Dolabım 👗</h1>
          </div>
        </header>

        {/* Kıyafet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Link href="/add-item" className="group border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center p-8 h-72 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl text-indigo-600">➕</span>
            </div>
            <span className="text-slate-600 font-bold group-hover:text-indigo-600">Yeni Ekle</span>
          </Link>

          {/* Kıyafet Kartları */}
          {clothes.map((item) => (
            <div key={item.id} className="relative group bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-slate-100 flex flex-col h-72">
              
              {/* SİLME BUTONU (Sadece üzerine gelince görünür) */}
              <button 
                onClick={() => handleDelete(item.id, item.imageUrl)}
                className="absolute top-3 right-3 bg-white/90 hover:bg-red-500 text-red-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Kıyafeti Sil"
              >
                🗑️
              </button>

              <div className="h-48 w-full relative bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 flex flex-col flex-1 justify-center bg-white">
                <h3 className="font-bold text-slate-800 truncate">{item.name}</h3>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}