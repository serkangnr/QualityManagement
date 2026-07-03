"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  WarningCircle,
  MagnifyingGlass,
  TrendUp,
  Users,
  Target,
  FileText,
  SquaresFour,
  SignOut,
  Gear,
} from "@phosphor-icons/react";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const navGroups = [
    {
      title: "Genel Yönetim",
      items: [
        { href: "/", icon: <SquaresFour size={22} />, label: "Dashboard" },
        { href: "/documents", icon: <FileText size={22} />, label: "Doküman Kontrolü" },
      ],
    },
    {
      title: "ISO 9001: Kalite",
      items: [
        { href: "/cpa", icon: <WarningCircle size={22} />, label: "DÖF Yönetimi" },
        { href: "/audits", icon: <MagnifyingGlass size={22} />, label: "İç Denetimler" },
        { href: "/risks", icon: <TrendUp size={22} />, label: "Risk ve Fırsatlar" },
        { href: "/customer", icon: <Users size={22} />, label: "Müşteri İletişimi" },
        { href: "/objectives", icon: <Target size={22} />, label: "Kalite Hedefleri" },
      ],
    },
    {
      title: "Sistem",
      items: [
        { href: "/settings", icon: <Gear size={22} />, label: "Admin Ayarları" },
      ],
    },
  ];

  return (
    <aside className="w-[var(--sidebar-width)] h-screen flex flex-col bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border-glass)] shrink-0 z-20 transition-all duration-300">
      {/* Logo Area */}
      <div className="h-[72px] flex items-center px-6 border-b border-[var(--color-border-glass)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <ShieldCheck size={26} weight="fill" className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-brand-700 dark:text-brand-500 leading-tight">
              BLADECO
            </h1>
            <p className="text-[0.65rem] uppercase tracking-wider text-slate-500 font-semibold">
              Kalite Yönetimi
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
              {group.title}
            </span>
            {group.items.map((item, itemIdx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={itemIdx}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                    isActive
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile / Footer */}
      <div className="p-4 border-t border-[var(--color-border-glass)]">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative z-50">
          <img
            src="https://ui-avatars.com/api/?name=Serkan+Guner&background=random"
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">Serkan Güner</p>
            <p className="text-xs text-slate-500 truncate">Yönetim Temsilcisi</p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
            <button className="text-slate-400 hover:text-red-500 transition-colors p-1">
              <SignOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
