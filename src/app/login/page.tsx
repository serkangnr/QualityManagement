"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LockKey, Phone } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Remove whitespace from phone
    const cleanPhone = phone.replace(/\s+/g, '');

    try {
      const res = await signIn("credentials", {
        redirect: false,
        phone: cleanPhone,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone number automatically (e.g. 555 123 45 67)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0")) val = val.substring(1);
    
    // Auto format
    let formatted = val;
    if (val.length > 3 && val.length <= 6) {
      formatted = `${val.slice(0, 3)} ${val.slice(3)}`;
    } else if (val.length > 6 && val.length <= 8) {
      formatted = `${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6)}`;
    } else if (val.length > 8) {
      formatted = `${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6, 8)} ${val.slice(8, 10)}`;
    }
    
    setPhone(formatted);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4">
            <ShieldCheck size={36} weight="duotone" className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bladeco QMS
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center">
            Kalite Yönetim Sistemine giriş yapmak için<br />bilgilerinizi girin.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 bg-white/70 dark:bg-slate-900/70">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm font-medium border border-red-100 dark:border-red-800/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Telefon Numarası
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 pr-3 border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 rounded-l-xl text-slate-500 font-semibold text-sm">
                  <Phone size={18} className="mr-1.5" />
                  +90
                </div>
                <input 
                  type="tel"
                  required
                  placeholder="555 123 45 67"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl pl-[90px] pr-4 py-3.5 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-lg tracking-wide"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Şifre
              </label>
              <div className="relative">
                <LockKey size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || phone.length < 10}
              className="mt-2 w-full bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-bold text-lg py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-slate-400 text-xs mt-8">
          Sisteme sadece yetkili personel giriş yapabilir.<br/>
          Hesabınız yoksa yöneticinize başvurun.
        </p>

      </div>
    </div>
  );
}
