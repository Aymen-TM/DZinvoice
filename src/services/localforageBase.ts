import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

export async function getAll<T extends {id: string}>(table: string): Promise<T[]> {
  return (await localforage.getItem<T[]>(table)) || [];
}

export async function getById<T extends {id: string}>(table: string, id: string): Promise<T | null> {
  const all = await getAll<T>(table);
  return all.find(item => item.id === id) || null;
}

export async function create<T extends {id: string}>(table: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
  const now = new Date().toISOString();
  // Use provided id if present, otherwise generate a UUID
  const item = { ...data, id: ((data as unknown) as {id: string}).id || uuidv4(), createdAt: now, updatedAt: now } as unknown as T;
  const all = await getAll<T>(table);
  all.push(item);
  await localforage.setItem(table, all);
  return item;
}

export async function update<T extends {id: string}>(table: string, id: string, data: Partial<T>): Promise<T> {
  const all = await getAll<T>(table);
  const idx = all.findIndex(item => item.id === id);
  if (idx === -1) throw new Error('Not found');
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  await localforage.setItem(table, all);
  return all[idx];
}

export async function remove(table: string, id: string): Promise<void> {
  const all = await getAll(table);
  const filtered = all.filter((item: {id: string}) => item.id !== id);
  await localforage.setItem(table, filtered);
}

export async function setAll<T extends {id: string}>(table: string, items: T[]): Promise<void> {
  await localforage.setItem(table, items);
}

// Utility: Export all tables as a single object
export async function exportAllTables() {
  // List all known tables used in the app
  const tables = [
    'clients',
    'articles',
    'achats',
    'ventes',
    'stock_items',
    'vente_items',
    'achat_items',
    'stock_movements',
    'history',
  ];
  const result: Record<string, unknown[]> = {};
  for (const table of tables) {
    result[table] = await getAll(table);
  }
  return result;
} 