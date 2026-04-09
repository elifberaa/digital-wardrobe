"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

// Kıyafet Tipi
interface Item {
  id: string;
  name: string;
  category: string;
  imageUrl: string; // BU ÇOK ÖNEMLİ: Artık görsel veriye ihtiyacımız var.
}

// YENİ: Yapay Zeka Tarafından Oluşturulan Kombin Tipi
interface AiCombination {
  title: string;          // Kombine verilecek isim, örn: "🌟 1. Kombin: Rahat & Şık"
  description: string;    // Neden bu kombin, örn: "Planına uygun olarak..."
  items: Item[];          // Bu kombinde kullanılan gerçek kıyafet objeleri
}

export default function AIAssistantPage() {
  const [clothes, setClothes] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [occasion, setOccasion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{ generalRationale: string; combos: AiCombination[] } | null>(null); // YENİ: Structured State
  const router = useRouter();

  // 1. Adım: Kullanıcının dolabını yükle
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
        console.error("Dolap çekilemedi:", error);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Adım: AI ile Görsel Konuşma (Simülasyon)
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clothes.length < 2) {
      alert("Yapay zekanın kombin yapabilmesi için dolabında en az 2 parça kıyafet olmalı!");
      return;
    }

    setIsGenerating(true);
    setAiRecommendation(null); // Eski önerileri temizle

    // (Prompt Engineering mantığı Console'da duruyor ama kodumuz görsel veri üretecek)
    console.log("Arka planda AI'a planınız giti:", occasion);

    // Gerçek API bağlayana kadar 2 saniyelik bir bekleme simülasyonu
    setTimeout(() => {
      // Basic simülasyon logic: Sadece rastgele kombinler oluştur.
      // (Test için dolabındaki ilk ve son kıyafetleri kullanacağız ama bu sefer OBJESİNİ vereceğiz)
      const combo1Items = [clothes[0], clothes[1]].filter(Boolean); // null/undefined kontrolü
      const combo2Items = [clothes[clothes.length-1], clothes[0]].filter(Boolean);

   // Simüle edilmiş yapısal AI cevabı (TÜRKÇE ve DAHA SAMİMİ)
      const mockResult = {
        generalRationale: `"${occasion}" planın için dolabındaki ${clothes.length} parçayı hızlıca gözden geçirdim ve senin için harika hissettirecek birkaç kombin hazırladım! ✨ Planın için:`,
        combos: [
          {
            title: "🌟 1. Kombin: Rahat & Şık",
            description: `"${occasion}" için ${combo1Items[0]?.name || "bu parçayı"} ve ${combo1Items[1]?.name || "bunu"} bir araya getirdim. Bu ikili, gün boyu rahat etmeni sağlarken aynı zamanda çok çaba harcamamış ama harika görünen (effortless) o havayı yakalamanı sağlayacak.`,
            items: combo1Items
          },
          {
            title: "👟 2. Kombin: İddialı Alternatif",
            description: `Eğer "${occasion}" planında biraz daha dikkat çekmek istersen, dolabının yıldızı olan ${combo2Items[0]?.name || "bu parçayı"} merkeze alabiliriz. Sade aksesuarlarla desteklediğinde oldukça güçlü bir duruş sergileyeceksin.`,
            items: combo2Items
          }
        ].filter(c => c.items.length > 0)
      };

      setAiRecommendation(mockResult); // State'i yeni obje ile güncelle
      setIsGenerating(false);
    }, 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Yapay Zeka Uyanıyor...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Üst Menü / Geri Dön */}
        <header className="flex justify-between items-center mb-10">
          <Link href="/" className="text-slate-500 hover:text-indigo-600 font-bold text-xl transition-colors">← Menüye Dön</Link>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI Asistan ✨</h1>
        </header>

        {/* Plan Giriş Alanı */}
        <div className="bg-white rounded-[2rem] shadow-sm p-8 md:p-10 border border-slate-100 mb-8 transition-transform hover:-translate-y-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Bugün planın ne?</h2>
          <p className="text-slate-500 mb-6 max-w-xl">Nereye gideceğini söyle, dolabındaki {clothes.length} parça arasından sana en uygun kombini bulayım.</p>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <input 
              type="text" 
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Örn: Ofis toplantısı, Akşam yemeği, Kahve buluşması..." 
              className="w-full p-5 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500 text-lg transition-all"
              required 
            />
            <button 
              disabled={isGenerating || clothes.length === 0} 
              className={`w-full p-5 rounded-2xl font-bold text-white transition-all text-lg shadow-xl shadow-purple-200/50 ${isGenerating ? 'bg-purple-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-purple-300 hover:scale-[1.02]'}`}
            >
              {isGenerating ? "Zeka Çalışıyor... 🧠👗" : "Bana Kombin Öner ✨"}
            </button>
          </form>
        </div>

        {/* AI Cevap Alanı (Stiline uygun olarak güncellendi!) */}
        {aiRecommendation && (
          <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-[2rem] p-8 md:p-10 border border-purple-100 shadow-inner space-y-12 animate-fade-in-up">

            {/* AI Genel Mesajı */}
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">Senin İçin Seçtiklerim ✨</h3>
              <p className="text-slate-600 leading-relaxed text-lg max-w-xl mx-auto">
                {aiRecommendation.generalRationale}
                <span className="font-semibold text-purple-700 ml-1.5">{occasion}</span>
              </p>
            </div>

            {/* YENİ: Kombinleri Döngüye Alıp GÖRSEL OLARAK Listeleme */}
            {aiRecommendation.combos.map((combo, comboIndex) => (
              <div key={comboIndex} className="space-y-6">
                
                {/* Kombin Başlığı ve Açıklaması */}
                <div className="border-b border-purple-100 pb-5">
                  <h4 className="text-2xl font-bold text-purple-950 mb-2">{combo.title}</h4>
                  <p className="text-slate-600 leading-relaxed max-w-2xl">
                    {combo.description}
                  </p>
                </div>

                {/* Kombindeki Kıyafetleri YAN YANA Kartlar Halinde Gösterme */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {combo.items.map(item => (
                    // Burası ana sayfandaki şık kart tasarımının minyatür hali
                    <div key={item.id} className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-100 flex flex-col h-64 hover:shadow-md transition-shadow">
                      <div className="h-40 w-full relative bg-slate-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 flex flex-col flex-1 justify-center bg-white">
                        <h5 className="font-bold text-slate-800 truncate text-sm">{item.name}</h5>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">{item.category}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}