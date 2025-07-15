import { StockItem } from '@/types/erp';
import * as base from './localforageBase';

const TABLE = 'stock_items';

export const getStockItems = () => base.getAll<StockItem>(TABLE);
export const getStockItem = (id: string) => base.getById<StockItem>(TABLE, id);
export const createStockItem = (data: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => base.create<StockItem>(TABLE, data);
export const updateStockItem = (id: string, data: Partial<StockItem>) => base.update<StockItem>(TABLE, id, data);
export const deleteStockItem = (id: string) => base.remove(TABLE, id);

export async function safeCreateStockItem(item: Omit<StockItem, 'createdAt' | 'updatedAt'>) {
  if (!item.ref) throw new Error('StockItem ref is required');
  const existing = await getStockItems();
  if (existing.some(s => s.ref === item.ref)) {
    throw new Error('StockItem ref must be unique');
  }
  return createStockItem(item);
} 