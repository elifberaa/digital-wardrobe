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
import { Drawer } from "vaul";
import { ArrowLeft, Plus, Trash2, Search, Shirt, Home, Wand2, User } from "lucide-react";

interface Item {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

const CATEGORIES = ["Tümü", "Üst", "Alt", "Dış Giyim", "Elbise", "Ayakkabı", "Aksesuar"];

export default function WardrobePage() {
  const [clothes, setClothes] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { router.push("/"); return; }
      try {
        const q = query(collection(db, "clothes"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetched: Item[] = [];
        querySnapshot.forEach((doc) => fetched.push({ id: doc.id,...doc.data() } as Item));
        setClothes(fetched);
      } catch (e) { toast.error("Dolap yüklenemedi"); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleDelete = async (item: Item) => {
    const original = [...clothes];
    setClothes(prev => prev.filter(c => c.id!== item.id));
    setSelectedItem(null);
    toast("Silindi", { action: { label: "Geri Al", onClick: () => setClothes(original) } });
    try {
      await deleteDoc(doc(db, "clothes", item.id));
      await deleteObject(ref(storage, item.imageUrl));
    } catch { setClothes(original); toast.error("Silinemedi"); }
  };

  const filteredClothes = useMemo(() => {
    const n = (s: string) => s.toLowerCase().replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c');
    
    const isCategoryMatch = (itemCat: string, activeCat: string) => {
      if (activeCat === "Tümü") return true;
      const mapping: Record<string, string[]> = {
        "Üst": ["tişört", "kazak / sweatshirt"],
        "Alt": ["pantolon"],
        "Dış Giyim": ["ceket / mont"],
        "Elbise": ["elbise"],
        "Ayakkabı": ["ayakkabı"],
        "Aksesuar": ["aksesuar"]
      };
      const targets = mapping[activeCat];
      if (targets) {
        return targets.some(target => n(itemCat) === n(target));
      }
      return n(itemCat) === n(activeCat);
    };

    return clothes
     .filter(i => isCategoryMatch(i.category, activeCategory))
     .filter(i => n(i.name).includes(n(searchQuery)));
  }, [clothes, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 pb-28">
        <div className="h-10 w-40 bg-slate-200 rounded-xl animate-pulse mb-6" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-slate-200 rounded-3xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Toaster richColors position="top-center" />
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-28 md:pb-8">

        {/* Header - Mobilde sade */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="md:hidden p-2.5 -ml-2">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl md:text-3xl font-black">Dolabım</h1>
              <span className="px-2.5 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">{clothes.length}</span>
            </div>
            <Link href="/add-item" className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold">
              <Plus className="w-4 h-4" /> Ekle
            </Link>
          </div>

          {/* Arama */}
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-base focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Kategoriler - Mobilde scroll */}
          <div className="flex gap-2 overflow-x-auto mt-3 -mx-4 px-4 pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat? "bg-slate-900 text-white" : "bg-white border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Grid */}
        {filteredClothes.length === 0? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🧺</p>
            <h3 className="font-bold text-lg">Hiçbir şey yok</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            <AnimatePresence>
              {filteredClothes.map(item => (
                <div key={item.id} className="relative overflow-hidden rounded-3xl">
                  {/* Swipe arka plan */}
                  <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6">
                    <Trash2 className="text-white w-6 h-6" />
                  </div>

                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.3}
                    onDragEnd={(_, info) => { if (info.offset.x < -90) handleDelete(item); }}
                    onClick={() => setSelectedItem(item)}
                    className="relative bg-white border border-slate-100 active:scale-[0.98] transition-transform"
                  >
                    <div className="aspect-[3/4] bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" draggable={false} />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm truncate">{item.name}</h3>
                      <span className="text-xs font-medium text-slate-400 uppercase">{item.category}</span>
                    </div>
                  </motion.div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* MOBİL FAB */}
      <Link href="/add-item" className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/30 z-40 active:scale-95 transition-transform">
        <Plus className="text-white w-7 h-7" />
      </Link>

      {/* MOBİL ALT NAVİGASYON */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200 z-50">
        <div className="flex justify-around items-center h-16 pb-2 safe-area-pb">
          <Link href="/" className="flex flex-col items-center gap-1 p-2">
            <Home className="w-6 h-6 text-slate-400" />
            <span className="text-[10px] text-slate-500">Ana</span>
          </Link>
          <Link href="/wardrobe" className="flex flex-col items-center gap-1 p-2">
            <Shirt className="w-6 h-6 text-slate-900" />
            <span className="text-[10px] font-semibold text-slate-900">Dolap</span>
          </Link>
          <div className="w-12" /> {/* FAB için boşluk */}
          <Link href="/ai-assistant" className="flex flex-col items-center gap-1 p-2">
            <Wand2 className="w-6 h-6 text-slate-400" />
            <span className="text-[10px] text-slate-500">AI</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 p-2">
            <User className="w-6 h-6 text-slate-400" />
            <span className="text-[10px] text-slate-500">Profil</span>
          </Link>
        </div>
      </nav>

      {/* DETAY DRAWER */}
      <Drawer.Root open={!!selectedItem} onOpenChange={o =>!o && setSelectedItem(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 max-h-[85vh] flex flex-col">
            <div className="mx-auto w-12 h-1.5 bg-slate-300 rounded-full my-3" />
            {selectedItem && (
              <>
                <div className="px-6 pb-6 overflow-y-auto">
                  <div className="aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedItem.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                  <p className="text-slate-500 mt-1">{selectedItem.category}</p>
                </div>
                <div className="p-6 pt-0 mt-auto border-t border-slate-100">
                  <button onClick={() => handleDelete(selectedItem)} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" /> Dolaptan Çıkar
                  </button>
                </div>
              </>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <style jsx global>{`
       .scrollbar-hide::-webkit-scrollbar { display: none; }
       .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
       .safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </main>
  );
}