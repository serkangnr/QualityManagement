"use client";

import { useState, useEffect } from "react";
import { Plus, X, MagnifyingGlass, CalendarBlank, User, ArrowRight } from "@phosphor-icons/react";

interface Audit {
  id: string;
  title: string;
  date: string;
  auditor: string;
  department: string;
  status: string; // PLANLANDI, DEVAM_EDİYOR, TAMAMLANDI
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form States
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [auditor, setAuditor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);



  const fetchAudits = async () => {
    try {
      const res = await fetch("/api/audits");
      if (res.ok) {
        const data = await res.json();
        setAudits(data);
      }
    } catch (error) {
      console.error("Denetim verileri çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/settings/options?category=DEPARTMENT");
      if (res.ok) {
        const data = await res.json();
        setDepartmentOptions(data.map((d: any) => d.value));
      }
    } catch (error) {
      console.error("Departmanlar yüklenemedi", error);
    }
  };

  useEffect(() => {
    fetchAudits();
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, department, date, auditor }),
      });
      
      if (res.ok) {
        setTitle("");
        setDepartment("");
        setDate("");
        setAuditor("");
        setIsModalOpen(false);
        fetchAudits();
      }
    } catch (error) {
      console.error("Denetim kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveAudit = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/audits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchAudits(); // Refresh data
      }
    } catch (error) {
      console.error("Denetim durumu güncellenemedi", error);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("auditId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Drop yapabilmek için gerekli
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("auditId");
    if (!id) return;
    
    const audit = audits.find(a => a.id === id);
    if (audit && audit.status !== newStatus) {
      // Optimistic UI update for instant feedback
      setAudits(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      await moveAudit(id, newStatus);
    }
  };

  const renderKanbanColumn = (status: string, title: string, colorClass: string) => {
    const columnAudits = audits.filter(a => a.status === status);
    
    return (
      <div 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
        className="flex flex-col flex-1 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 h-[calc(100vh-220px)] overflow-y-auto transition-colors"
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colorClass}`} />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          </div>
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">
            {columnAudits.length}
          </span>
        </div>
        
        <div className="flex flex-col gap-3 min-h-[100px]">
          {columnAudits.map(audit => (
            <div 
              key={audit.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, audit.id)}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing"
            >
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{audit.title}</h4>
              <div className="flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400 mb-2">
                <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800">
                  {audit.department}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <CalendarBlank size={14} />
                <span>{new Date(audit.date).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <User size={14} />
                <span>{audit.auditor}</span>
              </div>
            </div>
          ))}
          
          {columnAudits.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              Kayıt bulunmuyor
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            İç Denetimler
          </h1>
          <p className="text-slate-500 mt-1">Yıllık İç Denetim Planlaması ve Süreç Takibi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Plus size={20} weight="bold" />
          Denetim Planla
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">Yükleniyor...</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-x-auto pb-4">
          {renderKanbanColumn("PLANLANDI", "Planlandı", "bg-slate-400")}
          {renderKanbanColumn("DEVAM_EDİYOR", "Devam Ediyor", "bg-amber-400")}
          {renderKanbanColumn("TAMAMLANDI", "Tamamlandı", "bg-emerald-400")}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Yeni Denetim Planla</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Denetim Konusu</label>
                  <input 
                    required
                    type="text"
                    placeholder="Örn: Süreç Denetimi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Departman</label>
                  <select 
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="">Seçiniz...</option>
                    {departmentOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Baş Denetçi</label>
                <input 
                  required
                  type="text"
                  placeholder="Denetçi adını girin..."
                  value={auditor}
                  onChange={(e) => setAuditor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Planlanan Tarih</label>
                <input 
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
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
                  {isSubmitting ? 'Kaydediliyor...' : 'Planı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
