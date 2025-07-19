import localforage from 'localforage';

interface CompleteInvoice {
  id: string;
  meta: {
    invoiceNumber: string;
    date: string;
    terms: string;
    notes: string;
  };
  client: {
    clientName: string;
    clientCode: string;
  };
  totals: {
    montantTTC: number;
  };
}

function getCurrentYearShort(): string {
  return new Date().getFullYear().toString().slice(-2);
}

function formatInvoiceNumber(yearShort: string, number: number): string {
  return `FV/${yearShort}-${number.toString().padStart(4, '0')}`;
}

export async function generateNextInvoiceNumber(): Promise<string> {
  const yearShort = getCurrentYearShort();
  
  // Get complete invoices (the ones with proper invoice numbers)
  const completeInvoices: CompleteInvoice[] = (await localforage.getItem('complete_invoices')) || [];
  
  // Only consider invoices for the current year and matching the new format
  const regex = new RegExp(`^FV/${yearShort}-\\d{4}$`);
  const numbers = completeInvoices
    .map((invoice: CompleteInvoice) => invoice.meta.invoiceNumber)
    .filter((invoiceNumber: string) => regex.test(invoiceNumber))
    .map((invoiceNumber: string) => parseInt(invoiceNumber.split('-')[1], 10))
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