import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cpas = await prisma.cpa.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(cpas);
  } catch (error) {
    return NextResponse.json({ error: 'Veri çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source, department, description } = body;

    if (!source || !department || !description) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    const newCpa = await prisma.cpa.create({
      data: {
        source,
        department,
        description,
        status: 'AÇIK'
      },
    });

    return NextResponse.json(newCpa, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt oluşturulurken hata oluştu' }, { status: 500 });
  }
}
