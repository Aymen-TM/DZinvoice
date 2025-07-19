"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import type { Client, Article, Achat, AchatArticle, StockItem, Vente } from '@/types/erp';
import { 
  getClients, setClients, getArticles, setArticles, 
  getAchats, setAchats, getStock, setStock 
} from '@/utils/erpStorage';
import { getVentes, setVentes, getCompleteInvoiceById, getCompleteInvoices, deleteCompleteInvoice } from '@/utils/invoiceStorage';
import { 
  exportClients, exportArticles, exportAchats, 
  exportStock, exportVentes 
} from '@/utils/erpExport';
import { ERP_MENU_ITEMS, DEFAULT_CLIENT_FORM, DEFAULT_ARTICLE_FORM, DEFAULT_ACHAT_FORM } from '@/constants/erp';
import localforage from 'localforage';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { Suspense } from "react";
import ERPTable from '@/components/ERPTable';
import { useSettingsContext } from '@/components/SettingsProvider';

const TOOLBAR_BUTTONS = [
  { key: "new", label: "New" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "export", label: "Export" },
];

const emptyClient: Omit<Client, "id"> = DEFAULT_CLIENT_FORM;

const emptyArticle: Article = { ...DEFAULT_ARTICLE_FORM, id: '' };

const emptyAchat: Omit<Achat, 'id'> = DEFAULT_ACHAT_FORM;
const emptyAchatArticle: AchatArticle = { id: '', ref: '', designation: '', quantite: 1, depot: '', prixAchat: 0 };

type ToolbarButton = { key: string; label: string; onClick?: () => void };

function AccueilERPTest() {
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
  const [achatForm, setAchatForm] = useState<Omit<Achat, 'id'>>({ ...emptyAchat, articles: [] });
  const [editAchatIdx, setEditAchatIdx] = useState<number | null>(null);
  const [stock, setStockState] = useState<StockItem[]>([]);
  const [ventes, setVentesState] = useState<Vente[]>([]);
  const [showDeleteVenteIdx, setShowDeleteVenteIdx] = useState<number | null>(null);
  const [showDeleteStockIdx, setShowDeleteStockIdx] = useState<number | null>(null);
  const [showDeleteArticleIdx, setShowDeleteArticleIdx] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency, settings } = useSettingsContext();

  // Add at the top level of AccueilERPTest, after other useState hooks
  const [achatArticleRefDropdown, setAchatArticleRefDropdown] = useState<boolean[]>([]);
  const [achatArticleRefFiltered, setAchatArticleRefFiltered] = useState<Article[][]>([]);
  const [achatArticleDesDropdown, setAchatArticleDesDropdown] = useState<boolean[]>([]);
  const [achatArticleDesFiltered, setAchatArticleDesFiltered] = useState<Article[][]>([]);
  const achatArticleRefInputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const achatArticleDesInputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [depots, setDepots] = useState<string[]>([]);

  // Sorting and filtering state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Change filters state to support multi-select
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});
  const [filterDropdownOpen, setFilterDropdownOpen] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState<{ [key: string]: string }>({});
  const [pendingFilters, setPendingFilters] = useState<{ [key: string]: string[] }>({});

  // Add state for depot autocomplete
  const [achatDepotDropdown, setAchatDepotDropdown] = useState<boolean[]>([]);
  const [achatDepotFiltered, setAchatDepotFiltered] = useState<string[][]>([]);

  const [pdfLoadingIdx, setPdfLoadingIdx] = useState<number | null>(null);

  // Add at the top level of AccueilERPTest, after other useState hooks
  const [clientActiviteOptions, setClientActiviteOptions] = useState<{ CODE: string; LIBELLE: string }[]>([]);
  const [clientActiviteInput, setClientActiviteInput] = useState("");
  const [clientActiviteSuggestions, setClientActiviteSuggestions] = useState<{ CODE: string; LIBELLE: string }[]>([]);
  const [showClientActiviteSuggestions, setShowClientActiviteSuggestions] = useState(false);
  const [clientActiviteHighlighted, setClientActiviteHighlighted] = useState(-1);
  const clientActiviteRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [clientAIWarning, setClientAIWarning] = useState("");
  const [clientAIInput, setClientAIInput] = useState("");
  const [clientNIFWarning, setClientNIFWarning] = useState("");
  const [clientNISWarning, setClientNISWarning] = useState("");
  const [clientNIFInput, setClientNIFInput] = useState("");
  const [clientNISInput, setClientNISInput] = useState("");

  const [familleOptions, setFamilleOptions] = useState<string[]>([]);
  const [familleInput, setFamilleInput] = useState("");
  const [familleSuggestions, setFamilleSuggestions] = useState<string[]>([]);
  const [showFamilleSuggestions, setShowFamilleSuggestions] = useState(false);
  const [familleHighlighted, setFamilleHighlighted] = useState(-1);
  const familleRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Move this after columns is defined:
  // const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  // const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/codes_nomenclature.json')
      .then(res => res.json())
      .then(data => setClientActiviteOptions(data));
  }, []);

  useEffect(() => {
    setClientActiviteInput(clientForm.activite || "");
  }, [clientForm.activite, showClientForm]);

  useEffect(() => {
    if (
      clientActiviteHighlighted >= 0 &&
      clientActiviteHighlighted < clientActiviteSuggestions.length &&
      clientActiviteRefs.current[clientActiviteHighlighted]
    ) {
      clientActiviteRefs.current[clientActiviteHighlighted]?.scrollIntoView({ block: 'nearest' });
    }
  }, [clientActiviteHighlighted, clientActiviteSuggestions]);

  useEffect(() => {
    setClientAIInput(clientForm.ai || "");
    setClientNIFInput(clientForm.nif || "");
    setClientNISInput(clientForm.nis || "");
  }, [showClientForm, clientForm.ai, clientForm.nif, clientForm.nis]);

  useEffect(() => {
    // Gather unique famille values from all clients
    const uniqueFamilles = Array.from(new Set(clients.map(c => c.famille).filter(f => f && f.trim() !== "")));
    setFamilleOptions(uniqueFamilles);
  }, [clients]);

  useEffect(() => {
    setFamilleInput(clientForm.famille || "");
  }, [clientForm.famille, showClientForm]);

  useEffect(() => {
    if (
      familleHighlighted >= 0 &&
      familleHighlighted < familleSuggestions.length &&
      familleRefs.current[familleHighlighted]
    ) {
      familleRefs.current[familleHighlighted]?.scrollIntoView({ block: 'nearest' });
    }
  }, [familleHighlighted, familleSuggestions]);

  const handleClientActiviteInput = (value: string) => {
    setClientActiviteInput(value);
    setClientForm((prev) => ({ ...prev, activite: value }));
    if (value.length > 1) {
      const suggestions = clientActiviteOptions.filter(opt =>
        opt.LIBELLE.toLowerCase().includes(value.toLowerCase()) ||
        opt.CODE.includes(value)
      ).slice(0, 10);
      setClientActiviteSuggestions(suggestions);
      setShowClientActiviteSuggestions(true);
      setClientActiviteHighlighted(-1);
    } else {
      setShowClientActiviteSuggestions(false);
      setClientActiviteHighlighted(-1);
    }
  };

  const handleClientActiviteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showClientActiviteSuggestions || clientActiviteSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setClientActiviteHighlighted(h => Math.min(h + 1, clientActiviteSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setClientActiviteHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (clientActiviteHighlighted >= 0 && clientActiviteHighlighted < clientActiviteSuggestions.length) {
        handleClientActiviteSelect(clientActiviteSuggestions[clientActiviteHighlighted].LIBELLE);
      }
    } else if (e.key === 'Escape') {
      setShowClientActiviteSuggestions(false);
    }
  };

  const handleClientActiviteSelect = (libelle: string) => {
    setClientActiviteInput(libelle);
    setClientForm((prev) => ({ ...prev, activite: libelle }));
    setShowClientActiviteSuggestions(false);
  };

  const handleFamilleInput = (value: string) => {
    setFamilleInput(value);
    setClientForm((prev) => ({ ...prev, famille: value }));
    if (value.length > 0) {
      const suggestions = familleOptions.filter(opt =>
        opt.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setFamilleSuggestions(suggestions);
      setShowFamilleSuggestions(true);
      setFamilleHighlighted(-1);
    } else {
      setShowFamilleSuggestions(false);
      setFamilleHighlighted(-1);
    }
  };

  const handleFamilleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showFamilleSuggestions || familleSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFamilleHighlighted(h => Math.min(h + 1, familleSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFamilleHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (familleHighlighted >= 0 && familleHighlighted < familleSuggestions.length) {
        handleFamilleSelect(familleSuggestions[familleHighlighted]);
      }
    } else if (e.key === 'Escape') {
      setShowFamilleSuggestions(false);
    }
  };

  const handleFamilleSelect = (famille: string) => {
    setFamilleInput(famille);
    setClientForm((prev) => ({ ...prev, famille }));
    setShowFamilleSuggestions(false);
  };

  // Sync arrays with achatForm.articles length
  useEffect(() => {
    setAchatArticleRefDropdown((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? false));
    setAchatArticleRefFiltered((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? articles));
    setAchatArticleDesDropdown((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? false));
    setAchatArticleDesFiltered((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? articles));
    achatArticleRefInputRefs.current = achatForm.articles.map((_, idx) => achatArticleRefInputRefs.current[idx] ?? null);
    achatArticleDesInputRefs.current = achatForm.articles.map((_, idx) => achatArticleDesInputRefs.current[idx] ?? null);
  }, [achatForm.articles.length, achatForm.articles, articles]);

  // Sync depot autocomplete arrays with achatForm.articles length
  useEffect(() => {
    setAchatDepotDropdown((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? false));
    setAchatDepotFiltered((prev) => achatForm.articles.map((_, idx) => prev[idx] ?? depots));
  }, [achatForm.articles.length, achatForm.articles, depots]);

  // Load depots from stock on mount
  useEffect(() => {
    (async () => {
      const s = await getStock();
      const uniqueDepots = Array.from(new Set(s.map(item => item.depot).filter(Boolean)));
      setDepots(uniqueDepots);
    })();
  }, []);

  // Add debug log for article changes
  useEffect(() => {
    console.log('achatForm.articles changed:', achatForm.articles);
  }, [achatForm.articles]);

  // Sync activeMenu with ?tab=... in the URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeMenu) {
      setActiveMenu(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Handlers for reference field
  const handleAchatArticleRefSearchChange = (idx: number, value: string) => {
    setAchatArticleRefDropdown((prev) => prev.map((v, i) => (i === idx ? true : v)));
    setAchatArticleRefFiltered((prev) =>
      prev.map((arr, i) =>
        i === idx
          ? articles.filter((a) => a.ref.toLowerCase().includes(value.toLowerCase()))
          : arr
      )
    );
    handleAchatItemChange(idx, 'ref', value);
  };
  const handleAchatArticleRefSelect = (idx: number, a: Article) => {
    handleAchatItemChange(idx, 'ref', a.ref);
    handleAchatItemChange(idx, 'designation', a.designation);
    handleAchatItemChange(idx, 'prixAchat', a.prixAchat || 0);
    //setAchatArticleRefSearch((prev) => prev.map((v, i) => (i === idx ? a.ref : v)));
    //setAchatArticleDesSearch((prev) => prev.map((v, i) => (i === idx ? a.designation : v)));
    setAchatArticleRefDropdown((prev) => prev.map((v, i) => (i === idx ? false : v)));
    setAchatArticleDesDropdown((prev) => prev.map((v, i) => (i === idx ? false : v)));
  };
  const handleAchatArticleRefInputFocus = (idx: number) => {
    setAchatArticleRefDropdown((prev) => prev.map((v, i) => (i === idx ? true : v)));
  };

  // Handlers for designation field
  const handleAchatArticleDesSearchChange = (idx: number, value: string) => {
    //setAchatArticleDesSearch((prev) => prev.map((v, i) => (i === idx ? value : v)));
    setAchatArticleDesDropdown((prev) => prev.map((v, i) => (i === idx ? true : v)));
    setAchatArticleDesFiltered((prev) =>
      prev.map((arr, i) =>
        i === idx
          ? articles.filter((a) => a.designation.toLowerCase().includes(value.toLowerCase()))
          : arr
      )
    );
    handleAchatItemChange(idx, 'designation', value);
  };
  const handleAchatArticleDesSelect = (idx: number, a: Article) => {
    handleAchatItemChange(idx, 'ref', a.ref);
    handleAchatItemChange(idx, 'designation', a.designation);
    handleAchatItemChange(idx, 'prixAchat', a.prixAchat || 0);
    //setAchatArticleRefSearch((prev) => prev.map((v, i) => (i === idx ? a.ref : v)));
    //setAchatArticleDesSearch((prev) => prev.map((v, i) => (i === idx ? a.designation : v)));
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
    const { name, value } = e.target;
    if (name === "ai") {
      // Only allow numbers in the input field
      if (/[^0-9]/.test(value)) {
        setClientAIWarning("Le numéro AI ne doit contenir que des chiffres.");
        // Remove all non-numeric characters from the input
        const numericValue = value.replace(/\D/g, "");
        setClientAIInput(numericValue);
        setClientForm({ ...clientForm, [name]: numericValue.slice(0, 11) });
        return;
      }
      setClientAIInput(value);
      if (value.length > 11) {
        setClientAIWarning("Le numéro AI ne doit pas dépasser 11 caractères.");
      } else {
        setClientAIWarning("");
      }
      setClientForm({ ...clientForm, [name]: value.slice(0, 11) });
      return;
    }
    if (name === "nif") {
      if (/[^0-9]/.test(value)) {
        setClientNIFWarning("Le NIF ne doit contenir que des chiffres.");
        const numericValue = value.replace(/\D/g, "");
        setClientNIFInput(numericValue);
        setClientForm({ ...clientForm, [name]: numericValue });
        return;
      }
      setClientNIFInput(value);
      setClientNIFWarning("");
      setClientForm({ ...clientForm, [name]: value });
      return;
    }
    if (name === "nis") {
      if (/[^0-9]/.test(value)) {
        setClientNISWarning("Le NIS ne doit contenir que des chiffres.");
        const numericValue = value.replace(/\D/g, "");
        setClientNISInput(numericValue);
        setClientForm({ ...clientForm, [name]: numericValue });
        return;
      }
      setClientNISInput(value);
      setClientNISWarning("");
      setClientForm({ ...clientForm, [name]: value });
      return;
    }
    setClientForm({ ...clientForm, [name]: value });
  };

  function generateUniqueCLCode(existingCodes: string[]): string {
    let code;
    do {
      code = 'CL' + Math.floor(100000 + Math.random() * 900000).toString();
    } while (existingCodes.includes(code));
    return code;
  }

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.raisonSocial.trim()) {
      setClientError("La raison sociale est obligatoire.");
      return;
    }
    setClientError("");
    const formToSave = { ...clientForm };
    const allCodes = clients.map(c => c.codeTiers);
    if (!formToSave.codeTiers || allCodes.includes(formToSave.codeTiers)) {
      formToSave.codeTiers = generateUniqueCLCode(allCodes);
    }
    if (editClientId) {
      // Edit mode
      const updatedClients = clients.map((c) =>
        c.id === editClientId ? { ...c, ...formToSave } : c
      );
      await saveClients(updatedClients);
      setEditClientId(null);
    } else {
      // Add mode
      const newClient: Client = {
        ...formToSave,
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

  // Add handler for deleting client
  const handleDeleteClient = async (idx: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce client ?")) {
      const updated = clients.filter((_, i) => i !== idx);
      setClientsState(updated);
      await setClients(updated);
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
      await saveArticles([...articles, { ...articleForm, id: Date.now().toString() }]);
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
      setArticlesState(updated);
      await setArticles(updated);
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

  const handleAchatItemChange = (idx: number, field: keyof AchatArticle, value: string | number) => {
    setAchatForm((prev) => ({
      ...prev,
      articles: prev.articles.map((art, i) =>
        i === idx ? { ...art, [field]: field === 'quantite' ? Number(value) : value } : art
      ),
    }));
  };

  const handleAddAchatItem = () => {
    setAchatForm((prev) => ({
      ...prev,
      articles: [
        ...prev.articles,
        { ...emptyAchatArticle, id: Date.now().toString() + Math.random() }
      ]
    }));
  };

  const handleRemoveAchatItem = (idx: number) => {
    setAchatForm((prev) => ({ ...prev, articles: prev.articles.filter((_, i) => i !== idx) }));
  };

  const handleAchatFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAchatForm((prev) => ({ ...prev, [name]: name === 'montant' ? parseFloat(value) || 0 : value }));
  };

  const handleAchatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achatForm.fournisseur.trim() || !achatForm.date.trim()) {
      //setAchatError('Fournisseur et date sont obligatoires.');
      return;
    }
    if (achatForm.articles.length === 0) {
      //setAchatError('Ajoutez au moins un article.');
      return;
    }
    if (achatForm.articles.some(art => !art.ref || !art.designation || !art.depot || !art.quantite)) {
      //setAchatError('Tous les champs des articles sont obligatoires.');
      return;
    }
    //setAchatError("");
    let newAchats;
    if (editAchatIdx !== null) {
      // Edit mode
      newAchats = achats.map((a, i) => i === editAchatIdx ? { ...a, ...achatForm } : a);
      await saveAchats(newAchats);
      setEditAchatIdx(null);
    } else {
      // Add mode
      newAchats = [...achats, { ...achatForm, id: Date.now().toString(), articles: achatForm.articles }];
      await saveAchats(newAchats);
    }
    // Update stock for each article in achat
    const newStock = [...stock];
    achatForm.articles.forEach(art => {
      const idx = newStock.findIndex(s => s.ref === art.ref && s.depot === art.depot);
      if (idx !== -1) {
        newStock[idx] = { ...newStock[idx], quantite: newStock[idx].quantite + art.quantite };
      } else {
        newStock.push({
          id: Date.now().toString() + Math.random(),
          ref: art.ref,
          designation: art.designation,
          depot: art.depot,
          quantite: art.quantite,
        });
      }
    });
    await setStock(newStock);
    setStockState(newStock);
    setAchatForm({ ...emptyAchat, articles: [] });
    setShowAchatForm(false);
  };

  const handleEditAchat = (idx: number) => {
    const a = achats[idx];
    setAchatForm({ ...a, articles: a.articles.map(art => ({ ...art })) });
    setEditAchatIdx(idx);
    setShowAchatForm(true);
    //setAchatError("");
  };

  const handleAchatCancel = () => {
    setAchatForm({ ...emptyAchat, articles: [] });
    setShowAchatForm(false);
    setEditAchatIdx(null);
    //setAchatError("");
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
      // Also delete from complete invoices table
      try {
        await deleteCompleteInvoice(venteToDelete.id);
        console.log('Invoice deleted successfully');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        // Continue with vente deletion even if invoice deletion fails
      }
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

  // Sorting and filtering logic
  function applyFiltersAndSorting(columns: string[], rows: string[][]) {
    // Filtering
    let filteredRows = rows.filter(row =>
      columns.every((col, i) => {
        const filterVals = filters[col];
        if (!filterVals || filterVals.length === 0) return true;
        return filterVals.includes(String(row[i]));
      })
    );
    // Sorting
    if (sortColumn) {
      const colIdx = columns.indexOf(sortColumn);
      if (colIdx !== -1) {
        filteredRows = [...filteredRows].sort((a, b) => {
          const aVal = a[colIdx];
          const bVal = b[colIdx];
          if (aVal === bVal) return 0;
          if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }
    }
    return filteredRows;
  }

  // Helper to get unique values for a column, filtered by search
  function getUniqueColumnValues(col: string, rows: string[][], colIdx: number, search: string) {
    let values = Array.from(new Set(rows.map(row => row[colIdx])));
    if (search) {
      values = values.filter(v => String(v).toLowerCase().includes(search.toLowerCase()));
    }
    return values;
  }

  // Table columns and data per section
  const getTable = () => {
    switch (activeMenu) {
      case "tiers":
        return {
          columns: ["Code Tiers", "Raison Sociale", "Famille", "Activité", "Adresse", "Ville", "RC", "NIF", "NIS", "AI"],
          rows: clients.map((c) => [
            c.codeTiers,
            c.raisonSocial,
            c.famille,
            c.activite,
            c.adresse,
            c.ville,
            c.rc,
            c.nif,
            c.nis,
            c.ai
          ]),
        };
      case "articles":
        return {
          columns: ["Référence", "Désignation", "Prix Vente HT"],
          rows: articles.map((a) => [
            a.ref,
            a.designation,
            formatCurrency(a.prixVente)
          ]),
        };
      case "achat":
        return {
          columns: ["ID", "Fournisseur", "Date", "Montant"],
          rows: achats.map((a) => [
            a.id.toString(),
            a.fournisseur,
            a.date,
            formatCurrency(a.montant)
          ]),
        };
      case "stock":
        return {
          columns: ["Référence", "Désignation", "Dépôt", "Quantité"],
          rows: stock.map(s => [
            s.ref,
            s.designation,
            s.depot,
            s.quantite.toString()
          ]),
        };
      case "ventes":
        return {
          columns: ["Date", "Numéro Facture", "Prix H.T", "Montant Total HT", "Montant Total TTC"],
          rows: ventes.map((v) => {
            const prixHT = v.prixHT || 0;
            const montant = v.montant || 0;
            const unitPrice = v.unitPrice || 0;
            return [
              v.date,
              v.id,
                          formatCurrency(unitPrice),
            formatCurrency(prixHT),
            formatCurrency(montant)
            ];
          }),
        };
      default:
        return { columns: [], rows: [] };
    }
  };

  // Memoize columns and rows to prevent unnecessary re-renders
  const { columns, rows } = useMemo(getTable, [activeMenu, clients, articles, achats, stock, ventes]);
  const filteredSortedRows = applyFiltersAndSorting(columns, rows);
  // Add state for column visibility after columns is defined
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);

  // Load visibleColumns from localForage on mount or when activeMenu/columns changes
  useEffect(() => {
    if (columns.length === 0) return; // Don't load if columns aren't ready yet
    
    localforage.getItem<string[]>(`erp_visible_columns_${activeMenu}`).then((saved) => {
      if (Array.isArray(saved) && saved.length > 0) {
        // Validate that all saved columns still exist in current columns
        const validSavedColumns = saved.filter(col => columns.includes(col));
        if (validSavedColumns.length > 0) {
          setVisibleColumns(validSavedColumns);
        } else {
          setVisibleColumns(columns); // fallback to all columns
        }
      } else {
        setVisibleColumns(columns); // fallback to all columns
      }
    }).catch(() => {
      // If there's an error loading, default to all columns
      setVisibleColumns(columns);
    });
  }, [activeMenu, columns]);

  // Always show all columns if visibleColumns is empty (prevents all columns hidden)
  useEffect(() => {
    if (visibleColumns.length === 0 && columns.length > 0) {
      setVisibleColumns(columns);
    }
  }, [visibleColumns, columns]);

  // Save visibleColumns to localForage when it changes
  useEffect(() => {
    localforage.setItem(`erp_visible_columns_${activeMenu}`, visibleColumns);
  }, [visibleColumns, activeMenu]);

  // Add to toolbarButtons for all menus
  const exportAllData = async () => {
    // Gather all data
    const clients = await getClients();
    const articles = await getArticles();
    const achats = await getAchats();
    const stock = await getStock();
    const ventes = await getVentes();
    // You may want to add invoices if stored separately
    const data = { clients, articles, achats, stock, ventes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'erp_database_export.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const importAllData = async (file: File) => {
    if (!window.confirm('Importer ce fichier va écraser toutes les données existantes. Continuer ?')) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (data.clients) await setClients(data.clients);
      if (data.articles) await setArticles(data.articles);
      if (data.achats) await setAchats(data.achats);
      if (data.stock) await setStock(data.stock);
      if (data.ventes) await setVentes(data.ventes);
      alert('Importation réussie !');
      // Optionally refresh state
      setClientsState(await getClients());
      setArticlesState(await getArticles());
      setAchatsState(await getAchats());
      setStockState(await getStock());
      setVentesState(await getVentes());
    } catch {
      alert('Erreur lors de l\'importation du fichier.');
    }
  };

  const clearAllData = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer toutes les données ERP ? Cette action est irréversible.')) return;
    await localforage.setItem('clients', []);
    await localforage.setItem('articles', []);
    await localforage.setItem('achats', []);
    await localforage.setItem('stock_items', []);
    await localforage.setItem('ventes', []);
    setClientsState([]);
    setArticlesState([]);
    setAchatsState([]);
    setStockState([]);
    setVentesState([]);
    alert('Toutes les données ERP ont été supprimées.');
  };

  const resetInvoices = async () => {
    if (!window.confirm('Voulez-vous vraiment réinitialiser toutes les factures ? Cette action est irréversible.')) return;
    await localforage.setItem('invoices', []);
    await localforage.setItem('complete_invoices', []);
    await localforage.setItem('ventes', []);
    alert('Toutes les factures ont été réinitialisées. Le prochain numéro commencera à 1.');
  };

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

  const handleAchatDepotSearchChange = (idx: number, value: string) => {
    //setAchatDepotSearch((prev) => prev.map((v, i) => (i === idx ? value : v)));
    setAchatDepotDropdown((prev) => prev.map((v, i) => (i === idx ? true : v)));
    setAchatDepotFiltered((prev) =>
      prev.map((arr, i) =>
        i === idx
          ? depots.filter((d) => d.toLowerCase().includes(value.toLowerCase()))
          : arr
      )
    );
    handleAchatItemChange(idx, 'depot', value);
  };

  const handleAchatDepotSelect = (idx: number, depot: string) => {
    handleAchatItemChange(idx, 'depot', depot);
   //setAchatDepotSearch((prev) => prev.map((v, i) => (i === idx ? depot : v)));
    setAchatDepotDropdown((prev) => prev.map((v, i) => (i === idx ? false : v)));
  };

  const handleAchatDepotInputFocus = (idx: number) => {
    setAchatDepotDropdown((prev) => prev.map((v, i) => (i === idx ? true : v)));
  };

  const handleDownloadVentePDF = async (id: string, idx: number) => {
    setPdfLoadingIdx(idx);
    try {
      // Debug logging
      console.log('Looking for complete invoice with id:', id);
      const allCompleteInvoices = await getCompleteInvoices();
      console.log('All complete invoice IDs:', allCompleteInvoices.map(inv => inv.id));
      const invoice = await getCompleteInvoiceById(id);
      if (!invoice) return alert('Facture introuvable.');
      const pdfBytes = await generateInvoicePDF(invoice, settings.invoiceSettings.defaultCurrency);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erreur lors du téléchargement du PDF.');
      alert(e)
    } finally {
      setPdfLoadingIdx(null);
    }
  };

  const handlePreviewVentePDF = async (id: string, idx: number) => {
    setPdfLoadingIdx(idx);
    try {
      // Debug logging
      console.log('Looking for complete invoice with id:', id);
      const invoice = await getCompleteInvoiceById(id);
      if (!invoice) {
        alert('Facture introuvable pour cette vente.');
        return;
      }
      const pdfBytes = await generateInvoicePDF(invoice, settings.invoiceSettings.defaultCurrency);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      // Optionally, show a toast or alert for success
      // alert('Prévisualisation de la facture ouverte dans un nouvel onglet.');
    } catch (e) {
      alert('Erreur lors de la prévisualisation du PDF.');
      alert(e);
    } finally {
      setPdfLoadingIdx(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col pt-16 font-sans ipad:px-4">
      {/* Top Menu Bar */}
      <nav className="w-full bg-[var(--card)] shadow z-30 flex flex-col sm:flex-row items-center h-auto sm:h-16 px-3 sm:px-8 ipad:px-6 border-b border-[var(--border)] sticky top-0">
        <div className="flex flex-wrap gap-1 sm:gap-6 w-full justify-between items-center py-3 sm:py-0">
          <div className="flex flex-wrap gap-1 sm:gap-6">
            {ERP_MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`px-3 sm:px-4 py-2.5 sm:py-2 font-semibold text-xs sm:text-sm rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${activeMenu === item.key ? "bg-[var(--primary)] text-white shadow" : "text-[var(--primary-dark)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"}`}
                onClick={() => {
                  setActiveMenu(item.key);
                  router.push(`/erp?tab=${item.key}`);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          {["tiers", "articles", "achat", "stock", "ventes"].includes(activeMenu) && (
            <div className="flex gap-2 ml-auto">
              <button
                className="px-4 py-2 bg-[var(--primary)]/10 border border-[var(--border)] rounded-xl text-[var(--primary-dark)] font-medium text-xs sm:text-sm hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors"
                onClick={exportAllData}
              >
                Exporter la base
              </button>
              <button
                className="px-4 py-2 bg-[var(--primary)]/10 border border-[var(--border)] rounded-xl text-[var(--primary-dark)] font-medium text-xs sm:text-sm hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors"
                onClick={() => document.getElementById('erp-import-file')?.click()}
              >
                Importer la base
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  className="px-4 py-2 bg-red-100 border border-red-300 rounded-xl text-red-700 font-medium text-xs sm:text-sm hover:bg-red-200 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors"
                  onClick={clearAllData}
                >
                  Vider la base
                </button>
              )}
              {process.env.NODE_ENV === 'development' && (
                <button
                  className="px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-xl text-yellow-700 font-medium text-xs sm:text-sm hover:bg-yellow-200 hover:text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors"
                  onClick={resetInvoices}
                >
                  Réinitialiser les factures
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Toolbar */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-center px-3 sm:px-8 ipad:px-6 h-auto sm:h-14 z-30 sticky top-16">
        <div className="flex flex-wrap gap-2 w-full items-center justify-between py-3 sm:py-0">
          <div className="flex flex-wrap gap-2">
            {toolbarButtons.map((btn) => (
              <button
                key={btn.key}
                className="px-3 sm:px-4 py-2.5 sm:py-2 bg-[var(--primary)]/5 border border-[var(--border)] rounded-xl text-[var(--primary-dark)] font-medium text-xs sm:text-sm hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors"
                {...(typeof btn.onClick === 'function' ? { onClick: btn.onClick } : {})}
              >
                {btn.label}
              </button>
            ))}
            {/* Column visibility dropdown button removed from here */}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-8 ipad:p-0 pt-4 sm:pt-10 overflow-x-auto ipad:items-stretch ipad:justify-start">
        <div className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] p-3 sm:p-8 ipad:p-0 ipad:max-w-none ipad:w-full ipad:mx-0">
          <div className="flex items-center justify-between mb-6 ipad:flex-col ipad:items-start ipad:gap-2">
            <h2 className="text-lg sm:text-2xl ipad:text-lg font-bold text-[var(--primary-dark)] tracking-tight">
              {ERP_MENU_ITEMS.find((m) => m.key === activeMenu)?.label}
            </h2>
            <button
              type="button"
              className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded hover:bg-[var(--primary)]/20 transition text-[var(--primary-dark)] border border-[var(--border)] ipad:ml-0 ipad:px-4 ipad:py-2"
              onClick={() => setColumnDropdownOpen((open) => !open)}
              title="Afficher/Masquer les colonnes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {columnDropdownOpen && (
              <div className="absolute z-50 right-8 mt-12 sm:w-56 w-[90vw] min-w-[10rem] bg-white border border-[var(--primary)]/20 rounded-lg shadow-lg p-2">
                <div className="mb-2 font-semibold text-[var(--primary-dark)] text-sm">Colonnes à afficher</div>
                <div className="max-h-60 overflow-y-auto">
                  {/* Select All Option */}
                  <label className="flex items-center px-2 py-1 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={visibleColumns.length === columns.length}
                      onChange={e => {
                        if (e.target.checked) {
                          setVisibleColumns(columns);
                        } else {
                          setVisibleColumns([]);
                        }
                      }}
                    />
                    <span className="ml-2">Tout sélectionner</span>
                  </label>
                  {/* Individual columns */}
                  {columns.map((col) => (
                    <label key={col} className="flex items-center px-2 py-1 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col)}
                        onChange={e => {
                          if (e.target.checked) {
                            setVisibleColumns(prev => [...prev, col]);
                          } else {
                            setVisibleColumns(prev => prev.filter(c => c !== col));
                          }
                        }}
                      />
                      <span className="ml-2">{col}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="flex-1 px-2 py-1 rounded bg-blue-100 text-blue-600 text-xs font-semibold hover:bg-blue-200"
                    onClick={() => {
                      setVisibleColumns(columns);
                      setColumnDropdownOpen(false);
                    }}
                  >Réinitialiser</button>
                  <button
                    className="flex-1 px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200"
                    onClick={() => setColumnDropdownOpen(false)}
                  >Fermer</button>
                </div>
              </div>
            )}
          </div>
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
                    <input
                      name="codeTiers"
                      value={clientForm.codeTiers || generateUniqueCLCode(clients.map(c => c.codeTiers))}
                      onChange={handleClientChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                      placeholder="Code Tiers"
                      autoComplete="off"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Raison Sociale *</label>
                    <input name="raisonSocial" value={clientForm.raisonSocial} onChange={handleClientChange} required className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Raison Sociale" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Famille</label>
                    <div className="relative">
                      <input
                        name="famille"
                        type="text"
                        value={familleInput}
                        onChange={e => handleFamilleInput(e.target.value)}
                        onFocus={() => familleInput.length > 0 && setShowFamilleSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowFamilleSuggestions(false), 100)}
                        className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                        placeholder="Famille"
                        autoComplete="off"
                        onKeyDown={handleFamilleKeyDown}
                      />
                      {showFamilleSuggestions && familleSuggestions.length > 0 && (
                        <ul className="absolute z-10 left-0 right-0 bg-white border border-[var(--primary)]/30 rounded-xl mt-1 max-h-56 overflow-y-auto shadow-lg">
                          {familleSuggestions.map((opt, idx) => (
                            <li
                              key={opt}
                              ref={el => { familleRefs.current[idx] = el; }}
                              className={`px-4 py-2 cursor-pointer text-sm ${idx === familleHighlighted ? 'bg-blue-100 font-semibold' : 'hover:bg-blue-100'}`}
                              onMouseDown={() => handleFamilleSelect(opt)}
                            >
                              {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Activité</label>
                    <div className="relative">
                      <input
                        name="activite"
                        type="text"
                        value={clientActiviteInput}
                        onChange={e => handleClientActiviteInput(e.target.value)}
                        onFocus={() => clientActiviteInput.length > 1 && setShowClientActiviteSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowClientActiviteSuggestions(false), 100)}
                        className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                        placeholder="Activité"
                        autoComplete="off"
                        onKeyDown={handleClientActiviteKeyDown}
                      />
                      {showClientActiviteSuggestions && clientActiviteSuggestions.length > 0 && (
                        <ul className="absolute z-10 left-0 right-0 bg-white border border-[var(--primary)]/30 rounded-xl mt-1 max-h-56 overflow-y-auto shadow-lg">
                          {clientActiviteSuggestions.map((opt, idx) => (
                            <li
                              key={opt.CODE}
                              ref={el => { clientActiviteRefs.current[idx] = el; }}
                              className={`px-4 py-2 cursor-pointer text-sm ${idx === clientActiviteHighlighted ? 'bg-blue-100 font-semibold' : 'hover:bg-blue-100'}`}
                              onMouseDown={() => handleClientActiviteSelect(opt.LIBELLE)}
                            >
                              <span className="font-mono text-gray-500 mr-2">{opt.CODE}</span>
                              {opt.LIBELLE}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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
                    <input
                      name="nif"
                      type="text"
                      value={clientNIFInput}
                      onChange={handleClientChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                      placeholder="NIF"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {clientNIFWarning && (
                      <p className="text-xs text-red-600 mt-1">{clientNIFWarning}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">NIS</label>
                    <input
                      name="nis"
                      type="text"
                      value={clientNISInput}
                      onChange={handleClientChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                      placeholder="NIS"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {clientNISWarning && (
                      <p className="text-xs text-red-600 mt-1">{clientNISWarning}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">AI</label>
                    <input
                      name="ai"
                      type="text"
                      value={clientAIInput}
                      onChange={handleClientChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                      placeholder="AI"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {clientAIWarning && (
                      <p className="text-xs text-red-600 mt-1">{clientAIWarning}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Capital</label>
                    <input
                      name="capital"
                      type="text"
                      value={clientForm.capital || ''}
                      onChange={handleClientChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                      placeholder="Capital (optionnel)"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={clientForm.email || ''}
                      onChange={handleClientChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                      placeholder="Email (optionnel)"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Téléphone</label>
                    <input
                      name="telephone"
                      type="text"
                      value={clientForm.telephone || ''}
                      onChange={handleClientChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                      placeholder="Téléphone (optionnel)"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Site web</label>
                    <input
                      name="web"
                      type="text"
                      value={clientForm.web || ''}
                      onChange={handleClientChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm"
                      placeholder="Site web (optionnel)"
                    />
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
                    <input name="prixAchat" type="number" value={articleForm.prixAchat ?? 0} onChange={handleArticleChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Prix Achat HT" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-[var(--primary-dark)] text-sm">Prix Vente HT</label>
                    <input name="prixVente" type="number" value={articleForm.prixVente ?? 0} onChange={handleArticleChange} className="w-full px-3 sm:px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition text-sm" placeholder="Prix Vente HT" />
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
                    <input name="fournisseur" value={achatForm.fournisseur} onChange={handleAchatFieldChange} required className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Fournisseur" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--primary-dark)]">Date *</label>
                    <input name="date" type="date" value={achatForm.date} onChange={handleAchatFieldChange} required className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition" placeholder="Date" />
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
                              value={art.ref ?? ''}
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
                              value={art.designation ?? ''}
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
                            value={art.quantite ?? 1}
                            onChange={e => handleAchatItemChange(idx, 'quantite', e.target.value)}
                            className="w-24 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Quantité"
                          />
                          {/* Depot Input */}
                          <input
                            type="text"
                            value={art.depot ?? ''}
                            onChange={e => handleAchatDepotSearchChange(idx, e.target.value)}
                            onFocus={() => handleAchatDepotInputFocus(idx)}
                            className="w-full md:w-56 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Dépôt"
                          />
                          {achatDepotDropdown[idx] && (achatDepotFiltered[idx]?.length ?? 0) > 0 && (
                            <div className="absolute z-50 left-0 right-0 bg-white border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                              {achatDepotFiltered[idx].map(d => (
                                <button
                                  key={d}
                                  type="button"
                                  className="w-full text-left px-4 py-2 hover:bg-[var(--primary)]/10"
                                  onClick={() => handleAchatDepotSelect(idx, d)}
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Prix Achat Input */}
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={art.prixAchat ?? 0}
                            onChange={e => handleAchatItemChange(idx, 'prixAchat', e.target.value)}
                            className="w-32 px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--input)] placeholder-gray-400 placeholder-opacity-100 transition"
                            placeholder="Prix Achat"
                          />
                          <button type="button" onClick={() => handleRemoveAchatItem(idx)} className="text-[var(--danger)] hover:text-[var(--danger-dark)] text-lg font-bold px-2">&times;</button>
                        </div>
                      ))}
                      <button type="button" onClick={handleAddAchatItem} className="mt-2 px-4 py-2 bg-[var(--primary)]/5 text-[var(--primary)] rounded-lg font-semibold hover:bg-[var(--primary)]/10 transition flex items-center gap-2">
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
          <ERPTable
            columns={columns}
            rows={filteredSortedRows}
            visibleColumns={visibleColumns}
            activeMenu={activeMenu}
            onEdit={(idx: number) => {
              if (activeMenu === "tiers") handleEditClient(clients[idx].id);
              if (activeMenu === "articles") handleEditArticle(idx);
              if (activeMenu === "achat") handleEditAchat(idx);
              if (activeMenu === "ventes") handleEditVente(ventes[idx].id);
            }}
            onDelete={(idx: number) => {
              if (activeMenu === "tiers") handleDeleteClient(idx);
              if (activeMenu === "articles") handleDeleteArticle(idx);
              if (activeMenu === "achat") handleDeleteAchat(idx);
              if (activeMenu === "stock") handleDeleteStock(idx);
              if (activeMenu === "ventes") handleDeleteVente(idx);
            }}
            onDownloadPDF={handleDownloadVentePDF}
            onPreviewPDF={handlePreviewVentePDF}
            pdfLoadingIdx={pdfLoadingIdx}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={(col: string) => {
              if (sortColumn === col) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              } else {
                setSortColumn(col);
                setSortDirection('asc');
              }
            }}
            filters={filters}
            filterDropdownOpen={filterDropdownOpen}
            onFilterClick={(col: string) => {
              setFilterDropdownOpen(filterDropdownOpen === col ? null : col);
              setPendingFilters(filters);
            }}
            filterSearch={filterSearch}
            onFilterSearchChange={(col: string, value: string) => setFilterSearch(s => ({ ...s, [col]: value }))}
            pendingFilters={pendingFilters}
            onPendingFilterChange={(col: string, value: string, checked: boolean) => {
              setPendingFilters(f => {
                const prev = f[col] || [];
                if (checked) {
                  return { ...f, [col]: [...prev, value] };
                } else {
                  return { ...f, [col]: prev.filter(v => v !== value) };
                }
              });
            }}
            onFilterApply={() => {
              setFilters(pendingFilters);
              setFilterDropdownOpen(null);
            }}
            onFilterClear={(col: string) => {
              setPendingFilters(f => ({ ...f, [col]: [] }));
              setFilters(f => ({ ...f, [col]: [] }));
              setFilterDropdownOpen(null);
            }}
            getUniqueColumnValues={getUniqueColumnValues}
          />
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
      {showDeleteArticleIdx !== null && activeMenu === "articles" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
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
      {/* Add hidden file input for import */}
      <input
        id="erp-import-file"
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) importAllData(file);
          e.target.value = '';
        }}
      />
      {/* Add a style block for mobile table improvements: */}
      <style jsx global>{`
        @media (max-width: 640px) {
          table {
            font-size: 13px;
          }
          th, td {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          thead th {
            position: sticky;
            top: 0;
            z-index: 10;
            background: var(--card);
          }
          tbody tr {
            border-radius: 1rem;
            box-shadow: 0 1px 4px 0 rgba(30,42,80,0.06);
          }
        }
      `}</style>
    </div>
  );
}

export default function ERPPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccueilERPTest />
    </Suspense>
  );
}