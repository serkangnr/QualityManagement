"use client";

import { useState, useEffect } from "react";
import { Plus, X, WarningCircle, CheckCircle, Trash, Screwdriver } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";

interface Device {
  id: string;
  name: string;
  serialNo: string | null;
  calibrationDate: string;
  nextCalibrationDate: string;
  status: string;
}

export default function CalibrationPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const user = session?.user;
  
  // Form States
  const [name, setName] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [calibrationDate, setCalibrationDate] = useState("");
  const [nextCalibrationDate, setNextCalibrationDate] = useState("");
  const [status, setStatus] = useState("AKTİF");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (error) {
      console.error("Cihazlar çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, serialNo, calibrationDate, nextCalibrationDate, status }),
      });
      
      if (res.ok) {
        setName("");
        setSerialNo("");
        setCalibrationDate("");
        setNextCalibrationDate("");
        setStatus("AKTİF");
        setIsModalOpen(false);
        fetchDevices(); 
      }
    } catch (error) {
      console.error("Cihaz kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu cihaz kaydını kalıcı olarak silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const res = await fetch(`/api/devices?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchDevices();
      } else {
        const data = await res.json();
        alert(data.error || "Silme işlemi başarısız.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
    }
  };

  const getStatusBadge = (devStatus: string, nextDate: string) => {
    const isExpired = new Date(nextDate) < new Date();
    if (isExpired) {
       return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold border border-red-200"><WarningCircle size={14} weight="bold" /> SÜRESİ GEÇTİ</span>;
    }
    
    switch (devStatus) {
      case "AKTİF":
        return <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200"><CheckCircle size={14} weight="bold" /> AKTİF</span>;
      case "PASİF":
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">PASİF</span>;
      case "KALİBRASYON_DIŞI":
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">KALİBRASYON DIŞI</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">{devStatus}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
             <Screwdriver className="text-brand-500" /> Cihaz Kalibrasyon Takibi
          </h1>
          <p className="text-slate-500 mt-1">Ölçüm cihazlarının geçerlilik tarihleri ve durumları</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Plus size={20} weight="bold" />
          Yeni Cihaz Ekle
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-[var(--color-border-glass)]">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cihaz Adı</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Seri / Model No</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Son Kalibrasyon</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gelecek Kalibrasyon</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Kayıtlı cihaz bulunmuyor.</td>
                </tr>
              ) : (
                devices.map((device) => {
                  const isClose = new Date(device.nextCalibrationDate).getTime() - Date.now() < (30 * 24 * 60 * 60 * 1000); // Less than 30 days
                  const isExpired = new Date(device.nextCalibrationDate) < new Date();
                  
                  return (
                  <tr key={device.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${isExpired ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                    <td className="p-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                      {device.name}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {device.serialNo || '-'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {new Date(device.calibrationDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className={`p-4 whitespace-nowrap text-sm font-bold ${isExpired ? 'text-red-600' : isClose ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      {new Date(device.nextCalibrationDate).toLocaleDateString('tr-TR')}
                      {isClose && !isExpired && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">YAKLAŞTI</span>}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(device.status, device.nextCalibrationDate)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right flex justify-end gap-2">
                      {user?.role === "ADMIN" && (
                        <button 
                          onClick={() => handleDelete(device.id)}
                          title="Sil"
                          className="transition-colors p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash size={20} weight="bold" />
                        </button>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Yeni Cihaz / Ekipman</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cihaz Adı</label>
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kumpas, Terazi, Termometre vb."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Seri / Model No (Opsiyonel)</label>
                <input 
                  type="text"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Son Kalibrasyon</label>
                  <input 
                    required
                    type="date"
                    value={calibrationDate}
                    onChange={(e) => setCalibrationDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gelecek Kalibrasyon</label>
                  <input 
                    required
                    type="date"
                    value={nextCalibrationDate}
                    onChange={(e) => setNextCalibrationDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cihaz Durumu</label>
                <select 
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                >
                  <option value="AKTİF">AKTİF (Kullanımda)</option>
                  <option value="KALİBRASYON_DIŞI">KALİBRASYON DIŞI (Sadece Gösterge)</option>
                  <option value="PASİF">PASİF (Kullanım Dışı)</option>
                </select>
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
    </div>
  );
}
