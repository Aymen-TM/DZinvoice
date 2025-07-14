import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { 
  Client, Article, Achat, StockItem, Vente, 
  ClientForm, ArticleForm, AchatForm, TableData 
} from '@/types/erp';
import { 
  getClients, setClients, getArticles, setArticles, 
  getAchats, setAchats, getStock, setStock, 
  getVentes, setVentes 
} from '@/utils/erpStorage';
import { 
  exportClients, exportArticles, exportAchats, 
  exportStock, exportVentes 
} from '@/utils/erpExport';
import { deleteInvoice } from '@/utils/invoiceStorage';
import { ERP_MENU_ITEMS, DEFAULT_CLIENT_FORM, DEFAULT_ARTICLE_FORM, DEFAULT_ACHAT_FORM } from '@/constants/erp';

export function useERP() {
  const router = useRouter();
  
  // State management
  const [activeMenu, setActiveMenu] = useState("tiers");
  const [clients, setClientsState] = useState<Client[]>([]);
  const [articles, setArticlesState] = useState<Article[]>([]);
  const [achats, setAchatsState] = useState<Achat[]>([]);
  const [stock, setStockState] = useState<StockItem[]>([]);
  const [ventes, setVentesState] = useState<Vente[]>([]);

  // Form states
  const [showClientForm, setShowClientForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [showAchatForm, setShowAchatForm] = useState(false);
  const [clientForm, setClientForm] = useState<ClientForm>(DEFAULT_CLIENT_FORM);
  const [articleForm, setArticleForm] = useState<ArticleForm>(DEFAULT_ARTICLE_FORM);
  const [achatForm, setAchatForm] = useState<AchatForm>(DEFAULT_ACHAT_FORM);

  // Edit/Delete states
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [editArticleIdx, setEditArticleIdx] = useState<number | null>(null);
  const [editAchatIdx, setEditAchatIdx] = useState<number | null>(null);
  const [editVenteIdx, setEditVenteIdx] = useState<number | null>(null);
  const [showDeleteClientId, setShowDeleteClientId] = useState<string | null>(null);
  const [showDeleteArticleIdx, setShowDeleteArticleIdx] = useState<number | null>(null);
  const [showDeleteAchatIdx, setShowDeleteAchatIdx] = useState<number | null>(null);
  const [showDeleteVenteIdx, setShowDeleteVenteIdx] = useState<number | null>(null);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const [c, a, ac, s, v] = await Promise.all([
      getClients(),
      getArticles(),
      getAchats(),
      getStock(),
      getVentes(),
    ]);
    setClientsState(c);
    setArticlesState(a);
    setAchatsState(ac);
    setStockState(s);
    setVentesState(v);
  };

  // Table data generation
  const getTableData = (): TableData => {
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
          rows: achats.map((a) => [a.id.toString(), a.fournisseur, a.date, a.montant + " DA"]),
        };
      case "stock":
        return {
          columns: ["Référence", "Désignation", "Dépôt", "Quantité"],
          rows: stock.map(s => [s.ref, s.designation, s.depot, s.quantite.toString()]),
        };
      case "ventes":
        return {
          columns: ["Date", "Numéro Facture", "Prix H.T", "Montant Total HT", "Montant Total TTC"],
          rows: ventes.map((v) => [v.date, v.id, v.unitPrice + " DA", v.prixHT + " DA", v.montant + " DA"]),
        };
      default:
        return { columns: [], rows: [] };
    }
  };

  // Toolbar buttons generation
  const getToolbarButtons = () => {
    switch (activeMenu) {
      case "tiers":
        return [
          { key: "new", label: "Nouveau", onClick: () => setShowClientForm(true) },
          { key: "refresh", label: "Rafraîchir", onClick: loadAllData },
          { key: "export", label: "Exporter", onClick: () => exportClients(clients) },
        ];
      case "articles":
        return [
          { key: "new", label: "Nouveau", onClick: () => { setShowArticleForm(true); setEditArticleIdx(null); setArticleForm(DEFAULT_ARTICLE_FORM); } },
          { key: "refresh", label: "Rafraîchir", onClick: loadAllData },
          { key: "export", label: "Exporter", onClick: () => exportArticles(articles) },
        ];
      case "achat":
        return [
          { key: "new", label: "Nouveau", onClick: () => { setShowAchatForm(true); setEditAchatIdx(null); setAchatForm(DEFAULT_ACHAT_FORM); } },
          { key: "refresh", label: "Rafraîchir", onClick: loadAllData },
          { key: "export", label: "Exporter", onClick: () => exportAchats(achats) },
        ];
      case "stock":
        return [
          { key: "export", label: "Exporter", onClick: () => exportStock(stock) },
        ];
      case "ventes":
        return [
          { key: "new", label: "Nouveau", onClick: () => router.push('/create-invoice') },
          { key: "refresh", label: "Rafraîchir", onClick: loadAllData },
          { key: "export", label: "Exporter", onClick: () => exportVentes(ventes) },
        ];
      default:
        return [];
    }
  };

  return {
    // State
    activeMenu,
    clients,
    articles,
    achats,
    stock,
    ventes,
    showClientForm,
    showArticleForm,
    showAchatForm,
    clientForm,
    articleForm,
    achatForm,
    editClientId,
    editArticleIdx,
    editAchatIdx,
    editVenteIdx,
    showDeleteClientId,
    showDeleteArticleIdx,
    showDeleteAchatIdx,
    showDeleteVenteIdx,

    // Actions
    setActiveMenu,
    setShowClientForm,
    setShowArticleForm,
    setShowAchatForm,
    setClientForm,
    setArticleForm,
    setAchatForm,
    setEditClientId,
    setEditArticleIdx,
    setEditAchatIdx,
    setEditVenteIdx,
    setShowDeleteClientId,
    setShowDeleteArticleIdx,
    setShowDeleteAchatIdx,
    setShowDeleteVenteIdx,

    // Data
    menuItems: ERP_MENU_ITEMS,
    tableData: getTableData(),
    toolbarButtons: getToolbarButtons(),

    // Functions
    loadAllData,
    setClientsState,
    setArticlesState,
    setAchatsState,
    setStockState,
    setVentesState,
  };
} 