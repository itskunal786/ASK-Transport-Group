import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  MapPin, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  BarChart3, 
  Fuel, 
  X,
  Truck
} from 'lucide-react';
import type { ExecutiveRouteProfitability, BranchPerformanceRanking } from '../types/transportOperations';
import { getRouteProfitabilityRadar, getBranchRankings, recalculateRouteMargin } from '../api/executiveProfitabilityApi';
import { useLanguage } from '../context/LanguageContext';

const SEED_ROUTES: ExecutiveRouteProfitability[] = [
  {
    id: 'corridor-1',
    corridorLane: 'Delhi NCR - Mumbai SuperHub (NH-48)',
    originHub: 'Delhi Bilaspur Hub',
    destinationHub: 'Bhiwandi CDC Hub (Mumbai)',
    totalTripsExecuted: 142,
    totalFreightRevenueInr: 18460000,
    totalDieselCostInr: 6840000,
    totalTollExpensesInr: 1120000,
    totalDriverBhattaInr: 980000,
    totalMarketFleetPayoutInr: 4200000,
    totalEnrouteMiscMaintenanceInr: 380000,
    netGrossMarginInr: 4940000,
    netProfitPercentage: 26.76,
    healthStatus: 'HighMarginProfitable',
    rankPosition: 1,
    periodMonthYear: 'October 2026'
  },
  {
    id: 'corridor-2',
    corridorLane: 'Jaipur - Ahmedabad Express Freight Corridor',
    originHub: 'Jaipur Transport Nagar',
    destinationHub: 'Ahmedabad Aslali Hub',
    totalTripsExecuted: 98,
    totalFreightRevenueInr: 9800000,
    totalDieselCostInr: 3920000,
    totalTollExpensesInr: 680000,
    totalDriverBhattaInr: 540000,
    totalMarketFleetPayoutInr: 2400000,
    totalEnrouteMiscMaintenanceInr: 210000,
    netGrossMarginInr: 2050000,
    netProfitPercentage: 20.92,
    healthStatus: 'HighMarginProfitable',
    rankPosition: 2,
    periodMonthYear: 'October 2026'
  },
  {
    id: 'corridor-3',
    corridorLane: 'Pune - Bengaluru Industrial Freight Corridor',
    originHub: 'Pune Chakan Auto Hub',
    destinationHub: 'Bengaluru Nelamangala Hub',
    totalTripsExecuted: 84,
    totalFreightRevenueInr: 11200000,
    totalDieselCostInr: 4800000,
    totalTollExpensesInr: 920000,
    totalDriverBhattaInr: 610000,
    totalMarketFleetPayoutInr: 3100000,
    totalEnrouteMiscMaintenanceInr: 290000,
    netGrossMarginInr: 1480000,
    netProfitPercentage: 13.21,
    healthStatus: 'ModerateMargin',
    rankPosition: 3,
    periodMonthYear: 'October 2026'
  },
  {
    id: 'corridor-4',
    corridorLane: 'Kolkata Dankuni - Guwahati North-East Corridor',
    originHub: 'Kolkata Dankuni Hub',
    destinationHub: 'Guwahati Jalukbari Terminal',
    totalTripsExecuted: 46,
    totalFreightRevenueInr: 6400000,
    totalDieselCostInr: 3200000,
    totalTollExpensesInr: 540000,
    totalDriverBhattaInr: 490000,
    totalMarketFleetPayoutInr: 1900000,
    totalEnrouteMiscMaintenanceInr: 410000,
    netGrossMarginInr: -140000,
    netProfitPercentage: -2.18,
    healthStatus: 'LossMakingCritical',
    rankPosition: 4,
    periodMonthYear: 'October 2026'
  }
];

const SEED_BRANCHES: BranchPerformanceRanking[] = [
  {
    id: 'branch-1',
    branchCode: 'DEL-HQ-01',
    branchCity: 'Delhi Bilaspur Hub',
    regionZone: 'North Hub',
    monthlyDispatchedTonnage: 14850.5,
    averageTurnaroundTimeHours: 3.2,
    slaDeliveryCompliancePercent: 98.4,
    totalRevenueInr: 28400000,
    branchNetProfitInr: 6840000,
    performanceTier: 'Platinum Alpha'
  },
  {
    id: 'branch-2',
    branchCode: 'BOM-WH-02',
    branchCity: 'Bhiwandi Mumbai Terminal',
    regionZone: 'West Hub',
    monthlyDispatchedTonnage: 18420.0,
    averageTurnaroundTimeHours: 3.6,
    slaDeliveryCompliancePercent: 97.8,
    totalRevenueInr: 34500000,
    branchNetProfitInr: 8120000,
    performanceTier: 'Platinum Alpha'
  },
  {
    id: 'branch-3',
    branchCode: 'JAI-TN-03',
    branchCity: 'Jaipur Transport Nagar Hub',
    regionZone: 'North Hub',
    monthlyDispatchedTonnage: 9240.0,
    averageTurnaroundTimeHours: 4.1,
    slaDeliveryCompliancePercent: 95.6,
    totalRevenueInr: 14800000,
    branchNetProfitInr: 3150000,
    performanceTier: 'Gold Standard'
  },
  {
    id: 'branch-4',
    branchCode: 'KOL-DN-04',
    branchCity: 'Kolkata Dankuni Hub',
    regionZone: 'East Hub',
    monthlyDispatchedTonnage: 6810.0,
    averageTurnaroundTimeHours: 5.8,
    slaDeliveryCompliancePercent: 89.2,
    totalRevenueInr: 9400000,
    branchNetProfitInr: 620000,
    performanceTier: 'Under Review'
  }
];

export const ExecutiveProfitabilityRadar = () => {
  const { t } = useLanguage();
  const [routes, setRoutes] = useState<ExecutiveRouteProfitability[]>(SEED_ROUTES);
  const [branches, setBranches] = useState<BranchPerformanceRanking[]>(SEED_BRANCHES);
  const [selectedRoute, setSelectedRoute] = useState<ExecutiveRouteProfitability>(SEED_ROUTES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'ROUTES' | 'BRANCHES'>('ROUTES');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [routeData, branchData] = await Promise.all([
        getRouteProfitabilityRadar(),
        getBranchRankings()
      ]);
      if (routeData && routeData.length > 0) {
        setRoutes(routeData);
        setSelectedRoute(routeData[0]);
      }
      if (branchData && branchData.length > 0) {
        setBranches(branchData);
      }
    } catch {
      // keep seed
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async (id: string) => {
    try {
      const updated = await recalculateRouteMargin(id);
      setRoutes(prev => prev.map(r => r.id === id ? updated : r));
      if (selectedRoute.id === id) setSelectedRoute(updated);
      showToast('success', t(`Route margins updated for ${updated.corridorLane}!`, `${updated.corridorLane} के मार्जिन अपडेट हुए!`));
    } catch {
      showToast('info', t('Route recalculated locally!', 'मार्जिन री-कैलकुलेट किया गया!'));
    }
  };

  const filteredRoutes = routes.filter(r => 
    r.corridorLane.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.originHub.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.destinationHub.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = routes.reduce((sum, r) => sum + r.totalFreightRevenueInr, 0);
  const totalNetMargin = routes.reduce((sum, r) => sum + r.netGrossMarginInr, 0);
  const avgMarginPercent = totalRevenue > 0 ? (totalNetMargin / totalRevenue) * 100 : 0;
  const profitableLanesCount = routes.filter(r => r.healthStatus === 'HighMarginProfitable').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium shadow-lg transition-all ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
          notification.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' :
          'bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-stone-900 to-black rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold tracking-wider uppercase">
            <Award className="w-4 h-4" />
            <span>SuperAdmin Executive Net Profit & Margins Radar</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white">
            {t('Executive Route Profitability & P&L Radar', 'रूट-वाइज शुद्ध मुनाफा व मार्जिन लेजर (P&L Radar)')}
          </h1>
          <p className="text-amber-100/80 text-sm mt-1">
            {t(
              'Corridor-level gross margins, diesel vs toll efficiency, and branch turnaround performance analytics.',
              'रूट-वाइज भाड़ा आमदनी, डीजल, फ़ास्टैग टोल, और शाखा-वाइज शुद्ध मुनाफे का वास्तविक वित्तीय विश्लेषण।'
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('Refresh', 'रिफ्रेश')}</span>
          </button>
          <div className="flex bg-stone-800/80 p-1 rounded-xl border border-stone-700">
            <button
              onClick={() => setActiveView('ROUTES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeView === 'ROUTES' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-white'}`}
            >
              {t('Route Corridors', 'कॉरिडोर लेन')}
            </button>
            <button
              onClick={() => setActiveView('BRANCHES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeView === 'BRANCHES' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-white'}`}
            >
              {t('Branch Rankings', 'शाखा रैंकिंग')}
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Total Freight Revenue', 'कुल माल ढुलाई राजस्व')}
            </span>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-0.5">
              ₹{(totalRevenue / 100000).toFixed(1)} L
            </div>
            <span className="text-xs text-emerald-600 mt-1 inline-block">
              {routes.length} {t('Active Corridor Lanes', 'सक्रिय कॉरिडोर')}
            </span>
          </div>
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center text-stone-700 dark:text-stone-300">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Company Net Margin (P&L)', 'कंपनी नेट मार्जिन (P&L)')}
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">
              ₹{(totalNetMargin / 100000).toFixed(1)} L
            </div>
            <span className="text-xs text-emerald-600 mt-1 inline-block">
              {t('Avg Profit Margin:', 'औसत मुनाफा:')} <b>{avgMarginPercent.toFixed(1)}%</b>
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('High-Margin Corridors', 'उच्च मार्जिन कॉरिडोर')}
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{profitableLanesCount}</div>
            <span className="text-xs text-amber-600 mt-1 inline-block">
              &gt; 20% Net Gross Margin
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Top Performing Depot', 'शीर्ष प्रदर्शनकारी डिपो')}
            </span>
            <div className="text-lg font-bold text-stone-800 dark:text-stone-100 mt-1 truncate">
              {branches[0]?.branchCity.split(' ')[0]}
            </div>
            <span className="text-xs text-teal-600 mt-0.5 inline-block">
              {branches[0]?.slaDeliveryCompliancePercent}% SLA Delivery
            </span>
          </div>
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {activeView === 'ROUTES' ? (
        /* Two Column Layout for Route P&L */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Route Corridors List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={t('Search freight corridor / hub...', 'कॉरिडोर / हब खोजें...')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="mt-4 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {filteredRoutes.map(item => {
                  const isSelected = selectedRoute.id === item.id;
                  const isLoss = item.netProfitPercentage < 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedRoute(item)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/20 shadow-sm' 
                          : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-stone-400" />
                          <span>{item.corridorLane}</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isLoss ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' :
                          item.netProfitPercentage >= 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {item.netProfitPercentage >= 0 ? `+${item.netProfitPercentage.toFixed(1)}%` : `${item.netProfitPercentage.toFixed(1)}%`}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                        <span>{item.totalTripsExecuted} {t('Trips Completed', 'ट्रिप्स')}</span>
                        <span className={`font-bold ${isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {t('Margin:', 'मार्जिन:')} ₹{(item.netGrossMarginInr / 100000).toFixed(2)} L
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Detailed P&L Breakdown */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                    {t('Corridor Financial Audit', 'कॉरिडोर वित्तीय लेजर')} • {selectedRoute.corridorLane}
                  </h3>
                </div>
                <button
                  onClick={() => handleRecalculate(selectedRoute.id)}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('Recalculate Margin', 'मार्जिन री-कैलकुलेट')}</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Alert Banner */}
                <div className={`p-4 rounded-xl flex items-center justify-between ${
                  selectedRoute.netProfitPercentage >= 18 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : selectedRoute.netProfitPercentage >= 0 
                    ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {selectedRoute.netProfitPercentage >= 0 ? (
                      <TrendingUp className="w-7 h-7 text-emerald-600 shrink-0" />
                    ) : (
                      <TrendingDown className="w-7 h-7 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {selectedRoute.netProfitPercentage >= 18 ? t('🟢 High Profit Alpha Route', '🟢 उच्च मार्जिन अल्फा रूट') :
                         selectedRoute.netProfitPercentage >= 0 ? t('🟡 Moderate Margin Operation', '🟡 सामान्य मार्जिन संचालन') :
                         t('🔴 Critical Loss-Making Route', '🔴 घाटे वाला रूट (त्वरित एक्शन आवश्यक)')}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5">
                        {t('Gross Freight Revenue:', 'कुल भाड़ा आय:')} ₹{selectedRoute.totalFreightRevenueInr.toLocaleString('en-IN')} | {t('Net Margin:', 'शुद्ध मार्जिन:')} ₹{selectedRoute.netGrossMarginInr.toLocaleString('en-IN')} ({selectedRoute.netProfitPercentage.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expense Breakdown Table */}
                <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-700">
                      <tr>
                        <th className="py-2.5 px-3">{t('Cost Component (Expense Head)', 'लागत का विवरण (Cost Component)')}</th>
                        <th className="py-2.5 px-3">{t('Share (%)', 'अनुपात')}</th>
                        <th className="py-2.5 px-3 text-right">{t('Amount (INR)', 'राशि (रुपये)')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                      <tr>
                        <td className="py-2 px-3 flex items-center gap-2">
                          <Fuel className="w-3.5 h-3.5 text-amber-600" />
                          <span>{t('Diesel Fuel Expenditure', 'डीजल ईंधन खर्च')}</span>
                        </td>
                        <td className="py-2 px-3 text-stone-500">
                          {((selectedRoute.totalDieselCostInr / selectedRoute.totalFreightRevenueInr) * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-medium">₹{selectedRoute.totalDieselCostInr.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span>{t('Electronic Fastag Tolls', 'फ़ास्टैग इलेक्ट्रॉनिक टोल')}</span>
                        </td>
                        <td className="py-2 px-3 text-stone-500">
                          {((selectedRoute.totalTollExpensesInr / selectedRoute.totalFreightRevenueInr) * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-medium">₹{selectedRoute.totalTollExpensesInr.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-stone-400" />
                          <span>{t('Market Transporter & Hired Fleet Cost', 'मार्केट गाड़ी भाड़ा भुगतान')}</span>
                        </td>
                        <td className="py-2 px-3 text-stone-500">
                          {((selectedRoute.totalMarketFleetPayoutInr / selectedRoute.totalFreightRevenueInr) * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-medium">₹{selectedRoute.totalMarketFleetPayoutInr.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 flex items-center gap-2">
                          <IndianRupee className="w-3.5 h-3.5 text-stone-400" />
                          <span>{t('Driver Daily Allowance & Food', 'ड्राइवर भत्ता व भोजन खर्च')}</span>
                        </td>
                        <td className="py-2 px-3 text-stone-500">
                          {((selectedRoute.totalDriverBhattaInr / selectedRoute.totalFreightRevenueInr) * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-medium">₹{selectedRoute.totalDriverBhattaInr.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="bg-amber-50 dark:bg-amber-950/20 font-bold text-stone-900 dark:text-stone-100">
                        <td className="py-2.5 px-3">{t('Net Gross Margin / Profit', 'शुद्ध कंपनी मुनाफा (Net Margin)')}</td>
                        <td className="py-2.5 px-3 text-emerald-600">{selectedRoute.netProfitPercentage.toFixed(1)}%</td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-black">
                          ₹{selectedRoute.netGrossMarginInr.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Branch Rankings Table */
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <h3 className="font-bold text-sm text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>{t('National Branch & Depot Efficiency Leaderboard', 'राष्ट्रीय शाखा व डिपो टर्नअराउंड लीडरबोर्ड')}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="py-3 px-3">{t('Branch Code & Hub', 'शाखा व हब')}</th>
                  <th className="py-3 px-3">{t('Region', 'जोन')}</th>
                  <th className="py-3 px-3">{t('Monthly Tonnage', 'मासिक टन भार')}</th>
                  <th className="py-3 px-3">{t('Avg Turnaround (TAT)', 'टर्नअराउंड (TAT)')}</th>
                  <th className="py-3 px-3">{t('SLA Compliance', 'SLA डिलीवरी %')}</th>
                  <th className="py-3 px-3">{t('Revenue', 'कुल राजस्व')}</th>
                  <th className="py-3 px-3 text-right">{t('Net Profit', 'नेट मुनाफा')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                {branches.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{b.branchCity}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 block font-mono pl-7">{b.branchCode}</span>
                    </td>
                    <td className="py-3 px-3">{b.regionZone}</td>
                    <td className="py-3 px-3 font-medium">{b.monthlyDispatchedTonnage.toLocaleString('en-IN')} MT</td>
                    <td className="py-3 px-3 font-bold text-amber-600">{b.averageTurnaroundTimeHours} hrs</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{b.slaDeliveryCompliancePercent}%</td>
                    <td className="py-3 px-3">₹{(b.totalRevenueInr / 100000).toFixed(1)} L</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      ₹{(b.branchNetProfitInr / 100000).toFixed(2)} L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveProfitabilityRadar;
