import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const audits = await prisma.audit.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(audits);
  } catch (error) {
    return NextResponse.json({ error: 'Denetimler çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
