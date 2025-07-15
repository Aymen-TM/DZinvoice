import { Article } from '@/types/erp';
import * as base from './localforageBase';

const TABLE = 'articles';

export const getArticles = () => base.getAll<Article>(TABLE);
export const getArticle = (ref: string) => base.getById<Article>(TABLE, ref);
export const createArticle = (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => base.create<Article>(TABLE, data);
export const updateArticle = (ref: string, data: Partial<Article>) => base.update<Article>(TABLE, ref, data);
export const deleteArticle = (ref: string) => base.remove(TABLE, ref);

export async function safeCreateArticle(article: Omit<Article, 'createdAt' | 'updatedAt'>) {
  if (!article.ref) throw new Error('Article ref is required');
  const existing = await getArticles();
  if (existing.some(a => a.ref === article.ref)) {
    throw new Error('Article ref must be unique');
  }
  return createArticle(article);
} 