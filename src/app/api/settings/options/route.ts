import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Otomatik Seed (Eğer tablo tamamen boşsa varsayılanları ekle)
    const count = await prisma.systemOption.count();
    if (count === 0) {
      const defaultOptions = [
        { category: "DEPARTMENT", value: "AR-GE" },
        { category: "DEPARTMENT", value: "Üretim" },
        { category: "DEPARTMENT", value: "Kalite Kontrol" },
        { category: "DEPARTMENT", value: "Satın Alma" },
        { category: "DEPARTMENT", value: "İnsan Kaynakları" },
        { category: "DEPARTMENT", value: "Bilgi İşlem" },
        { category: "DEPARTMENT", value: "Satış" },
        { category: "DEPARTMENT", value: "Lojistik" },
        { category: "DEPARTMENT", value: "Genel" },
        { category: "DOC_TYPE", value: "Prosedür" },
        { category: "DOC_TYPE", value: "Form" },
        { category: "DOC_TYPE", value: "El Kitabı" },
        { category: "DOC_TYPE", value: "Talimat" },
        { category: "DOC_TYPE", value: "Liste" },
        { category: "CPA_SOURCE", value: "İç Denetim" },
        { category: "CPA_SOURCE", value: "Dış Denetim" },
        { category: "CPA_SOURCE", value: "Müşteri Şikayeti" },
        { category: "CPA_SOURCE", value: "Süreç İçi Kontrol" },
        { category: "CPA_SOURCE", value: "YGG" }
      ];
      await prisma.systemOption.createMany({ data: defaultOptions });
    }

    const options = await prisma.systemOption.findMany({
      where: category ? { category } : undefined,
      orderBy: { value: 'asc' },
    });

    return NextResponse.json(options);
  } catch (error) {
    return NextResponse.json({ error: 'Ayarlar çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, value } = body;

    if (!category || !value) {
      return NextResponse.json({ error: 'Kategori ve değer zorunludur' }, { status: 400 });
    }

    // Check if it already exists to avoid unique constraint error
    const existing = await prisma.systemOption.findFirst({
      where: { category, value }
    });

    if (existing) {
      return NextResponse.json({ error: 'Bu kayıt zaten mevcut' }, { status: 400 });
    }

    const newOption = await prisma.systemOption.create({
      data: { category, value },
    });

    return NextResponse.json(newOption, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Ayar oluşturulurken hata oluştu' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Geçersiz veri (id gerekli)' }, { status: 400 });
    }

    await prisma.systemOption.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Ayar silinirken hata oluştu' }, { status: 500 });
  }
}
