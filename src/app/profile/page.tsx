"use client";

import { useState } from "react";
import { User, LockKey, Phone } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  
  const [phone, setPhone] = useState(session?.user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Profiliniz başarıyla güncellendi.", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        if (phone !== session?.user?.phone) {
           update(); // Refresh session data
        }
      } else {
        setMessage({ text: data.error || "Güncelleme başarısız.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Bir hata oluştu.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/30">
            <User size={28} weight="fill" />
          </div>
          Profil Ayarları
        </h1>
        <p className="text-slate-500 mt-2">Kişisel bilgilerinizi ve şifrenizi buradan güncelleyebilirsiniz.</p>
      </header>

      <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 lg:p-8">
        
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">İsim Soyisim</label>
            <div className="relative">
              <input
                type="text"
                value={session.user?.name || ""}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl px-11 py-3 outline-none cursor-not-allowed"
              />
              <User size={20} className="absolute left-4 top-3.5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">İsim değişikliği için yöneticinizle iletişime geçin.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telefon Numarası</label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="5550000000"
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-11 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
              <Phone size={20} className="absolute left-4 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Şifre Değiştirme</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mevcut Şifre</label>
                <div className="relative">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Mevcut şifreniz"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-11 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                  <LockKey size={20} className="absolute left-4 top-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Yeni Şifre</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yeni şifreniz"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-11 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                  <LockKey size={20} className="absolute left-4 top-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || (currentPassword.length > 0 && newPassword.length === 0)}
              className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Kaydet"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
