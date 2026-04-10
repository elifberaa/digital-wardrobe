import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { occasion, clothes } = body;

    if (!occasion || !clothes || clothes.length === 0) {
      return NextResponse.json({ error: "Kıyafet veya plan bilgisi eksik!" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Sunucu ayar hatası: GEMINI_API_KEY bulunamadı." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Sen, Dijital Gardırop uygulamasından kullanıcısına enerji veren, zeki, sıcak kanlı ve uzman bir Moda Stilistisin.

Kullanıcının planı: "${occasion}"
Kullanıcının dolabındaki tüm kıyafetleri (her biri benzersiz 'id', 'name' ve 'category' ile):
${JSON.stringify(clothes, null, 2)}

Görev:
Kullanıcının bu plan için dolabındaki mevcut kıyafetleri inceleyerek 1 ila en fazla 3 adet kombin oluştur. 
Kombinlere koyacağın parçalar SADECE yukarıdaki dolap yapısına dahil olan GERÇEK kıyafet ID'lerinden (id) oluşmalı. Olmayan bir şeyi ekleme. 

Bana sadece geçerli bir JSON objesi dön. Asla Markdown (\`\`\`json) sembollerini VEYA ek açıklamaları cevapta BARINDIRMA. SADECE JSON METNİ OLSUN!

JSON Formatı şu şekilde olmalı:
{
  "generalRationale": "Planın için dolabını inceledim ve kendi sıcak moda stilisti ağzınla harika bir açılış cümlesi yaz...",
  "combos": [
    {
      "title": "🌟 1. Kombin: Rahat & Şık (Gibi emoji ve ilgi çekici isimler barındır)",
      "description": "Neden bu kombini seçtiğini ve giydiğinde ortamda nasıl hissedeceğini açıklayan motive edici bir cümle...",
      "itemIds": ["dolaptaki_kiyafet_id_1", "dolaptaki_kiyafet_id_2"]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let textResult = result.response.text();
    
    // Eğer Gemini inatla markdown dönerse temizleyelim:
    if (textResult.includes("```json")) {
      textResult = textResult.split("```json")[1].split("```")[0];
    } else if (textResult.includes("```")) {
      textResult = textResult.split("```")[1].split("```")[0];
    }

    textResult = textResult.trim();
    const data = JSON.parse(textResult);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Assistant Endpoint Error:", error);
    return NextResponse.json({ error: "AI servisine bağlanılamadı: " + error.message }, { status: 500 });
  }
}
