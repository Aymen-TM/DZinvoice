"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import type { Client, Article, Achat, AchatArticle, StockItem, Vente } from '@/types/erp';
import { 
  getClients, setClients, getArticles, setArticles, 
  getAchats, setAchats, getStock, setStock 
} from '@/utils/erpStorage';
import { getVentes, setVentes, deleteInvoice } from '@/utils/invoiceStorage';
import { 
  exportClients, exportArticles, exportAchats, 
  exportStock, exportVentes 
} from '@/utils/erpExport';
import { ERP_MENU_ITEMS, DEFAULT_CLIENT_FORM, DEFAULT_ARTICLE_FORM, DEFAULT_ACHAT_FORM } from '@/constants/erp';

const TOOLBAR_BUTTONS = [
  { key: "new", label: "New" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "export", label: "Export" },
];

const emptyClient: Omit<Client, "id"> = DEFAULT_CLIENT_FORM;

const emptyArticle: Article = DEFAULT_ARTICLE_FORM;

const emptyAchat: Omit<Achat, 'id'> = DEFAULT_ACHAT_FORM;
const emptyAchatArticle: AchatArticle = {
  ref: '',
  designation: '',
  quantite: 1,
  depot: '',
  prixAchat: 0,
};

type ToolbarButton = { key: string; label: string; onClick?: () => void };

export default function AccueilERPTest() {
  const [activeMenu, setActiveMenu] = useState("articles");
  const [clients, setClientsState] = useState<Client[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState<Omit<Client, "id">>(emptyClient);
  const [clientError, setClientError] = useState("");
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [articles, setArticlesState] = useState<Article[]>([]);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [articleForm, setArticleForm] = useState<Article>(emptyArticle);
  const [editArticleIdx, setEditArticleIdx] = useState<number | null>(null);
  const [achats, setAchatsState] = useState<Achat[]>([]);
  const [showAchatForm, setShowAchatForm] = useState(false);
  const [achatForm, setAchatForm] = useState<Omit<Achat, 'id'>>(emptyAchat);
  const [editAchatIdx, setEditAchatIdx] = useState<number | null>(null);
  const [stock, setStockState] = useState<StockItem[]>([]);
  const [ventes, setVentesState] = useState<Vente[]>([]);
  const [showDeleteVenteIdx, setShowDeleteVenteIdx] = useState<number | null>(null);
  const [showDeleteStockIdx, setShowDeleteStockIdx] = useState<number | null>(null);
  const router = useRouter();

  // Add at the top level of AccueilERPTest, after other useState hooks
  const [achatArticleRefSearch, setAchatArticleRefSearch] = useState<string[]>([]);
  const [achatArticleRefDropdown, setAchatArticleRefDropdown] = useState<boolean[]>([]);
  const [achatArticleRefFiltered, setAchatArticleRefFiltered] = useState<Article[][]>([]);
  const [achatArticleDesSearch, setAchatArticleDesSearch] = useState<string[]>([]);
  const [achatArticleDesDropdown, setAchatArticleDesDropdown] = useState<boolean[]>([]);
  const [achatArticleDesFiltered, setAchatArticleDesFiltered] = useState<Article[][]>([]);
  const achatArticleRefInputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const achatArticleDesInputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [depots, setDepots] = useState<string[]>([]);

  // Sync arrays with achatForm.articles length
  useEffect(() => {
    setAchatArticleRefSearch((prev) => achatForm.articles.map((art, idx) => prev[idx] ?? art.ref ?? ""));
    setAchatArticleRefDropdown((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? false));
    setAchatArticleRefFiltered((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? articles));
    setAchatArticleDesSearch((prev) => achatForm.articles.map((art, idx) => prev[idx] ?? art.designation ?? ""));
    setAchatArticleDesDropdown((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? false));
    setAchatArticleDesFiltered((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? articles));
    achatArticleRefInputRefs.current = achatForm.articles.map((_, idx) => achatArticleRefInputRefs.current[idx] ?? null);
    achatArticleDesInputRefs.current = achatForm.articles.map((_, idx) => achatArticleDesInputRefs.current[idx] ?? null);
  }, [achatForm.articles.length, articles]);

  // Load depots from stock on mount
  useEffect(() => {
    (async () => {
      const s = await getStock();
      const uniqueDepots = Array.from(new Set(s.map(item => item.depot).filter(Boolean)));
      setDepots(uniqueDepots);
    })();
  }, []);

  // Handlers for reference field
  const handleAchatArticleRefSearchChange = (idx: number, value: string) => {
    setAchatArticleRefSearch((prev) => prev.map((v, i) => (i === idx ? value : v)));
    setAchatArticleRefDropdown((prev) => prev.map((v, i) => (i === idx ? true : v)));
    setAchatArticleRefFiltered((prev) =>
      prev.map((arr, i) =>
        i === idx
          ? articles.filter((a) => a.ref.toLowerCase().includes(value.toLowerCase()))
          : arr
      )
    );
  };
  const handleAchatArticleRefSelect = (idx: number, a: Article) => {
    handleAchatArticleChange(idx, 'ref', a.ref);
    handleAchatArticleChange(idx, 'designation', a.designation);
    handleAchatArticleChange(idx, 'prixAchat', a.prixAchat || 0);
    setAchatArticleRefSearch((prev) => prev.map((v, i) => (i === idx ? a.ref : v)));
    setAchatArticleDesSearch((prev) => prev.map((v, i) => (i === idx ? a.designation : v)));
    setAchatArticleRefDropdown((prev) => prev.map((v, i) => (i === idx ? false : v)));
    setAchatArticleDesDropdown((prev) => prev.map((v, i) => (i === idx ? false : v)));
  };
  const handleAchatArticleRefInputFocus = (idx: number) => {
    setAchatArticleRefDropdown((prev) => prev.map((v, i) => (i === idx ? true : v)));
  };

  // Handlers for designation field
  const handleAchatArticleDesSearchChange = (idx: number, value: string) => {
    setAchatArticleDesSearch((prev) => prev.map((v, i) => (i === idx ? value : v)));
    setAchatArticleDesDropdown((prev) => prev.map((v, i) => (i === idx ? true : v)));
    setAchatArticleDesFiltered((prev) =>
      prev.map((arr, i) =>
        i === idx
          ? articles.filter((a) => a.designation.toLowerCase().includes(value.toLowerCase()))
          : arr
      )
    );
  };
  const handleAchatArticleDesSelect = (idx: number, a: Article) => {
    handleAchatArticleChange(idx, 'ref', a.ref);
    handleAchatArticleChange(idx, 'designation', a.designation);
    handleAchatArticleChange(idx, 'prixAchat', a.prixAchat || 0);
    setAchatArticleRefSearch((prev) => prev.map((v, i) => (i === idx ? a.ref : v)));
    setAchatArticleDesSearch((prev) => prev.map((v, i) => (i === idx ? a.designation : v)));
    setAchatArticleRefDropdown((prev) => prev.map((v, i) => (i === idx ? false : v)));
    setAchatArticleDesDropdown((prev) => prev.map((v, i) => (i === idx ? false : v)));
  };
  const handleAchatArticleDesInputFocus = (idx: number) => {
    setAchatArticleDesDropdown((prev) => prev.map((v, i) => (i === idx ? true : v)));
  };

  // Handler for click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      achatArticleRefInputRefs.current.forEach((ref, idx) => {
        if (ref && event.target instanceof Node && !ref.contains(event.target)) {
          setAchatArticleRefDropdown((prev) => prev.map((v, i) => (i === idx ? false : v)));
        }
      });
      achatArticleDesInputRefs.current.forEach((ref, idx) => {
        if (ref && event.target instanceof Node && !ref.contains(event.target)) {
          setAchatArticleDesDropdown((prev) => prev.map((v, i) => (i === idx ? false : v)));
        }
      });
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load all data from localForage on mount
  useEffect(() => {
    (async () => {
      const c = await getClients() as Client[];
      setClientsState(c);
      const a = await getArticles() as Article[];
      setArticlesState(a);
      const ac = await getAchats() as Achat[];
      setAchatsState(ac);
      const s = await getStock() as StockItem[];
      setStockState(s);
      const v = await getVentes() as Vente[];
      setVentesState(v);
    })();
  }, []);

  // CLIENT CRUD
  const saveClients = async (newClients: Client[]) => {
    setClientsState(newClients);
    await setClients(newClients);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.raisonSocial.trim()) {
      setClientError("La raison sociale est obligatoire.");
      return;
    }
    setClientError("");
    if (editClientId) {
      // Edit mode
      const updatedClients = clients.map((c) =>
        c.id === editClientId ? { ...c, ...clientForm } : c
      );
      await saveClients(updatedClients);
      setEditClientId(null);
    } else {
      // Add mode
      const newClient: Client = {
        ...clientForm,
        id: Date.now().toString(),
      };
      await saveClients([...clients, newClient]);
    }
    setClientForm(emptyClient);
    setShowClientForm(false);
  };

  const handleClientCancel = () => {
    setClientForm(emptyClient);
    setShowClientForm(false);
    setClientError("");
    setEditClientId(null);
  };

  const handleEditClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      const { /* id: _id, */ ...rest } = client;
      setClientForm(rest);
      setEditClientId(id);
      setShowClientForm(true);
    }
  };





  // ARTICLE CRUD
  const saveArticles = async (newArticles: Article[]) => {
    setArticlesState(newArticles);
    await setArticles(newArticles);
  };

  // Article handlers
  const handleArticleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setArticleForm({
      ...articleForm,
      [name]: name === 'qte' || name === 'prixAchat' || name === 'prixVente' ? parseFloat(value) || 0 : value,
    });
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.ref.trim() || !articleForm.designation.trim()) return;
    if (editArticleIdx !== null) {
      // Edit mode
      const updated = [...articles];
      updated[editArticleIdx] = { ...articleForm };
      await saveArticles(updated);
      setEditArticleIdx(null);
    } else {
      // Add mode
      await saveArticles([...articles, { ...articleForm }]);
    }
    setArticleForm(emptyArticle);
    setShowArticleForm(false);
  };

  const handleArticleCancel = () => {
    setArticleForm(emptyArticle);
    setShowArticleForm(false);
    setEditArticleIdx(null);
  };

  const handleEditArticle = (idx: number) => {
    setArticleForm(articles[idx]);
    setEditArticleIdx(idx);
    setShowArticleForm(true);
  };





  // ACHAT CRUD
  const saveAchats = async (newAchats: Achat[]) => {
    setAchatsState(newAchats);
    await setAchats(newAchats);
  };

  // Achat handlers
  const handleAchatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAchatForm({
      ...achatForm,
      [name]: name === 'montant' ? parseFloat(value) || 0 : value,
    });
  };

  const handleAchatArticleChange = (idx: number, field: keyof AchatArticle, value: string | number) => {
    const updated = achatForm.articles.map((art, i) =>
      i === idx ? { ...art, [field]: field === 'quantite' ? Number(value) : value } : art
    );
    setAchatForm({ ...achatForm, articles: updated });
  };

  const handleAddAchatArticle = () => {
    setAchatForm({ ...achatForm, articles: [...achatForm.articles, { ...emptyAchatArticle }] });
  };

  const handleRemoveAchatArticle = (idx: number) => {
    setAchatForm({ ...achatForm, articles: achatForm.articles.filter((_, i) => i !== idx) });
  };

  // When submitting achat, ensure each article has a ref if possible
  const handleAchatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achatForm.fournisseur.trim() || !achatForm.date.trim()) return;
    // Ensure each article has a ref if possible
    const updatedArticles = achatForm.articles.map(art => {
      if (!art.ref && art.designation) {
        const found = articles.find(a => a.designation === art.designation);
        if (found) {
          return { ...art, ref: found.ref };
        }
      }
      return art;
    });
    let newAchats;
    if (editAchatIdx !== null) {
      // Edit mode
      const updated = [...achats];
      updated[editAchatIdx] = { ...achats[editAchatIdx], ...achatForm, articles: updatedArticles };
      newAchats = updated;
      await saveAchats(updated);
      setEditAchatIdx(null);
    } else {
      // Add mode
      newAchats = [...achats, { ...achatForm, id: Date.now(), articles: updatedArticles }];
      await saveAchats(newAchats);
    }
    // Update stock for each article in achat
    const newStock = [...stock];
    updatedArticles.forEach(art => {
      if (!art.ref && !art.designation) return;
      const idx = newStock.findIndex(s => s.ref === art.ref && s.depot === art.depot);
      if (idx !== -1) {
        newStock[idx] = { ...newStock[idx], quantite: newStock[idx].quantite + art.quantite };
      } else {
        newStock.push({
          ref: art.ref,
          designation: art.designation,
          depot: art.depot,
          quantite: art.quantite,
        });
      }
    });
    await setStock(newStock);
    setAchatForm(emptyAchat);
    setShowAchatForm(false);
  };

  const handleAchatCancel = () => {
    setAchatForm(emptyAchat);
    setShowAchatForm(false);
    setEditAchatIdx(null);
  };

  const handleEditAchat = (idx: number) => {
    setAchatForm(achats[idx]);
    setEditAchatIdx(idx);
    setShowAchatForm(true);
  };

  // Add handler for deleting achat
  const handleDeleteAchat = async (idx: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet achat ?")) {
      const updated = achats.filter((_, i) => i !== idx);
      setAchatsState(updated);
      await setAchats(updated);
    }
  };




  // VENTE CRUD
  const saveVentes = async (newVentes: Vente[]) => {
    setVentesState(newVentes);
    await setVentes(newVentes);
  };
  const handleDeleteVente = (idx: number) => {
    setShowDeleteVenteIdx(idx);
  };

  const handleEditVente = (id: string) => {
    // Navigate to invoice creation page with the invoice ID for editing
    router.push(`/create-invoice?edit=${id}`);
  };
  const confirmDeleteVente = async () => {
    if (showDeleteVenteIdx !== null) {
      const venteToDelete = ventes[showDeleteVenteIdx];
      const updated = ventes.filter((_, i) => i !== showDeleteVenteIdx);
      await saveVentes(updated);
      // Also delete from invoices table
      await deleteInvoice(venteToDelete.id);
      setShowDeleteVenteIdx(null);
    }
  };
  const cancelDeleteVente = () => {
    setShowDeleteVenteIdx(null);
  };

  // Handler for deleting stock item
  const handleDeleteStock = (idx: number) => {
    setShowDeleteStockIdx(idx);
  };
  const confirmDeleteStock = async () => {
    if (showDeleteStockIdx !== null) {
      const updated = stock.filter((_, i) => i !== showDeleteStockIdx);
      setStockState(updated);
      await setStock(updated);
      setShowDeleteStockIdx(null);
    }
  };
  const cancelDeleteStock = () => {
    setShowDeleteStockIdx(null);
  };

  // Table columns and data per section
  const getTable = () => {
    switch (activeMenu) {
      case "tiers":
        return {
          columns: ["Code Tiers", "Raison Sociale", "Famille", "Activité", "Adresse", "Ville", "RC", "NIF", "NIS", "AI"],
          rows: clients.map((c) => [c.codeTiers, c.raisonSocial, c.famille, c.activite, c.adresse, c.ville, c.rc, c.nif, c.nis, c.ai]),
        };
      case "articles":
        return {
          columns: ["Référence", "Désignation", "Prix Vente HT"],
          rows: articles.map((a) => [a.ref, a.designation, a.prixVente + " DA"]),
        };
      case "achat":
        return {
          columns: ["ID", "Fournisseur", "Date", "Montant"],
          rows: achats.map((a) => [a.id, a.fournisseur, a.date, a.montant + " DA"]),
        };
      case "stock":
        return {
          columns: ["Référence", "Désignation", "Dépôt", "Quantité"],
          rows: stock.map(s => [s.ref, s.designation, s.depot, s.quantite]),
        };
      case "ventes":
        console.log("Ventes data:", ventes);
        return {
          columns: ["Date", "Numéro Facture", "Prix H.T", "Montant Total HT", "Montant Total TTC"],
          rows: ventes.map((v) => {
            console.log("Processing vente:", v);
            const prixHT = v.prixHT || 0;
            const montant = v.montant || 0;
            const unitPrice = v.unitPrice || 0;
            console.log("Calculated values:", { prixHT, montant, unitPrice });
            return [v.date, v.id, unitPrice + " DA", prixHT + " DA", montant + " DA"];
          }),
        };
      default:
        return { columns: [], rows: [] };
    }
  };

  const { columns, rows } = getTable();

  // Toolbar buttons: show 'Nouveau' as active for Tiers, Articles, and Achat
  const toolbarButtons: ToolbarButton[] = activeMenu === "tiers"
    ? [
        { key: "new", label: "Nouveau", onClick: () => setShowClientForm(true) },
        { key: "refresh", label: "Rafraîchir", onClick: async () => { const c = await getClients() as Client[]; setClientsState(c); } },
        { key: "export", label: "Exporter", onClick: () => exportClients(clients) },
      ]
    : activeMenu === "articles"
    ? [
        { key: "new", label: "Nouveau", onClick: () => { setShowArticleForm(true); setEditArticleIdx(null); setArticleForm(emptyArticle); } },
        { key: "refresh", label: "Rafraîchir", onClick: async () => { const a = await getArticles() as Article[]; setArticlesState(a); } },
        { key: "export", label: "Exporter", onClick: () => exportArticles(articles) },
      ]
    : activeMenu === "achat"
    ? [
        { key: "new", label: "Nouveau", onClick: () => { setShowAchatForm(true); setEditAchatIdx(null); setAchatForm(emptyAchat); } },
        { key: "refresh", label: "Rafraîchir", onClick: async () => { const ac = await getAchats() as Achat[]; setAchatsState(ac); } },
        { key: "export", label: "Exporter", onClick: () => exportAchats(achats) },
      ]
    : activeMenu === "stock"
    ? [
        { key: "refresh", label: "Rafraîchir", onClick: async () => { const s = await getStock() as StockItem[]; setStockState(s); } },
        { key: "export", label: "Exporter", onClick: () => exportStock(stock) },
      ]
    : activeMenu === "ventes"
    ? [
        { key: "new", label: "Nouveau", onClick: () => router.push('/create-invoice') },
        { key: "refresh", label: "Rafraîchir", onClick: async () => { const v = await getVentes() as Vente[]; setVentesState(v); } },
        { key: "export", label: "Exporter", onClick: () => exportVentes(ventes) },
      ]
    : TOOLBAR_BUTTONS;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col pt-16 font-sans">
      {/* Top Menu Bar */}
      <nav className="w-full bg-[var(--card)] shadow z-30 flex flex-col sm:flex-row items-center h-auto sm:h-16 px-3 sm:px-8 border-b border-[var(--border)] sticky top-0">
        <div className="flex flex-wrap gap-1 sm:gap-6 w-full justify-center sm:justify-start py-3 sm:py-0">
          {ERP_MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`px-3 sm:px-4 py-2.5 sm:py-2 font-semibold text-xs sm:text-sm rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${activeMenu === item.key ? "bg-[var(--primary)] text-white shadow" : "text-[var(--primary-dark)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"}`}
              onClick={() => setActiveMenu(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Toolbar */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-center px-3 sm:px-8 h-auto sm:h-14 z-30 sticky top-16">
        <div className="flex flex-wrap gap-2 w-full justify-center sm:justify-start py-3 sm:py-0">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.key}
              className="px-3 sm:px-4 py-2.5 sm:py-2 bg-[var(--primary)]/5 border border-[var(--border)] rounded-xl text-[var(--primary-dark)] font-medium text-xs sm:text-sm hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors"
              {...(typeof btn.onClick === 'function' ? { onClick: btn.onClick } : {})}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-8 pt-4 sm:pt-10 overflow-x-auto">
        <div className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] p-3 sm:p-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-6 text-[var(--primary-dark)] tracking-tight">{ERP_MENU_ITEMS.find((m) => m.key === activeMenu)?.label}</h2>
          {/* --- FORMS --- */}
          {activeMenu === "tiers" && showClientForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
              <form
                onSubmit={handleClientSubmit}
                className="relative bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--primary)]/20 w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in"
              >
                <div className="flex items-center gap-3 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 sticky top-0 bg-[var(--card)] z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--primary)] rounded-full flex items-center justify-center shadow flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--primary-dark)]">Ajouter / Modifier un client</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-br from-[var(--card)] via-[var(--primary)]/5 to-[var(--primary)]/10">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Code Tiers</label>
                    <input name="codeTiers" value={clientForm.codeTiers} onChange={handleClientChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Code Tiers" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Raison Sociale *</label>
                    <input name="raisonSocial" value={clientForm.raisonSocial} onChange={handleClientChange} required className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Raison Sociale" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Famille</label>
                    <input name="famille" value={clientForm.famille} onChange={handleClientChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Famille" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Activité</label>
                    <input name="activite" value={clientForm.activite} onChange={handleClientChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Activité" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Adresse</label>
                    <input name="adresse" value={clientForm.adresse} onChange={handleClientChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Adresse" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Ville</label>
                    <input name="ville" value={clientForm.ville} onChange={handleClientChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Ville" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">RC</label>
                    <input name="rc" value={clientForm.rc} onChange={handleClientChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="RC" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">NIF</label>
                    <input name="nif" value={clientForm.nif} onChange={handleClientChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="NIF" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">NIS</label>
                    <input name="nis" value={clientForm.nis} onChange={handleClientChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="NIS" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">AI</label>
                    <input name="ai" value={clientForm.ai} onChange={handleClientChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="AI" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 justify-end sticky bottom-0 bg-[var(--card)] z-10">
                  <button type="button" onClick={handleClientCancel} className="px-4 sm:px-5 py-3 sm:py-2 rounded-lg font-semibold bg-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/80 transition text-sm">Annuler</button>
                  <button type="submit" className="px-4 sm:px-5 py-3 sm:py-2 rounded-lg font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow transition text-sm">Enregistrer</button>
                  {clientError && <span className="text-[var(--danger)] text-xs sm:text-sm text-center sm:text-left">{clientError}</span>}
                </div>
                <button type="button" onClick={handleClientCancel} className="absolute top-3 right-3 text-[var(--muted)] hover:text-[var(--danger)] text-xl sm:text-2xl font-bold focus:outline-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--border)] transition">&times;</button>
              </form>
            </div>
          )}
          {activeMenu === "articles" && showArticleForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
              <form
                onSubmit={handleArticleSubmit}
                className="relative bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--primary)]/20 w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in"
              >
                <div className="flex items-center gap-3 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 sticky top-0 bg-[var(--card)] z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--primary)] rounded-full flex items-center justify-center shadow flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--primary-dark)]">Ajouter / Modifier un article</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-br from-[var(--card)] via-[var(--primary)]/5 to-[var(--primary)]/10">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Référence *</label>
                    <input name="ref" value={articleForm.ref} onChange={handleArticleChange} required className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Référence" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Désignation *</label>
                    <input name="designation" value={articleForm.designation} onChange={handleArticleChange} required className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Désignation" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Prix Achat HT</label>
                    <input name="prixAchat" type="number" value={articleForm.prixAchat} onChange={handleArticleChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Prix Achat HT" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Prix Vente HT</label>
                    <input name="prixVente" type="number" value={articleForm.prixVente} onChange={handleArticleChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Prix Vente HT" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 justify-end sticky bottom-0 bg-[var(--card)] z-10">
                  <button type="button" onClick={handleArticleCancel} className="px-4 sm:px-5 py-3 sm:py-2 rounded-lg font-semibold bg-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/80 transition text-sm">Annuler</button>
                  <button type="submit" className="px-4 sm:px-5 py-3 sm:py-2 rounded-lg font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow transition text-sm">Enregistrer</button>
                </div>
                <button type="button" onClick={handleArticleCancel} className="absolute top-3 right-3 text-[var(--muted)] hover:text-[var(--danger)] text-xl sm:text-2xl font-bold focus:outline-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--border)] transition">&times;</button>
              </form>
            </div>
          )}
          {activeMenu === "achat" && showAchatForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <form
                onSubmit={handleAchatSubmit}
                className="relative bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--primary)]/20 w-full max-w-lg sm:max-w-4xl p-0 overflow-hidden animate-fade-in mx-2"
              >
                <div className="flex items-center gap-3 px-6 pt-6 pb-2 border-b border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10">
                  <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h1l2 9a2 2 0 002 2h8a2 2 0 002-2l2-9h1" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--primary-dark)]">Ajouter / Modifier un achat</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-6 py-6 bg-gradient-to-br from-[var(--card)] via-[var(--primary)]/5 to-[var(--primary)]/10">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Fournisseur *</label>
                    <input name="fournisseur" value={achatForm.fournisseur} onChange={handleAchatChange} required className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Fournisseur" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Date *</label>
                    <input name="date" type="date" value={achatForm.date} onChange={handleAchatChange} required className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Date" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)]">Articles achetés</label>
                    <div className="space-y-3">
                      {achatForm.articles.map((art, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-2 md:gap-4 items-center bg-[var(--primary)]/5 border border-[var(--border)] rounded-lg p-3 relative">
                          {/* Reference Autocomplete Input */}
                          <div className="w-full md:w-40 relative" ref={el => { achatArticleRefInputRefs.current[idx] = el; }}>
                            <input
                              type="text"
                              value={achatArticleRefSearch[idx] || ""}
                              onChange={e => handleAchatArticleRefSearchChange(idx, e.target.value)}
                              onFocus={() => handleAchatArticleRefInputFocus(idx)}
                              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                              placeholder="Référence"
                            />
                            {achatArticleRefDropdown[idx] && (achatArticleRefFiltered[idx]?.length ?? 0) > 0 && (
                              <div className="absolute z-50 left-0 right-0 bg-white border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                                {achatArticleRefFiltered[idx].map(a => (
                                  <button
                                    key={a.ref}
                                    type="button"
                                    className="w-full text-left px-4 py-2 hover:bg-[var(--primary)]/10"
                                    onClick={() => handleAchatArticleRefSelect(idx, a)}
                                  >
                                    {a.ref} - {a.designation}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Designation Autocomplete Input */}
                          <div className="w-full md:w-72 flex-1 relative" ref={el => { achatArticleDesInputRefs.current[idx] = el; }}>
                            <input
                              type="text"
                              value={achatArticleDesSearch[idx] || ""}
                              onChange={e => handleAchatArticleDesSearchChange(idx, e.target.value)}
                              onFocus={() => handleAchatArticleDesInputFocus(idx)}
                              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                              placeholder="Désignation"
                            />
                            {achatArticleDesDropdown[idx] && (achatArticleDesFiltered[idx]?.length ?? 0) > 0 && (
                              <div className="absolute z-50 left-0 right-0 bg-white border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                                {achatArticleDesFiltered[idx].map(a => (
                                  <button
                                    key={a.ref}
                                    type="button"
                                    className="w-full text-left px-4 py-2 hover:bg-[var(--primary)]/10"
                                    onClick={() => handleAchatArticleDesSelect(idx, a)}
                                  >
                                    {a.ref} - {a.designation}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Quantity Input */}
                          <input
                            type="number"
                            min="1"
                            value={art.quantite}
                            onChange={e => handleAchatArticleChange(idx, 'quantite', e.target.value)}
                            className="w-24 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Quantité"
                          />
                          {/* Depot Input */}
                          <select
                            value={art.depot}
                            onChange={e => handleAchatArticleChange(idx, 'depot', e.target.value)}
                            className="w-full md:w-56 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                          >
                            <option value="">Sélectionner un dépôt</option>
                            {depots.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          {/* Prix Achat Input */}
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={art.prixAchat || ''}
                            onChange={e => handleAchatArticleChange(idx, 'prixAchat', e.target.value)}
                            className="w-32 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Prix Achat"
                          />
                          <button type="button" onClick={() => handleRemoveAchatArticle(idx)} className="text-[var(--danger)] hover:text-[var(--danger-dark)] text-lg font-bold px-2">&times;</button>
                        </div>
                      ))}
                      <button type="button" onClick={handleAddAchatArticle} className="mt-2 px-4 py-2 bg-[var(--primary)]/5 text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--primary)]/10 transition flex items-center gap-2">
                        <span>Ajouter un article</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-2 border-t border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 justify-end sticky bottom-0 bg-[var(--card)] z-10">
                  <button type="button" onClick={handleAchatCancel} className="px-5 py-2 rounded-lg font-semibold bg-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/80 transition">Annuler</button>
                  <button type="submit" className="px-5 py-2 rounded-lg font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow transition">Enregistrer</button>
                </div>
                <button type="button" onClick={handleAchatCancel} className="absolute top-3 right-3 text-[var(--muted)] hover:text-[var(--danger)] text-2xl font-bold focus:outline-none">&times;</button>
              </form>
            </div>
          )}
          {/* --- TABLE --- */}
          <div className="overflow-x-auto w-full mt-4 rounded-xl border border-[var(--border)]">
            <div className="min-w-full">
              <table className="w-full divide-y divide-[var(--border)] text-sm">
                <thead className="bg-[var(--primary)]/5">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-3 sm:px-4 py-3 text-left font-semibold text-[var(--primary-dark)] whitespace-nowrap text-xs sm:text-sm tracking-wide">{col}</th>
                    ))}
                    {(activeMenu === "tiers" || activeMenu === "articles" || activeMenu === "achat" || activeMenu === "stock" || activeMenu === "ventes") && (
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-[var(--primary-dark)] whitespace-nowrap text-xs sm:text-sm tracking-wide">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + ((activeMenu === "tiers" || activeMenu === "articles" || activeMenu === "achat") ? 1 : (activeMenu === "stock" ? 1 : 0))} className="text-center text-[var(--muted)] py-8 text-sm">Aucune donnée</td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-[var(--card)]" : "bg-[var(--table-row-alt)] hover:bg-[var(--primary)]/10 transition-colors"}>
                        {row.map((cell, i) => (
                          <td key={i} className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm">{cell}</td>
                        ))}
                        {activeMenu === "tiers" && (
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <button
                                className="px-2 py-1.5 sm:py-1 text-xs bg-[var(--warning)]/10 text-[var(--warning)] rounded hover:bg-[var(--warning)]/20 transition"
                                onClick={() => handleEditClient(clients[idx].id)}
                              >
                                Éditer
                              </button>
                            </div>
                          </td>
                        )}
                        {activeMenu === "articles" && (
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <button
                                className="px-2 py-1.5 sm:py-1 text-xs bg-[var(--warning)]/10 text-[var(--warning)] rounded hover:bg-[var(--warning)]/20 transition"
                                onClick={() => handleEditArticle(idx)}
                              >
                                Éditer
                              </button>
                            </div>
                          </td>
                        )}
                        {activeMenu === "achat" && (
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <button
                                className="px-2 py-1.5 sm:py-1 text-xs bg-[var(--warning)]/10 text-[var(--warning)] rounded hover:bg-[var(--warning)]/20 transition"
                                onClick={() => handleEditAchat(idx)}
                              >
                                Éditer
                              </button>
                              <button
                                className="px-2 py-1.5 sm:py-1 text-xs bg-[var(--danger)]/10 text-[var(--danger)] rounded hover:bg-[var(--danger)]/20 transition"
                                onClick={() => handleDeleteAchat(idx)}
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        )}
                        {activeMenu === "stock" && (
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <button
                                className="px-2 py-1.5 sm:py-1 text-xs bg-[var(--danger)]/10 text-[var(--danger)] rounded hover:bg-[var(--danger)]/20 transition"
                                onClick={() => handleDeleteStock(idx)}
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        )}
                                              {activeMenu === "ventes" && (
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <button
                              className="px-2 py-1.5 sm:py-1 text-xs bg-[var(--warning)]/10 text-[var(--warning)] rounded hover:bg-[var(--warning)]/20 transition"
                              onClick={() => handleEditVente(ventes[idx].id)}
                            >
                              Éditer
                            </button>
                            <button
                              className="px-2 py-1.5 sm:py-1 text-xs bg-[var(--danger)]/10 text-[var(--danger)] rounded hover:bg-[var(--danger)]/20 transition"
                              onClick={() => handleDeleteVente(idx)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* ...modals and dialogs: update to use new palette, spacing, and shadow... */}
        </div>
      </main>
      {/* ...global fade-in animation remains... */}
      {/* Vente Delete Modal */}
      {showDeleteVenteIdx !== null && activeMenu === "ventes" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-red-700">Confirmer la suppression</h3>
            <p className="mb-6">Voulez-vous vraiment supprimer cette vente ? Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={cancelDeleteVente} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Annuler</button>
              <button onClick={confirmDeleteVente} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteStockIdx !== null && activeMenu === "stock" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-red-700">Confirmer la suppression</h3>
            <p className="mb-6">Voulez-vous vraiment supprimer cet article du stock ? Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={cancelDeleteStock} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Annuler</button>
              <button onClick={confirmDeleteStock} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 