"use client";

import { useState, useEffect } from "react";
import { Plus, X, ShieldWarning, ChartBar, CheckCircle } from "@phosphor-icons/react";

interface Risk {
  id: string;
  code: string;
  process: string;
  description: string;
  score: number;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form States
  const [code, setCode] = useState("");
  const [process, setProcess] = useState("");
  const [description, setDescription] = useState("");
  const [probability, setProbability] = useState<number>(1);
  const [impact, setImpact] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchRisks();
    fetchOptions();
  }, []);

  const fetchRisks = async () => {
    try {
      const res = await fetch("/api/risks");
      if (res.ok) {
        const data = await res.json();
        setRisks(data);
      }
    } catch (error) {
      console.error("Risk verileri çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await fetch("/api/settings/options?category=DEPARTMENT");
      if (res.ok) {
        const data = await res.json();
        setDepartmentOptions(data.map((d: any) => d.value));
      }
    } catch (error) {
      console.error("Departmanlar yüklenemedi:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const calculatedScore = probability * impact;

    try {
      const res = await fetch("/api/risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code, 
          process, 
          description, 
          score: calculatedScore 
        }),
      });
      
      if (res.ok) {
        setCode("");
        setProcess("");
        setDescription("");
        setProbability(1);
        setImpact(1);
        setIsModalOpen(false);
        fetchRisks();
      } else {
        const errorData = await res.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error("Risk kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 15) return { label: "Kabul Edilemez", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" };
    if (score >= 9) return { label: "Yüksek", color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" };
    if (score >= 4) return { label: "Orta", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" };
    return { label: "Düşük", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" };
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Risk ve Fırsatlar Matrisi
          </h1>
          <p className="text-slate-500 mt-1">Süreç Bazlı Risk Değerlendirmesi ve Skorlaması</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Plus size={20} weight="bold" />
          Yeni Risk Değerlendir
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-red-500">{risks.filter(r => r.score >= 15).length}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase mt-1">Kabul Edilemez</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-orange-500">{risks.filter(r => r.score >= 9 && r.score < 15).length}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase mt-1">Yüksek Risk</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-amber-500">{risks.filter(r => r.score >= 4 && r.score < 9).length}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase mt-1">Orta Risk</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-emerald-500">{risks.filter(r => r.score < 4).length}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase mt-1">Düşük Risk</span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-[var(--color-border-glass)]">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kod</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">İlgili Süreç</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk / Fırsat Tanımı</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Skor</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Seviye</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              ) : risks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Sistemde kayıtlı risk değerlendirmesi bulunmuyor.</td>
                </tr>
              ) : (
                risks.map((risk) => {
                  const level = getRiskLevel(risk.score);
                  return (
                    <tr key={risk.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                        {risk.code}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                        {risk.process}
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-md">
                        {risk.description}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm border border-slate-200 dark:border-slate-700">
                          {risk.score}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${level.color}`}>
                          {level.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
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
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldWarning className="text-brand-500" /> Yeni Risk Değerlendirmesi
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Risk Kodu</label>
                  <input 
                    required
                    type="text"
                    placeholder="Örn: RSK-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">İlgili Süreç</label>
                  <select 
                    required
                    value={process}
                    onChange={(e) => setProcess(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="">Seçiniz...</option>
                    {departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Risk/Fırsat Tanımı</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Meydana gelebilecek olası durumu açıklayın..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Olasılık (1-5)</label>
                  <select 
                    required
                    value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none text-sm"
                  >
                    <option value={1}>1 - Çok Düşük</option>
                    <option value={2}>2 - Düşük</option>
                    <option value={3}>3 - Orta</option>
                    <option value={4}>4 - Yüksek</option>
                    <option value={5}>5 - Çok Yüksek</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Şiddet (1-5)</label>
                  <select 
                    required
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none text-sm"
                  >
                    <option value={1}>1 - İhmal Edilebilir</option>
                    <option value={2}>2 - Hafif</option>
                    <option value={3}>3 - Orta</option>
                    <option value={4}>4 - Ciddi</option>
                    <option value={5}>5 - Felaket</option>
                  </select>
                </div>
                
                <div className="col-span-2 mt-2 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Hesaplanan Risk Skoru:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">{probability * impact}</span>
                    <span className="text-xs text-slate-500">/ 25</span>
                  </div>
                </div>
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
                  {isSubmitting ? 'Kaydediliyor...' : 'Riski Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
