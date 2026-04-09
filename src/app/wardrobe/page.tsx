"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { ArrowLeft, Plus, Trash2, Search, X } from "lucide-react";

interface Item {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

const CATEGORIES = ["Tümü", "Üst", "Alt", "Dış Giyim", "Ayakkabı", "Aksesuar"];

export default function WardrobePage() {
  const [clothes, setClothes] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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
          fetchedClothes.push({ id: doc.id,...doc.data() } as Item);
        });
        setClothes(fetchedClothes);
      } catch (error) {
        console.error("Hata:", error);
        toast.error("Dolap yüklenemedi");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleDelete = async (item: Item) => {
    const originalClothes = [...clothes];
    setClothes((prev) => prev.filter((c) => c.id!== item.id)); // Optimistic UI

    toast("Kıyafet silindi", {
      action: {
        label: "Geri Al",
        onClick: () => setClothes(originalClothes),
      },
    });

    try {
      await deleteDoc(doc(db, "clothes", item.id));
      await deleteObject(ref(storage, item.imageUrl));
    } catch (error) {
      setClothes(originalClothes); // Hata olursa geri al
      toast.error("Silinemedi, tekrar dene");
    }
  };

  const filteredClothes = useMemo(() => {
    return clothes
     .filter(item => activeCategory === "Tümü" || item.category === activeCategory)
     .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [clothes, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster richColors position="bottom-center" />
      <div className="max-w-7xl mx-auto">

        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </Link>
              <h1 className="text-3xl font-black text-slate-800">Dolabım</h1>
              <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-bold rounded-full">{clothes.length}</span>
            </div>
            <Link href="/add-item">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-all">
                <Plus className="w-4 h-4" /> Ekle
              </button>
            </Link>
          </div>

          {/* Arama + Filtre */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Dolabında ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                   ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {filteredClothes.length === 0? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🧺</p>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Buralar boş kaldı</h3>
            <p className="text-slate-500 mb-6">{searchQuery? `"${searchQuery}" için sonuç yok` : "İlk kıyafetini ekleyerek başla"}</p>
            <Link href="/add-item">
              <button className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700">Kıyafet Ekle</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {filteredClothes.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className="group relative bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
                >
                  <button
                    onClick={() => handleDelete(item)}
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-md hover:bg-red-500 text-slate-600 hover:text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="aspect-[3/4] w-full bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 truncate">{item.name}</h3>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.category}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}