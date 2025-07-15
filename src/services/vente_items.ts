// If not present, define the VenteItem type here or import from your types
export interface VenteItem {
  id: string;
  venteId: string;
  articleRef: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

import * as base from './localforageBase';

const TABLE = 'vente_items';

export const getVenteItems = () => base.getAll<VenteItem>(TABLE);
export const getVenteItem = (id: string) => base.getById<VenteItem>(TABLE, id);
export const createVenteItem = (data: Omit<VenteItem, 'id' | 'createdAt' | 'updatedAt'>) => base.create<VenteItem>(TABLE, data);
export const updateVenteItem = (id: string, data: Partial<VenteItem>) => base.update<VenteItem>(TABLE, id, data);
export const deleteVenteItem = (id: string) => base.remove(TABLE, id);

export async function safeCreateVenteItem(item: Omit<VenteItem, 'createdAt' | 'updatedAt'>) {
  if (!item.id) throw new Error('VenteItem id is required');
  const existing = await getVenteItems();
  if (existing.some(a => a.id === item.id)) {
    throw new Error('VenteItem id must be unique');
  }
  return createVenteItem(item);
} 