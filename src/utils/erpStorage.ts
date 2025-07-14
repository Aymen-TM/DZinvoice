import localforage from 'localforage';
import type { Client, Article, Achat, StockItem, Vente } from '@/types/erp';

// Storage Keys
const CLIENTS_KEY = 'clients';
const ARTICLES_KEY = 'articles';
const ACHATS_KEY = 'achats';
const STOCK_KEY = 'stock';
const VENTES_KEY = 'ventes';

// Client Storage
export async function getClients(): Promise<Client[]> {
  const clients = await localforage.getItem<Client[]>(CLIENTS_KEY);
  return clients || [];
}

export async function setClients(clients: Client[]): Promise<void> {
  await localforage.setItem(CLIENTS_KEY, clients);
}

// Article Storage
export async function getArticles(): Promise<Article[]> {
  const articles = await localforage.getItem<Article[]>(ARTICLES_KEY);
  return articles || [];
}

export async function setArticles(articles: Article[]): Promise<void> {
  await localforage.setItem(ARTICLES_KEY, articles);
}

// Achat Storage
export async function getAchats(): Promise<Achat[]> {
  const achats = await localforage.getItem<Achat[]>(ACHATS_KEY);
  return achats || [];
}

export async function setAchats(achats: Achat[]): Promise<void> {
  await localforage.setItem(ACHATS_KEY, achats);
}

// Stock Storage
export async function getStock(): Promise<StockItem[]> {
  const stock = await localforage.getItem<StockItem[]>(STOCK_KEY);
  return stock || [];
}

export async function setStock(stock: StockItem[]): Promise<void> {
  await localforage.setItem(STOCK_KEY, stock);
}

// Vente Storage
export async function getVentes(): Promise<Vente[]> {
  const ventes = await localforage.getItem<Vente[]>(VENTES_KEY);
  return ventes || [];
}

export async function setVentes(ventes: Vente[]): Promise<void> {
  await localforage.setItem(VENTES_KEY, ventes);
} 