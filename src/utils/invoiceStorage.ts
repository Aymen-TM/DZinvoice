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