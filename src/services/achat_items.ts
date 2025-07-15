// If not present, define the AchatItem type here or import from your types
export interface AchatItem {
  id: string;
  achatId: string;
  articleRef: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

import * as base from './localforageBase';

const TABLE = 'achat_items';

export const getAchatItems = () => base.getAll<AchatItem>(TABLE);
export const getAchatItem = (id: string) => base.getById<AchatItem>(TABLE, id);
export const createAchatItem = (data: Omit<AchatItem, 'id' | 'createdAt' | 'updatedAt'>) => base.create<AchatItem>(TABLE, data);
export const updateAchatItem = (id: string, data: Partial<AchatItem>) => base.update<AchatItem>(TABLE, id, data);
export const deleteAchatItem = (id: string) => base.remove(TABLE, id);

export async function safeCreateAchatItem(item: Omit<AchatItem, 'createdAt' | 'updatedAt'>) {
  if (!item.id) throw new Error('AchatItem id is required');
  const existing = await getAchatItems();
  if (existing.some(a => a.id === item.id)) {
    throw new Error('AchatItem id must be unique');
  }
  return createAchatItem(item);
} 