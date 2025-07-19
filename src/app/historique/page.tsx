"use client";
import React, { useState, useEffect } from "react";
import { FiFileText, FiEdit, FiDownload, FiTrash2, FiUser, FiPackage, FiDollarSign, FiShoppingCart, FiDatabase } from "react-icons/fi";
import { getHistory } from "@/services/history";
import { exportToCSV, exportToPDF } from "@/utils/historyExport";
import { HistoryAction } from "@/services/history";
import { seedHistoryData } from "@/utils/seedHistory";

const actionTypes = [
  { value: "Tous", label: "Tous les types" },
  { value: "invoice_created", label: "Factures créées" },
  { value: "invoice_updated", label: "Factures modifiées" },
  { value: "invoice_deleted", label: "Factures supprimées" },
  { value: "client_created", label: "Clients ajoutés" },
  { value: "client_updated", label: "Clients modifiés" },
  { value: "client_deleted", label: "Clients supprimés" },
  { value: "article_created", label: "Articles ajoutés" },
  { value: "article_updated", label: "Articles modifiés" },
  { value: "article_deleted", label: "Articles supprimés" },
  { value: "vente_created", label: "Ventes créées" },
  { value: "vente_updated", label: "Ventes modifiées" },
  { value: "vente_deleted", label: "Ventes supprimées" },
  { value: "achat_created", label: "Achats créés" },
  { value: "achat_updated", label: "Achats modifiés" },
  { value: "achat_deleted", label: "Achats supprimés" },
  { value: "stock_movement", label: "Mouvements de stock" }
];

const entityTypes = [
  { value: "Tous", label: "Toutes les entités" },
  { value: "invoice", label: "Factures" },
  { value: "client", label: "Clients" },
  { value: "article", label: "Articles" },
  { value: "vente", label: "Ventes" },
  { value: "achat", label: "Achats" },
  { value: "stock", label: "Stock" }
];

export default function HistoriquePage() {
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("Tous");
  const [entityType, setEntityType] = useState("Tous");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load history data
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await getHistory();
        setHistory(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...history];

    // Filter by type
    if (type !== "Tous") {
      filtered = filtered.filter(action => action.type === type);
    }

    // Filter by entity type
    if (entityType !== "Tous") {
      filtered = filtered.filter(action => action.entityType === entityType);
    }

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter(action => {
        const actionDate = new Date(action.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return actionDate >= start && actionDate <= end;
      });
    } else if (startDate) {
      filtered = filtered.filter(action => {
        const actionDate = new Date(action.createdAt);
        const start = new Date(startDate);
        return actionDate >= start;
      });
    } else if (endDate) {
      filtered = filtered.filter(action => {
        const actionDate = new Date(action.createdAt);
        const end = new Date(endDate);
        return actionDate <= end;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(action => 
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  }, [history, type, entityType, startDate, endDate, searchTerm]);

  const handleExportCSV = () => {
    exportToCSV(filteredHistory, 'historique');
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(filteredHistory, 'historique');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  const handleSeedData = async () => {
    try {
      await seedHistoryData();
      // Reload history data
      const data = await getHistory();
      setHistory(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const clearFilters = () => {
    setType("Tous");
    setEntityType("Tous");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  const getActionIconComponent = (type: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      'invoice_created': <FiFileText className="text-blue-500" />,
      'invoice_updated': <FiEdit className="text-yellow-500" />,
      'invoice_deleted': <FiTrash2 className="text-red-500" />,
      'client_created': <FiUser className="text-green-500" />,
      'client_updated': <FiEdit className="text-yellow-500" />,
      'client_deleted': <FiTrash2 className="text-red-500" />,
      'article_created': <FiPackage className="text-blue-500" />,
      'article_updated': <FiEdit className="text-yellow-500" />,
      'article_deleted': <FiTrash2 className="text-red-500" />,
      'vente_created': <FiDollarSign className="text-green-500" />,
      'vente_updated': <FiEdit className="text-yellow-500" />,
      'vente_deleted': <FiTrash2 className="text-red-500" />,
      'achat_created': <FiShoppingCart className="text-purple-500" />,
      'achat_updated': <FiEdit className="text-yellow-500" />,
      'achat_deleted': <FiTrash2 className="text-red-500" />,
      'stock_movement': <FiDatabase className="text-orange-500" />
    };
    return iconMap[type] || <FiFileText className="text-gray-500" />;
  };

  return (
    <main className="min-h-screen bg-blue-50 font-sans p-2 sm:p-4 md:p-6 lg:p-8 pt-20 sm:pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-700 mb-4 sm:mb-6 text-center sm:text-left">
          Historique des actions
        </h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow p-2 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{history.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total actions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{filteredHistory.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Actions filtrées</div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
              {history.length > 0 ? new Date(history[0].createdAt).toLocaleDateString('fr-FR') : '-'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Dernière action</div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
              {history.length > 0 ? new Date(history[history.length - 1].createdAt).toLocaleDateString('fr-FR') : '-'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Première action</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white shadow rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          {/* Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Type d&apos;action</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)} 
                className="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-blue-300 focus:border-blue-300"
              >
                {actionTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Type d&apos;entité</label>
              <select 
                value={entityType} 
                onChange={e => setEntityType(e.target.value)} 
                className="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-blue-300 focus:border-blue-300"
              >
                {entityTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-blue-300 focus:border-blue-300" 
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-blue-300 focus:border-blue-300" 
              />
            </div>
          </div>
          
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <input 
                type="text" 
                placeholder="Rechercher dans les titres et descriptions..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-blue-300 focus:border-blue-300" 
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button 
                onClick={clearFilters}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 text-gray-700 rounded shadow hover:bg-gray-200 transition text-xs sm:text-sm"
              >
                Effacer
              </button>
              <button 
                onClick={handleSeedData}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-purple-100 text-purple-700 rounded shadow hover:bg-purple-200 transition text-xs sm:text-sm"
              >
                Données de test
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-1 bg-green-100 text-green-700 px-3 sm:px-4 py-1 sm:py-2 rounded shadow hover:bg-green-200 transition text-xs sm:text-sm"
              >
                <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" /> CSV
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-1 bg-red-100 text-red-700 px-3 sm:px-4 py-1 sm:py-2 rounded shadow hover:bg-red-200 transition text-xs sm:text-sm"
              >
                <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Timeline/List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2 text-sm sm:text-base">Chargement de l&apos;historique...</p>
          </div>
        ) : (
          <ul className="space-y-2 sm:space-y-4">
            {filteredHistory.map(action => (
              <li key={action.id} className="flex items-start gap-2 sm:gap-3 bg-white shadow rounded-lg p-3 sm:p-4 border-l-4 border-blue-400 hover:shadow-lg transition">
                <span className="text-lg sm:text-xl mt-1 flex-shrink-0">
                  {getActionIconComponent(action.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-700 font-semibold">
                    <span className="truncate">{action.title}</span>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="text-gray-400 hidden sm:inline">•</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(action.createdAt).toLocaleString('fr-FR')}
                      </span>
                      {action.entityType && (
                        <>
                          <span className="text-gray-400 hidden sm:inline">•</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                            {action.entityType === 'invoice' ? 'Facture' : action.entityType}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-700 mt-1 text-xs sm:text-sm break-words">{action.description}</div>
                  {action.metadata && Object.keys(action.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-2">
                      {Object.entries(action.metadata).map(([key, value]) => (
                        <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                          <strong>{key}:</strong> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
            {filteredHistory.length === 0 && (
              <li className="text-center text-gray-400 py-8 bg-white rounded-lg shadow">
                <p className="text-sm sm:text-base">
                  {history.length === 0 ? "Aucune action enregistrée." : "Aucune action trouvée avec les filtres actuels."}
                </p>
              </li>
            )}
          </ul>
        )}
      </div>
    </main>
  );
} 