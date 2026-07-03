"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle } from "@phosphor-icons/react";

interface Notification {
  id: string;
  message: string;
  targetDepartment: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Bildirimler yüklenemedi", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 10 seconds for demo purposes
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error("Bildirim okundu işaretlenemedi", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
      >
        <Bell size={22} weight={unreadCount > 0 ? "fill" : "regular"} className={unreadCount > 0 ? "text-brand-500" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Bildirimler</h3>
            {unreadCount > 0 && (
              <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} Yeni
              </span>
            )}
          </div>
          
          <div className="max-h-[350px] overflow-y-auto flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Henüz bildiriminiz yok.
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-slate-100 dark:border-slate-800/50 transition-colors flex gap-3 group ${notification.isRead ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-brand-50/30 dark:bg-brand-900/10 hover:bg-brand-50/60 dark:hover:bg-brand-900/20'}`}
                >
                  <div className="mt-0.5">
                    {!notification.isRead ? (
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(var(--color-brand-500),0.5)]" />
                    ) : (
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      {!notification.isRead && (
                        <button 
                          onClick={(e) => markAsRead(notification.id, e)}
                          className="text-xs text-brand-600 dark:text-brand-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline"
                        >
                          <CheckCircle size={14} /> Okundu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
