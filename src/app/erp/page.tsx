"use client";
import { useState, useEffect } from "react";
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
};

type ToolbarButton = { key: string; label: string; onClick?: () => void };

export default function AccueilERPTest() {
  const [activeMenu, setActiveMenu] = useState("articles");
  const [clients, setClientsState] = useState<Client[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState<Omit<Client, "id">>(emptyClient);
  const [clientError, setClientError] = useState("");
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [articles, setArticlesState] = useState<Article[]>([]);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [articleForm, setArticleForm] = useState<Article>(emptyArticle);
  const [editArticleIdx, setEditArticleIdx] = useState<number | null>(null);
  const [showDeleteArticleIdx, setShowDeleteArticleIdx] = useState<number | null>(null);
  const [achats, setAchatsState] = useState<Achat[]>([]);
  const [showAchatForm, setShowAchatForm] = useState(false);
  const [achatForm, setAchatForm] = useState<Omit<Achat, 'id'>>(emptyAchat);
  const [editAchatIdx, setEditAchatIdx] = useState<number | null>(null);
  const [showDeleteAchatIdx, setShowDeleteAchatIdx] = useState<number | null>(null);
  const [stock, setStockState] = useState<StockItem[]>([]);
  const [ventes, setVentesState] = useState<Vente[]>([]);
  const [showDeleteVenteIdx, setShowDeleteVenteIdx] = useState<number | null>(null);
  const router = useRouter();

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

  const handleDeleteClient = (id: string) => {
    setShowDeleteId(id);
  };

  const confirmDeleteClient = async () => {
    if (showDeleteId) {
      const updatedClients = clients.filter((c) => c.id !== showDeleteId);
      await saveClients(updatedClients);
      setShowDeleteId(null);
    }
  };

  const cancelDeleteClient = () => {
    setShowDeleteId(null);
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

  const handleDeleteArticle = (idx: number) => {
    setShowDeleteArticleIdx(idx);
  };

  const confirmDeleteArticle = async () => {
    if (showDeleteArticleIdx !== null) {
      const updated = articles.filter((_, i) => i !== showDeleteArticleIdx);
      await saveArticles(updated);
      setShowDeleteArticleIdx(null);
    }
  };

  const cancelDeleteArticle = () => {
    setShowDeleteArticleIdx(null);
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

  const handleAchatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achatForm.fournisseur.trim() || !achatForm.date.trim()) return;
    let newAchats;
    if (editAchatIdx !== null) {
      // Edit mode
      const updated = [...achats];
      updated[editAchatIdx] = { ...achats[editAchatIdx], ...achatForm };
      newAchats = updated;
      await saveAchats(updated);
      setEditAchatIdx(null);
    } else {
      // Add mode
      newAchats = [...achats, { ...achatForm, id: Date.now() }];
      await saveAchats(newAchats);
    }
    // Update stock for each article in achat
    const newStock = [...stock];
    achatForm.articles.forEach(art => {
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

  const handleDeleteAchat = (idx: number) => {
    setShowDeleteAchatIdx(idx);
  };

  const confirmDeleteAchat = async () => {
    if (showDeleteAchatIdx !== null) {
      const updated = achats.filter((_, i) => i !== showDeleteAchatIdx);
      await saveAchats(updated);
      setShowDeleteAchatIdx(null);
    }
  };

  const cancelDeleteAchat = () => {
    setShowDeleteAchatIdx(null);
  };

  // STOCK CRUD
  const saveStock = async (newStock: StockItem[]) => {
    setStockState(newStock);
    await setStock(newStock);
  };

  // VENTE CRUD
  const saveVentes = async (newVentes: Vente[]) => {
    setVentesState(newVentes);
    await setVentes(newVentes);
  };
  const handleDeleteVente = (idx: number) => {
    setShowDeleteVenteIdx(idx);
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
      <nav className="w-full bg-[var(--card)] shadow z-30 flex flex-col sm:flex-row items-center h-auto sm:h-16 px-2 sm:px-8 border-b border-[var(--border)] sticky top-0">
        <div className="flex flex-wrap gap-2 sm:gap-6 w-full justify-center sm:justify-start py-2 sm:py-0">
          {ERP_MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`px-4 py-2 font-semibold text-sm rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${activeMenu === item.key ? "bg-[var(--primary)] text-white shadow" : "text-[var(--primary-dark)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"}`}
              onClick={() => setActiveMenu(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Toolbar */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-center px-2 sm:px-8 h-auto sm:h-14 z-30 sticky top-16">
        <div className="flex flex-wrap gap-2 w-full justify-center sm:justify-start py-2 sm:py-0">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.key}
              className="px-4 py-2 bg-[var(--primary)]/5 border border-[var(--border)] rounded-xl text-[var(--primary-dark)] font-medium text-sm hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors"
              {...(typeof btn.onClick === 'function' ? { onClick: btn.onClick } : {})}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-2 sm:p-8 pt-4 sm:pt-10 overflow-x-auto">
        <div className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] p-2 sm:p-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-6 text-[var(--primary-dark)] tracking-tight">{ERP_MENU_ITEMS.find((m) => m.key === activeMenu)?.label}</h2>
          {/* --- FORMS --- */}
          {activeMenu === "tiers" && showClientForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <form
                onSubmit={handleClientSubmit}
                className="relative bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--primary)]/20 w-full max-w-lg sm:max-w-2xl p-0 overflow-hidden animate-fade-in mx-2"
              >
                <div className="flex items-center gap-3 px-6 pt-6 pb-2 border-b border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10">
                  <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--primary-dark)]">Ajouter / Modifier un client</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-6 py-6 bg-gradient-to-br from-[var(--card)] via-[var(--primary)]/5 to-[var(--primary)]/10">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Code Tiers</label>
                    <input name="codeTiers" value={clientForm.codeTiers} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Code Tiers" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Raison Sociale *</label>
                    <input name="raisonSocial" value={clientForm.raisonSocial} onChange={handleClientChange} required className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Raison Sociale" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Famille</label>
                    <input name="famille" value={clientForm.famille} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Famille" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Activité</label>
                    <input name="activite" value={clientForm.activite} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Activité" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Adresse</label>
                    <input name="adresse" value={clientForm.adresse} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Adresse" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Ville</label>
                    <input name="ville" value={clientForm.ville} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Ville" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">RC</label>
                    <input name="rc" value={clientForm.rc} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="RC" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">NIF</label>
                    <input name="nif" value={clientForm.nif} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="NIF" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">NIS</label>
                    <input name="nis" value={clientForm.nis} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="NIS" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">AI</label>
                    <input name="ai" value={clientForm.ai} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="AI" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-2 border-t border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 justify-end">
                  <button type="button" onClick={handleClientCancel} className="px-5 py-2 rounded-lg font-semibold bg-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/80 transition">Annuler</button>
                  <button type="submit" className="px-5 py-2 rounded-lg font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow transition">Enregistrer</button>
                  {clientError && <span className="text-[var(--danger)] ml-4 self-center text-xs sm:text-sm">{clientError}</span>}
                </div>
                <button type="button" onClick={handleClientCancel} className="absolute top-3 right-3 text-[var(--muted)] hover:text-[var(--danger)] text-2xl font-bold focus:outline-none">&times;</button>
              </form>
            </div>
          )}
          {activeMenu === "articles" && showArticleForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <form
                onSubmit={handleArticleSubmit}
                className="relative bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--primary)]/20 w-full max-w-lg sm:max-w-2xl p-0 overflow-hidden animate-fade-in mx-2"
              >
                <div className="flex items-center gap-3 px-6 pt-6 pb-2 border-b border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10">
                  <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--primary-dark)]">Ajouter / Modifier un article</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-6 py-6 bg-gradient-to-br from-[var(--card)] via-[var(--primary)]/5 to-[var(--primary)]/10">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Référence *</label>
                    <input name="ref" value={articleForm.ref} onChange={handleArticleChange} required className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Référence" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Désignation *</label>
                    <input name="designation" value={articleForm.designation} onChange={handleArticleChange} required className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Désignation" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Prix Achat HT</label>
                    <input name="prixAchat" type="number" value={articleForm.prixAchat} onChange={handleArticleChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Prix Achat HT" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Prix Vente HT</label>
                    <input name="prixVente" type="number" value={articleForm.prixVente} onChange={handleArticleChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Prix Vente HT" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-2 border-t border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 justify-end">
                  <button type="button" onClick={handleArticleCancel} className="px-5 py-2 rounded-lg font-semibold bg-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/80 transition">Annuler</button>
                  <button type="submit" className="px-5 py-2 rounded-lg font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow transition">Enregistrer</button>
                </div>
                <button type="button" onClick={handleArticleCancel} className="absolute top-3 right-3 text-[var(--muted)] hover:text-[var(--danger)] text-2xl font-bold focus:outline-none">&times;</button>
              </form>
            </div>
          )}
          {activeMenu === "achat" && showAchatForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <form
                onSubmit={handleAchatSubmit}
                className="relative bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--primary)]/20 w-full max-w-lg sm:max-w-2xl p-0 overflow-hidden animate-fade-in mx-2"
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
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Montant</label>
                    <input name="montant" type="number" value={achatForm.montant} onChange={handleAchatChange} className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Montant" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)]">Articles achetés</label>
                    <div className="space-y-3">
                      {achatForm.articles.map((art, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-2 md:gap-4 items-center bg-[var(--primary)]/5 border border-[var(--border)] rounded-lg p-3">
                          <input
                            type="text"
                            value={art.ref}
                            onChange={e => handleAchatArticleChange(idx, 'ref', e.target.value)}
                            className="w-full md:w-40 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Référence"
                          />
                          <input
                            type="text"
                            value={art.designation}
                            onChange={e => handleAchatArticleChange(idx, 'designation', e.target.value)}
                            className="w-full md:flex-1 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Désignation"
                          />
                          <input
                            type="number"
                            min="1"
                            value={art.quantite}
                            onChange={e => handleAchatArticleChange(idx, 'quantite', e.target.value)}
                            className="w-24 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Quantité"
                          />
                          <input
                            type="text"
                            value={art.depot}
                            onChange={e => handleAchatArticleChange(idx, 'depot', e.target.value)}
                            className="w-32 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Dépôt"
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
                <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-2 border-t border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 justify-end">
                  <button type="button" onClick={handleAchatCancel} className="px-5 py-2 rounded-lg font-semibold bg-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/80 transition">Annuler</button>
                  <button type="submit" className="px-5 py-2 rounded-lg font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow transition">Enregistrer</button>
                </div>
                <button type="button" onClick={handleAchatCancel} className="absolute top-3 right-3 text-[var(--muted)] hover:text-[var(--danger)] text-2xl font-bold focus:outline-none">&times;</button>
              </form>
            </div>
          )}
          {/* --- TABLE --- */}
          <div className="overflow-x-auto w-full mt-4">
            <table className="min-w-full divide-y divide-[var(--border)] text-sm">
              <thead className="bg-[var(--primary)]/5">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left font-semibold text-[var(--primary-dark)] whitespace-nowrap text-sm tracking-wide">{col}</th>
                  ))}
                  {(activeMenu === "tiers" || activeMenu === "articles" || activeMenu === "achat") && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + ((activeMenu === "tiers" || activeMenu === "articles" || activeMenu === "achat") ? 1 : 0)} className="text-center text-[var(--muted)] py-8">Aucune donnée</td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-[var(--card)]" : "bg-[var(--table-row-alt)] hover:bg-[var(--primary)]/10 transition-colors"}>
                      {row.map((cell, i) => (
                        <td key={i} className="px-4 py-3 whitespace-nowrap text-sm">{cell}</td>
                      ))}
                      {activeMenu === "tiers" && (
                        <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-[var(--warning)]/10 text-[var(--warning)] rounded hover:bg-[var(--warning)]/20 transition"
                            onClick={() => handleEditClient(clients[idx].id)}
                          >
                            Éditer
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-[var(--danger)]/10 text-[var(--danger)] rounded hover:bg-[var(--danger)]/20 transition"
                            onClick={() => handleDeleteClient(clients[idx].id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      )}
                      {activeMenu === "articles" && (
                        <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-[var(--warning)]/10 text-[var(--warning)] rounded hover:bg-[var(--warning)]/20 transition"
                            onClick={() => handleEditArticle(idx)}
                          >
                            Éditer
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-[var(--danger)]/10 text-[var(--danger)] rounded hover:bg-[var(--danger)]/20 transition"
                            onClick={() => handleDeleteArticle(idx)}
                          >
                            Supprimer
                          </button>
                        </td>
                      )}
                      {activeMenu === "achat" && (
                        <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-[var(--warning)]/10 text-[var(--warning)] rounded hover:bg-[var(--warning)]/20 transition"
                            onClick={() => handleEditAchat(idx)}
                          >
                            Éditer
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-[var(--danger)]/10 text-[var(--danger)] rounded hover:bg-[var(--danger)]/20 transition"
                            onClick={() => handleDeleteAchat(idx)}
                          >
                            Supprimer
                          </button>
                        </td>
                      )}
                      {activeMenu === "ventes" && (
                        <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-[var(--warning)]/10 text-[var(--warning)] rounded hover:bg-[var(--warning)]/20 transition"
                            disabled
                          >
                            Éditer
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-[var(--danger)]/10 text-[var(--danger)] rounded hover:bg-[var(--danger)]/20 transition"
                            onClick={() => handleDeleteVente(idx)}
                          >
                            Supprimer
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
    </div>
  );
} 