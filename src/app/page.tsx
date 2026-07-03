"use client";

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

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Sistem Özeti
          </h1>
          <p className="text-slate-500 mt-1">BLADECO Kalite Yönetim Sistemi Genel Durumu</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <Clock size={20} className="text-brand-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full blur-2xl group-hover:bg-red-200 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <WarningCircle size={28} weight="fill" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Açık DÖF</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">12</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full blur-2xl group-hover:bg-amber-200 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <TrendUp size={28} weight="fill" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Yüksek Riskler</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">5</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-100 dark:bg-brand-900/20 rounded-full blur-2xl group-hover:bg-brand-200 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <MagnifyingGlass size={28} weight="fill" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Yaklaşan Denetim</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">2</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-2xl group-hover:bg-emerald-200 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={28} weight="fill" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Kapatılan DÖF</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">48</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Son Aktiviteler */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Son Aktiviteler</h3>
            <button className="text-sm font-medium text-brand-600 hover:text-brand-700">Tümünü Gör</button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                <FileText size={20} weight="fill" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Yeni Doküman Yayınlandı</p>
                <p className="text-xs text-slate-500 mt-0.5">PR-001 Kalite El Kitabı (Rev 05) sisteme eklendi.</p>
              </div>
              <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">2 saat önce</span>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                <WarningCircle size={20} weight="fill" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Yeni DÖF Açıldı</p>
                <p className="text-xs text-slate-500 mt-0.5">Üretim bandı 3 için kalibrasyon uygunsuzluğu bildirildi.</p>
              </div>
              <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">5 saat önce</span>
            </div>
          </div>
        </div>

        {/* Hızlı Aksiyonlar */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/cpa" className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                <WarningCircle size={24} weight="fill" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Yeni DÖF Bildir</span>
            </Link>
            <Link href="/audits" className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} weight="fill" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Denetim Planla</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
