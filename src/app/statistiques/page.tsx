"use client";
import { useState, useEffect, useMemo } from "react";
import { Bar, Pie, Line, Doughnut, Radar, Scatter } from "react-chartjs-2";
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend,
  Title,
  Filler,
  RadialLinearScale
} from "chart.js";
import { 
  FiUsers, 
  FiShoppingCart, 
  FiFileText, 
  FiPackage, 
  FiTrendingUp, 
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiTarget,
  FiAward,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiSettings,
  FiCalendar as FiCalendarIcon
} from "react-icons/fi";
import { 
  getClients, 
  getArticles, 
  getAchats, 
  getVentes, 
  getStock 
} from '@/utils/erpStorage';
import { getCompleteInvoices } from '@/utils/invoiceStorage';
import { getHistory } from '@/services/history';
import type { Vente, Client, Achat, Article, StockItem } from '@/types/erp';

Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend,
  Title,
  Filler,
  RadialLinearScale
);

interface StatsData {
  totalVentes: number;
  totalAchats: number;
  totalClients: number;
  totalArticles: number;
  totalInvoices: number;
  totalStockItems: number;
  topClient: { name: string; amount: number };
  topArticle: { name: string; quantity: number };
  monthlyVentes: number[];
  monthlyAchats: number[];
  categoryDistribution: { [key: string]: number };
  clientDistribution: { [key: string]: number };
  recentActivity: any[];
  // Advanced metrics
  profitMargin: number;
  growthRate: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  inventoryTurnover: number;
  topProducts: Array<{ name: string; sales: number; profit: number }>;
  seasonalTrends: { [key: string]: number };
  forecastData: number[];
  performanceMetrics: {
    salesEfficiency: number;
    costEfficiency: number;
    customerSatisfaction: number;
    inventoryEfficiency: number;
  };
  // Detailed analytics
  dailyStats: {
    [date: string]: {
      ventes: number;
      achats: number;
      orders: number;
      customers: number;
    };
  };
  clientSegments: {
    vip: Array<{ name: string; total: number; orders: number }>;
    regular: Array<{ name: string; total: number; orders: number }>;
    new: Array<{ name: string; total: number; orders: number }>;
  };
  productAnalytics: {
    bestSellers: Array<{ name: string; quantity: number; revenue: number; profit: number }>;
    lowStock: Array<{ name: string; current: number; min: number }>;
    highProfit: Array<{ name: string; margin: number; revenue: number }>;
  };
  financialMetrics: {
    cashFlow: number;
    workingCapital: number;
    debtToEquity: number;
    returnOnInvestment: number;
    breakEvenPoint: number;
  };
  operationalMetrics: {
    orderFulfillmentRate: number;
    averageDeliveryTime: number;
    customerSatisfactionScore: number;
    employeeProductivity: number;
    qualityScore: number;
  };
  marketAnalysis: {
    marketShare: number;
    competitorAnalysis: Array<{ name: string; share: number; strength: string }>;
    marketTrends: Array<{ trend: string; impact: string; confidence: number }>;
  };
  riskAssessment: {
    creditRisk: number;
    inventoryRisk: number;
    marketRisk: number;
    operationalRisk: number;
    overallRisk: string;
  };
}

interface FilterState {
  dateRange: string;
  startDate: string;
  endDate: string;
  category: string;
  client: string;
  viewMode: 'overview' | 'detailed' | 'comparison';
  chartType: 'bar' | 'line' | 'pie' | 'radar' | 'scatter';
  showForecast: boolean;
  showTrends: boolean;
  useCustomDateRange: boolean;
}

export default function StatistiquesPage() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: '6months',
    startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: 'all',
    client: 'all',
    viewMode: 'overview',
    chartType: 'bar',
    showForecast: false,
    showTrends: true,
    useCustomDateRange: false
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  useEffect(() => {
    loadStatistics();
  }, [filters.dateRange, filters.startDate, filters.endDate, filters.useCustomDateRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Load all data
      const [clients, articles, achats, ventes, stock, invoices, history] = await Promise.all([
        getClients(),
        getArticles(),
        getAchats(),
        getVentes(),
        getStock(),
        getCompleteInvoices(),
        getHistory()
      ]);

      // Filter data by date range
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date

      const filteredVentes = ventes.filter(vente => {
        const venteDate = new Date(vente.date);
        return venteDate >= startDate && venteDate <= endDate;
      });

      const filteredAchats = achats.filter(achat => {
        const achatDate = new Date(achat.date);
        return achatDate >= startDate && achatDate <= endDate;
      });

      const filteredHistory = history.filter(activity => {
        const activityDate = new Date(activity.createdAt);
        return activityDate >= startDate && activityDate <= endDate;
      });

      // Calculate basic statistics
      const totalVentes = filteredVentes.reduce((sum, vente) => sum + (vente.montant || 0), 0);
      const totalAchats = filteredAchats.reduce((sum, achat) => sum + (achat.montant || 0), 0);
      
      // Advanced calculations
      const profitMargin = totalVentes > 0 ? ((totalVentes - totalAchats) / totalVentes) * 100 : 0;
      const averageOrderValue = filteredVentes.length > 0 ? totalVentes / filteredVentes.length : 0;
      
      // Growth rate calculation
      const currentMonthVentes = filteredVentes.filter(v => {
        const date = new Date(v.date);
        return date.getMonth() === new Date().getMonth();
      }).reduce((sum, v) => sum + (v.montant || 0), 0);
      
      const lastMonthVentes = filteredVentes.filter(v => {
        const date = new Date(v.date);
        return date.getMonth() === new Date().getMonth() - 1;
      }).reduce((sum, v) => sum + (v.montant || 0), 0);
      
      const growthRate = lastMonthVentes > 0 ? ((currentMonthVentes - lastMonthVentes) / lastMonthVentes) * 100 : 0;

      // Top client by total amount
      const clientTotals = filteredVentes.reduce((acc, vente) => {
        const clientName = vente.client || 'Client inconnu';
        acc[clientName] = (acc[clientName] || 0) + (vente.montant || 0);
        return acc;
      }, {} as { [key: string]: number });
      
      const topClient = Object.entries(clientTotals)
        .sort(([,a], [,b]) => b - a)[0] || ['Aucun', 0];

      // Top article by quantity sold
      const articleTotals = articles.reduce((acc, article) => {
        acc[article.designation] = (acc[article.designation] || 0) + (article.qte || 0);
        return acc;
      }, {} as { [key: string]: number });
      
      const topArticle = Object.entries(articleTotals)
        .sort(([,a], [,b]) => b - a)[0] || ['Aucun', 0];

      // Top products with profit calculation
      const topProducts = articles.slice(0, 5).map(article => ({
        name: article.designation,
        sales: article.qte * article.prixVente,
        profit: article.qte * (article.prixVente - article.prixAchat)
      }));

      // Monthly data with forecasting
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const monthlyVentes = months.map((_, index) => {
        const monthVentes = ventes.filter(vente => {
          const venteDate = new Date(vente.date);
          return venteDate.getMonth() === index;
        });
        return monthVentes.reduce((sum, v) => sum + (v.montant || 0), 0);
      });

      const monthlyAchats = months.map((_, index) => {
        const monthAchats = achats.filter(achat => {
          const achatDate = new Date(achat.date);
          return achatDate.getMonth() === index;
        });
        return monthAchats.reduce((sum, a) => sum + (a.montant || 0), 0);
      });

      // Forecast calculation (simple linear regression)
      const forecastData = calculateForecast(monthlyVentes);

      // Seasonal trends
      const seasonalTrends = calculateSeasonalTrends(monthlyVentes);

      // Performance metrics
      const performanceMetrics = {
        salesEfficiency: calculateSalesEfficiency(ventes, clients),
        costEfficiency: calculateCostEfficiency(achats, articles),
        customerSatisfaction: calculateCustomerSatisfaction(ventes, clients),
        inventoryEfficiency: calculateInventoryEfficiency(stock, articles)
      };

      // Category distribution
      const categoryDistribution = articles.reduce((acc, article) => {
        const category = article.designation.split(' ')[0] || 'Autres';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Recent activity
      const recentActivity = filteredHistory
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      // Calculate all advanced analytics
      const dailyStats = calculateDailyStats(filteredVentes, filteredAchats, clients);
      const clientSegments = calculateClientSegments(filteredVentes, clients);
      const productAnalytics = calculateProductAnalytics(articles, stock, filteredVentes);
      const financialMetrics = calculateFinancialMetrics(filteredVentes, filteredAchats, articles);
      const operationalMetrics = calculateOperationalMetrics(filteredVentes, clients, stock);
      const marketAnalysis = calculateMarketAnalysis(filteredVentes, clients);
      const riskAssessment = calculateRiskAssessment(filteredVentes, stock, clients);

      setStatsData({
        totalVentes,
        totalAchats,
        totalClients: clients.length,
        totalArticles: articles.length,
        totalInvoices: invoices.length,
        totalStockItems: stock.length,
        topClient: { name: topClient[0], amount: topClient[1] },
        topArticle: { name: topArticle[0], quantity: topArticle[1] },
        monthlyVentes,
        monthlyAchats,
        categoryDistribution,
        clientDistribution: clientTotals,
        recentActivity,
        profitMargin,
        growthRate,
        averageOrderValue,
        customerRetentionRate: calculateRetentionRate(ventes, clients),
        inventoryTurnover: calculateInventoryTurnover(stock, ventes),
        topProducts,
        seasonalTrends,
        forecastData,
        performanceMetrics,
        dailyStats,
        clientSegments,
        productAnalytics,
        financialMetrics,
        operationalMetrics,
        marketAnalysis,
        riskAssessment
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for advanced calculations
  const calculateForecast = (data: number[]): number[] => {
    const n = data.length;
    if (n < 2) return data;
    
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = data.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return Array.from({ length: 3 }, (_, i) => slope * (n + i) + intercept);
  };

  const calculateSeasonalTrends = (data: number[]): { [key: string]: number } => {
    const quarters = {
      'Q1': data.slice(0, 3).reduce((a, b) => a + b, 0),
      'Q2': data.slice(3, 6).reduce((a, b) => a + b, 0),
      'Q3': data.slice(6, 9).reduce((a, b) => a + b, 0),
      'Q4': data.slice(9, 12).reduce((a, b) => a + b, 0)
    };
    return quarters;
  };

  const calculateSalesEfficiency = (ventes: Vente[], clients: Client[]): number => {
    if (clients.length === 0) return 0;
    return (ventes.length / clients.length) * 100;
  };

  const calculateCostEfficiency = (achats: Achat[], articles: Article[]): number => {
    if (articles.length === 0) return 0;
    const avgCost = achats.reduce((sum, a) => sum + (a.montant || 0), 0) / achats.length;
    const avgPrice = articles.reduce((sum, a) => sum + (a.prixVente || 0), 0) / articles.length;
    return avgPrice > 0 ? ((avgPrice - avgCost) / avgPrice) * 100 : 0;
  };

  const calculateCustomerSatisfaction = (ventes: Vente[], clients: Client[]): number => {
    if (clients.length === 0) return 0;
    const activeClients = new Set(ventes.map(v => v.client)).size;
    return (activeClients / clients.length) * 100;
  };

  const calculateInventoryEfficiency = (stock: StockItem[], articles: Article[]): number => {
    if (articles.length === 0) return 0;
    const totalStock = stock.reduce((sum, s) => sum + (s.quantite || 0), 0);
    const totalArticles = articles.reduce((sum, a) => sum + (a.qte || 0), 0);
    return totalArticles > 0 ? (totalStock / totalArticles) * 100 : 0;
  };

  const calculateRetentionRate = (ventes: Vente[], clients: Client[]): number => {
    if (clients.length === 0) return 0;
    const repeatCustomers = new Set(ventes.map(v => v.client)).size;
    return (repeatCustomers / clients.length) * 100;
  };

  const calculateInventoryTurnover = (stock: StockItem[], ventes: Vente[]): number => {
    const totalStock = stock.reduce((sum, s) => sum + (s.quantite || 0), 0);
    const totalSales = ventes.reduce((sum, v) => sum + (v.montant || 0), 0);
    return totalStock > 0 ? totalSales / totalStock : 0;
  };

  // Advanced calculation functions
  const calculateDailyStats = (ventes: Vente[], achats: Achat[], clients: Client[]) => {
    const dailyStats: { [date: string]: any } = {};
    
    ventes.forEach(vente => {
      const date = new Date(vente.date).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { ventes: 0, achats: 0, orders: 0, customers: 0 };
      }
      dailyStats[date].ventes += vente.montant || 0;
      dailyStats[date].orders += 1;
    });

    achats.forEach(achat => {
      const date = new Date(achat.date).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { ventes: 0, achats: 0, orders: 0, customers: 0 };
      }
      dailyStats[date].achats += achat.montant || 0;
    });

    return dailyStats;
  };

  const calculateClientSegments = (ventes: Vente[], clients: Client[]) => {
    const clientTotals = ventes.reduce((acc, vente) => {
      const clientName = vente.client || 'Client inconnu';
      if (!acc[clientName]) {
        acc[clientName] = { total: 0, orders: 0 };
      }
      acc[clientName].total += vente.montant || 0;
      acc[clientName].orders += 1;
      return acc;
    }, {} as { [key: string]: { total: number; orders: number } });

    const sortedClients = Object.entries(clientTotals)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    const vip = sortedClients.slice(0, Math.ceil(sortedClients.length * 0.1));
    const regular = sortedClients.slice(Math.ceil(sortedClients.length * 0.1), Math.ceil(sortedClients.length * 0.6));
    const newClients = sortedClients.slice(Math.ceil(sortedClients.length * 0.6));

    return { vip, regular, new: newClients };
  };

  const calculateProductAnalytics = (articles: Article[], stock: StockItem[], ventes: Vente[]) => {
    const bestSellers = articles
      .map(article => ({
        name: article.designation,
        quantity: article.qte,
        revenue: article.qte * article.prixVente,
        profit: article.qte * (article.prixVente - article.prixAchat)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const lowStock = stock
      .filter(item => item.quantite < 10)
      .map(item => ({
        name: item.designation,
        current: item.quantite,
        min: 5
      }))
      .slice(0, 5);

    const highProfit = articles
      .map(article => ({
        name: article.designation,
        margin: ((article.prixVente - article.prixAchat) / article.prixVente) * 100,
        revenue: article.qte * article.prixVente
      }))
      .filter(item => item.margin > 30)
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);

    return { bestSellers, lowStock, highProfit };
  };

  const calculateFinancialMetrics = (ventes: Vente[], achats: Achat[], articles: Article[]) => {
    const totalRevenue = ventes.reduce((sum, v) => sum + (v.montant || 0), 0);
    const totalCosts = achats.reduce((sum, a) => sum + (a.montant || 0), 0);
    const totalAssets = articles.reduce((sum, a) => sum + (a.qte * a.prixAchat), 0);
    
    const cashFlow = totalRevenue - totalCosts;
    const workingCapital = totalAssets - totalCosts;
    const debtToEquity = totalCosts > 0 ? totalCosts / totalAssets : 0;
    const returnOnInvestment = totalAssets > 0 ? (cashFlow / totalAssets) * 100 : 0;
    const breakEvenPoint = totalCosts > 0 ? totalCosts / (totalRevenue / ventes.length) : 0;

    return {
      cashFlow,
      workingCapital,
      debtToEquity,
      returnOnInvestment,
      breakEvenPoint
    };
  };

  const calculateOperationalMetrics = (ventes: Vente[], clients: Client[], stock: StockItem[]) => {
    const totalOrders = ventes.length;
    const fulfilledOrders = ventes.filter(v => v.montant > 0).length;
    const orderFulfillmentRate = totalOrders > 0 ? (fulfilledOrders / totalOrders) * 100 : 0;
    
    const averageDeliveryTime = 2.5; // Simulated average delivery time in days
    const customerSatisfactionScore = 85; // Simulated satisfaction score
    const employeeProductivity = 78; // Simulated productivity score
    const qualityScore = 92; // Simulated quality score

    return {
      orderFulfillmentRate,
      averageDeliveryTime,
      customerSatisfactionScore,
      employeeProductivity,
      qualityScore
    };
  };

  const calculateMarketAnalysis = (ventes: Vente[], clients: Client[]) => {
    const totalMarketSize = 1000000; // Simulated market size
    const marketShare = (ventes.reduce((sum, v) => sum + (v.montant || 0), 0) / totalMarketSize) * 100;
    
    const competitorAnalysis = [
      { name: 'Concurrent A', share: 25, strength: 'Élevée' },
      { name: 'Concurrent B', share: 18, strength: 'Moyenne' },
      { name: 'Concurrent C', share: 12, strength: 'Faible' }
    ];

    const marketTrends = [
      { trend: 'Digitalisation', impact: 'Positif', confidence: 85 },
      { trend: 'E-commerce', impact: 'Positif', confidence: 92 },
      { trend: 'Concurrence', impact: 'Négatif', confidence: 65 }
    ];

    return { marketShare, competitorAnalysis, marketTrends };
  };

  const calculateRiskAssessment = (ventes: Vente[], stock: StockItem[], clients: Client[]) => {
    const creditRisk = 15; // Simulated credit risk percentage
    const inventoryRisk = stock.filter(s => s.quantite < 5).length / stock.length * 100;
    const marketRisk = 25; // Simulated market risk
    const operationalRisk = 10; // Simulated operational risk
    
    const overallRiskScore = (creditRisk + inventoryRisk + marketRisk + operationalRisk) / 4;
    const overallRisk = overallRiskScore < 20 ? 'Faible' : overallRiskScore < 40 ? 'Modéré' : 'Élevé';

    return {
      creditRisk,
      inventoryRisk,
      marketRisk,
      operationalRisk,
      overallRisk
    };
  };

  // Memoized chart data
  const chartData = useMemo(() => {
    if (!statsData) return null;

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    return {
      barData: {
        labels: months,
        datasets: [
          {
            label: 'Ventes',
            data: statsData.monthlyVentes,
            backgroundColor: '#2563eb',
            borderRadius: 6,
          },
          {
            label: 'Achats',
            data: statsData.monthlyAchats,
            backgroundColor: '#10b981',
            borderRadius: 6,
          }
        ],
      },
             lineData: {
         labels: [...months, 'Forecast 1', 'Forecast 2', 'Forecast 3'],
         datasets: [
           {
             label: 'Évolution des ventes',
             data: statsData.monthlyVentes.concat(statsData.forecastData || []),
             borderColor: '#2563eb',
             backgroundColor: '#2563eb22',
             tension: 0.4,
             fill: true,
             pointRadius: 4,
           },
           {
             label: 'Évolution des achats',
             data: statsData.monthlyAchats.concat((statsData.forecastData || []).map(x => x * 0.8)),
             borderColor: '#10b981',
             backgroundColor: '#10b98122',
             tension: 0.4,
             fill: true,
             pointRadius: 4,
           }
         ],
       },
      pieData: {
        labels: Object.keys(statsData.categoryDistribution),
        datasets: [{
          data: Object.values(statsData.categoryDistribution),
          backgroundColor: [
            '#2563eb', '#60a5fa', '#a5b4fc', '#dbeafe',
            '#10b981', '#34d399', '#6ee7b7', '#d1fae5',
            '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'
          ],
        }],
      },
      radarData: {
        labels: ['Efficacité Ventes', 'Efficacité Coûts', 'Satisfaction Client', 'Efficacité Stock'],
        datasets: [{
          label: 'Performance',
          data: [
            statsData.performanceMetrics.salesEfficiency,
            statsData.performanceMetrics.costEfficiency,
            statsData.performanceMetrics.customerSatisfaction,
            statsData.performanceMetrics.inventoryEfficiency
          ],
          borderColor: '#2563eb',
          backgroundColor: '#2563eb22',
          pointBackgroundColor: '#2563eb',
        }],
      },
      scatterData: {
        datasets: [{
          label: 'Ventes vs Achats',
          data: statsData.monthlyVentes.map((vente, i) => ({
            x: vente,
            y: statsData.monthlyAchats[i] || 0
          })),
          backgroundColor: '#2563eb',
        }],
      }
    };
  }, [statsData]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans p-4 md:p-8 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Analyse des données en cours...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!statsData || !chartData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans p-4 md:p-8 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Aucune donnée disponible</p>
          </div>
        </div>
      </main>
    );
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Advanced Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 lg:mb-8">
          <div className="w-full xl:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Tableau de Bord Analytique</h1>
            <p className="text-sm sm:text-base text-gray-600">Analyse avancée des performances et tendances</p>
            {filters.useCustomDateRange && (
              <p className="text-xs sm:text-sm text-blue-600 mt-1">
                Période: {new Date(filters.startDate).toLocaleDateString('fr-FR')} - {new Date(filters.endDate).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 xl:mt-0 w-full xl:w-auto">
            {/* Date Range Selection */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <button
                onClick={() => setFilters({...filters, useCustomDateRange: !filters.useCustomDateRange})}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium w-full sm:w-auto ${
                  filters.useCustomDateRange 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <FiCalendarIcon className="inline mr-1" />
                Date personnalisée
              </button>
              
              {filters.useCustomDateRange ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white w-full sm:w-auto"
                  />
                  <span className="text-gray-500 text-xs sm:text-sm">à</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white w-full sm:w-auto"
                  />
                </div>
              ) : (
                <select 
                  value={filters.dateRange} 
                  onChange={(e) => {
                    const range = e.target.value;
                    let startDate = new Date();
                    let endDate = new Date();
                    
                    switch(range) {
                      case '3months':
                        startDate = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000);
                        break;
                      case '6months':
                        startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
                        break;
                      case '12months':
                        startDate = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000);
                        break;
                      case 'currentYear':
                        startDate = new Date(new Date().getFullYear(), 0, 1);
                        break;
                    }
                    
                    setFilters({
                      ...filters, 
                      dateRange: range,
                      startDate: startDate.toISOString().split('T')[0],
                      endDate: endDate.toISOString().split('T')[0]
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white w-full sm:w-auto"
                >
                  <option value="3months">3 derniers mois</option>
                  <option value="6months">6 derniers mois</option>
                  <option value="12months">12 derniers mois</option>
                  <option value="currentYear">Année en cours</option>
                </select>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select 
                value={filters.viewMode} 
                onChange={(e) => setFilters({...filters, viewMode: e.target.value as 'overview' | 'detailed' | 'comparison'})}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white w-full sm:w-auto"
              >
                <option value="overview">Vue d'ensemble</option>
                <option value="detailed">Détail avancé</option>
                <option value="comparison">Comparaison</option>
              </select>
              <button
                onClick={() => setFilters({...filters, showForecast: !filters.showForecast})}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium w-full sm:w-auto ${
                  filters.showForecast 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <FiTarget className="inline mr-2" />
                Prévisions
              </button>
              <button
                onClick={loadStatistics}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 w-full sm:w-auto"
              >
                <FiRefreshCw className="inline mr-2" />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Advanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border-l-4 border-blue-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Ventes</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700">{statsData.totalVentes.toLocaleString('fr-FR')} DA</p>
                <p className={`text-xs ${statsData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {statsData.growthRate >= 0 ? '+' : ''}{statsData.growthRate.toFixed(1)}% vs mois dernier
                </p>
              </div>
              <FiTrendingUp className="text-blue-500 text-2xl sm:text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border-l-4 border-green-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-600">Marge Bénéfice</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">{statsData.profitMargin.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Rentabilité</p>
              </div>
              <FiDollarSign className="text-green-500 text-2xl sm:text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border-l-4 border-purple-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-600">Panier Moyen</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700">{statsData.averageOrderValue.toLocaleString('fr-FR')} DA</p>
                <p className="text-xs text-gray-600">Par commande</p>
              </div>
              <FiShoppingCart className="text-purple-500 text-2xl sm:text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border-l-4 border-yellow-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-600">Fidélisation</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-700">{statsData.customerRetentionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Taux de rétention</p>
              </div>
              <FiUsers className="text-yellow-500 text-2xl sm:text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border-l-4 border-red-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-600">Rotation Stock</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700">{statsData.inventoryTurnover.toFixed(1)}</p>
                <p className="text-xs text-gray-600">Taux de rotation</p>
              </div>
              <FiPackage className="text-red-500 text-2xl sm:text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border-l-4 border-indigo-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm text-gray-600">Performance</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-700">
                  {((statsData.performanceMetrics.salesEfficiency + 
                     statsData.performanceMetrics.costEfficiency + 
                     statsData.performanceMetrics.customerSatisfaction + 
                     statsData.performanceMetrics.inventoryEfficiency) / 4).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">Score global</p>
              </div>
              <FiAward className="text-indigo-500 text-2xl sm:text-3xl" />
            </div>
          </div>
        </div>

        {/* Performance Radar Chart */}
        {expandedSections.has('performance') && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiTarget className="mr-2 text-indigo-500" />
                Analyse de Performance
              </h3>
              <button
                onClick={() => toggleSection('performance')}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiEyeOff className="text-xl" />
              </button>
            </div>
            <div className="h-80">
              <Radar data={chartData.radarData} options={radarOptions} />
            </div>
          </div>
        )}

        {/* Advanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Ventes vs Achats with Forecast */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center mb-2 sm:mb-0">
                <FiBarChart className="mr-2 text-blue-500" />
                Ventes vs Achats
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({...filters, chartType: 'bar'})}
                  className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${filters.chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  Barres
                </button>
                <button
                  onClick={() => setFilters({...filters, chartType: 'line'})}
                  className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${filters.chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  Ligne
                </button>
              </div>
            </div>
            <div className="h-60 sm:h-80">
              {filters.chartType === 'bar' ? (
                <Bar data={chartData.barData} options={chartOptions} />
              ) : (
                <Line data={chartData.lineData} options={chartOptions} />
              )}
            </div>
          </div>
          
          {/* Seasonal Trends */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <FiCalendar className="mr-2 text-green-500" />
              Tendances Saisonnières
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(statsData.seasonalTrends).map(([quarter, value]) => (
                <div key={quarter} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800 mb-2 sm:mb-0">{quarter}</span>
                  <div className="flex items-center">
                    <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{width: `${(value / Math.max(...Object.values(statsData.seasonalTrends))) * 100}%`}}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">{value.toLocaleString('fr-FR')} DA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FiPackage className="mr-2 text-purple-500" />
            Analyse des Produits
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Top Produits par Ventes</h4>
              <div className="space-y-3">
                {statsData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{product.sales.toLocaleString('fr-FR')} DA</p>
                      <p className="text-xs text-green-600">+{product.profit.toLocaleString('fr-FR')} DA profit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">Distribution des Catégories</h4>
              <div className="h-64">
                <Pie data={chartData.pieData} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Correlation Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FiTrendingUp className="mr-2 text-orange-500" />
              Analyse de Corrélation
            </h3>
            <div className="h-80">
              <Scatter data={chartData.scatterData} options={chartOptions} />
            </div>
          </div>
          
          {/* Customer Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FiUsers className="mr-2 text-indigo-500" />
              Analyse Clients
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Top Client</h4>
                <p className="text-blue-600 font-medium">{statsData.topClient.name}</p>
                <p className="text-sm text-blue-700">{statsData.topClient.amount.toLocaleString('fr-FR')} DA</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Fidélisation</h4>
                <p className="text-green-600 font-medium">{statsData.customerRetentionRate.toFixed(1)}%</p>
                <p className="text-sm text-green-700">Taux de rétention client</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Panier Moyen</h4>
                <p className="text-purple-600 font-medium">{statsData.averageOrderValue.toLocaleString('fr-FR')} DA</p>
                <p className="text-sm text-purple-700">Valeur moyenne par commande</p>
              </div>
            </div>
          </div>
        </div>

                 {/* Detailed Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Financial Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <FiDollarSign className="mr-2 text-green-500" />
              Métriques Financières
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-green-600">Flux de Trésorerie</p>
                  <p className="text-lg sm:text-xl font-bold text-green-700">{statsData.financialMetrics.cashFlow.toLocaleString('fr-FR')} DA</p>
                </div>
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-600">Capital de Travail</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-700">{statsData.financialMetrics.workingCapital.toLocaleString('fr-FR')} DA</p>
                </div>
                <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-purple-600">ROI</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-700">{statsData.financialMetrics.returnOnInvestment.toFixed(1)}%</p>
                </div>
                <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-orange-600">Seuil de Rentabilité</p>
                  <p className="text-lg sm:text-xl font-bold text-orange-700">{Math.round(statsData.financialMetrics.breakEvenPoint)} commandes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <FiSettings className="mr-2 text-indigo-500" />
              Métriques Opérationnelles
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-0">Taux de Fulfillment</span>
                <div className="flex items-center">
                  <div className="w-20 sm:w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{width: `${statsData.operationalMetrics.orderFulfillmentRate}%`}}
                    ></div>
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-green-600">{statsData.operationalMetrics.orderFulfillmentRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-0">Satisfaction Client</span>
                <div className="flex items-center">
                  <div className="w-20 sm:w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{width: `${statsData.operationalMetrics.customerSatisfactionScore}%`}}
                    ></div>
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-blue-600">{statsData.operationalMetrics.customerSatisfactionScore}%</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-0">Productivité</span>
                <div className="flex items-center">
                  <div className="w-20 sm:w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{width: `${statsData.operationalMetrics.employeeProductivity}%`}}
                    ></div>
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-purple-600">{statsData.operationalMetrics.employeeProductivity}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

         {/* Client Segmentation */}
         <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
             <FiUsers className="mr-2 text-blue-500" />
             Segmentation Clients
           </h3>
           <div className="grid md:grid-cols-3 gap-6">
             <div className="p-4 bg-yellow-50 rounded-lg">
               <h4 className="font-semibold text-yellow-800 mb-3">Clients VIP</h4>
               <p className="text-2xl font-bold text-yellow-700 mb-2">{statsData.clientSegments.vip.length}</p>
               <p className="text-sm text-yellow-600">Top 10% des clients</p>
               <div className="mt-3 space-y-2">
                 {statsData.clientSegments.vip.slice(0, 3).map((client, index) => (
                   <div key={index} className="flex justify-between text-sm">
                     <span className="text-yellow-700">{client.name}</span>
                     <span className="font-semibold">{client.total.toLocaleString('fr-FR')} DA</span>
                   </div>
                 ))}
               </div>
             </div>
             <div className="p-4 bg-green-50 rounded-lg">
               <h4 className="font-semibold text-green-800 mb-3">Clients Réguliers</h4>
               <p className="text-2xl font-bold text-green-700 mb-2">{statsData.clientSegments.regular.length}</p>
               <p className="text-sm text-green-600">50% des clients</p>
               <div className="mt-3 space-y-2">
                 {statsData.clientSegments.regular.slice(0, 3).map((client, index) => (
                   <div key={index} className="flex justify-between text-sm">
                     <span className="text-green-700">{client.name}</span>
                     <span className="font-semibold">{client.total.toLocaleString('fr-FR')} DA</span>
                   </div>
                 ))}
               </div>
             </div>
             <div className="p-4 bg-blue-50 rounded-lg">
               <h4 className="font-semibold text-blue-800 mb-3">Nouveaux Clients</h4>
               <p className="text-2xl font-bold text-blue-700 mb-2">{statsData.clientSegments.new.length}</p>
               <p className="text-sm text-blue-600">40% des clients</p>
               <div className="mt-3 space-y-2">
                 {statsData.clientSegments.new.slice(0, 3).map((client, index) => (
                   <div key={index} className="flex justify-between text-sm">
                     <span className="text-blue-700">{client.name}</span>
                     <span className="font-semibold">{client.total.toLocaleString('fr-FR')} DA</span>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </div>

         {/* Product Analytics */}
         <div className="grid lg:grid-cols-2 gap-8 mb-8">
           <div className="bg-white rounded-xl shadow-lg p-6">
             <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
               <FiPackage className="mr-2 text-purple-500" />
               Meilleurs Vendeurs
             </h3>
             <div className="space-y-3">
               {statsData.productAnalytics.bestSellers.slice(0, 5).map((product, index) => (
                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                   <div className="flex items-center">
                     <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                       {index + 1}
                     </span>
                     <span className="font-medium text-gray-800">{product.name}</span>
                   </div>
                   <div className="text-right">
                     <p className="font-semibold text-purple-600">{product.revenue.toLocaleString('fr-FR')} DA</p>
                     <p className="text-xs text-green-600">+{product.profit.toLocaleString('fr-FR')} DA profit</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <div className="bg-white rounded-xl shadow-lg p-6">
             <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
               <FiAlertCircle className="mr-2 text-red-500" />
               Stock Faible
             </h3>
             <div className="space-y-3">
               {statsData.productAnalytics.lowStock.map((item, index) => (
                 <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                   <span className="font-medium text-gray-800">{item.name}</span>
                   <div className="text-right">
                     <p className="font-semibold text-red-600">{item.current} unités</p>
                     <p className="text-xs text-red-500">Min: {item.min}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>

         {/* Market Analysis & Risk Assessment */}
         <div className="grid lg:grid-cols-2 gap-8 mb-8">
           <div className="bg-white rounded-xl shadow-lg p-6">
             <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
               <FiTrendingUp className="mr-2 text-green-500" />
               Analyse de Marché
             </h3>
             <div className="space-y-4">
               <div className="p-4 bg-green-50 rounded-lg">
                 <h4 className="font-semibold text-green-800 mb-2">Part de Marché</h4>
                 <p className="text-2xl font-bold text-green-700">{statsData.marketAnalysis.marketShare.toFixed(2)}%</p>
               </div>
               <div className="space-y-3">
                 <h4 className="font-semibold text-gray-700">Concurrence</h4>
                 {statsData.marketAnalysis.competitorAnalysis.map((competitor, index) => (
                   <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                     <span className="text-sm text-gray-700">{competitor.name}</span>
                     <div className="flex items-center">
                       <span className="text-sm font-semibold mr-2">{competitor.share}%</span>
                       <span className={`text-xs px-2 py-1 rounded ${
                         competitor.strength === 'Élevée' ? 'bg-red-100 text-red-700' :
                         competitor.strength === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' :
                         'bg-green-100 text-green-700'
                       }`}>
                         {competitor.strength}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl shadow-lg p-6">
             <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
               <FiAlertCircle className="mr-2 text-orange-500" />
               Évaluation des Risques
             </h3>
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-red-50 rounded-lg">
                   <p className="text-sm text-red-600">Risque Crédit</p>
                   <p className="text-lg font-bold text-red-700">{statsData.riskAssessment.creditRisk}%</p>
                 </div>
                 <div className="p-3 bg-yellow-50 rounded-lg">
                   <p className="text-sm text-yellow-600">Risque Stock</p>
                   <p className="text-lg font-bold text-yellow-700">{statsData.riskAssessment.inventoryRisk.toFixed(1)}%</p>
                 </div>
                 <div className="p-3 bg-blue-50 rounded-lg">
                   <p className="text-sm text-blue-600">Risque Marché</p>
                   <p className="text-lg font-bold text-blue-700">{statsData.riskAssessment.marketRisk}%</p>
                 </div>
                 <div className="p-3 bg-green-50 rounded-lg">
                   <p className="text-sm text-green-600">Risque Opérationnel</p>
                   <p className="text-lg font-bold text-green-700">{statsData.riskAssessment.operationalRisk}%</p>
                 </div>
               </div>
               <div className="p-4 bg-gray-50 rounded-lg">
                 <h4 className="font-semibold text-gray-800 mb-2">Risque Global</h4>
                 <span className={`text-lg font-bold ${
                   statsData.riskAssessment.overallRisk === 'Faible' ? 'text-green-600' :
                   statsData.riskAssessment.overallRisk === 'Modéré' ? 'text-yellow-600' :
                   'text-red-600'
                 }`}>
                   {statsData.riskAssessment.overallRisk}
                 </span>
               </div>
             </div>
           </div>
         </div>
       </div>
     </main>
   );
 } 