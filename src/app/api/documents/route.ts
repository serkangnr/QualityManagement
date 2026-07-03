import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Dokümanlar çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const revision = formData.get('revision') as string;
    const publishDate = formData.get('publishDate') as string;
    const file = formData.get('file') as File | null;

    if (!code || !name || !type) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    let fileUrl = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Benzersiz dosya ismi oluştur
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
    }

    const newDoc = await prisma.document.create({
      data: {
        code,
        name,
        type,
        revision: revision || 'Rev 00',
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        fileUrl,
      },
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu doküman kodu zaten kullanılıyor' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Doküman kaydedilirken hata oluştu' }, { status: 500 });
  }
}
