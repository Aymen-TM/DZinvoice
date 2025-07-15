// If not present, define the StockMovement type here or import from your types
export interface StockMovement {
  id: string;
  articleRef: string;
  quantity: number;
  movementType: 'entree' | 'sortie';
  relatedDocId: string;
  createdAt: string;
  updatedAt: string;
}

import * as base from './localforageBase';

const TABLE = 'stock_movements';

export const getStockMovements = () => base.getAll<StockMovement>(TABLE);
export const getStockMovement = (id: string) => base.getById<StockMovement>(TABLE, id);
export const createStockMovement = (data: Omit<StockMovement, 'id' | 'createdAt' | 'updatedAt'>) => base.create<StockMovement>(TABLE, data);
export const updateStockMovement = (id: string, data: Partial<StockMovement>) => base.update<StockMovement>(TABLE, id, data);
export const deleteStockMovement = (id: string) => base.remove(TABLE, id);

export async function safeCreateStockMovement(item: Omit<StockMovement, 'createdAt' | 'updatedAt'>) {
  if (!item.id) throw new Error('StockMovement id is required');
  const existing = await getStockMovements();
  if (existing.some(a => a.id === item.id)) {
    throw new Error('StockMovement id must be unique');
  }
  return createStockMovement(item);
} 