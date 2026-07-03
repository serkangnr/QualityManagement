"use client";

import { useState, useEffect } from "react";
import { Plus, X, WarningCircle, CheckCircle, Clock, Trash, DownloadSimple } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { pdf } from '@react-pdf/renderer';
import { CpaDocument } from '@/components/pdf/CpaDocument';

interface Cpa {
  id: string;
  source: string;
  department: string;
  description: string;
  rootCause?: string;
  actionPlan?: string;
  status: string;
  resolutionNote?: string;
  createdAt: string;
  authorId?: string;
  assigneeId?: string;
  targetDate?: string;
  assignee?: { name: string };
}

export default function CpaPage() {
  const [cpas, setCpas] = useState<Cpa[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCpa, setSelectedCpa] = useState<Cpa | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateResolutionNote, setUpdateResolutionNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const user = session?.user as any;
  
  // Form States
  const [source, setSource] = useState("İç Denetim");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchCpas();
    fetchOptions();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Kullanıcılar çekilemedi:", error);
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
        body: JSON.stringify({ source, department, description, rootCause, actionPlan, assigneeId, targetDate }),
      });
      
      if (res.ok) {
        setSource("İç Denetim");
        setDepartment("");
        setDescription("");
        setRootCause("");
        setActionPlan("");
        setAssigneeId("");
        setTargetDate("");
        setIsModalOpen(false);
        fetchCpas(); 
      }
    } catch (error) {
      console.error("DÖF kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiAnalyze = async () => {
    if (!description.trim()) {
      alert("Lütfen analiz için önce uygunsuzluk tanımını doldurun.");
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        const data = await res.json();
        setRootCause(data.rootCause);
        setActionPlan(data.action);
      } else {
        alert("AI analizi başarısız oldu.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDownloadPdf = async (cpa: Cpa) => {
    try {
      const blob = await pdf(<CpaDocument cpa={cpa} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DOF_${cpa.id.substring(0,8).toUpperCase()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF oluşturulurken hata:", error);
      alert("PDF oluşturulamadı.");
    }
  };

  const handleOpenUpdateModal = (cpa: Cpa) => {
    setSelectedCpa(cpa);
    setUpdateStatus(cpa.status);
    setUpdateResolutionNote(cpa.resolutionNote || "");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCpa) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/cpa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedCpa.id, 
          status: updateStatus, 
          resolutionNote: updateResolutionNote 
        }),
      });
      
      if (res.ok) {
        setIsUpdateModalOpen(false);
        setSelectedCpa(null);
        fetchCpas();
      } else {
        alert("Güncelleme başarısız.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kaydı kalıcı olarak silmek istediğinize emin misiniz? (Bu işlem geri alınamaz)")) {
      return;
    }

    try {
      const res = await fetch(`/api/cpa?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCpas();
      } else {
        const data = await res.json();
        alert(data.error || "Silme işlemi başarısız.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
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
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              ) : filteredCpas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Bu kategoriye ait kayıt bulunmuyor.</td>
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
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-sm truncate">
                      <strong>Tanım:</strong> {cpa.description}
                      {(cpa.rootCause || cpa.actionPlan || cpa.assignee) && (
                        <div className="mt-2 pl-3 border-l-2 border-brand-300 dark:border-brand-700 bg-slate-50/50 dark:bg-slate-800/30 py-1.5 px-2 rounded-r">
                          {cpa.rootCause && <p className="text-xs mb-1"><span className="font-semibold text-brand-600 dark:text-brand-400">Kök Neden:</span> {cpa.rootCause}</p>}
                          {cpa.actionPlan && <p className="text-xs"><span className="font-semibold text-emerald-600 dark:text-emerald-400">Aksiyon:</span> {cpa.actionPlan}</p>}
                          {(cpa.assignee || cpa.targetDate) && (
                            <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                              {cpa.assignee && <span className="text-xs text-slate-500">🧑‍💻 Sorumlu: <b>{cpa.assignee.name}</b></span>}
                              {cpa.targetDate && <span className="text-xs text-slate-500">📅 Termin: <b>{new Date(cpa.targetDate).toLocaleDateString('tr-TR')}</b></span>}
                            </div>
                          )}
                        </div>
                      )}
                      {cpa.resolutionNote && (
                        <div className="mt-2 pl-3 border-l-2 border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 py-1.5 px-2 rounded-r">
                           <p className="text-xs text-indigo-700 dark:text-indigo-300">
                             <span className="font-semibold">Kanıt/Yapılan İşlem:</span> {cpa.resolutionNote}
                           </p>
                        </div>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(cpa.status)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenUpdateModal(cpa)}
                        title="Durum Güncelle / Kapat"
                        className="transition-colors p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-900/30"
                      >
                        <Clock size={20} weight="bold" />
                      </button>
                      <button 
                        onClick={() => handleDownloadPdf(cpa)}
                        title="PDF İndir"
                        className="transition-colors p-2 rounded-lg text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30"
                      >
                        <DownloadSimple size={20} weight="bold" />
                      </button>
                      {(() => {
                        const isAdmin = user?.role === "ADMIN";
                        const isOwner = cpa.authorId === user?.id;
                        const docTime = new Date(cpa.createdAt || Date.now()).getTime();
                        const diffHours = (Date.now() - docTime) / (1000 * 60 * 60);
                        const isWithin48Hours = diffHours <= 48;

                        if (isAdmin || (isOwner && isWithin48Hours)) {
                          return (
                            <button 
                              onClick={() => handleDelete(cpa.id)}
                              title="Sil"
                              className="transition-colors p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              <Trash size={20} weight="bold" />
                            </button>
                          );
                        } else if (isOwner && !isWithin48Hours) {
                           return (
                             <button 
                               title="Silme süresi (48 saat) doldu. Lütfen yöneticiye başvurun."
                               className="transition-colors p-2 rounded-lg text-slate-300 cursor-not-allowed"
                               disabled
                             >
                               <Trash size={20} weight="bold" />
                             </button>
                           );
                        }
                        return null;
                      })()}
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
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
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={handleAiAnalyze}
                    disabled={isAiLoading || !description}
                    className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAiLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <span>✨</span>
                    )}
                    Yapay Zeka ile Analiz Et
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kök Neden Analizi</label>
                  <textarea 
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    rows={4}
                    placeholder="AI analizi sonucu buraya gelecek veya elle girebilirsiniz..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none text-sm"
                  ></textarea>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Düzeltici Faaliyet</label>
                  <textarea 
                    value={actionPlan}
                    onChange={(e) => setActionPlan(e.target.value)}
                    rows={4}
                    placeholder="AI analizi sonucu buraya gelecek veya elle girebilirsiniz..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aksiyon Sorumlusu</label>
                  <select 
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="">Seçiniz...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.department || 'Genel'})</option>)}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hedef Bitiş (Termin)</label>
                  <input 
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
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

      {/* Update/Close Modal */}
      {isUpdateModalOpen && selectedCpa && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">DÖF Durumunu Güncelle</h2>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Yeni Durum</label>
                <select 
                  required
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                >
                  <option value="AÇIK">AÇIK</option>
                  <option value="İŞLEMDE">İŞLEMDE</option>
                  <option value="KAPALI">KAPALI (Tamamlandı)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Yapılan İşlem / Kanıt Açıklaması</label>
                <textarea 
                  value={updateResolutionNote}
                  onChange={(e) => setUpdateResolutionNote(e.target.value)}
                  rows={4}
                  placeholder="DÖF kapatılıyorsa veya işleme alındıysa yapılanları buraya yazın..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                ></textarea>
                <p className="text-xs text-slate-500">Bu not PDF raporuna da yansıyacaktır.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
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
