"use client";

import { useState, useEffect } from "react";
import { Plus, X, Target, PencilSimple } from "@phosphor-icons/react";

interface Objective {
  id: string;
  title: string;
  targetValue: number;
  actualValue: number;
  createdAt: string;
}

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  
  // Form States
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState<number | "">("");
  const [actualValue, setActualValue] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      const res = await fetch("/api/objectives");
      if (res.ok) {
        const data = await res.json();
        setObjectives(data);
      }
    } catch (error) {
      console.error("Hedef verileri çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          targetValue: Number(targetValue), 
          actualValue: Number(actualValue || 0) 
        }),
      });
      
      if (res.ok) {
        setTitle("");
        setTargetValue("");
        setActualValue("");
        setIsModalOpen(false);
        fetchObjectives();
      }
    } catch (error) {
      console.error("Hedef kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObjective) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/objectives", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedObjective.id, 
          actualValue: Number(actualValue) 
        }),
      });
      
      if (res.ok) {
        setActualValue("");
        setSelectedObjective(null);
        setIsUpdateModalOpen(false);
        fetchObjectives();
      }
    } catch (error) {
      console.error("Hedef güncellenemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUpdateModal = (obj: Objective) => {
    setSelectedObjective(obj);
    setActualValue(obj.actualValue);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Kalite Hedefleri
          </h1>
          <p className="text-slate-500 mt-1">Stratejik Kalite Hedefleri ve İlerleme Takibi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Plus size={20} weight="bold" />
          Yeni Hedef Belirle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Yükleniyor...</div>
        ) : objectives.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Henüz tanımlanmış bir kalite hedefi bulunmuyor.
          </div>
        ) : (
          objectives.map((obj) => {
            const percentage = Math.min(100, Math.round((obj.actualValue / obj.targetValue) * 100));
            const isCompleted = percentage >= 100;
            
            // Progress bar rengi (Duruma göre)
            let progressColor = "bg-brand-500";
            if (percentage >= 100) progressColor = "bg-emerald-500";
            else if (percentage < 30) progressColor = "bg-red-500";
            else if (percentage < 60) progressColor = "bg-amber-500";

            return (
              <div key={obj.id} className="glass-panel rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'}`}>
                      <Target size={24} weight="fill" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {obj.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => openUpdateModal(obj)}
                    className="text-slate-400 hover:text-brand-600 transition-colors p-2 bg-slate-50 hover:bg-brand-50 dark:bg-slate-800/50 dark:hover:bg-brand-900/30 rounded-lg shrink-0"
                    title="Gerçekleşen Değeri Güncelle"
                  >
                    <PencilSimple size={18} weight="bold" />
                  </button>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gerçekleşen / Hedef</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        <span className={`text-xl ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{obj.actualValue}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-sm">{obj.targetValue}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        %{percentage}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* YENİ HEDEF MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Target className="text-brand-500" /> Yeni Hedef Ekle
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hedef Tanımı</label>
                <input 
                  required
                  type="text"
                  placeholder="Örn: Müşteri Şikayetlerini %20 Azaltmak"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hedef Değer</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    placeholder="Örn: 100"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Şu Anki Durum (İsteğe Bağlı)</label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="Örn: 0"
                    value={actualValue}
                    onChange={(e) => setActualValue(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
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
                  {isSubmitting ? 'Kaydediliyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GÜNCELLEME MODALI */}
      {isUpdateModalOpen && selectedObjective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">İlerlemeyi Güncelle</h2>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-4">
              <div className="text-sm text-slate-500 mb-2">
                Hedef: <strong className="text-slate-800 dark:text-slate-200">{selectedObjective.title}</strong>
                <br/>(Hedeflenen Değer: {selectedObjective.targetValue})
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Yeni Gerçekleşen Değer</label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  value={actualValue}
                  onChange={(e) => setActualValue(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-lg font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium transition-colors w-full"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
