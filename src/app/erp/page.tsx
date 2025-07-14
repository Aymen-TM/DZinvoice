"use client";
import { useState, useEffect } from "react";
// For Excel export
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';
import { getClients, setClients, getArticles, setArticles, getAchats, setAchats, getStock, setStock, Client, Article, Achat, AchatArticle, StockItem } from '@/utils/invoiceStorage';

const MENU_ITEMS = [
  { key: "tiers", label: "Tiers" },
  { key: "articles", label: "Articles" },
  { key: "achat", label: "Achat" },
  { key: "stock", label: "Stock" },
  { key: "ventes", label: "Ventes" },
];

const TOOLBAR_BUTTONS = [
  { key: "new", label: "New" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "export", label: "Export" },
];

const TABLE_DATA = {
  tiers: [
    { id: 1, name: "Client A", type: "Client", city: "Algiers" },
    { id: 2, name: "Supplier B", type: "Supplier", city: "Oran" },
  ],
  articles: [
    { ref: "012020500001", designation: "CHILLED BONELESS BEEF BRISKET", qte: 934.5, prixAchat: 716.5, prixVente: 999.99 },
    { ref: "012020500007", designation: "FOREQUARTER CHILLED BONELESS BEEF", qte: 39149.83, prixAchat: 779.96, prixVente: 950.0 },
  ],
  achat: [
    { id: 1, fournisseur: "Supplier B", date: "2024-06-01", montant: 100000 },
  ],
  stock: [
    { id: 1, article: "BEEF BRISKET", qte: 500, depot: "Main" },
  ],
  ventes: [
    { id: 1, client: "Client A", date: "2024-06-02", montant: 25000 },
  ],
};

const emptyClient: Omit<Client, "id"> = {
  codeTiers: "",
  raisonSocial: "",
  famille: "Clients",
  nom: "",
  prenom: "",
  activite: "",
  adresse: "",
  ville: "",
  rc: "",
  nif: "",
  nis: "",
  ai: "",
};

const emptyArticle: Article = {
  ref: '',
  designation: '',
  qte: 0,
  prixAchat: 0,
  prixVente: 0,
};

const emptyAchat: Omit<Achat, 'id'> = {
  fournisseur: '',
  date: '',
  montant: 0,
  articles: [],
};
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
    await saveStock(newStock);
    setAchatForm(emptyAchat);
    setShowAchatForm(false);
  };

  const handleAchatCancel = () => {
    setAchatForm(emptyAchat);
    setShowAchatForm(false);
    setEditAchatIdx(null);
  };

  const handleEditAchat = (idx: number) => {
    const { id, ...rest } = achats[idx];
    setAchatForm(rest);
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
          columns: ["Référence", "Désignation", "Qte", "Prix Achat HT", "Prix Vente HT"],
          rows: articles.map((a) => [a.ref, a.designation, a.qte, a.prixAchat + " DA", a.prixVente + " DA"]),
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
        return {
          columns: ["ID", "Client", "Date", "Montant"],
          rows: TABLE_DATA.ventes.map((v) => [v.id, v.client, v.date, v.montant + " DA"]),
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
        { key: "export", label: "Exporter", onClick: () => handleExportClients() },
      ]
    : activeMenu === "articles"
    ? [
        { key: "new", label: "Nouveau", onClick: () => { setShowArticleForm(true); setEditArticleIdx(null); setArticleForm(emptyArticle); } },
        { key: "refresh", label: "Rafraîchir", onClick: async () => { const a = await getArticles() as Article[]; setArticlesState(a); } },
        { key: "export", label: "Exporter", onClick: () => handleExportArticles() },
      ]
    : activeMenu === "achat"
    ? [
        { key: "new", label: "Nouveau", onClick: () => { setShowAchatForm(true); setEditAchatIdx(null); setAchatForm(emptyAchat); } },
        { key: "refresh", label: "Rafraîchir", onClick: async () => { const ac = await getAchats() as Achat[]; setAchatsState(ac); } },
        { key: "export", label: "Exporter", onClick: () => handleExportAchats() },
      ]
    : activeMenu === "stock"
    ? [
        { key: "export", label: "Exporter", onClick: () => handleExportStock() },
      ]
    : TOOLBAR_BUTTONS;

  // Export stock to Excel
  function handleExportStock() {
    if (stock.length === 0) return;
    const ws = XLSXUtils.json_to_sheet(stock.map(({ ref, designation, depot, quantite }) => ({
      'Référence': ref,
      'Désignation': designation,
      'Dépôt': depot,
      'Quantité': quantite,
    })));
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Stock');
    XLSXWriteFile(wb, 'stock.xlsx');
  }
  // Export clients to Excel
  function handleExportClients() {
    if (clients.length === 0) return;
    const ws = XLSXUtils.json_to_sheet(clients.map(({ codeTiers, raisonSocial, famille, activite, adresse, ville, rc, nif, nis, ai }) => ({
      'Code Tiers': codeTiers,
      'Raison Sociale': raisonSocial,
      'Famille': famille,
      'Activité': activite,
      'Adresse': adresse,
      'Ville': ville,
      'RC': rc,
      'NIF': nif,
      'NIS': nis,
      'AI': ai,
    })));
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Tiers');
    XLSXWriteFile(wb, 'clients.xlsx');
  }
  // Export articles to Excel
  function handleExportArticles() {
    if (articles.length === 0) return;
    const ws = XLSXUtils.json_to_sheet(articles.map(({ ref, designation, prixAchat, prixVente }) => ({
      'Référence': ref,
      'Désignation': designation,
      'Prix Achat HT': prixAchat,
      'Prix Vente HT': prixVente,
    })));
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Articles');
    XLSXWriteFile(wb, 'articles.xlsx');
  }
  // Export achats to Excel
  function handleExportAchats() {
    if (achats.length === 0) return;
    const ws = XLSXUtils.json_to_sheet(achats.map(({ id, fournisseur, date, montant, articles }) => ({
      'ID': id,
      'Fournisseur': fournisseur,
      'Date': date,
      'Montant': montant,
      'Articles': articles.map(a => `${a.ref} (${a.designation}) x${a.quantite} [${a.depot}]`).join('; '),
    })));
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Achats');
    XLSXWriteFile(wb, 'achats.xlsx');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pt-16">
      {/* Top Menu Bar */}
      <nav className="w-full bg-white shadow z-30 flex flex-col sm:flex-row items-center h-auto sm:h-14 px-2 sm:px-4 border-b border-gray-200 sticky top-0">
        <div className="flex flex-wrap gap-2 sm:gap-6 w-full justify-center sm:justify-start py-2 sm:py-0">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`px-3 sm:px-4 py-2 font-semibold text-xs sm:text-sm rounded transition-colors duration-200 ${activeMenu === item.key ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"}`}
              onClick={() => setActiveMenu(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 shadow-sm flex flex-col sm:flex-row items-center px-2 sm:px-4 h-auto sm:h-12 z-30 sticky top-14">
        <div className="flex flex-wrap gap-2 w-full justify-center sm:justify-start py-2 sm:py-0">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.key}
              className="px-3 sm:px-3 py-2 sm:py-1.5 bg-white border border-gray-200 rounded text-gray-700 font-medium text-xs sm:text-xs hover:bg-blue-100 transition-colors"
              {...(typeof btn.onClick === 'function' ? { onClick: btn.onClick } : {})}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-2 sm:p-6 pt-4 sm:pt-8 overflow-x-auto">
        <div className="bg-white rounded-xl shadow border border-gray-100 p-2 sm:p-4">
          <h2 className="text-base sm:text-lg font-bold mb-4 text-blue-700">{MENU_ITEMS.find((m) => m.key === activeMenu)?.label}</h2>
          {activeMenu === "tiers" && showClientForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <form
                onSubmit={handleClientSubmit}
                className="relative bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-lg sm:max-w-2xl p-0 overflow-hidden animate-fade-in mx-2"
              >
                <div className="flex items-center gap-3 px-4 sm:px-6 pt-6 pb-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-blue-700">Ajouter / Modifier un client</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-br from-white via-blue-50 to-blue-100">
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">Code Tiers</label>
                    <input name="codeTiers" value={clientForm.codeTiers} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Code Tiers" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">Raison Sociale *</label>
                    <input name="raisonSocial" value={clientForm.raisonSocial} onChange={handleClientChange} required className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Raison Sociale" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">Famille</label>
                    <input name="famille" value={clientForm.famille} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Famille" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">Activité</label>
                    <input name="activite" value={clientForm.activite} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Activité" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">Adresse</label>
                    <input name="adresse" value={clientForm.adresse} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Adresse" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">Ville</label>
                    <input name="ville" value={clientForm.ville} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Ville" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">RC</label>
                    <input name="rc" value={clientForm.rc} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="RC" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">NIF</label>
                    <input name="nif" value={clientForm.nif} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="NIF" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">NIS</label>
                    <input name="nis" value={clientForm.nis} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="NIS" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-blue-700">AI</label>
                    <input name="ai" value={clientForm.ai} onChange={handleClientChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="AI" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100 justify-end">
                  <button type="button" onClick={handleClientCancel} className="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Annuler</button>
                  <button type="submit" className="px-5 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow transition">Enregistrer</button>
                  {clientError && <span className="text-red-500 ml-4 self-center text-xs sm:text-sm">{clientError}</span>}
                </div>
                <button type="button" onClick={handleClientCancel} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none">&times;</button>
              </form>
            </div>
          )}
          {activeMenu === "articles" && showArticleForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <form
                onSubmit={handleArticleSubmit}
                className="relative bg-white rounded-2xl shadow-2xl border border-orange-100 w-full max-w-lg sm:max-w-2xl p-0 overflow-hidden animate-fade-in mx-2"
              >
                <div className="flex items-center gap-3 px-4 sm:px-6 pt-6 pb-2 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-orange-700">Ajouter / Modifier un article</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-br from-white via-orange-50 to-orange-100">
                  <div>
                    <label className="block font-semibold mb-1 text-orange-700">Référence *</label>
                    <input name="ref" value={articleForm.ref} onChange={handleArticleChange} required className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Référence" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-orange-700">Désignation *</label>
                    <input name="designation" value={articleForm.designation} onChange={handleArticleChange} required className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Désignation" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-orange-700">Prix Achat HT</label>
                    <input name="prixAchat" type="number" value={articleForm.prixAchat} onChange={handleArticleChange} className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Prix Achat HT" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-orange-700">Prix Vente HT</label>
                    <input name="prixVente" type="number" value={articleForm.prixVente} onChange={handleArticleChange} className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Prix Vente HT" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100 justify-end">
                  <button type="button" onClick={handleArticleCancel} className="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Annuler</button>
                  <button type="submit" className="px-5 py-2 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 shadow transition">Enregistrer</button>
                </div>
                <button type="button" onClick={handleArticleCancel} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none">&times;</button>
              </form>
            </div>
          )}
          {activeMenu === "achat" && showAchatForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <form
                onSubmit={handleAchatSubmit}
                className="relative bg-white rounded-2xl shadow-2xl border border-green-100 w-full max-w-lg sm:max-w-2xl p-0 overflow-hidden animate-fade-in mx-2"
              >
                <div className="flex items-center gap-3 px-4 sm:px-6 pt-6 pb-2 border-b border-green-100 bg-gradient-to-r from-green-50 to-green-100">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h1l2 9a2 2 0 002 2h8a2 2 0 002-2l2-9h1" /></svg>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-green-700">Ajouter / Modifier un achat</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-br from-white via-green-50 to-green-100">
                  <div>
                    <label className="block font-semibold mb-1 text-green-700">Fournisseur *</label>
                    <input name="fournisseur" value={achatForm.fournisseur} onChange={handleAchatChange} required className="w-full px-4 py-2.5 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Fournisseur" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-green-700">Date *</label>
                    <input name="date" type="date" value={achatForm.date} onChange={handleAchatChange} required className="w-full px-4 py-2.5 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Date" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-green-700">Montant</label>
                    <input name="montant" type="number" value={achatForm.montant} onChange={handleAchatChange} className="w-full px-4 py-2.5 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Montant" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-2 text-green-700">Articles achetés</label>
                    <div className="space-y-3">
                      {achatForm.articles.map((art, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-2 md:gap-4 items-center bg-green-50 border border-green-200 rounded-lg p-3">
                          <input
                            type="text"
                            value={art.ref}
                            onChange={e => handleAchatArticleChange(idx, 'ref', e.target.value)}
                            className="w-full md:w-40 px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Référence"
                          />
                          <input
                            type="text"
                            value={art.designation}
                            onChange={e => handleAchatArticleChange(idx, 'designation', e.target.value)}
                            className="w-full md:flex-1 px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Désignation"
                          />
                          <input
                            type="number"
                            min="1"
                            value={art.quantite}
                            onChange={e => handleAchatArticleChange(idx, 'quantite', e.target.value)}
                            className="w-24 px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Quantité"
                          />
                          <input
                            type="text"
                            value={art.depot}
                            onChange={e => handleAchatArticleChange(idx, 'depot', e.target.value)}
                            className="w-32 px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white/80 placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Dépôt"
                          />
                          <button type="button" onClick={() => handleRemoveAchatArticle(idx)} className="text-red-500 hover:text-red-700 text-lg font-bold px-2">&times;</button>
                        </div>
                      ))}
                      <button type="button" onClick={handleAddAchatArticle} className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition flex items-center gap-2">
                        <span>Ajouter un article</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-green-100 bg-gradient-to-r from-green-50 to-green-100 justify-end">
                  <button type="button" onClick={handleAchatCancel} className="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Annuler</button>
                  <button type="submit" className="px-5 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 shadow transition">Enregistrer</button>
                </div>
                <button type="button" onClick={handleAchatCancel} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none">&times;</button>
              </form>
            </div>
          )}
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-blue-50">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-2 sm:px-4 py-2 text-left font-semibold text-blue-700 whitespace-nowrap text-xs sm:text-sm">{col}</th>
                  ))}
                  {(activeMenu === "tiers" || activeMenu === "articles" || activeMenu === "achat") && <th className="px-2 sm:px-4 py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + ((activeMenu === "tiers" || activeMenu === "articles" || activeMenu === "achat") ? 1 : 0)} className="text-center text-gray-400 py-8">Aucune donnée</td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                      {row.map((cell, i) => (
                        <td key={i} className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">{cell}</td>
                      ))}
                      {activeMenu === "tiers" && (
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap flex gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                            onClick={() => handleEditClient(clients[idx].id)}
                          >
                            Éditer
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                            onClick={() => handleDeleteClient(clients[idx].id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      )}
                      {activeMenu === "articles" && (
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap flex gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                            onClick={() => handleEditArticle(idx)}
                          >
                            Éditer
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                            onClick={() => handleDeleteArticle(idx)}
                          >
                            Supprimer
                          </button>
                        </td>
                      )}
                      {activeMenu === "achat" && (
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap flex gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                            onClick={() => handleEditAchat(idx)}
                          >
                            Éditer
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                            onClick={() => handleDeleteAchat(idx)}
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
        </div>
      </main>

      {/* Edit/Delete Modals */}
      {showDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-red-700">Confirmer la suppression</h3>
            <p className="mb-6">Voulez-vous vraiment supprimer ce client ? Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={cancelDeleteClient} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Annuler</button>
              <button onClick={confirmDeleteClient} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {/* Article Delete Modal */}
      {showDeleteArticleIdx !== null && activeMenu === "articles" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-red-700">Confirmer la suppression</h3>
            <p className="mb-6">Voulez-vous vraiment supprimer cet article ? Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={cancelDeleteArticle} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Annuler</button>
              <button onClick={confirmDeleteArticle} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {/* Achat Delete Modal */}
      {showDeleteAchatIdx !== null && activeMenu === "achat" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-red-700">Confirmer la suppression</h3>
            <p className="mb-6">Voulez-vous vraiment supprimer cet achat ? Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={cancelDeleteAchat} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Annuler</button>
              <button onClick={confirmDeleteAchat} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {/* Add fade-in animation */}
      <style jsx global>{`
        .animate-fade-in {
          animation: fade-in-modal 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fade-in-modal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 