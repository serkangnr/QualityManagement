import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20, // Son 20 bildirimi getir
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Bildirimler çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json(updatedNotification, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Bildirim güncellenirken hata oluştu' }, { status: 500 });
  }
}
