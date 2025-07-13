export function generateNextInvoiceNumber(): string {
  // Get existing invoices from localStorage
  const stored = localStorage.getItem('invoices');
  const invoices = stored ? JSON.parse(stored) : [];
  
  if (invoices.length === 0) {
    // If no invoices exist, start with 1
    return '1';
  }
  
  // Extract invoice numbers and find the highest one
  const invoiceNumbers = invoices
    .map((invoice: any) => invoice.id)
    .filter((id: string) => {
      // Only consider numeric invoice numbers
      const num = parseInt(id, 10);
      return !isNaN(num) && num > 0;
    })
    .map((id: string) => parseInt(id, 10));
  
  if (invoiceNumbers.length === 0) {
    // If no valid numeric invoice numbers found, start with 1
    return '1';
  }
  
  // Find the highest invoice number and increment by 1
  const maxNumber = Math.max(...invoiceNumbers);
  const nextNumber = maxNumber + 1;
  
  return nextNumber.toString();
}

export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  // Check if the invoice number is not empty and is a valid number
  if (!invoiceNumber || invoiceNumber.trim() === '') {
    return false;
  }
  
  const num = parseInt(invoiceNumber, 10);
  return !isNaN(num) && num > 0;
} 