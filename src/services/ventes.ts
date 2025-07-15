import { Vente } from '@/types/erp';
import * as base from './localforageBase';

const TABLE = 'ventes';

export const getVentes = () => base.getAll<Vente>(TABLE);
export const getVente = (id: string) => base.getById<Vente>(TABLE, id);
export const createVente = (data: Omit<Vente, 'id' | 'createdAt' | 'updatedAt'>) => base.create<Vente>(TABLE, data);
export const updateVente = (id: string, data: Partial<Vente>) => base.update<Vente>(TABLE, id, data);
export const deleteVente = (id: string) => base.remove(TABLE, id);

export async function safeCreateVente(vente: Omit<Vente, 'createdAt' | 'updatedAt'>) {
  if (!vente.id) throw new Error('Vente id is required');
  const existing = await getVentes();
  if (existing.some(v => v.id === vente.id)) {
    throw new Error('Vente id must be unique');
  }
  return createVente(vente);
} 