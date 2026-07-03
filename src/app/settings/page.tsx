"use client";

import { useState, useEffect } from "react";
import { Gear, Trash, Plus, Building, FileText, WarningCircle, Users } from "@phosphor-icons/react";

interface SystemOption {
  id: string;
  category: string;
  value: string;
}

const CATEGORIES = [
  { id: "DEPARTMENT", label: "Departmanlar", icon: <Building size={20} /> },
  { id: "DOC_TYPE", label: "Doküman Türleri", icon: <FileText size={20} /> },
  { id: "CPA_SOURCE", label: "DÖF Kaynakları", icon: <WarningCircle size={20} /> },
  { id: "USERS", label: "Kullanıcı Yönetimi", icon: <Users size={20} /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("DEPARTMENT");
  const [options, setOptions] = useState<SystemOption[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newValue, setNewValue] = useState("");
  
  // User form states
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userRole, setUserRole] = useState("USER");
  const [userPassword, setUserPassword] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (category: string) => {
    setIsLoading(true);
    try {
      if (category === "USERS") {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } else {
        const res = await fetch(`/api/settings/options?category=${category}`);
        if (res.ok) {
          const data = await res.json();
          setOptions(data);
        }
      }
    } catch (error) {
      console.error("Veri çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
    if (activeTab === "USERS") {
      // Also fetch departments for the dropdown
      fetch("/api/settings/options?category=DEPARTMENT")
        .then(res => res.json())
        .then(data => setDepartmentOptions(data.map((d: any) => d.value)))
        .catch(console.error);
    }
  }, [activeTab]);

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    try {
      const res = await fetch("/api/settings/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeTab, value: newValue.trim() }),
      });

      if (res.ok) {
        setNewValue("");
        fetchData(activeTab);
      } else {
        alert("Bu kayıt zaten mevcut veya bir hata oluştu.");
      }
    } catch (error) {
      console.error("Ekleme hatası:", error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone || !userPassword) return;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, phone: userPhone, role: userRole, password: userPassword, department: userDepartment }),
      });

      if (res.ok) {
        setUserName("");
        setUserPhone("");
        setUserPassword("");
        setUserRole("USER");
        setUserDepartment("");
        fetchData("USERS");
      } else {
        const data = await res.json();
        alert(data.error || "Kullanıcı eklenirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Kullanıcı ekleme hatası:", error);
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm("Bu öğeyi silmek istediğinize emin misiniz? (Bağlı kayıtlar etkilenebilir)")) return;
    
    try {
      const res = await fetch(`/api/settings/options?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData(activeTab);
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    
    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData("USERS");
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/30">
            <Gear size={28} weight="fill" />
          </div>
          Admin Ayarları
        </h1>
        <p className="text-slate-500 mt-2">Sistem genelindeki açılır menü seçeneklerini (departmanlar, doküman türleri vb.) buradan yönetebilirsiniz.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Tabs Sidebar */}
        <div className="lg:w-64 shrink-0 flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left ${
                activeTab === cat.id 
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 lg:p-8 min-h-[400px] flex flex-col">
          
          <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {CATEGORIES.find(c => c.id === activeTab)?.label} Yönetimi
              </h2>
              <p className="text-sm text-slate-500 mt-1">Sistem formlarında görünecek seçenekler listesi.</p>
            </div>

            <form onSubmit={handleAddOption} className="flex gap-2">
              <input
                type="text"
                placeholder="Yeni ekle..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all w-full md:w-64 text-sm"
              />
              <button 
                type="submit"
                disabled={!newValue.trim()}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={18} weight="bold" /> <span className="hidden md:inline">Ekle</span>
              </button>
            </form>
          </div>

          {/* List or User Form */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              </div>
            ) : activeTab === "USERS" ? (
              <div className="flex flex-col gap-6">
                <form onSubmit={handleAddUser} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col md:flex-row gap-4">
                  <input type="text" placeholder="İsim Soyisim" value={userName} onChange={e=>setUserName(e.target.value)} required className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" placeholder="Tel (555...)" value={userPhone} onChange={e=>setUserPhone(e.target.value)} required className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  <input type="password" placeholder="Şifre" value={userPassword} onChange={e=>setUserPassword(e.target.value)} required className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  <select value={userDepartment} onChange={e=>setUserDepartment(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm">
                    <option value="">Departman Seçin (Opsiyonel)</option>
                    {departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <select value={userRole} onChange={e=>setUserRole(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm">
                    <option value="ADMIN">ADMIN (Kalite Yöneticisi)</option>
                    <option value="AUDITOR">AUDITOR (İç Denetçi)</option>
                    <option value="USER">USER (Personel)</option>
                    <option value="GUEST">GUEST (Dış Kullanıcı)</option>
                  </select>
                  <button type="submit" disabled={!userName || !userPhone || !userPassword} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">Kullanıcı Ekle</button>
                </form>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-[var(--color-border-glass)]">
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">İsim Soyisim</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Telefon</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Departman</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Rol</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-glass)]">
                      {users.length === 0 ? (
                         <tr><td colSpan={5} className="p-4 text-center text-slate-400">Kayıtlı kullanıcı yok.</td></tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 text-sm font-semibold">{user.name}</td>
                            <td className="p-3 text-sm text-slate-500">{user.phone}</td>
                            <td className="p-3 text-sm text-slate-500">{user.department || '-'}</td>
                            <td className="p-3 text-sm"><span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs font-medium">{user.role}</span></td>
                            <td className="p-3 text-right">
                              <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded transition-colors"><Trash size={18} /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : options.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <p>Henüz hiç kayıt yok.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {options.map((option) => (
                  <div 
                    key={option.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{option.value}</span>
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="Sil"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
