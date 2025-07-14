import * as XLSX from 'xlsx';
import type { Client, Article, Achat, StockItem, Vente } from '@/types/erp';

// Export utilities for ERP data
export function exportClients(clients: Client[]): void {
  if (clients.length === 0) return;
  
  const ws = XLSX.utils.json_to_sheet(clients.map(({ codeTiers, raisonSocial, famille, activite, adresse, ville, rc, nif, nis, ai }) => ({
    'Code Tiers': codeTiers,
    'Raison Sociale': raisonSocial,
    'Famille': famille,
    'Activité': activite,
    'Adresse': adresse,
    'Ville': ville,
    'RC': rc,
    'NIF': nif,
    'NIS': nis,
    'AI': ai,
  })));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tiers');
  XLSX.writeFile(wb, 'clients.xlsx');
}

export function exportArticles(articles: Article[]): void {
  if (articles.length === 0) return;
  
  const ws = XLSX.utils.json_to_sheet(articles.map(({ ref, designation, prixAchat, prixVente }) => ({
    'Référence': ref,
    'Désignation': designation,
    'Prix Achat HT': prixAchat,
    'Prix Vente HT': prixVente,
  })));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Articles');
  XLSX.writeFile(wb, 'articles.xlsx');
}

export function exportAchats(achats: Achat[]): void {
  if (achats.length === 0) return;
  
  const ws = XLSX.utils.json_to_sheet(achats.map(({ id, fournisseur, date, montant, articles }) => ({
    'ID': id,
    'Fournisseur': fournisseur,
    'Date': date,
    'Montant': montant,
    'Articles': articles.map(a => `${a.ref} (${a.designation}) x${a.quantite} [${a.depot}]`).join('; '),
  })));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Achats');
  XLSX.writeFile(wb, 'achats.xlsx');
}

export function exportStock(stock: StockItem[]): void {
  if (stock.length === 0) return;
  
  const ws = XLSX.utils.json_to_sheet(stock.map(({ ref, designation, depot, quantite }) => ({
    'Référence': ref,
    'Désignation': designation,
    'Dépôt': depot,
    'Quantité': quantite,
  })));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock');
  XLSX.writeFile(wb, 'stock.xlsx');
}

export function exportVentes(ventes: Vente[]): void {
  if (ventes.length === 0) return;
  
  const ws = XLSX.utils.json_to_sheet(ventes.map(({ id, client, date, montant }) => ({
    'ID': id,
    'Client': client,
    'Date': date,
    'Montant': montant,
  })));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ventes');
  XLSX.writeFile(wb, 'ventes.xlsx');
} 