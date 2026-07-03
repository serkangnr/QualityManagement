import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let whereClause = {};

    // Sadece ADMIN'ler taslakları/onay bekleyenleri görebilir. Normal kullanıcılar sadece yayınlananları görür.
    if (session?.user && session.user.role !== 'ADMIN') {
      whereClause = { status: 'YAYINLANDI' };
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        reviewer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Dokümanlar çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

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
        status: session.user.role === 'ADMIN' ? 'YAYINLANDI' : 'ONAY_BEKLİYOR',
        authorId: session.user.id,
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

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: { 
        status,
        reviewerId: session.user.id
      },
    });

    return NextResponse.json(updatedDoc, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Doküman ID eksik' }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Doküman bulunamadı' }, { status: 404 });
    }

    // Role and Time Checks
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = document.authorId === session.user.id;
    
    // 48 hours check
    const docTime = new Date(document.createdAt).getTime();
    const now = Date.now();
    const diffHours = (now - docTime) / (1000 * 60 * 60);
    const isWithin48Hours = diffHours <= 48;

    if (!isAdmin) {
      if (!isOwner) {
        return NextResponse.json({ error: 'Bu dokümanı silme yetkiniz yok.' }, { status: 403 });
      }
      if (!isWithin48Hours) {
        return NextResponse.json({ error: 'Oluşturma üzerinden 48 saat geçtiği için bu kaydı silemezsiniz. Lütfen Bilgi İşlem / Yönetici ile iletişime geçin.' }, { status: 403 });
      }
    }

    // Delete the file if it exists
    if (document.fileUrl) {
      const fileName = document.fileUrl.replace('/uploads/', '');
      const filePath = path.join(process.cwd(), 'public/uploads', fileName);
      try {
        if (fs.existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (err) {
        console.error("Dosya silinemedi:", err);
      }
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}
