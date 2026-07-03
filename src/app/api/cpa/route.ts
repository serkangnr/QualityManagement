import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let whereClause = {};

    // Eğer ADMIN veya AUDITOR değilse ve departmanı varsa sadece kendi departmanını görsün
    if (session?.user && session.user.role === 'USER' && session.user.department) {
      whereClause = { department: session.user.department };
    }

    const cpas = await prisma.cpa.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(cpas);
  } catch (error) {
    return NextResponse.json({ error: 'Veri çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.source || !body.department || !body.description) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    const newCpa = await prisma.cpa.create({
      data: {
        source: body.source,
        department: body.department,
        description: body.description,
        rootCause: body.rootCause || null,
        actionPlan: body.actionPlan || null,
        status: body.status || "AÇIK",
        assigneeId: body.assigneeId || null,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(newCpa, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt oluşturulamadı' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, resolutionNote } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'DÖF ID ve Durum zorunludur' }, { status: 400 });
    }

    const updatedCpa = await prisma.cpa.update({
      where: { id },
      data: {
        status,
        resolutionNote: resolutionNote !== undefined ? resolutionNote : undefined,
      }
    });

    return NextResponse.json(updatedCpa, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Durum güncellenemedi' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID eksik' }, { status: 400 });
    }

    const record = await prisma.cpa.findUnique({ where: { id } });

    if (!record) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = record.authorId === session.user.id;
    
    const docTime = new Date(record.createdAt).getTime();
    const now = Date.now();
    const diffHours = (now - docTime) / (1000 * 60 * 60);
    const isWithin48Hours = diffHours <= 48;

    if (!isAdmin) {
      if (!isOwner) {
        return NextResponse.json({ error: 'Bu kaydı silme yetkiniz yok.' }, { status: 403 });
      }
      if (!isWithin48Hours) {
        return NextResponse.json({ error: 'Oluşturma üzerinden 48 saat geçtiği için bu kaydı silemezsiniz. Lütfen Yönetici ile iletişime geçin.' }, { status: 403 });
      }
    }

    await prisma.cpa.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}
