import { InvoiceData } from '@/types/invoice';
import { Vente } from '@/types/erp';
import { getVentes as _getVentes, createVente, updateVente, deleteVente } from '@/services/ventes';
import * as base from '@/services/localforageBase';
import { setAll } from '@/services/localforageBase';
import localforage from 'localforage';

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

const INVOICES_KEY = 'invoices';
const COMPLETE_INVOICES_KEY = 'complete_invoices';

// Modular CRUD for Invoice
export const getInvoices = () => base.getAll<Invoice>(INVOICES_KEY);
export const getInvoiceById = (id: string) => base.getById<Invoice>(INVOICES_KEY, id);
export const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
  const invoices: Invoice[] = (await localforage.getItem(INVOICES_KEY)) || [];
  invoices.push(invoice as Invoice);
  await localforage.setItem(INVOICES_KEY, invoices);
};
export const updateInvoice = (id: string, data: Partial<Invoice>) => base.update<Invoice>(INVOICES_KEY, id, data);
export const deleteInvoice = (id: string) => base.remove(INVOICES_KEY, id);

// Modular CRUD for CompleteInvoice
export const getCompleteInvoices = () => base.getAll<CompleteInvoice>(COMPLETE_INVOICES_KEY);
export const getCompleteInvoiceById = (id: string) => base.getById<CompleteInvoice>(COMPLETE_INVOICES_KEY, id);
export const addCompleteInvoice = (invoice: Omit<CompleteInvoice, 'id' | 'createdAt' | 'updatedAt'>) => base.create<CompleteInvoice>(COMPLETE_INVOICES_KEY, invoice);
export const updateCompleteInvoice = (id: string, data: Partial<CompleteInvoice>) => base.update<CompleteInvoice>(COMPLETE_INVOICES_KEY, id, data);
export const deleteCompleteInvoice = (id: string) => base.remove(COMPLETE_INVOICES_KEY, id);

// Vente Storage (for invoice integration)
export const getVentes = _getVentes;
export const setVentes = async (ventes: Vente[]) => {
  await setAll<Vente>('ventes', ventes);
}; 