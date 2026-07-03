"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  WarningCircle, 
  TrendUp, 
  CheckCircle,
  Clock,
  MagnifyingGlass,
  FileText
} from "@phosphor-icons/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Dashboard verisi alınamadı", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} dk önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else {
      return `${Math.floor(diffHours / 24)} gün önce`;
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Merhaba, {session?.user?.name?.split(' ')[0] || "Yönetici"} 👋
          </h1>
          <p className="text-slate-500 mt-1">BLADECO Kalite Yönetim Sistemi Genel Durumu</p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md dark:bg-slate-800/50 px-4 py-2 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          <Clock size={20} className="text-brand-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 font-medium">Veriler yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Link href="/cpa" className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/5 rounded-full blur-2xl group-hover:bg-red-200/50 transition-colors duration-500" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner">
                  <WarningCircle size={32} weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Açık DÖF</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{data?.kpis?.openCpa || 0}</h3>
                </div>
              </div>
            </Link>

            <Link href="/risks" className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/5 rounded-full blur-2xl group-hover:bg-amber-200/50 transition-colors duration-500" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                  <TrendUp size={32} weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Yüksek Riskler</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{data?.kpis?.highRisk || 0}</h3>
                </div>
              </div>
            </Link>

            <Link href="/audits" className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-900/5 rounded-full blur-2xl group-hover:bg-brand-200/50 transition-colors duration-500" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-inner">
                  <MagnifyingGlass size={32} weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Yaklaşan Denetim</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{data?.kpis?.upcomingAudits || 0}</h3>
                </div>
              </div>
            </Link>

            <Link href="/cpa" className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/5 rounded-full blur-2xl group-hover:bg-emerald-200/50 transition-colors duration-500" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <CheckCircle size={32} weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Kapatılan DÖF</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{data?.kpis?.closedCpa || 0}</h3>
                </div>
              </div>
            </Link>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            
            {/* Grafikler */}
            <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/20 dark:shadow-none">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">DÖF Trendi</h3>
                  <p className="text-sm text-slate-500 mt-1">Son 6 ayda açılan uygunsuzluk kayıtları</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                {data?.chartData && data.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 600 }} 
                      />
                      <Bar 
                        dataKey="cpa" 
                        name="Açılan DÖF" 
                        fill="#3b82f6" 
                        radius={[6, 6, 0, 0]} 
                        barSize={32}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">Yeterli veri yok</div>
                )}
              </div>
            </div>

            {/* Son Aktiviteler */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/20 dark:shadow-none flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Son Aktiviteler</h3>
              </div>
              <div className="flex flex-col gap-6 relative flex-1">
                {/* Timeline Line */}
                <div className="absolute left-6 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/50"></div>
                
                {data?.activities && data.activities.length > 0 ? (
                  data.activities.map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-5 relative z-10 group">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white dark:border-slate-800 transition-transform group-hover:scale-110 ${
                        activity.type === 'DOCUMENT' 
                          ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 dark:from-blue-900/40 dark:to-blue-900/10 dark:text-blue-400' 
                          : 'bg-gradient-to-br from-red-100 to-red-50 text-red-600 dark:from-red-900/40 dark:to-red-900/10 dark:text-red-400'
                      }`}>
                        {activity.type === 'DOCUMENT' ? <FileText size={22} weight="fill" /> : <WarningCircle size={22} weight="fill" />}
                      </div>
                      <div className="flex flex-col justify-center pt-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{activity.title}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">{activity.description}</p>
                        <span className="text-[11px] font-bold text-slate-400 mt-2 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-0.5 rounded-md">
                          {timeAgo(activity.date)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">Henüz aktivite bulunmuyor.</div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
