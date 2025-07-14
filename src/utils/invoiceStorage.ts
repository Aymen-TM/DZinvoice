import localforage from 'localforage';

// Move type definitions here for use in storage functions
export interface Client {
  id: string;
  codeTiers: string;
  raisonSocial: string;
  famille: string;
  nom: string;
  prenom: string;
  activite: string;
  adresse: string;
  ville: string;
  rc: string;
  nif: string;
  nis: string;
  ai: string;
}
export interface Article {
  ref: string;
  designation: string;
  qte: number;
  prixAchat: number;
  prixVente: number;
}
export interface AchatArticle {
  ref: string;
  designation: string;
  quantite: number;
  depot: string;
}
export interface Achat {
  id: number;
  fournisseur: string;
  date: string;
  montant: number;
  articles: AchatArticle[];
}
export interface StockItem {
  ref: string;
  designation: string;
  depot: string;
  quantite: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  date: string;
  total: number;
  items: InvoiceItem[];
  status?: string;
}

const INVOICES_KEY = 'invoices';

export async function getInvoices(): Promise<Invoice[]> {
  const invoices = await localforage.getItem<Invoice[]>(INVOICES_KEY);
  return invoices || [];
}

export async function addInvoice(invoice: Invoice): Promise<void> {
  const invoices = await getInvoices();
  const idx = invoices.findIndex(inv => inv.id === invoice.id);
  if (idx !== -1) {
    invoices[idx] = invoice;
  } else {
    invoices.push(invoice);
  }
  await localforage.setItem(INVOICES_KEY, invoices);
}

export async function deleteInvoice(id: string): Promise<void> {
  const invoices = await getInvoices();
  const updated = invoices.filter(inv => inv.id !== id);
  await localforage.setItem(INVOICES_KEY, updated);
}

export async function clearInvoices(): Promise<void> {
  await localforage.removeItem(INVOICES_KEY);
}

// CLIENTS
const CLIENTS_KEY = 'clients';
export async function getClients() {
  const clients = await localforage.getItem(CLIENTS_KEY);
  return clients || [];
}
export async function setClients(clients: Client[]) {
  await localforage.setItem(CLIENTS_KEY, clients);
}
// ARTICLES
const ARTICLES_KEY = 'articles';
export async function getArticles() {
  const articles = await localforage.getItem(ARTICLES_KEY);
  return articles || [];
}
export async function setArticles(articles: Article[]) {
  await localforage.setItem(ARTICLES_KEY, articles);
}
// ACHATS
const ACHATS_KEY = 'achats';
export async function getAchats() {
  const achats = await localforage.getItem(ACHATS_KEY);
  return achats || [];
}
export async function setAchats(achats: Achat[]) {
  await localforage.setItem(ACHATS_KEY, achats);
}
// STOCK
const STOCK_KEY = 'stock';
export async function getStock() {
  const stock = await localforage.getItem(STOCK_KEY);
  return stock || [];
}
export async function setStock(stock: StockItem[]) {
  await localforage.setItem(STOCK_KEY, stock);
} 