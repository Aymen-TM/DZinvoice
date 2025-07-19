import { Vente } from '@/types/erp';
import * as base from './localforageBase';
import { logVenteCreated, logVenteUpdated, logVenteDeleted } from './history';

const TABLE = 'ventes';

export const getVentes = () => base.getAll<Vente>(TABLE);
export const getVente = (id: string) => base.getById<Vente>(TABLE, id);
export const createVente = async (data: Omit<Vente, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newVente = await base.create<Vente>(TABLE, data);
  
  // Log history
  await logVenteCreated(
    newVente.id,
    newVente.client,
    newVente.montant
  );
  
  return newVente;
};
export const updateVente = async (id: string, data: Partial<Vente>) => {
  const updatedVente = await base.update<Vente>(TABLE, id, data);
  
  // Log history
  await logVenteUpdated(
    id,
    updatedVente.client,
    updatedVente.montant
  );
  
  return updatedVente;
};
export const deleteVente = async (id: string) => {
  const vente = await getVente(id);
  if (vente) {
    // Log history before deletion
    await logVenteDeleted(
      id,
      vente.client
    );
  }
  
  await base.remove(TABLE, id);
};

export async function safeCreateVente(vente: Omit<Vente, 'createdAt' | 'updatedAt'>) {
  if (!vente.id) throw new Error('Vente id is required');
  const existing = await getVentes();
  if (existing.some(v => v.id === vente.id)) {
    throw new Error('Vente id must be unique');
  }
  return createVente(vente);
} 