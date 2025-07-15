// ERP Entity Types
export interface Client {
  id: string;
  codeTiers: string;
  raisonSocial: string;
  famille: string;
  nom: string;
  prenom: string;
  activite: string;
  adresse: string;
  ville: string;
  rc: string;
  nif: string;
  nis: string;
  ai: string;
}

export interface Article {
  id: string;
  ref: string;
  designation: string;
  qte: number;
  prixAchat: number;
  prixVente: number;
}

export interface AchatArticle {
  id: string;
  ref: string;
  designation: string;
  quantite: number;
  depot: string;
  prixAchat: number;
}

export interface Achat {
  id: string;
  fournisseur: string;
  date: string;
  montant: number;
  articles: AchatArticle[];
}

export interface StockItem {
  id: string;
  ref: string;
  designation: string;
  depot: string;
  quantite: number;
}

export interface Vente {
  id: string;
  client: string;
  date: string;
  montant: number;
  prixHT: number;
  nombreItems: number;
  unitPrice: number;
}

// ERP Menu Types
export interface MenuItem {
  key: string;
  label: string;
}

export interface ToolbarButton {
  key: string;
  label: string;
  onClick?: () => void;
}

export interface TableData {
  columns: string[];
  rows: string[][];
}

// ERP Form Types
export interface ClientForm {
  codeTiers: string;
  raisonSocial: string;
  famille: string;
  nom: string;
  prenom: string;
  activite: string;
  adresse: string;
  ville: string;
  rc: string;
  nif: string;
  nis: string;
  ai: string;
}

export interface ArticleForm {
  ref: string;
  designation: string;
  qte: number;
  prixAchat: number;
  prixVente: number;
}

export interface AchatForm {
  fournisseur: string;
  date: string;
  montant: number;
  articles: AchatArticle[];
} 