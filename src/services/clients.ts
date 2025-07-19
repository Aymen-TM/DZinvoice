import { Client } from '@/types/erp';
import * as base from './localforageBase';
import { logClientCreated, logClientUpdated, logClientDeleted } from './history';

const TABLE = 'clients';

export const getClients = () => base.getAll<Client>(TABLE);
export const getClient = (id: string) => base.getById<Client>(TABLE, id);
export const createClient = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newClient = await base.create<Client>(TABLE, data);
  
  // Log history
  await logClientCreated(
    newClient.id,
    newClient.raisonSocial || `${newClient.nom} ${newClient.prenom}`
  );
  
  return newClient;
};
export const updateClient = async (id: string, data: Partial<Client>) => {
  const updatedClient = await base.update<Client>(TABLE, id, data);
  
  // Log history
  await logClientUpdated(
    id,
    updatedClient.raisonSocial || `${updatedClient.nom} ${updatedClient.prenom}`
  );
  
  return updatedClient;
};
export const deleteClient = async (id: string) => {
  const client = await getClient(id);
  if (client) {
    // Log history before deletion
    await logClientDeleted(
      id,
      client.raisonSocial || `${client.nom} ${client.prenom}`
    );
  }
  
  await base.remove(TABLE, id);
};

export async function safeCreateClient(client: Omit<Client, 'createdAt' | 'updatedAt'>) {
  if (!client.id) throw new Error('Client id is required');
  const existing = await getClients();
  if (existing.some(c => c.id === client.id)) {
    throw new Error('Client id must be unique');
  }
  return createClient(client);
} 