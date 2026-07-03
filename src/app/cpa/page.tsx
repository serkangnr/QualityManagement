"use client";

import { useState, useEffect } from "react";
import { Plus, X, WarningCircle, CheckCircle, Clock } from "@phosphor-icons/react";

interface Cpa {
  id: string;
  source: string;
  department: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function CpaPage() {
  const [cpas, setCpas] = useState<Cpa[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form States
  const [source, setSource] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchCpas();
    fetchOptions();
  }, []);

  const fetchCpas = async () => {
    try {
      const res = await fetch("/api/cpa");
      if (res.ok) {
        const data = await res.json();
        setCpas(data);
      }
    } catch (error) {
      console.error("DÖF verileri çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [sourceRes, deptRes] = await Promise.all([
        fetch("/api/settings/options?category=CPA_SOURCE"),
        fetch("/api/settings/options?category=DEPARTMENT")
      ]);
      if (sourceRes.ok) {
        const data = await sourceRes.json();
        setSourceOptions(data.map((d: any) => d.value));
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartmentOptions(data.map((d: any) => d.value));
      }
    } catch (error) {
      console.error("Ayarlar çekilemedi:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/cpa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, department, description }),
      });
      
      if (res.ok) {
        setSource("");
        setDepartment("");
        setDescription("");
        setIsModalOpen(false);
        fetchCpas(); // Listeyi yenile
      }
    } catch (error) {
      console.error("DÖF kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AÇIK":
        return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold border border-red-200"><WarningCircle size={14} weight="bold" /> AÇIK</span>;
      case "İŞLEMDE":
        return <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200"><Clock size={14} weight="bold" /> İŞLEMDE</span>;
      case "KAPALI":
        return <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200"><CheckCircle size={14} weight="bold" /> KAPALI</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">{status}</span>;
    }
  };

  const [activeTab, setActiveTab] = useState("Hepsi");
  const cpaStatuses = ["Hepsi", "AÇIK", "İŞLEMDE", "KAPALI"];

  const filteredCpas = cpas.filter(cpa => 
    activeTab === "Hepsi" || cpa.status === activeTab
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            DÖF Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Düzeltici ve Önleyici Faaliyet (Uygunsuzluk) Takibi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Plus size={20} weight="bold" />
          Yeni DÖF Kaydı
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {cpaStatuses.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-brand-500 text-white shadow-sm" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-[var(--color-border-glass)]">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tarih</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kaynak</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Departman</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Uygunsuzluk Tanımı</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              ) : filteredCpas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Bu kategoriye ait kayıt bulunmuyor.</td>
                </tr>
              ) : (
                filteredCpas.map((cpa) => (
                  <tr key={cpa.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {new Date(cpa.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                      {cpa.source}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {cpa.department}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-md truncate">
                      {cpa.description}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(cpa.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Yeni DÖF Bildirimi</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Uygunsuzluk Kaynağı</label>
                <select 
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                >
                  <option value="">Seçiniz...</option>
                  {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sorumlu Departman</label>
                <select 
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                >
                  <option value="">Seçiniz...</option>
                  {departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Uygunsuzluk Tanımı</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Uygunsuzluğu detaylı bir şekilde açıklayın..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
