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

    const audits = await prisma.audit.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(audits);
  } catch (error) {
    return NextResponse.json({ error: 'Denetimler çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const { title, department, date, auditor } = body;

    if (!title || !date || !auditor || !department) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    const newAudit = await prisma.audit.create({
      data: {
        title,
        department,
        date: new Date(date),
        auditor,
        status: 'PLANLANDI',
        authorId: session.user.id,
      },
    });

    // Create a notification for the newly planned audit
    const formattedDate = new Date(date).toLocaleDateString('tr-TR');
    await prisma.notification.create({
      data: {
        message: `${formattedDate} tarihinde ${department} birimi için "${title}" iç denetimi planlanmıştır. Denetçi: ${auditor}`,
        targetDepartment: department,
      },
    });

    return NextResponse.json(newAudit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Denetim oluşturulurken hata oluştu' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
    }

    const updatedAudit = await prisma.audit.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedAudit, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Denetim güncellenirken hata oluştu' }, { status: 500 });
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

    const record = await prisma.audit.findUnique({ where: { id } });

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

    await prisma.audit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}
