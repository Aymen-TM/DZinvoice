import { Achat } from '@/types/erp';
import * as base from './localforageBase';

const TABLE = 'achats';

export const getAchats = () => base.getAll<Achat>(TABLE);
export const getAchat = (id: string) => base.getById<Achat>(TABLE, id);
export const createAchat = (data: Omit<Achat, 'id' | 'createdAt' | 'updatedAt'>) => base.create<Achat>(TABLE, data);
export const updateAchat = (id: string, data: Partial<Achat>) => base.update<Achat>(TABLE, id, data);
export const deleteAchat = (id: string) => base.remove(TABLE, id); 