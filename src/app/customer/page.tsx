"use client";

import { useState, useEffect } from "react";
import { Plus, X, Users, ChatCircleDots, Envelope, CheckCircle, Clock } from "@phosphor-icons/react";

interface Complaint {
  id: string;
  customer: string;
  description: string;
  status: string; // YENİ, İNCELENİYOR, ÇÖZÜLDÜ
  createdAt: string;
}

export default function CustomerPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form States
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/customer");
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error("Şikayet verileri çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, description }),
      });
      
      if (res.ok) {
        setCustomer("");
        setDescription("");
        setIsModalOpen(false);
        fetchComplaints();
      }
    } catch (error) {
      console.error("Şikayet kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchComplaints();
      }
    } catch (error) {
      console.error("Durum güncellenemedi:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "YENİ":
        return <span className="flex items-center gap-1 bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 px-2.5 py-1 rounded-md text-xs font-bold border w-max"><Envelope size={14} weight="bold" /> YENİ</span>;
      case "İNCELENİYOR":
        return <span className="flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 px-2.5 py-1 rounded-md text-xs font-bold border w-max"><Clock size={14} weight="bold" /> İNCELENİYOR</span>;
      case "ÇÖZÜLDÜ":
        return <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 px-2.5 py-1 rounded-md text-xs font-bold border w-max"><CheckCircle size={14} weight="bold" /> ÇÖZÜLDÜ</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border w-max">{status}</span>;
    }
  };

  const [activeTab, setActiveTab] = useState("Hepsi");
  const statuses = ["Hepsi", "YENİ", "İNCELENİYOR", "ÇÖZÜLDÜ"];

  const filteredComplaints = complaints.filter(complaint => 
    activeTab === "Hepsi" || complaint.status === activeTab
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Müşteri İletişimi
          </h1>
          <p className="text-slate-500 mt-1">Müşteri Şikayetleri ve Bildirim Takibi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Plus size={20} weight="bold" />
          Yeni Bildirim Ekle
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {statuses.map(tab => (
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
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Müşteri / Kurum</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Bildirim / Şikayet Detayı</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Bu kategoriye ait bildirim bulunmuyor.</td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        {complaint.customer}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                      {complaint.description}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(complaint.status)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      {complaint.status === "YENİ" && (
                        <button 
                          onClick={() => updateStatus(complaint.id, "İNCELENİYOR")}
                          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg transition-colors border border-amber-200 dark:border-amber-800"
                        >
                          İncelemeye Al
                        </button>
                      )}
                      {complaint.status === "İNCELENİYOR" && (
                        <button 
                          onClick={() => updateStatus(complaint.id, "ÇÖZÜLDÜ")}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
                        >
                          Çözüldü Olarak İşaretle
                        </button>
                      )}
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
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ChatCircleDots className="text-brand-500" /> Yeni Müşteri Bildirimi
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
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Müşteri / Kurum Adı</label>
                <input 
                  required
                  type="text"
                  placeholder="Şikayeti veya bildirimi yapan kişi/kurum..."
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bildirim / Şikayet Detayı</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Müşterinin ilettiği mesajı detaylıca yazın..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  {isSubmitting ? 'Kaydediliyor...' : 'Bildirimi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
