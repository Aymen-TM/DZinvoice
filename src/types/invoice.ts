export interface Company {
  companyName: string;
  activity: string;
  address: string;
  capital: string;
  phone: string;
  email: string;
  web: string;
  bank: string;
  rc: string;
  nif: string;
  ai: string;
  nis: string;
}

export interface Client {
  clientName: string;
  clientCode: string;
  activity: string;
  address: string;
  city: string;
  rc: string;
  nif: string;
  ai: string;
  nis: string;
}

export interface InvoiceMeta {
  invoiceNumber: string;
  date: string;
  terms: 'None' | 'Custom' | 'On Receipt' | 'Next Day' | '2 Days' | '3 Days' | '4 Days' | '5 Days';
  notes: string;
}

export interface Item {
  id: string;
  reference: string;
  designation: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  tva: number;
}

export interface Totals {
  montantHT: number;
  remise: number;
  tva: number;
  montantTTC: number;
  amountInWords: string;
}

export interface InvoiceData {
  company: Company;
  client: Client;
  meta: InvoiceMeta;
  items: Item[];
  totals: Totals;
} 