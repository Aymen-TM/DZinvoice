import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { InvoiceData } from '@/types/invoice';

export const generateInvoicePDF = async (invoiceData: InvoiceData) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Use your actual InvoiceData structure
  const { company, client, meta, items, totals } = invoiceData;
  const notes = meta.notes;

  // === CONFIG ===
  const pageMarginX = 45;
  const contentWidth = 505;
  const lineHeight = 16;

  let currentY = 800;

  // === Company Info Box ===
  const companyBoxHeight = 5 * lineHeight + 20;
  page.drawRectangle({
    x: pageMarginX,
    y: currentY - companyBoxHeight,
    width: contentWidth,
    height: companyBoxHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  let textY = currentY - 20;
  page.drawText(company.companyName, { x: pageMarginX + 5, y: textY, size: 18, font: boldFont, color: rgb(0, 0.2, 0.6) });
  textY -= lineHeight;
  page.drawText(company.activity, { x: pageMarginX + 5, y: textY, size: 11, font });
  textY -= lineHeight;
  page.drawText(`Adresse: ${company.address}`, { x: pageMarginX + 5, y: textY, size: 11, font });
  textY -= lineHeight;
  page.drawText(`Tél: ${company.phone} | Email: ${company.email}`, { x: pageMarginX + 5, y: textY, size: 11, font });
  textY -= lineHeight;
  page.drawText(`RC: ${company.rc} | NIF: ${company.nif} | NIS: ${company.nis}`, { x: pageMarginX + 5, y: textY, size: 11, font });

  currentY -= companyBoxHeight + 30;

  // FACTURE Title
  page.drawText('FACTURE', { x: 230, y: currentY, size: 22, font: boldFont, color: rgb(0, 0.2, 0.6) });
  currentY -= 25;

  // Meta Boxes Config
  const metaBoxWidth = 140;
  const metaLabelBoxHeight = lineHeight + 6;
  const metaValueBoxHeight = lineHeight + 6;
  const metaGap = 15;
  const totalMetaWidth = (metaBoxWidth * 3) + (metaGap * 2);
  const pageWidth = 595;
  const startX = (pageWidth - totalMetaWidth) / 2;

  const numeroX = startX;
  const dateX = numeroX + metaBoxWidth + metaGap;
  const pageX = dateX + metaBoxWidth + metaGap;

  const drawCenteredText = (text: string, fontObj: typeof font, size: number, x: number, y: number, boxWidth: number, color = rgb(0, 0, 0)) => {
    const textWidth = fontObj.widthOfTextAtSize(text, size);
    const textX = x + (boxWidth - textWidth) / 2;
    page.drawText(text, { x: textX, y, size, font: fontObj, color });
  };

  const drawMetaLabel = (label: string, x: number, y: number) => {
    page.drawRectangle({ x, y: y - metaLabelBoxHeight, width: metaBoxWidth, height: metaLabelBoxHeight, color: rgb(0, 0.2, 0.6), borderColor: rgb(0, 0, 0), borderWidth: 1 });
    drawCenteredText(label, boldFont, 11, x, y - metaLabelBoxHeight + 5, metaBoxWidth, rgb(1, 1, 1));
  };

  const drawMetaValue = (value: string, x: number, y: number) => {
    const valueBoxY = y - metaLabelBoxHeight - metaValueBoxHeight;
    page.drawRectangle({ x, y: valueBoxY, width: metaBoxWidth, height: metaValueBoxHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
    drawCenteredText(value, boldFont, 12, x, valueBoxY + 5, metaBoxWidth);
  };

  drawMetaLabel('Numéro de Facture', numeroX, currentY);
  drawMetaLabel('Date', dateX, currentY);
  drawMetaLabel('Page', pageX, currentY);

  drawMetaValue(`${meta.invoiceNumber}`, numeroX, currentY);
  drawMetaValue(`${meta.date}`, dateX, currentY);
  drawMetaValue(`1`, pageX, currentY);

  currentY -= metaLabelBoxHeight + metaValueBoxHeight + 25;

  // === Client Info Box ===
  const clientBoxHeight = 4 * lineHeight + 20;
  page.drawRectangle({
    x: pageMarginX,
    y: currentY - clientBoxHeight,
    width: contentWidth,
    height: clientBoxHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  textY = currentY - 20;
  page.drawText(`Client: ${client.clientName}`, { x: pageMarginX + 5, y: textY, size: 12, font: boldFont });
  textY -= lineHeight;
  page.drawText(`Activité: ${client.activity}`, { x: pageMarginX + 5, y: textY, size: 11, font });
  textY -= lineHeight;
  page.drawText(`Adresse: ${client.address}, ${client.city}`, { x: pageMarginX + 5, y: textY, size: 11, font });
  textY -= lineHeight;
  page.drawText(`RC: ${client.rc} | NIF: ${client.nif} | NIS: ${client.nis}`, { x: pageMarginX + 5, y: textY, size: 11, font });

  currentY -= clientBoxHeight + 20;

  // === Table Header Box ===
  const tableHeaders = [
    { label: 'Réf.', width: 60 },
    { label: 'Désignation', width: 190 },
    { label: 'Qté', width: 50 },
    { label: 'Prix U.H.T', width: 80 },
    { label: 'Montant H.T', width: 125 }, // Increased to fill remaining width
  ];
  const headerHeight = lineHeight + 6;
  const headerFillColor = rgb(0.85, 0.92, 0.98); // Light blue
  const rowHeight = lineHeight + 2; // Reduced for tighter fit
  const tableBoxHeight = headerHeight + items.length * rowHeight; // No padding
  page.drawRectangle({
    x: pageMarginX,
    y: currentY - tableBoxHeight,
    width: contentWidth,
    height: tableBoxHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Draw header cells
  let colX = pageMarginX;
  tableHeaders.forEach(header => {
    page.drawRectangle({
      x: colX,
      y: currentY - headerHeight,
      width: header.width,
      height: headerHeight,
      color: headerFillColor,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    const textWidth = boldFont.widthOfTextAtSize(header.label, 11);
    const textX = colX + (header.width - textWidth) / 2;
    page.drawText(header.label, {
      x: textX,
      y: currentY - headerHeight + 5,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    colX += header.width;
  });

  // Draw item rows
  let rowY = currentY - headerHeight - rowHeight;
  items.forEach(item => {
    let colX = pageMarginX;
    // Réf.
    page.drawRectangle({ x: colX, y: rowY, width: tableHeaders[0].width, height: rowHeight, borderColor: rgb(0,0,0), borderWidth: 1 });
    page.drawText(item.reference, { x: colX + 5, y: rowY + 5, size: 10, font });
    colX += tableHeaders[0].width;
    // Désignation
    page.drawRectangle({ x: colX, y: rowY, width: tableHeaders[1].width, height: rowHeight, borderColor: rgb(0,0,0), borderWidth: 1 });
    page.drawText(item.designation, { x: colX + 5, y: rowY + 5, size: 10, font });
    colX += tableHeaders[1].width;
    // Qté
    page.drawRectangle({ x: colX, y: rowY, width: tableHeaders[2].width, height: rowHeight, borderColor: rgb(0,0,0), borderWidth: 1 });
    page.drawText(item.quantity.toString(), { x: colX + 5, y: rowY + 5, size: 10, font });
    colX += tableHeaders[2].width;
    // Prix U.H.T
    page.drawRectangle({ x: colX, y: rowY, width: tableHeaders[3].width, height: rowHeight, borderColor: rgb(0,0,0), borderWidth: 1 });
    page.drawText(item.unitPrice.toFixed(2), { x: colX + 5, y: rowY + 5, size: 10, font });
    colX += tableHeaders[3].width;
    // Montant H.T
    page.drawRectangle({ x: colX, y: rowY, width: tableHeaders[4].width, height: rowHeight, borderColor: rgb(0,0,0), borderWidth: 1 });
    page.drawText(item.amount.toFixed(2), { x: colX + 5, y: rowY + 5, size: 10, font });
    // Next row
    rowY -= rowHeight;
  });

  currentY -= tableBoxHeight + 20;

  // === Totals Box ===
  const totalsBoxHeight = 4 * lineHeight + 20;
  page.drawRectangle({
    x: 340,
    y: currentY - totalsBoxHeight,
    width: 210,
    height: totalsBoxHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  let totalY = currentY - 20;
  page.drawText(`Montant H.T: ${totals.montantHT.toFixed(2)} DA`, { x: 350, y: totalY, size: 11, font });
  totalY -= lineHeight;
  page.drawText(`Remise: ${totals.remise.toFixed(2)} DA`, { x: 350, y: totalY, size: 11, font });
  totalY -= lineHeight;
  page.drawText(`T.V.A: ${totals.tva.toFixed(2)} DA`, { x: 350, y: totalY, size: 11, font });
  totalY -= lineHeight;
  page.drawText(`Montant T.T.C: ${totals.montantTTC.toFixed(2)} DA`, { x: 350, y: totalY, size: 12, font: boldFont });

  currentY -= totalsBoxHeight + 20;

  // === Notes + Amount in Words ===
  page.drawText(`Observations: ${notes}`, { x: pageMarginX, y: currentY, size: 10, font });
  currentY -= lineHeight;
  page.drawText(`Arrêtée la présente facture à la somme de: ${totals.amountInWords}`, { x: pageMarginX, y: currentY, size: 10, font });

  // === Save + Download ===
  const pdfBytes = await pdfDoc.save();
  
  // Return the PDF bytes for preview and download functionality
  return pdfBytes;
}; 