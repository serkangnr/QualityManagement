import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(complaints);
  } catch (error) {
    return NextResponse.json({ error: 'Müşteri bildirimleri çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, description } = body;

    if (!customer || !description) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    const newComplaint = await prisma.complaint.create({
      data: {
        customer,
        description,
        status: 'YENİ',
      },
    });

    return NextResponse.json(newComplaint, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Bildirim oluşturulurken hata oluştu' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedComplaint, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Durum güncellenirken hata oluştu' }, { status: 500 });
  }
}
