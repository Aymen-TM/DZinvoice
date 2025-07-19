import * as base from './localforageBase';
import { logStockMovement } from './history';

const TABLE = 'stock_movements';

export interface StockMovement {
  id: string;
  itemId: string;
  designation: string;
  depot: string;
  quantity: number;
  movementType: 'in' | 'out';
  date: string;
  reason?: string;
}

export const getStockMovements = () => base.getAll<StockMovement>(TABLE);
export const getStockMovement = (id: string) => base.getById<StockMovement>(TABLE, id);
export const createStockMovement = async (data: Omit<StockMovement, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newMovement = await base.create<StockMovement>(TABLE, data);
  
  // Log history
  await logStockMovement(
    newMovement.itemId,
    newMovement.designation,
    newMovement.depot,
    newMovement.quantity,
    newMovement.movementType
  );
  
  return newMovement;
};
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