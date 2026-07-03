import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // 1. KPI Verileri
    const openCpaCount = await prisma.cpa.count({
      where: {
        status: {
          in: ['AÇIK', 'İŞLEMDE'],
        },
      },
    });

    const closedCpaCount = await prisma.cpa.count({
      where: {
        status: 'KAPALI',
      },
    });

    const highRiskCount = await prisma.risk.count({
      where: {
        score: {
          gte: 15, // Score 15 and above is considered high risk
        },
      },
    });

    const upcomingAudits = await prisma.audit.count({
      where: {
        status: 'PLANLANDI',
        date: {
          gte: new Date(),
        },
      },
    });

    // 2. Grafik Verileri (Son 6 ayın DÖF açılışları)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // İlk günü

    const recentCpas = await prisma.cpa.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Gruplama
    const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const chartData = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = months[d.getMonth()];
      
      const count = recentCpas.filter(c => {
        const cDate = new Date(c.createdAt);
        return cDate.getMonth() === d.getMonth() && cDate.getFullYear() === d.getFullYear();
      }).length;

      chartData.push({ name: monthLabel, cpa: count });
    }

    // 3. Son Aktiviteler (Son 5 DÖF ve Doküman karıştırılarak)
    const lastDocuments = await prisma.document.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, code: true, createdAt: true },
    });

    const lastCpas = await prisma.cpa.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, source: true, description: true, createdAt: true },
    });

    // Map to unified activity format
    const activities = [
      ...lastDocuments.map(d => ({
        id: `doc-${d.id}`,
        type: 'DOCUMENT',
        title: 'Yeni Doküman Yayınlandı',
        description: `${d.code} - ${d.name} sisteme yüklendi.`,
        date: d.createdAt,
      })),
      ...lastCpas.map(c => ({
        id: `cpa-${c.id}`,
        type: 'CPA',
        title: 'Yeni DÖF Açıldı',
        description: c.description,
        date: c.createdAt,
      }))
    ];

    // Sort by date descending and take top 5
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentActivities = activities.slice(0, 5);

    return NextResponse.json({
      kpis: {
        openCpa: openCpaCount,
        closedCpa: closedCpaCount,
        highRisk: highRiskCount,
        upcomingAudits,
      },
      chartData,
      activities: recentActivities,
    });
  } catch (error) {
    console.error("Dashboard API hatası:", error);
    return NextResponse.json({ error: 'Veriler alınamadı' }, { status: 500 });
  }
}
