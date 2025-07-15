import localforage from 'localforage';

interface StoredInvoice {
  id: string;
  clientName: string;
  date: string;
  total: number;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  status?: string;
}

export async function generateNextInvoiceNumber(): Promise<string> {
  const invoices: StoredInvoice[] = (await localforage.getItem('invoices')) || [];
  if (invoices.length === 0) {
    return '1';
  }
  const invoiceNumbers = invoices
    .map((invoice: StoredInvoice) => invoice.id)
    .filter((id: string) => {
      const num = parseInt(id, 10);
      return !isNaN(num) && num > 0;
    })
    .map((id: string) => parseInt(id, 10));
  if (invoiceNumbers.length === 0) {
    return '1';
  }
  invoiceNumbers.sort((a, b) => a - b);
  // Find the smallest missing positive integer
  let nextNumber = 1;
  for (let i = 0; i < invoiceNumbers.length; i++) {
    if (invoiceNumbers[i] !== nextNumber) {
      break;
    }
    nextNumber++;
  }
  return nextNumber.toString();
}

// Fallback sync version for SSR or initial render
export function generateNextInvoiceNumberSync(): string {
  return '1';
}

export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  if (!invoiceNumber || invoiceNumber.trim() === '') {
    return false;
  }
  const num = parseInt(invoiceNumber, 10);
  return !isNaN(num) && num > 0;
} 