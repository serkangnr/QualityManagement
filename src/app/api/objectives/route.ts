import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const objectives = await prisma.objective.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(objectives);
  } catch (error) {
    return NextResponse.json({ error: 'Hedefler çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, targetValue, actualValue } = body;

    if (!title || targetValue === undefined) {
      return NextResponse.json({ error: 'Başlık ve Hedef Değer zorunludur' }, { status: 400 });
    }

    const newObjective = await prisma.objective.create({
      data: {
        title,
        targetValue: parseFloat(targetValue),
        actualValue: actualValue ? parseFloat(actualValue) : 0,
      },
    });

    return NextResponse.json(newObjective, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Hedef oluşturulurken hata oluştu' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, actualValue } = body;

    if (!id || actualValue === undefined) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
    }

    const updatedObjective = await prisma.objective.update({
      where: { id },
      data: { actualValue: parseFloat(actualValue) },
    });

    return NextResponse.json(updatedObjective, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Hedef güncellenirken hata oluştu' }, { status: 500 });
  }
}
