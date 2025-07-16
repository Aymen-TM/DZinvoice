import { Client } from '@/types/erp';
import { Article } from '@/types/erp';
import { Achat } from '@/types/erp';
import { StockItem } from '@/types/erp';
import { Vente } from '@/types/erp';
import {
  getClients as _getClients,
  //updateClient,
 // deleteClient
} from '@/services/clients';
import {
  getArticles as _getArticles,
  //updateArticle,
  //deleteArticle
} from '@/services/articles';
import {
  getAchats as _getAchats,
 // createAchat,
  //updateAchat,
 //deleteAchat
} from '@/services/achats';
import {
  getStockItems as _getStockItems,
 // createStockItem,
  //updateStockItem,
 // deleteStockItem
} from '@/services/stock_items';
import {
  getVentes as _getVentes,
 // createVente,
 // updateVente,
 // deleteVente
} from '@/services/ventes';
import { setAll } from '@/services/localforageBase';

// Client Storage
export const getClients = _getClients;
export const setClients = async (clients: Client[]) => {
  await setAll<Client>('clients', clients);
};

// Article Storage
export const getArticles = _getArticles;
export const setArticles = async (articles: Article[]) => {
  await setAll<Article>('articles', articles);
};

// Achat Storage
export const getAchats = _getAchats;
export const setAchats = async (achats: Achat[]) => {
  await setAll<Achat>('achats', achats);
};

// Stock Storage
export const getStock = _getStockItems;
export const setStock = async (stock: StockItem[]) => {
  await setAll<StockItem>('stock_items', stock);
};

// Vente Storage
export const getVentes = _getVentes;
export const setVentes = async (ventes: Vente[]) => {
  await setAll<Vente>('ventes', ventes);
}; 