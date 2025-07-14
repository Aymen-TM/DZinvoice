import localforage from 'localforage';

import type { InvoiceData } from '@/types/invoice';

// Invoice Types
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

// Complete invoice data for editing
export interface CompleteInvoice extends InvoiceData {
  id: string;
}

export interface Vente {
  id: string;
  client: string;
  date: string;
  montant: number;
  prixHT: number;
  nombreItems: number;
  unitPrice: number;
}

// Invoice Storage
const INVOICES_KEY = 'invoices';
const VENTES_KEY = 'ventes';
const COMPLETE_INVOICES_KEY = 'complete_invoices';

export async function getInvoices(): Promise<Invoice[]> {
  const invoices = await localforage.getItem<Invoice[]>(INVOICES_KEY);
  return invoices || [];
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const invoices = await getInvoices();
  return invoices.find(inv => inv.id === id) || null;
}

// Complete invoice storage functions
export async function getCompleteInvoices(): Promise<CompleteInvoice[]> {
  const invoices = await localforage.getItem<CompleteInvoice[]>(COMPLETE_INVOICES_KEY);
  return invoices || [];
}

export async function getCompleteInvoiceById(id: string): Promise<CompleteInvoice | null> {
  const invoices = await getCompleteInvoices();
  return invoices.find(inv => inv.id === id) || null;
}

export async function addCompleteInvoice(invoice: CompleteInvoice): Promise<void> {
  const invoices = await getCompleteInvoices();
  const idx = invoices.findIndex(inv => inv.id === invoice.id);
  if (idx !== -1) {
    invoices[idx] = invoice;
  } else {
    invoices.push(invoice);
  }
  await localforage.setItem(COMPLETE_INVOICES_KEY, invoices);
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

// Vente Storage (for invoice integration)
export async function getVentes(): Promise<Vente[]> {
  const ventes = await localforage.getItem<Vente[]>(VENTES_KEY);
  return ventes || [];
}

export async function setVentes(ventes: Vente[]): Promise<void> {
  await localforage.setItem(VENTES_KEY, ventes);
} 