import { HistoryAction } from '@/services/history';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// CSV Export
export const exportToCSV = (history: HistoryAction[], filename: string = 'historique') => {
  const headers = ['Date', 'Type', 'Titre', 'Description', 'ID Entité', 'Type Entité'];
  const csvContent = [
    headers.join(','),
    ...history.map(action => [
      new Date(action.createdAt).toLocaleString('fr-FR'),
      action.type,
      `"${action.title}"`,
      `"${action.description}"`,
      action.entityId || '',
      action.entityType || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Sanitize text for PDF encoding
const sanitizeText = (text: string): string => {
  return text
    .replace(/[\u202F\u00A0]/g, ' ') // Replace narrow no-break space and no-break space with regular space
    .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes with regular quotes
    .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes with regular double quotes
    .replace(/[\u2013\u2014]/g, '-') // Replace en-dash and em-dash with regular dash
    .replace(/[\u2026]/g, '...') // Replace ellipsis with three dots
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Replace other non-ASCII characters with similar ASCII equivalents
      const replacements: Record<string, string> = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ý': 'y', 'ÿ': 'y',
        'ñ': 'n',
        'ç': 'c',
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
        'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
        'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
        'Ý': 'Y',
        'Ñ': 'N',
        'Ç': 'C'
      };
      return replacements[char] || '?';
    });
};

// Helper function to wrap text
const wrapText = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
  const sanitizedText = sanitizeText(text);
  const words = sanitizedText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// PDF Export using pdf-lib
export const exportToPDF = async (history: HistoryAction[], filename: string = 'historique') => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageMargin = 50;
  const contentWidth = 495;
  const lineHeight = 14;
  let currentY = 800;

  // Title
  page.drawText('Historique des Actions', {
    x: pageMargin,
    y: currentY,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8)
  });
  currentY -= 30;

  // Date range
  const startDate = history.length > 0 ? new Date(history[history.length - 1].createdAt).toLocaleDateString('fr-FR') : '';
  const endDate = history.length > 0 ? new Date(history[0].createdAt).toLocaleDateString('fr-FR') : '';
  page.drawText(`Periode: ${startDate} - ${endDate}`, {
    x: pageMargin,
    y: currentY,
    size: 12,
    font: font,
    color: rgb(0.4, 0.4, 0.4)
  });
  currentY -= 25;

  // Table header
  const headerY = currentY;
  const colX = [pageMargin, pageMargin + 120, pageMargin + 220, pageMargin + 420];
  const colWidths = [120, 100, 200, 75]; // Date, Type, Description, Entity

  // Draw header background
  page.drawRectangle({
    x: pageMargin,
    y: headerY - 20,
    width: contentWidth,
    height: 20,
    color: rgb(0.2, 0.4, 0.8)
  });

  // Header text
  page.drawText('Date', { x: colX[0], y: headerY - 15, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText('Type', { x: colX[1], y: headerY - 15, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText('Description', { x: colX[2], y: headerY - 15, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText('Entite', { x: colX[3], y: headerY - 15, size: 10, font: boldFont, color: rgb(1, 1, 1) });

  currentY -= 40;

  // Table rows
  for (let index = 0; index < history.length; index++) {
    const action = history[index];
    
    // Check if we need a new page
    if (currentY < 100) {
      page = pdfDoc.addPage([595, 842]);
      currentY = 800;
    }

    // Alternate row background
    if (index % 2 === 0) {
      page.drawRectangle({
        x: pageMargin,
        y: currentY - 15,
        width: contentWidth,
        height: 15,
        color: rgb(0.95, 0.95, 0.95)
      });
    }

    // Row data
    const date = new Date(action.createdAt).toLocaleString('fr-FR');
    const type = sanitizeText(getActionTypeDisplayName(action.type));
    const description = sanitizeText(action.description);
    const entity = sanitizeText(action.entityType === 'invoice' ? 'Facture' : (action.entityType || ''));

    // Draw text with proper positioning
    page.drawText(sanitizeText(date), { 
      x: colX[0], 
      y: currentY - 10, 
      size: 8, 
      font: font, 
      color: rgb(0, 0, 0) 
    });
    
    page.drawText(type, { 
      x: colX[1], 
      y: currentY - 10, 
      size: 8, 
      font: font, 
      color: rgb(0, 0, 0) 
    });
    
    // Handle long descriptions with text wrapping
    const maxDescWidth = colWidths[2] - 10; // Leave some padding
    const descLines = wrapText(description, maxDescWidth, font, 8);
    
    if (descLines.length > 1) {
      // Multi-line description
      descLines.forEach((line, lineIndex) => {
        page.drawText(line, { 
          x: colX[2], 
          y: currentY - 10 - (lineIndex * 10), 
          size: 8, 
          font: font, 
          color: rgb(0, 0, 0) 
        });
      });
      currentY -= (descLines.length * 10) + 5; // Extra space for multi-line
    } else {
      // Single line description
      page.drawText(description, { 
        x: colX[2], 
        y: currentY - 10, 
        size: 8, 
        font: font, 
        color: rgb(0, 0, 0) 
      });
      currentY -= 20;
    }
    
    page.drawText(entity, { 
      x: colX[3], 
      y: currentY + 10, // Adjust for multi-line descriptions
      size: 8, 
      font: font, 
      color: rgb(0, 0, 0) 
    });
  }

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

// Get action type display name
export const getActionTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'invoice_created': 'Facture créée',
    'invoice_updated': 'Facture modifiée',
    'invoice_deleted': 'Facture supprimée',
    'client_created': 'Client ajouté',
    'client_updated': 'Client modifié',
    'client_deleted': 'Client supprimé',
    'article_created': 'Article ajouté',
    'article_updated': 'Article modifié',
    'article_deleted': 'Article supprimé',
    'vente_created': 'Vente créée',
    'vente_updated': 'Vente modifiée',
    'vente_deleted': 'Vente supprimée',
    'achat_created': 'Achat créé',
    'achat_updated': 'Achat modifié',
    'achat_deleted': 'Achat supprimé',
    'stock_movement': 'Mouvement de stock'
  };
  return typeMap[type] || type;
};

// Get action icon
export const getActionIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'invoice_created': '📄',
    'invoice_updated': '✏️',
    'invoice_deleted': '🗑️',
    'client_created': '👤',
    'client_updated': '✏️',
    'client_deleted': '🗑️',
    'article_created': '📦',
    'article_updated': '✏️',
    'article_deleted': '🗑️',
    'vente_created': '💰',
    'vente_updated': '✏️',
    'vente_deleted': '🗑️',
    'achat_created': '🛒',
    'achat_updated': '✏️',
    'achat_deleted': '🗑️',
    'stock_movement': '📊'
  };
  return iconMap[type] || '📋';
}; 