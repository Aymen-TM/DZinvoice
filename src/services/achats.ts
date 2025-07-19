import { Achat } from '@/types/erp';
import * as base from './localforageBase';
import { logAchatCreated, logAchatUpdated, logAchatDeleted } from './history';

const TABLE = 'achats';

export const getAchats = () => base.getAll<Achat>(TABLE);
export const getAchat = (id: string) => base.getById<Achat>(TABLE, id);
export const createAchat = async (data: Omit<Achat, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newAchat = await base.create<Achat>(TABLE, data);
  
  // Log history
  await logAchatCreated(
    newAchat.id,
    newAchat.fournisseur,
    newAchat.montant
  );
  
  return newAchat;
};
export const updateAchat = async (id: string, data: Partial<Achat>) => {
  const updatedAchat = await base.update<Achat>(TABLE, id, data);
  
  // Log history
  await logAchatUpdated(
    id,
    updatedAchat.fournisseur,
    updatedAchat.montant
  );
  
  return updatedAchat;
};
export const deleteAchat = async (id: string) => {
  const achat = await getAchat(id);
  if (achat) {
    // Log history before deletion
    await logAchatDeleted(
      id,
      achat.fournisseur
    );
  }
  
  await base.remove(TABLE, id);
}; 