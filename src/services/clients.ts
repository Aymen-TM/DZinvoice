import { Client } from '@/types/erp';
import * as base from './localforageBase';

const TABLE = 'clients';

export const getClients = () => base.getAll<Client>(TABLE);
export const getClient = (id: string) => base.getById<Client>(TABLE, id);
export const createClient = (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => base.create<Client>(TABLE, data);
export const updateClient = (id: string, data: Partial<Client>) => base.update<Client>(TABLE, id, data);
export const deleteClient = (id: string) => base.remove(TABLE, id);

export async function safeCreateClient(client: Omit<Client, 'createdAt' | 'updatedAt'>) {
  if (!client.id) throw new Error('Client id is required');
  const existing = await getClients();
  if (existing.some(c => c.id === client.id)) {
    throw new Error('Client id must be unique');
  }
  return createClient(client);
} 