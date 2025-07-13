"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  clientName: string;
  date: string;
  total: number;
  items: InvoiceItem[];
  status?: string; // 'paid' or undefined
}

const TABS = [
  { label: "Toutes les factures", value: "all" },
  { label: "En attente", value: "outstanding" },
  { label: "Payées", value: "paid" },
];

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load invoices from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("invoices");
    if (stored) {
      setInvoices(JSON.parse(stored));
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenu && menuRefs.current[openMenu]) {
        if (!menuRefs.current[openMenu]?.contains(e.target as Node)) {
          setOpenMenu(null);
        }
      }
    }
    if (openMenu) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openMenu]);

  // Delete invoice by id
  const handleDelete = (id: string) => {
    const updated = invoices.filter((inv) => inv.id !== id);
    setInvoices(updated);
    localStorage.setItem("invoices", JSON.stringify(updated));
    setOpenMenu(null);
  };

  // Dropdown actions
  const handleMarkPaid = (id: string) => {
    const updated = invoices.map(inv =>
      inv.id === id ? { ...inv, status: 'paid' } : inv
    );
    setInvoices(updated);
    localStorage.setItem('invoices', JSON.stringify(updated));
    setOpenMenu(null);
  };
  const handleMarkUnpaid = (id: string) => {
    const updated = invoices.map(inv =>
      inv.id === id ? { ...inv, status: undefined } : inv
    );
    setInvoices(updated);
    localStorage.setItem('invoices', JSON.stringify(updated));
    setOpenMenu(null);
  };
  const handleGetLink = (id: string) => {
    alert(`Get Link: https://yourapp.com/invoice/${id}`);
    setOpenMenu(null);
  };
  const handleEmail = () => {
    alert("Email: This feature is coming soon!");
    setOpenMenu(null);
  };
  const handlePrint = () => {
    alert("Print: This feature is coming soon!");
    setOpenMenu(null);
  };

  // Filter invoices by search and tab
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'paid') return inv.status === 'paid' && matchesSearch;
    if (activeTab === 'outstanding') return inv.status !== 'paid' && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 flex items-center justify-center px-2 sm:px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-0 overflow-visible">
          {/* Tabs and header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 pt-6 pb-2 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex gap-2 mb-4 sm:mb-0">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200
                    ${activeTab === tab.value
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                      : "bg-white text-blue-700 border border-blue-100 hover:bg-blue-50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Rechercher par client ou numéro..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm shadow-sm"
              />
              <Link
                href="/create-invoice"
                className="ml-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition-colors text-sm flex items-center"
              >
                + Nouvelle facture
              </Link>
            </div>
          </div>

          {/* Invoice list or empty state */}
          <div className="p-6 min-h-[300px] overflow-visible">
            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center text-gray-400">
                <svg className="w-12 h-12 mb-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <rect x="8" y="8" width="32" height="32" rx="6" strokeWidth="2" />
                  <path d="M16 24h16M16 30h10" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="font-semibold text-lg text-blue-700 mb-1">Aucune facture trouvée</div>
                <div className="text-sm text-gray-500 mb-4">Créez votre première facture pour l'afficher ici.</div>
                <Link
                  href="/"
                  className="inline-block px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition-colors text-sm"
                >
                  + New invoice
                </Link>
              </div>
            ) : (
              <div className="overflow-visible">
                <table className="min-w-full divide-y divide-slate-100 overflow-visible">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">N° FACTURE</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">CLIENT</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">DATE</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">TOTAL</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50 overflow-visible">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm text-blue-900">{invoice.id}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{invoice.clientName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{new Date(invoice.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-700">
                          {invoice.total.toLocaleString()} DZD
                          {invoice.status === 'paid' && (
                            <div className="text-xs text-green-600 font-semibold mt-1">Payée</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center relative overflow-visible">
                          <div className="flex justify-center gap-2">
                            {/* Dropdown menu button */}
                            <div ref={el => { menuRefs.current[invoice.id] = el; }}>
                              <button
                                className="p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onClick={() => setOpenMenu(openMenu === invoice.id ? null : invoice.id)}
                                aria-label="Actions"
                              >
                                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="6" r="1.5" />
                                  <circle cx="12" cy="12" r="1.5" />
                                  <circle cx="12" cy="18" r="1.5" />
                                </svg>
                              </button>
                              {/* Dropdown menu */}
                              {openMenu === invoice.id && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-lg shadow-lg z-50 animate-fade-in">
                                  {invoice.status === 'paid' ? (
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-700 rounded-t-lg"
                                      onClick={() => handleMarkUnpaid(invoice.id)}
                                    >
                                      Marquer comme non payée
                                    </button>
                                  ) : (
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-700 rounded-t-lg"
                                      onClick={() => handleMarkPaid(invoice.id)}
                                      disabled={invoice.status === 'paid'}
                                    >
                                      Marquer comme payée
                                    </button>
                                  )}
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-700"
                                    onClick={() => handleGetLink(invoice.id)}
                                  >
                                    Obtenir le lien
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-700"
                                    onClick={handleEmail}
                                  >
                                    Envoyer par email
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-700"
                                    onClick={handlePrint}
                                  >
                                    Imprimer
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 rounded-b-lg border-t border-slate-100"
                                    onClick={() => handleDelete(invoice.id)}
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add fade-in animation
// Add this to your global CSS if not present:
// .animate-fade-in { animation: fade-in 0.15s ease-in; }
// @keyframes fade-in { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: translateY(0);} } 