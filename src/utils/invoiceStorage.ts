import localforage from 'localforage';

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
export async function setClients(clients: any[]) {
  await localforage.setItem(CLIENTS_KEY, clients);
}
// ARTICLES
const ARTICLES_KEY = 'articles';
export async function getArticles() {
  const articles = await localforage.getItem(ARTICLES_KEY);
  return articles || [];
}
export async function setArticles(articles: any[]) {
  await localforage.setItem(ARTICLES_KEY, articles);
}
// ACHATS
const ACHATS_KEY = 'achats';
export async function getAchats() {
  const achats = await localforage.getItem(ACHATS_KEY);
  return achats || [];
}
export async function setAchats(achats: any[]) {
  await localforage.setItem(ACHATS_KEY, achats);
}
// STOCK
const STOCK_KEY = 'stock';
export async function getStock() {
  const stock = await localforage.getItem(STOCK_KEY);
  return stock || [];
}
export async function setStock(stock: any[]) {
  await localforage.setItem(STOCK_KEY, stock);
} 