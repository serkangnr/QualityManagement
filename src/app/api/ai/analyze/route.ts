import { NextResponse } from 'next/server';

// Sahte (Mock) Yapay Zeka Yanıtları
const mockResponses = [
  {
    keywords: ['kalibrasyon', 'makine', 'cihaz', 'ölçüm'],
    rootCause: "Cihazın periyodik bakım takvimi dışına çıkılması ve günlük operatör kontrollerinin yetersizliği.",
    action: "Makinenin acil kalibrasyona gönderilmesi ve bakım formlarına 'Günlük Operatör Kontrolü' satırının eklenerek personelin eğitilmesi."
  },
  {
    keywords: ['eğitim', 'personel', 'hata', 'yanlış', 'eksik'],
    rootCause: "İşe yeni başlayan personelin oryantasyon eğitiminin teorik kalması ve pratik uygulama sınavının yapılmamış olması.",
    action: "İlgili personelin 'İşbaşı Eğitim Formu' üzerinden yeniden eğitilmesi ve tüm yeni personeller için pratik sınav zorunluluğu getirilmesi."
  },
  {
    keywords: ['tedarik', 'malzeme', 'hammadde', 'gecikme', 'tedarikçi'],
    rootCause: "Tedarikçi değerlendirme kriterlerinin güncel olmaması ve alternatif tedarikçi havuzunun dar olması.",
    action: "Tedarikçi performans değerlendirmesinin yapılması ve en az 2 yeni alternatif tedarikçi ile ön sözleşme imzalanması."
  },
  {
    keywords: ['müşteri', 'şikayet', 'iade', 'hasar', 'paket'],
    rootCause: "Paketleme standartlarının yetersizliği ve kargo firmasıyla yapılan SLA (Servis Seviyesi) sözleşmesindeki eksiklikler.",
    action: "Ambalaj malzemesi kalınlığının artırılması ve sevkiyat öncesi 'Son Kontrol' adımı eklenerek fotoğraflı kayıt alınması."
  }
];

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Açıklama gerekli' }, { status: 400 });
    }

    // Yapay Zeka (AI) simülasyonu için 1.5 saniye bekle
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const descLower = description.toLowerCase();
    
    // Kelime eşleştirme mantığı (Basit NLP simülasyonu)
    let bestMatch = null;
    let maxMatches = 0;

    for (const mock of mockResponses) {
      const matchCount = mock.keywords.filter(kw => descLower.includes(kw)).length;
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = mock;
      }
    }

    // Eğer hiçbir kelime eşleşmezse varsayılan, havalı bir jenerik analiz döndür
    if (!bestMatch) {
      bestMatch = {
        rootCause: "İlgili sürecin standart operasyon prosedüründe (SOP) yer alan adımların, saha uygulamasında tam olarak benimsenmemesi.",
        action: "Sürecin risk analizi yapılarak mevcut prosedürün saha gerçeklerine göre revize edilmesi ve çalışanlara tebliğ edilmesi."
      };
    }

    return NextResponse.json({
      rootCause: bestMatch.rootCause,
      action: bestMatch.action
    });

  } catch (error) {
    console.error("AI Analiz Hatası:", error);
    return NextResponse.json({ error: 'Analiz başarısız' }, { status: 500 });
  }
}
