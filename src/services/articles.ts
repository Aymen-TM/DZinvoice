import { Article } from '@/types/erp';
import * as base from './localforageBase';
import { logArticleCreated, logArticleUpdated, logArticleDeleted } from './history';

const TABLE = 'articles';

export const getArticles = () => base.getAll<Article>(TABLE);
export const getArticle = (id: string) => base.getById<Article>(TABLE, id);
export const createArticle = async (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newArticle = await base.create<Article>(TABLE, data);
  
  // Log history
  await logArticleCreated(
    newArticle.id,
    newArticle.designation,
    newArticle.ref
  );
  
  return newArticle;
};
export const updateArticle = async (id: string, data: Partial<Article>) => {
  const updatedArticle = await base.update<Article>(TABLE, id, data);
  
  // Log history
  await logArticleUpdated(
    id,
    updatedArticle.designation,
    updatedArticle.ref
  );
  
  return updatedArticle;
};
export const deleteArticle = async (id: string) => {
  const article = await getArticle(id);
  if (article) {
    // Log history before deletion
    await logArticleDeleted(
      id,
      article.designation,
      article.ref
    );
  }
  
  await base.remove(TABLE, id);
};

export async function safeCreateArticle(article: Omit<Article, 'createdAt' | 'updatedAt'>) {
  if (!article.ref) throw new Error('Article ref is required');
  const existing = await getArticles();
  if (existing.some(a => a.ref === article.ref)) {
    throw new Error('Article ref must be unique');
  }
  return createArticle(article);
} 