"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ReactDOM from "react-dom";

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

// Toast component
function Toast({ message, show }: { message: string; show: boolean }) {
  return show ? (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in text-sm font-semibold">
      {message}
    </div>
  ) : null;
}

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [menuPortal, setMenuPortal] = useState<{ id: string; top: number; left: number; direction: 'up' | 'down' } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const menuPortalRef = useRef<HTMLDivElement | null>(null);

  // Toast helper
  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 2500);
  };

  // Load invoices from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("invoices");
    if (stored) {
      setInvoices(JSON.parse(stored));
    }
  }, []);

  // On mount, check for highlight flag
  useEffect(() => {
    const id = localStorage.getItem('highlightInvoiceId');
    if (id) {
      setHighlightId(id);
      setTimeout(() => {
        setHighlightId(null);
        localStorage.removeItem('highlightInvoiceId');
      }, 3000);
    }
  }, []);

  // Scroll to highlighted invoice on mobile
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenu && menuRefs.current[openMenu]) {
        const trigger = menuRefs.current[openMenu];
        const portal = menuPortalRef.current;
        if (
          trigger &&
          !trigger.contains(e.target as Node) &&
          (!portal || !portal.contains(e.target as Node))
        ) {
          setOpenMenu(null);
        }
      }
    }
    if (openMenu) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openMenu]);

  // Close menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // On menu close, also setMenuPortal(null)
  useEffect(() => {
    if (!openMenu) setMenuPortal(null);
  }, [openMenu]);

  // Delete invoice by id
  const handleDelete = (id: string | null) => {
    if (!id) return;
    setDeleteLoading(true);
    const exists = invoices.some(inv => inv.id === id);
    if (!exists) {
      setDeleteLoading(false);
      setToast({ message: "Facture introuvable.", show: true });
      setConfirmDeleteId(null);
      return;
    }
    const updated = invoices.filter((inv) => inv.id !== id);
    setInvoices(updated);
    localStorage.setItem("invoices", JSON.stringify(updated));
    setOpenMenu(null);
    setDeleteLoading(false);
    setConfirmDeleteId(null);
    showToast("Facture supprimée avec succès");
  };

  // Dropdown actions
  const handleMarkPaid = (id: string) => {
    const updated = invoices.map(inv =>
      inv.id === id ? { ...inv, status: 'paid' } : inv
    );
    setInvoices(updated);
    localStorage.setItem('invoices', JSON.stringify(updated));
    setOpenMenu(null);
    showToast("Facture marquée comme payée");
  };
  const handleMarkUnpaid = (id: string) => {
    const updated = invoices.map(inv =>
      inv.id === id ? { ...inv, status: undefined } : inv
    );
    setInvoices(updated);
    localStorage.setItem('invoices', JSON.stringify(updated));
    setOpenMenu(null);
    showToast("Facture marquée comme non payée");
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

  // Detect menu direction on open
  const handleMenuOpen = (id: string, ref: HTMLDivElement | null) => {
    if (!ref) return setOpenMenu(id);
    const rect = ref.getBoundingClientRect();
    const menuHeight = 280; // estimated menu height in px
    const spaceBelow = window.innerHeight - rect.bottom;
    const direction = spaceBelow < menuHeight ? 'up' : 'down';
    setOpenMenu(id);
    setMenuPortal({
      id,
      top: direction === 'up' ? rect.top - menuHeight - 8 : rect.bottom + 8,
      left: rect.right - 224, // 224px = 14rem (menu width)
      direction,
    });
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 pt-6 pb-2 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 gap-4 sm:gap-0">
            <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 sm:px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-colors duration-200
                    ${activeTab === tab.value
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                      : "bg-white text-blue-700 border border-blue-100 hover:bg-blue-50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Rechercher par client ou numéro..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-sm shadow-sm"
              />
              <Link
                href="/create-invoice"
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition-colors text-xs sm:text-sm flex items-center justify-center"
              >
                + Nouvelle facture
              </Link>
            </div>
          </div>

          {/* Invoice list or empty state */}
          <div className="p-2 sm:p-6 min-h-[300px] overflow-visible">
            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center text-gray-400 relative">
                <svg className="w-12 h-12 mb-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <rect x="8" y="8" width="32" height="32" rx="6" strokeWidth="2" />
                  <path d="M16 24h16M16 30h10" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="font-semibold text-lg text-blue-700 mb-1">Bienvenue sur DZ Invoice !</div>
                <div className="text-sm text-gray-500 mb-4">Aucune facture trouvée.<br/>Cliquez sur le bouton ci-dessous pour créer votre première facture et commencer à gérer vos clients facilement.</div>
                <Link
                  href="/create-invoice"
                  className="inline-block px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition-colors text-sm"
                >
                  + Nouvelle facture
                </Link>
                {/* FAB on mobile */}
                <Link
                  href="/create-invoice"
                  className="sm:hidden fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center text-2xl font-bold hover:from-indigo-600 hover:to-blue-700 transition-colors z-40"
                  aria-label="Nouvelle facture"
                >
                  +
                </Link>
              </div>
            ) : (
              <>
                {/* FAB on mobile */}
                <Link
                  href="/create-invoice"
                  className="sm:hidden fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center text-2xl font-bold hover:from-indigo-600 hover:to-blue-700 transition-colors z-40"
                  aria-label="Nouvelle facture"
                >
                  +
                </Link>
                {/* Mobile Card List */}
                <div className="sm:hidden space-y-4">
                  {filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      ref={highlightId === invoice.id ? highlightRef : undefined}
                      className={`bg-white rounded-xl shadow p-5 text-base flex flex-col gap-3 relative transition-all duration-500 ${highlightId === invoice.id ? 'ring-4 ring-green-400' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono text-xs text-blue-700">N° {invoice.id}</div>
                          <div className="font-semibold text-base text-gray-900">{invoice.clientName}</div>
                        </div>
                        <div className="relative">
                          <button
                            className="p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={() => handleMenuOpen(invoice.id, menuRefs.current[invoice.id])}
                            aria-label="Actions"
                          >
                            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="6" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="18" r="1.5" />
                            </svg>
                          </button>
                          {openMenu === invoice.id && menuPortal && menuPortal.id === invoice.id &&
                            ReactDOM.createPortal(
                              <div
                                ref={menuPortalRef}
                                onClick={e => e.stopPropagation()}
                                className={`fixed z-50 bg-white border border-slate-100 rounded-lg shadow-lg animate-fade-in flex flex-col text-base py-2 overflow-visible
                                  w-56 sm:w-56 w-full max-w-xs left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                                  ${menuPortal.direction === 'up' ? '' : ''}`}
                                style={{
                                  top: menuPortal.top,
                                  left: window.innerWidth < 640 ? '50%' : menuPortal.left, // center on mobile
                                  minWidth: window.innerWidth < 640 ? undefined : '14rem',
                                  maxWidth: window.innerWidth < 640 ? '20rem' : undefined,
                                  width: window.innerWidth < 640 ? '100%' : undefined,
                                  padding: '0.5rem 0.25rem',
                                  transform: window.innerWidth < 640 ? 'translateX(-50%)' : undefined,
                                }}
                              >
                                {invoice.status === 'paid' ? (
                                  <button
                                    className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                    onClick={() => { setOpenMenu(null); setMenuPortal(null); handleMarkUnpaid(invoice.id); }}
                                    aria-label="Marquer comme non payée"
                                  >
                                    <span>🔄</span> Marquer comme non payée
                                  </button>
                                ) : (
                                  <button
                                    className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                    onClick={() => { setOpenMenu(null); setMenuPortal(null); handleMarkPaid(invoice.id); }}
                                    disabled={invoice.status === 'paid'}
                                    aria-label="Marquer comme payée"
                                  >
                                    <span>✔️</span> Marquer comme payée
                                  </button>
                                )}
                                <button
                                  className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                  onClick={() => { setOpenMenu(null); setMenuPortal(null); handleGetLink(invoice.id); }}
                                  aria-label="Obtenir le lien"
                                >
                                  <span>🔗</span> Obtenir le lien
                                </button>
                                <button
                                  className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                  onClick={() => { setOpenMenu(null); setMenuPortal(null); handleEmail(); }}
                                  aria-label="Envoyer par email"
                                >
                                  <span>✉️</span> Envoyer par email
                                </button>
                                <button
                                  className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                  onClick={() => { setOpenMenu(null); setMenuPortal(null); handlePrint(); }}
                                  aria-label="Imprimer"
                                >
                                  <span>🖨️</span> Imprimer
                                </button>
                                <button
                                  className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-red-50 text-red-600 rounded-b-lg border-t border-slate-100 focus:outline-none focus:ring-2 focus:ring-red-400 text-base min-h-[44px]"
                                  onClick={() => { setOpenMenu(null); setMenuPortal(null); setConfirmDeleteId(invoice.id); }}
                                  aria-label="Supprimer"
                                >
                                  <span>🗑️</span> Supprimer
                                </button>
                              </div>,
                              document.body
                            )
                          }
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>Date : <span className="text-gray-700">{new Date(invoice.date).toLocaleDateString()}</span></span>
                        <span>Total : <span className="font-bold text-green-700">{invoice.total.toLocaleString()} DZD</span></span>
                        {invoice.status === 'paid' && (
                          <span className="text-green-600 font-semibold">Payée</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto overflow-visible">
                  <table className="min-w-full divide-y divide-slate-100 overflow-visible text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider whitespace-nowrap">N° FACTURE</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider whitespace-nowrap">CLIENT</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider whitespace-nowrap">DATE</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider whitespace-nowrap">TOTAL</th>
                        <th className="px-2 sm:px-4 py-2 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider whitespace-nowrap">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50 overflow-visible">
                      {filteredInvoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          id={`highlight-${invoice.id}`}
                          className={`hover:bg-blue-50/50 transition-colors ${highlightId === invoice.id ? 'ring-4 ring-green-400' : ''}`}
                        >
                          <td className="px-2 sm:px-4 py-3 font-mono text-xs sm:text-sm text-blue-900 whitespace-nowrap">{invoice.id}</td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">{invoice.clientName}</td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-700 whitespace-nowrap">{new Date(invoice.date).toLocaleDateString()}</td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-bold text-green-700 whitespace-nowrap">
                            {invoice.total.toLocaleString()} DZD
                            {invoice.status === 'paid' && (
                              <div className="text-xs text-green-600 font-semibold mt-1">Payée</div>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-center relative overflow-visible whitespace-nowrap">
                            <div className="flex justify-center gap-2">
                              <div ref={el => { menuRefs.current[invoice.id] = el; }} className="relative">
                                <button
                                  className="p-2 sm:p-2.5 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center"
                                  onClick={() => handleMenuOpen(invoice.id, menuRefs.current[invoice.id])}
                                  aria-label="Actions"
                                >
                                  <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="6" r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="12" cy="18" r="1.5" />
                                  </svg>
                                </button>
                                {openMenu === invoice.id && menuPortal && menuPortal.id === invoice.id &&
                                  ReactDOM.createPortal(
                                    <div
                                      ref={menuPortalRef}
                                      onClick={e => e.stopPropagation()}
                                      className={`fixed z-50 bg-white border border-slate-100 rounded-lg shadow-lg animate-fade-in flex flex-col text-base py-2 overflow-visible
                                        w-56 sm:w-56 w-full max-w-xs left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                                        ${menuPortal.direction === 'up' ? '' : ''}`}
                                      style={{
                                        top: menuPortal.top,
                                        left: window.innerWidth < 640 ? '50%' : menuPortal.left, // center on mobile
                                        minWidth: window.innerWidth < 640 ? undefined : '14rem',
                                        maxWidth: window.innerWidth < 640 ? '20rem' : undefined,
                                        width: window.innerWidth < 640 ? '100%' : undefined,
                                        padding: '0.5rem 0.25rem',
                                        transform: window.innerWidth < 640 ? 'translateX(-50%)' : undefined,
                                      }}
                                    >
                                      {invoice.status === 'paid' ? (
                                        <button
                                          className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                          onClick={() => { setOpenMenu(null); setMenuPortal(null); handleMarkUnpaid(invoice.id); }}
                                          aria-label="Marquer comme non payée"
                                        >
                                          <span>🔄</span> Marquer comme non payée
                                        </button>
                                      ) : (
                                        <button
                                          className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                          onClick={() => { setOpenMenu(null); setMenuPortal(null); handleMarkPaid(invoice.id); }}
                                          disabled={invoice.status === 'paid'}
                                          aria-label="Marquer comme payée"
                                        >
                                          <span>✔️</span> Marquer comme payée
                                        </button>
                                      )}
                                      <button
                                        className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                        onClick={() => { setOpenMenu(null); setMenuPortal(null); handleGetLink(invoice.id); }}
                                        aria-label="Obtenir le lien"
                                      >
                                        <span>🔗</span> Obtenir le lien
                                      </button>
                                      <button
                                        className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                        onClick={() => { setOpenMenu(null); setMenuPortal(null); handleEmail(); }}
                                        aria-label="Envoyer par email"
                                      >
                                        <span>✉️</span> Envoyer par email
                                      </button>
                                      <button
                                        className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base min-h-[44px]"
                                        onClick={() => { setOpenMenu(null); setMenuPortal(null); handlePrint(); }}
                                        aria-label="Imprimer"
                                      >
                                        <span>🖨️</span> Imprimer
                                      </button>
                                      <button
                                        className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-red-50 text-red-600 rounded-b-lg border-t border-slate-100 focus:outline-none focus:ring-2 focus:ring-red-400 text-base min-h-[44px]"
                                        onClick={() => { setOpenMenu(null); setMenuPortal(null); setConfirmDeleteId(invoice.id); }}
                                        aria-label="Supprimer"
                                      >
                                        <span>🗑️</span> Supprimer
                                      </button>
                                    </div>,
                                    document.body
                                  )
                                }
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Toast notification */}
      <Toast message={toast.message} show={toast.show} />
      {/* Confirmation dialog for delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center">
            <div className="mb-4">
              <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-lg font-bold text-red-700 mb-2 text-center">Supprimer la facture ?</div>
            <div className="text-sm text-gray-600 mb-6 text-center">Cette action est irréversible. Voulez-vous vraiment supprimer cette facture ?</div>
            <div className="flex gap-2 w-full">
              <button
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition-colors"
                onClick={() => { setConfirmDeleteId(null); setDeleteLoading(false); }}
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-semibold shadow hover:from-red-600 hover:to-red-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={!confirmDeleteId || deleteLoading}
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add fade-in animation
// Add this to your global CSS if not present:
// .animate-fade-in { animation: fade-in 0.15s ease-in; }
// @keyframes fade-in { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: translateY(0);} } 