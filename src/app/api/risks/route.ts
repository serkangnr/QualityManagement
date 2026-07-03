import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const risks = await prisma.risk.findMany({
      orderBy: { score: 'desc' },
    });
    return NextResponse.json(risks);
  } catch (error) {
    return NextResponse.json({ error: 'Risk verileri çekilirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, process, description, score } = body;

    if (!code || !process || !description || !score) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    const newRisk = await prisma.risk.create({
      data: {
        code,
        process,
        description,
        score: parseInt(score, 10),
      },
    });

    return NextResponse.json(newRisk, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu risk kodu (code) zaten kullanılıyor' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Risk oluşturulurken hata oluştu' }, { status: 500 });
  }
}
