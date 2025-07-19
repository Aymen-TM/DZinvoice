import * as base from './localforageBase';

export interface HistoryAction {
  id: string;
  type: 'invoice_created' | 'invoice_updated' | 'invoice_deleted' | 'client_created' | 'client_updated' | 'client_deleted' | 'article_created' | 'article_updated' | 'article_deleted' | 'vente_created' | 'vente_updated' | 'vente_deleted' | 'achat_created' | 'achat_updated' | 'achat_deleted' | 'stock_movement';
  title: string;
  description: string;
  entityId?: string;
  entityType?: 'invoice' | 'client' | 'article' | 'vente' | 'achat' | 'stock';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const TABLE = 'history';

export const getHistory = () => base.getAll<HistoryAction>(TABLE);
export const getHistoryById = (id: string) => base.getById<HistoryAction>(TABLE, id);
export const createHistoryAction = (data: Omit<HistoryAction, 'id' | 'createdAt' | 'updatedAt'>) => base.create<HistoryAction>(TABLE, data);
export const updateHistoryAction = (id: string, data: Partial<HistoryAction>) => base.update<HistoryAction>(TABLE, id, data);
export const deleteHistoryAction = (id: string) => base.remove(TABLE, id);

// Helper functions to create specific history actions
export const logInvoiceCreated = async (invoiceId: string, invoiceNumber: string, clientName: string, amount: number) => {
  return createHistoryAction({
    type: 'invoice_created',
    title: 'Facture créée',
    description: `Facture #${invoiceNumber} créée pour ${clientName} (${amount.toLocaleString('fr-FR')} DA)`,
    entityId: invoiceId,
    entityType: 'invoice',
    metadata: { invoiceNumber, clientName, amount }
  });
};

export const logInvoiceUpdated = async (invoiceId: string, invoiceNumber: string, clientName: string, amount: number) => {
  return createHistoryAction({
    type: 'invoice_updated',
    title: 'Facture modifiée',
    description: `Facture #${invoiceNumber} modifiée pour ${clientName} (${amount.toLocaleString('fr-FR')} DA)`,
    entityId: invoiceId,
    entityType: 'invoice',
    metadata: { invoiceNumber, clientName, amount }
  });
};

export const logInvoiceDeleted = async (invoiceId: string, invoiceNumber: string, clientName: string) => {
  return createHistoryAction({
    type: 'invoice_deleted',
    title: 'Facture supprimée',
    description: `Facture #${invoiceNumber} supprimée pour ${clientName}`,
    entityId: invoiceId,
    entityType: 'invoice',
    metadata: { invoiceNumber, clientName }
  });
};

export const logClientCreated = async (clientId: string, clientName: string) => {
  return createHistoryAction({
    type: 'client_created',
    title: 'Client ajouté',
    description: `Client "${clientName}" ajouté`,
    entityId: clientId,
    entityType: 'client',
    metadata: { clientName }
  });
};

export const logClientUpdated = async (clientId: string, clientName: string) => {
  return createHistoryAction({
    type: 'client_updated',
    title: 'Client modifié',
    description: `Client "${clientName}" modifié`,
    entityId: clientId,
    entityType: 'client',
    metadata: { clientName }
  });
};

export const logClientDeleted = async (clientId: string, clientName: string) => {
  return createHistoryAction({
    type: 'client_deleted',
    title: 'Client supprimé',
    description: `Client "${clientName}" supprimé`,
    entityId: clientId,
    entityType: 'client',
    metadata: { clientName }
  });
};

export const logArticleCreated = async (articleId: string, designation: string, ref: string) => {
  return createHistoryAction({
    type: 'article_created',
    title: 'Article ajouté',
    description: `Article "${designation}" (${ref}) ajouté au stock`,
    entityId: articleId,
    entityType: 'article',
    metadata: { designation, ref }
  });
};

export const logArticleUpdated = async (articleId: string, designation: string, ref: string) => {
  return createHistoryAction({
    type: 'article_updated',
    title: 'Article modifié',
    description: `Article "${designation}" (${ref}) modifié`,
    entityId: articleId,
    entityType: 'article',
    metadata: { designation, ref }
  });
};

export const logArticleDeleted = async (articleId: string, designation: string, ref: string) => {
  return createHistoryAction({
    type: 'article_deleted',
    title: 'Article supprimé',
    description: `Article "${designation}" (${ref}) supprimé`,
    entityId: articleId,
    entityType: 'article',
    metadata: { designation, ref }
  });
};

export const logVenteCreated = async (venteId: string, client: string, amount: number) => {
  return createHistoryAction({
    type: 'vente_created',
    title: 'Vente créée',
    description: `Vente créée pour ${client} (${amount.toLocaleString('fr-FR')} DA)`,
    entityId: venteId,
    entityType: 'vente',
    metadata: { client, amount }
  });
};

export const logVenteUpdated = async (venteId: string, client: string, amount: number) => {
  return createHistoryAction({
    type: 'vente_updated',
    title: 'Vente modifiée',
    description: `Vente modifiée pour ${client} (${amount.toLocaleString('fr-FR')} DA)`,
    entityId: venteId,
    entityType: 'vente',
    metadata: { client, amount }
  });
};

export const logVenteDeleted = async (venteId: string, client: string) => {
  return createHistoryAction({
    type: 'vente_deleted',
    title: 'Vente supprimée',
    description: `Vente supprimée pour ${client}`,
    entityId: venteId,
    entityType: 'vente',
    metadata: { client }
  });
};

export const logAchatCreated = async (achatId: string, fournisseur: string, amount: number) => {
  return createHistoryAction({
    type: 'achat_created',
    title: 'Achat créé',
    description: `Achat créé pour ${fournisseur} (${amount.toLocaleString('fr-FR')} DA)`,
    entityId: achatId,
    entityType: 'achat',
    metadata: { fournisseur, amount }
  });
};

export const logAchatUpdated = async (achatId: string, fournisseur: string, amount: number) => {
  return createHistoryAction({
    type: 'achat_updated',
    title: 'Achat modifié',
    description: `Achat modifié pour ${fournisseur} (${amount.toLocaleString('fr-FR')} DA)`,
    entityId: achatId,
    entityType: 'achat',
    metadata: { fournisseur, amount }
  });
};

export const logAchatDeleted = async (achatId: string, fournisseur: string) => {
  return createHistoryAction({
    type: 'achat_deleted',
    title: 'Achat supprimé',
    description: `Achat supprimé pour ${fournisseur}`,
    entityId: achatId,
    entityType: 'achat',
    metadata: { fournisseur }
  });
};

export const logStockMovement = async (itemId: string, designation: string, depot: string, quantity: number, movementType: 'in' | 'out') => {
  return createHistoryAction({
    type: 'stock_movement',
    title: 'Mouvement de stock',
    description: `${movementType === 'in' ? 'Entrée' : 'Sortie'} de ${quantity} ${designation} dans le dépôt ${depot}`,
    entityId: itemId,
    entityType: 'stock',
    metadata: { designation, depot, quantity, movementType }
  });
};

// Filter and search functions
export const getHistoryByType = async (type: string) => {
  const history = await getHistory();
  if (type === 'Tous') return history;
  return history.filter(action => action.type === type);
};

export const getHistoryByDateRange = async (startDate: string, endDate: string) => {
  const history = await getHistory();
  return history.filter(action => {
    const actionDate = new Date(action.createdAt);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return actionDate >= start && actionDate <= end;
  });
};

export const getHistoryByEntityType = async (entityType: string) => {
  const history = await getHistory();
  if (entityType === 'Tous') return history;
  return history.filter(action => action.entityType === entityType);
}; 