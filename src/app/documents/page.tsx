"use client";

import { useState, useEffect } from "react";
import { Plus, X, FileText, FilePdf, FileDoc, DownloadSimple, MagnifyingGlass, Eye, Trash } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";

interface Document {
  id: string;
  code: string;
  name: string;
  type: string;
  revision: string;
  publishDate: string;
  fileUrl: string | null;
  status: string;
  reviewer?: { name: string };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const { data: session } = useSession();
  const user = session?.user;
  
  // Form States
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [revision, setRevision] = useState("Rev 00");
  const [publishDate, setPublishDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchDocuments();
    fetchOptions();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Dokümanlar çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await fetch("/api/settings/options?category=DOC_TYPE");
      if (res.ok) {
        const data = await res.json();
        setTypeOptions(data.map((d: any) => d.value));
      }
    } catch (error) {
      console.error("Doküman türleri yüklenemedi:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("code", code);
    formData.append("name", name);
    formData.append("type", type);
    formData.append("revision", revision);
    formData.append("publishDate", publishDate);
    if (file) {
      formData.append("file", file);
    }
    
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData, // JSON yerine FormData
      });
      
      if (res.ok) {
        setCode("");
        setName("");
        setType("");
        setRevision("Rev 00");
        setPublishDate("");
        setFile(null);
        setIsModalOpen(false);
        fetchDocuments();
      } else {
        const errorData = await res.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error("Doküman kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (fileUrl: string | null) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      alert("Bu kayda ait bir dosya bulunmuyor.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu dokümanı kalıcı olarak silmek istediğinize emin misiniz? (Bu işlem geri alınamaz)")) {
      return;
    }

    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(data.error || "Silme işlemi başarısız.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Bu dokümanı YAYINLA statüsüne çekmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/documents`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "YAYINLANDI" }),
      });
      if (res.ok) {
        fetchDocuments();
      } else {
        alert("Onay işlemi başarısız.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
    }
  };

  const [activeTab, setActiveTab] = useState("Hepsi");
  
  const docTypes = ["Hepsi", ...typeOptions];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "Hepsi" || doc.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getDocIcon = (type: string) => {
    switch(type) {
      case "Prosedür": return <FileDoc size={24} className="text-blue-500" weight="fill" />;
      case "Form": return <FileText size={24} className="text-emerald-500" weight="fill" />;
      case "El Kitabı": return <FilePdf size={24} className="text-rose-500" weight="fill" />;
      default: return <FileText size={24} className="text-slate-400" weight="fill" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Doküman Kontrolü
          </h1>
          <p className="text-slate-500 mt-1">Sistemdeki Yürürlükteki Dokümanlar ve Revizyonlar</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Plus size={20} weight="bold" />
          Doküman Yükle
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="relative max-w-md">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Doküman kodu veya adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-700 dark:text-slate-200"
            />
          </div>
          
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {docTypes.map(tab => (
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
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tür</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kod</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Doküman Adı</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Revizyon</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Yayın Tarihi</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-glass)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Kayıtlı doküman bulunamadı.</td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      {getDocIcon(doc.type)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {doc.code}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {doc.name}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-md text-xs font-bold dark:bg-brand-900/30 dark:border-brand-800 dark:text-brand-300">
                        {doc.revision}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {doc.status === 'YAYINLANDI' ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">
                          {doc.status} {doc.reviewer && <span className="font-normal text-[10px] ml-1">({doc.reviewer.name})</span>}
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">
                          {doc.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(doc.publishDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => {
                            if (doc.fileUrl) {
                              setPreviewDoc(doc);
                            } else {
                              alert("Bu kayda ait bir dosya bulunmuyor.");
                            }
                          }}
                          title={doc.fileUrl ? "Önizle" : "Dosya Bulunamadı"}
                          className={`transition-colors p-2 rounded-lg ${doc.fileUrl ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <Eye size={20} weight="bold" />
                        </button>
                        <button 
                          onClick={() => handleDownload(doc.fileUrl)}
                          title={doc.fileUrl ? "Dosyayı İndir" : "Dosya Bulunamadı"}
                          className={`transition-colors p-2 rounded-lg ${doc.fileUrl ? 'text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <DownloadSimple size={20} weight="bold" />
                        </button>
                        
                        {/* Approval Logic */}
                        {user?.role === "ADMIN" && doc.status === "ONAY_BEKLİYOR" && (
                          <button 
                            onClick={() => handleApprove(doc.id)}
                            title="Yayınla / Onayla"
                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors px-3 py-1 rounded-lg text-xs font-bold ml-2"
                          >
                            ONAYLA
                          </button>
                        )}
                        
                        {/* Deletion Logic */}
                        {(() => {
                          const isAdmin = user?.role === "ADMIN";
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const isOwner = (doc as any).authorId === user?.id;
                          const docTime = new Date(doc.publishDate || doc.createdAt || Date.now()).getTime();
                          const diffHours = (Date.now() - docTime) / (1000 * 60 * 60);
                          const isWithin48Hours = diffHours <= 48;

                          if (isAdmin || (isOwner && isWithin48Hours)) {
                            return (
                              <button 
                                onClick={() => handleDelete(doc.id)}
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

                      </div>
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
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Yeni Doküman Yükle</h2>
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
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Doküman Kodu</label>
                  <input 
                    required
                    type="text"
                    placeholder="Örn: PR-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Doküman Türü</label>
                  <select 
                    required
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="">Seçiniz...</option>
                    {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Doküman Adı</label>
                <input 
                  required
                  type="text"
                  placeholder="Dokümanın tam adını girin..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Revizyon</label>
                  <input 
                    required
                    type="text"
                    value={revision}
                    onChange={(e) => setRevision(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Yayın Tarihi</label>
                  <input 
                    required
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>
              
              {/* File Upload Input */}
              <div className="flex flex-col gap-1.5 mt-2">
                 <div className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                    <input 
                      type="file" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <FilePdf size={32} weight="duotone" className={`mb-2 ${file ? 'text-brand-500' : 'text-slate-400'}`} />
                    <p className="text-sm font-medium text-center">
                      {file ? file.name : "Dosya seçmek için tıklayın"}
                    </p>
                    <p className="text-xs mt-1">PDF, DOCX, XLSX (Max 10MB)</p>
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
                  {isSubmitting ? 'Kaydediliyor...' : 'Yükle ve Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Eye className="text-brand-500" /> {previewDoc.code} - {previewDoc.name}
                </h2>
                <span className="text-xs text-slate-500 font-medium">Önizleme Modu</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownload(previewDoc.fileUrl)}
                  className="text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  <DownloadSimple size={18} /> İndir
                </button>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center">
              {previewDoc.fileUrl?.toLowerCase().endsWith('.pdf') ? (
                <iframe 
                  src={`${previewDoc.fileUrl}#toolbar=0`} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
                  <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <FileDoc size={40} className="text-brand-600 dark:text-brand-400" weight="duotone" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Önizleme Desteklenmiyor
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                    Sistem yerel ağda (localhost) çalıştığı için Word/Excel dosyaları doğrudan tarayıcı içinde önizlenememektedir. Güvenliğiniz ve verimliliğiniz için lütfen dosyayı cihazınıza indirerek görüntüleyin.
                  </p>
                  <button 
                    onClick={() => handleDownload(previewDoc.fileUrl)}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm shadow-brand-500/20 flex items-center gap-2"
                  >
                    <DownloadSimple size={20} weight="bold" />
                    Dosyayı Şimdi İndir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
