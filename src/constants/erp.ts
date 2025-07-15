import type { MenuItem } from '@/types/erp';

// ERP Menu Configuration
export const ERP_MENU_ITEMS: MenuItem[] = [
  { key: "tiers", label: "Tiers" },
  { key: "articles", label: "Articles" },
  { key: "achat", label: "Achat" },
  { key: "stock", label: "Stock" },
  { key: "ventes", label: "Ventes" },
];

// Default form data
export const DEFAULT_CLIENT_FORM = {
  codeTiers: "",
  raisonSocial: "",
  famille: "",
  nom: "",
  prenom: "",
  activite: "",
  adresse: "",
  ville: "",
  rc: "",
  nif: "",
  nis: "",
  ai: "",
};

export const DEFAULT_ARTICLE_FORM = {
  id: '',
  ref: "",
  designation: "",
  qte: 0,
  prixAchat: 0,
  prixVente: 0,
};

export const DEFAULT_ACHAT_FORM = {
  fournisseur: "",
  date: "",
  montant: 0,
  articles: [],
};

// Table data for different sections
export const TABLE_DATA = {
  tiers: [
    { id: 1, name: "Client A", type: "Client", city: "Algiers" },
    { id: 2, name: "Supplier B", type: "Supplier", city: "Oran" },
  ],
  articles: [
    { ref: "012020500001", designation: "CHILLED BONELESS BEEF BRISKET", qte: 934.5, prixAchat: 716.5, prixVente: 999.99 },
    { ref: "012020500007", designation: "FOREQUARTER CHILLED BONELESS BEEF", qte: 39149.83, prixAchat: 779.96, prixVente: 950.0 },
  ],
  achat: [
    { id: 1, fournisseur: "Supplier B", date: "2024-06-01", montant: 100000 },
  ],
  stock: [
    { id: 1, article: "BEEF BRISKET", qte: 500, depot: "Main" },
  ],
}; 