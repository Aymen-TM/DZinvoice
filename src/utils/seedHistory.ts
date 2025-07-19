import { createHistoryAction } from '@/services/history';

export const seedHistoryData = async () => {
  const sampleActions = [
    {
      type: 'invoice_created' as const,
      title: 'Facture créée',
      description: 'Facture #FV/24-0001 créée pour Entreprise ABC (15,000 DA)',
      entityId: 'inv-001',
      entityType: 'invoice' as const,
      metadata: { invoiceNumber: 'FV/24-0001', clientName: 'Entreprise ABC', amount: 15000 }
    },
    {
      type: 'client_created' as const,
      title: 'Client ajouté',
      description: 'Client "Entreprise ABC" ajouté',
      entityId: 'client-001',
      entityType: 'client' as const,
      metadata: { clientName: 'Entreprise ABC' }
    },
    {
      type: 'article_created' as const,
      title: 'Article ajouté',
      description: 'Article "Ordinateur portable" (REF-001) ajouté au stock',
      entityId: 'article-001',
      entityType: 'article' as const,
      metadata: { designation: 'Ordinateur portable', ref: 'REF-001' }
    },
    {
      type: 'vente_created' as const,
      title: 'Vente créée',
      description: 'Vente créée pour Entreprise ABC (25,000 DA)',
      entityId: 'vente-001',
      entityType: 'vente' as const,
      metadata: { client: 'Entreprise ABC', amount: 25000 }
    },
    {
      type: 'achat_created' as const,
      title: 'Achat créé',
      description: 'Achat créé pour Fournisseur XYZ (8,500 DA)',
      entityId: 'achat-001',
      entityType: 'achat' as const,
      metadata: { fournisseur: 'Fournisseur XYZ', amount: 8500 }
    },
    {
      type: 'stock_movement' as const,
      title: 'Mouvement de stock',
      description: 'Entrée de 10 Ordinateur portable dans le dépôt Principal',
      entityId: 'stock-001',
      entityType: 'stock' as const,
      metadata: { designation: 'Ordinateur portable', depot: 'Principal', quantity: 10, movementType: 'in' }
    },
    {
      type: 'invoice_updated' as const,
      title: 'Facture modifiée',
      description: 'Facture #FV/24-0001 modifiée pour Entreprise ABC (16,500 DA)',
      entityId: 'inv-001',
      entityType: 'invoice' as const,
      metadata: { invoiceNumber: 'FV/24-0001', clientName: 'Entreprise ABC', amount: 16500 }
    },
    {
      type: 'client_updated' as const,
      title: 'Client modifié',
      description: 'Client "Entreprise ABC" modifié',
      entityId: 'client-001',
      entityType: 'client' as const,
      metadata: { clientName: 'Entreprise ABC' }
    },
    {
      type: 'article_deleted' as const,
      title: 'Article supprimé',
      description: 'Article "Produit obsolète" (REF-999) supprimé',
      entityId: 'article-999',
      entityType: 'article' as const,
      metadata: { designation: 'Produit obsolète', ref: 'REF-999' }
    },
    {
      type: 'stock_movement' as const,
      title: 'Mouvement de stock',
      description: 'Sortie de 5 Ordinateur portable du dépôt Principal',
      entityId: 'stock-002',
      entityType: 'stock' as const,
      metadata: { designation: 'Ordinateur portable', depot: 'Principal', quantity: 5, movementType: 'out' }
    }
  ];

  // Create actions with different timestamps (spread over the last 30 days)
  for (let i = 0; i < sampleActions.length; i++) {
    const daysAgo = sampleActions.length - i - 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(9 + Math.floor(Math.random() * 8)); // Random hour between 9-17
    date.setMinutes(Math.floor(Math.random() * 60));
    
    await createHistoryAction({
      ...sampleActions[i]
    });
  }

  console.log('History data seeded successfully!');
}; 