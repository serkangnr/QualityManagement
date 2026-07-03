import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { nextCalibrationDate: 'asc' },
    });
    return NextResponse.json(devices);
  } catch (error) {
    return NextResponse.json({ error: 'Cihazlar çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const { name, serialNo, calibrationDate, nextCalibrationDate, status } = body;

    if (!name || !calibrationDate || !nextCalibrationDate) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    const newDevice = await prisma.device.create({
      data: {
        name,
        serialNo,
        calibrationDate: new Date(calibrationDate),
        nextCalibrationDate: new Date(nextCalibrationDate),
        status: status || 'AKTİF',
        authorId: session.user.id,
      },
    });

    return NextResponse.json(newDevice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt oluşturulamadı' }, { status: 500 });
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
    
    // Yalnızca adminler silebilir
    if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Bu kaydı silme yetkiniz yok.' }, { status: 403 });
    }

    await prisma.device.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}
