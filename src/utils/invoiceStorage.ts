import { InvoiceData } from '@/types/invoice';
import { Vente } from '@/types/erp';
import { getVentes as _getVentes } from '@/services/ventes';
import * as base from '@/services/localforageBase';
import { setAll } from '@/services/localforageBase';
import { logInvoiceCreated, logInvoiceUpdated, logInvoiceDeleted } from '@/services/history';
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
  const newInvoice = { ...invoice, id: Date.now().toString() } as Invoice;
  invoices.push(newInvoice);
  await localforage.setItem(INVOICES_KEY, invoices);
  
  // Note: History logging is handled by addCompleteInvoice
  // to avoid duplicate entries
  
  return newInvoice;
};

export const updateInvoice = async (id: string, data: Partial<Invoice>) => {
  const updatedInvoice = await base.update<Invoice>(INVOICES_KEY, id, data);
  
  // Log history
  await logInvoiceUpdated(
    id,
    id, // Using id as invoice number for now
    updatedInvoice.clientName,
    updatedInvoice.total
  );
  
  return updatedInvoice;
};

export const deleteInvoice = async (id: string) => {
  const invoice = await getInvoiceById(id);
  if (invoice) {
    // Log history before deletion
    await logInvoiceDeleted(
      id,
      id, // Using id as invoice number for now
      invoice.clientName
    );
  }
  
  await base.remove(INVOICES_KEY, id);
};

// Modular CRUD for CompleteInvoice
export const getCompleteInvoices = () => base.getAll<CompleteInvoice>(COMPLETE_INVOICES_KEY);
export const getCompleteInvoiceById = (id: string) => base.getById<CompleteInvoice>(COMPLETE_INVOICES_KEY, id);

export const addCompleteInvoice = async (invoice: Omit<CompleteInvoice, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newInvoice = await base.create<CompleteInvoice>(COMPLETE_INVOICES_KEY, invoice);
  
  // Log history
  await logInvoiceCreated(
    newInvoice.id,
    newInvoice.meta.invoiceNumber,
    newInvoice.client.clientName,
    newInvoice.totals.montantTTC
  );
  
  return newInvoice;
};

export const updateCompleteInvoice = async (id: string, data: Partial<CompleteInvoice>) => {
  const updatedInvoice = await base.update<CompleteInvoice>(COMPLETE_INVOICES_KEY, id, data);
  
  // Log history
  await logInvoiceUpdated(
    id,
    updatedInvoice.meta.invoiceNumber,
    updatedInvoice.client.clientName,
    updatedInvoice.totals.montantTTC
  );
  
  return updatedInvoice;
};

export const deleteCompleteInvoice = async (id: string) => {
  const invoice = await getCompleteInvoiceById(id);
  if (invoice) {
    // Log history before deletion
    await logInvoiceDeleted(
      id,
      invoice.meta.invoiceNumber,
      invoice.client.clientName
    );
  }
  
  await base.remove(COMPLETE_INVOICES_KEY, id);
};

// Vente Storage (for invoice integration)
export const getVentes = _getVentes;
export const setVentes = async (ventes: Vente[]) => {
  await setAll<Vente>('ventes', ventes);
}; 