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

function getCurrentYearShort(): string {
  return new Date().getFullYear().toString().slice(-2);
}

function formatInvoiceNumber(yearShort: string, number: number): string {
  return `FV/${yearShort}-${number.toString().padStart(4, '0')}`;
}

export async function generateNextInvoiceNumber(): Promise<string> {
  const yearShort = getCurrentYearShort();
  const invoices: StoredInvoice[] = (await localforage.getItem('invoices')) || [];
  // Only consider invoices for the current year and matching the new format
  const regex = new RegExp(`^FV/${yearShort}-\\d{4}$`);
  const numbers = invoices
    .map((invoice: StoredInvoice) => invoice.id)
    .filter((id: string) => regex.test(id))
    .map((id: string) => parseInt(id.split('-')[1], 10))
    .filter((num) => !isNaN(num));
  let nextNumber = 1;
  if (numbers.length > 0) {
    numbers.sort((a, b) => a - b);
    // Find the smallest missing positive integer
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] !== i + 1) {
        nextNumber = i + 1;
        break;
      }
      nextNumber = numbers.length + 1;
    }
  }
  return formatInvoiceNumber(yearShort, nextNumber);
}

// Fallback sync version for SSR or initial render
export function generateNextInvoiceNumberSync(): string {
  const yearShort = getCurrentYearShort();
  return formatInvoiceNumber(yearShort, 1);
}

export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  // FV/YY-NNNN
  return /^FV\/\d{2}-\d{4}$/.test(invoiceNumber);
} 