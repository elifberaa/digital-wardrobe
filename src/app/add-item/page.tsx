"use client";
import { useState } from "react";
import { storage, db, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddItemPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // YENİ: Fotoğraf Önizlemesi
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tişört");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fotoğraf seçildiğinde önizleme oluştur
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !auth.currentUser) {
      alert("Lütfen bir fotoğraf seçin ve giriş yaptığınızdan emin olun!");
      return;
    }
    setLoading(true);

    try {
      const storageRef = ref(storage, `clothes/${auth.currentUser.uid}/${Date.now()}_${image.name}`);
      await uploadBytes(storageRef, image);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "clothes"), {
        userId: auth.currentUser.uid,
        name: name,
        category: category,
        imageUrl: url,
        createdAt: new Date(),
      });

      alert("Harika! Kıyafet dolabına eklendi. ✨");
      router.push("/wardrobe"); // Ana sayfaya değil, direkt dolaba dönsün
    } catch (error) {
      const err = error as Error;
      console.error("Hata Detayı:", err);
      alert("Hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      
      {/* Üst Kısım / Geri Dön */}
      <div className="max-w-xl w-full mb-8 flex justify-between items-center">
        <Link href="/wardrobe" className="flex items-center text-slate-500 hover:text-indigo-600 font-medium transition-colors">
          <span className="mr-2 text-xl">←</span> Dolaba Dön
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Yeni Parça Ekle</h1>
      </div>

      <div className="max-w-xl w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-10">
        
        <form onSubmit={handleUpload} className="space-y-8">
          
          {/* YENİ: Fotoğraf Yükleme ve Önizleme Alanı */}
          <div className="flex flex-col items-center">
            <label className={`w-full h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${imagePreview ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}>
              
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Önizleme" className="h-full w-full object-contain rounded-3xl p-2" />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                    <span className="text-2xl text-indigo-600">📸</span>
                  </div>
                  <span className="text-slate-600 font-medium">Fotoğraf Seç veya Sürükle</span>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" // Gerçek inputu gizliyoruz, sadece kutuya tıklayınca açılacak
                required 
              />
            </label>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kıyafetin Adı</label>
              <input 
                type="text" 
                placeholder="Örn: Vintage Kot Ceket" 
                className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kategorisi</label>
              <select 
                className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 appearance-none"
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Tişört</option>
                <option>Pantolon</option>
                <option>Ceket / Mont</option>
                <option>Kazak / Sweatshirt</option>
                <option>Elbise</option>
                <option>Ayakkabı</option>
                <option>Aksesuar</option>
              </select>
            </div>
          </div>

          <button 
            disabled={loading} 
            className={`w-full p-5 rounded-2xl font-bold text-white transition-all text-lg ${loading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200/50 hover:-translate-y-1'}`}
          >
            {loading ? "Dolaba Asılıyor... 👗" : "Dolaba Ekle ✨"}
          </button>
        </form>

      </div>
    </div>
  );
}