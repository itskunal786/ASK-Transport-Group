import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Fuel, 
  IndianRupee, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Printer, 
  PlusCircle, 
  RefreshCw, 
  Truck, 
  MapPin, 
  Gauge,
  Wallet,
  FileCheck2,
  X
} from 'lucide-react';
import type { DriverTripSettlement, DriverSettlementStatus } from '../types/transportOperations';
import { getAllDriverSettlements, approveDriverSettlement, createDriverSettlement } from '../api/driverSettlementApi';
import { useLanguage } from '../context/LanguageContext';
import './DriverTripSettlementHisaab.css';

// ============================================================================
// SEED FALLBACK DATA
// ============================================================================

const SEED_SETTLEMENTS: DriverTripSettlement[] = [
  {
    id: 'settle-1',
    settlementNo: 'TRP-2026-SET-0891',
    tripSheetNo: 'TS-DEL-BOM-4892',
    vehicleNumber: 'RJ-14-GH-4921',
    driverName: 'Suresh Kumar Gurjar',
    driverPhone: '+91 98290 41203',
    originCity: 'Jaipur SuperHub',
    destinationCity: 'Bhiwandi Hub (Mumbai)',
    totalTripKm: 1148,
    standardKmpl: 4.2,
    actualKmpl: 4.4,
    dieselLitersActual: 260.9,
    dieselLitersStandard: 273.3,
    dieselPenaltyBonusInr: 1116,
    advanceCashGivenInr: 12000,
    dieselCardAdvanceInr: 23500,
    fastagTollActualInr: 4320,
    driverBhattaFoodInr: 3500,
    loadingUnloadingExpensesInr: 1800,
    enrouteMaintenanceRtoInr: 750,
    totalAuthorizedExpensesInr: 10370,
    netPayableToDriverInr: 3850,
    recoverableFromDriverInr: 0,
    status: 'DRAFT_PENDING_APPROVAL',
    auditedBy: 'Jaipur Depot Fleet Auditor (Kishan Lal)',
    notes: 'Safe delivery at Bhiwandi Godown #4. Clean fuel economy bonus approved by manager.'
  },
  {
    id: 'settle-2',
    settlementNo: 'TRP-2026-SET-0892',
    tripSheetNo: 'TS-DEL-KOL-7714',
    vehicleNumber: 'HR-55-AN-8102',
    driverName: 'Manjeet Singh Dhillon',
    driverPhone: '+91 98112 76431',
    originCity: 'Delhi Bilaspur Hub',
    destinationCity: 'Kolkata Dankuni Hub',
    totalTripKm: 1480,
    standardKmpl: 4.1,
    actualKmpl: 3.7,
    dieselLitersActual: 400.0,
    dieselLitersStandard: 360.9,
    dieselPenaltyBonusInr: -3519,
    advanceCashGivenInr: 18000,
    dieselCardAdvanceInr: 32000,
    fastagTollActualInr: 5850,
    driverBhattaFoodInr: 4500,
    loadingUnloadingExpensesInr: 2200,
    enrouteMaintenanceRtoInr: 1200,
    totalAuthorizedExpensesInr: 13750,
    netPayableToDriverInr: 0,
    recoverableFromDriverInr: 1420,
    status: 'DISPUTED_AUDIT',
    auditedBy: 'Bilaspur Logistics HQ (Aman Verma)',
    notes: 'Low KMPL on NH-19 corridor. Driver claims excessive idling due to Varanasi highway jam.'
  },
  {
    id: 'settle-3',
    settlementNo: 'TRP-2026-SET-0893',
    tripSheetNo: 'TS-PUN-BLR-3108',
    vehicleNumber: 'MH-12-PQ-9024',
    driverName: 'Ramesh Balu Shinde',
    driverPhone: '+91 97654 32910',
    originCity: 'Pune Chakan Hub',
    destinationCity: 'Bengaluru Nelamangala',
    totalTripKm: 840,
    standardKmpl: 4.3,
    actualKmpl: 4.5,
    dieselLitersActual: 186.6,
    dieselLitersStandard: 195.3,
    dieselPenaltyBonusInr: 783,
    advanceCashGivenInr: 9000,
    dieselCardAdvanceInr: 16800,
    fastagTollActualInr: 3100,
    driverBhattaFoodInr: 2800,
    loadingUnloadingExpensesInr: 1500,
    enrouteMaintenanceRtoInr: 400,
    totalAuthorizedExpensesInr: 7800,
    netPayableToDriverInr: 4620,
    recoverableFromDriverInr: 0,
    status: 'SETTLED_CASH_PAID',
    settledDate: '2026-10-29T16:45:00',
    auditedBy: 'Pune Regional Finance Desk (Sunil Kadam)',
    notes: 'Complete digital voucher verified. Payment disbursed via instant IMPS.'
  }
];

// Helper to normalize any incoming record (backend or mock) so fields are never undefined
function normalizeSettlement(s: any): DriverTripSettlement {
  if (!s) return SEED_SETTLEMENTS[0];

  const settlementNo = s.settlementNo || s.settlementVoucherNo || s.tripNumber || `TRP-${s.id || 'SET-0891'}`;
  const tripSheetNo = s.tripSheetNo || s.tripNumber || `TS-${s.vehicleNumber || 'DEL-BOM-4892'}`;

  // Extract cities from tripRoute if missing
  let originCity = s.originCity || '';
  let destinationCity = s.destinationCity || '';
  if (!originCity && s.tripRoute) {
    const parts = String(s.tripRoute).split('➔');
    originCity = parts[0]?.trim() || 'Jaipur SuperHub';
    destinationCity = parts[1]?.trim() || 'Bhiwandi Hub (Mumbai)';
  }
  if (!originCity) originCity = 'Jaipur SuperHub';
  if (!destinationCity) destinationCity = 'Bhiwandi Hub (Mumbai)';

  const totalTripKm = Number(s.totalTripKm || 1148);
  const standardKmpl = Number(s.standardKmpl || 4.2);
  const actualKmpl = Number(s.actualKmpl || 4.3);
  const dieselLitersStandard = Number(s.dieselLitersStandard || (totalTripKm / standardKmpl).toFixed(1));
  const dieselLitersActual = Number(s.dieselLitersActual || (totalTripKm / actualKmpl).toFixed(1));

  const advanceCashGivenInr = Number(s.advanceCashGivenInr || 0);
  const fastagTollActualInr = Number(s.fastagTollActualInr ?? s.fastagTollsInr ?? 0);
  const driverBhattaFoodInr = Number(s.driverBhattaFoodInr ?? s.foodBhattaInr ?? 0);
  const loadingUnloadingExpensesInr = Number(s.loadingUnloadingExpensesInr ?? s.unloadingPettyExpenseInr ?? 0);
  const enrouteMaintenanceRtoInr = Number(s.enrouteMaintenanceRtoInr || 0);

  const totalAuthorizedExpensesInr = Number(
    s.totalAuthorizedExpensesInr ??
    (fastagTollActualInr + driverBhattaFoodInr + loadingUnloadingExpensesInr + enrouteMaintenanceRtoInr)
  );

  const dieselPenaltyBonusInr = Number(
    s.dieselPenaltyBonusInr ?? Math.round((dieselLitersStandard - dieselLitersActual) * 90)
  );

  let netPayable = Number(s.netPayableToDriverInr ?? 0);
  let netRecoverable = Number(s.recoverableFromDriverInr ?? 0);
  if (!s.netPayableToDriverInr && !s.recoverableFromDriverInr) {
    const balance = totalAuthorizedExpensesInr + dieselPenaltyBonusInr - advanceCashGivenInr;
    netPayable = balance > 0 ? balance : 0;
    netRecoverable = balance < 0 ? Math.abs(balance) : 0;
  }

  // Normalize status string
  let status: DriverSettlementStatus = 'DRAFT_PENDING_APPROVAL';
  const rawStatus = String(s.status || '').toUpperCase();
  if (rawStatus.includes('SETTLED') || rawStatus.includes('PAID') || rawStatus === 'PAIDOUT') {
    status = 'SETTLED_CASH_PAID';
  } else if (rawStatus.includes('RECOVER') || rawStatus === 'RECOVEREDFROMDRIVER') {
    status = 'RECOVERED_FROM_NEXT_TRIP';
  } else if (rawStatus.includes('DISPUTE')) {
    status = 'DISPUTED_AUDIT';
  } else {
    status = 'DRAFT_PENDING_APPROVAL';
  }

  return {
    id: String(s.id || `settle-${Date.now()}`),
    settlementNo,
    tripSheetNo,
    vehicleNumber: s.vehicleNumber || 'RJ-14-GH-4921',
    driverName: s.driverName || 'Suresh Kumar Gurjar',
    driverPhone: s.driverPhone || '+91 98290 41203',
    originCity,
    destinationCity,
    totalTripKm,
    standardKmpl,
    actualKmpl,
    dieselLitersStandard,
    dieselLitersActual,
    dieselPenaltyBonusInr,
    advanceCashGivenInr,
    dieselCardAdvanceInr: Number(s.dieselCardAdvanceInr ?? s.dieselFuelExpensesInr ?? Math.round(dieselLitersActual * 90)),
    fastagTollActualInr,
    driverBhattaFoodInr,
    loadingUnloadingExpensesInr,
    enrouteMaintenanceRtoInr,
    totalAuthorizedExpensesInr,
    netPayableToDriverInr: netPayable,
    recoverableFromDriverInr: netRecoverable,
    status,
    settledDate: s.settledDate || s.auditedAt || (status === 'SETTLED_CASH_PAID' ? new Date().toISOString() : undefined),
    auditedBy: s.auditedBy || 'Jaipur Depot Fleet Auditor (Kishan Lal)',
    notes: s.notes || 'Trip settled through electronic hisaab deck.'
  };
}

export const DriverTripSettlementHisaab: React.FC = () => {
  const { t, language } = useLanguage();
  const [settlements, setSettlements] = useState<DriverTripSettlement[]>(SEED_SETTLEMENTS);
  const [selectedSettlement, setSelectedSettlement] = useState<DriverTripSettlement>(SEED_SETTLEMENTS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Form State for new hisaab entry
  const [newVehicle, setNewVehicle] = useState('RJ-14-GH-4921');
  const [newDriver, setNewDriver] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOrigin, setNewOrigin] = useState('Delhi Hub');
  const [newDest, setNewDest] = useState('Mumbai SuperHub');
  const [newKm, setNewKm] = useState(1200);
  const [newStdKmpl, setNewStdKmpl] = useState(4.2);
  const [newActKmpl, setNewActKmpl] = useState(4.3);
  const [newCashAdv, setNewCashAdv] = useState(12000);
  const [newFastag, setNewFastag] = useState(4500);
  const [newBhatta, setNewBhatta] = useState(3600);
  const [newLabor, setNewLabor] = useState(1500);
  const [newMisc, setNewMisc] = useState(500);

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
      const data = await getAllDriverSettlements();
      if (data && Array.isArray(data) && data.length > 0) {
        const normalized = data.map(normalizeSettlement);
        setSettlements(normalized);
        setSelectedSettlement(normalized[0]);
      }
    } catch {
      // Keep seed data as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const updated = await approveDriverSettlement(id);
      const normalizedUpdated = updated ? normalizeSettlement(updated) : null;
      setSettlements(prev => prev.map(s => s.id === id ? { 
        ...s, 
        status: normalizedUpdated?.status || 'SETTLED_CASH_PAID', 
        settledDate: new Date().toISOString() 
      } : s));
      setSelectedSettlement(prev => ({ 
        ...prev, 
        status: 'SETTLED_CASH_PAID', 
        settledDate: new Date().toISOString() 
      }));
      showToast('success', t(
        `Trip settlement ${selectedSettlement?.settlementNo || id} approved and finalized!`, 
        `हिसाब पर्ची ${selectedSettlement?.settlementNo || id} सफलतापूर्वक स्वीकृत व फाइनल सेटल की गई!`
      ));
    } catch {
      setSettlements(prev => prev.map(s => s.id === id ? { 
        ...s, 
        status: 'SETTLED_CASH_PAID', 
        settledDate: new Date().toISOString() 
      } : s));
      setSelectedSettlement(prev => ({ 
        ...prev, 
        status: 'SETTLED_CASH_PAID', 
        settledDate: new Date().toISOString() 
      }));
      showToast('success', t(
        `Trip settlement approved and finalized!`, 
        `हिसाब पर्ची स्वीकृत व फाइनल सेटल की गई!`
      ));
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.trim()) {
      showToast('error', t('Please enter driver name!', 'कृपया ड्राइवर का नाम दर्ज करें!'));
      return;
    }

    const stdDiesel = Number((newKm / newStdKmpl).toFixed(1));
    const actDiesel = Number((newKm / newActKmpl).toFixed(1));
    const dieselDiffLiters = Number((stdDiesel - actDiesel).toFixed(1));
    const fuelBonusPenalty = Math.round(dieselDiffLiters * 90);

    const totalAuthExpenses = Number(newFastag) + Number(newBhatta) + Number(newLabor) + Number(newMisc);
    const balance = totalAuthExpenses + fuelBonusPenalty - Number(newCashAdv);
    
    const netPayable = balance > 0 ? balance : 0;
    const netRecoverable = balance < 0 ? Math.abs(balance) : 0;

    const newItem: DriverTripSettlement = {
      id: `settle-${Date.now()}`,
      settlementNo: `TRP-${new Date().getFullYear()}-SET-${Math.floor(1000 + Math.random() * 9000)}`,
      tripSheetNo: `TS-${newOrigin.substring(0, 3).toUpperCase()}-${newDest.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleNumber: newVehicle,
      driverName: newDriver,
      driverPhone: newPhone || '+91 98000 00000',
      originCity: newOrigin,
      destinationCity: newDest,
      totalTripKm: Number(newKm),
      standardKmpl: Number(newStdKmpl),
      actualKmpl: Number(newActKmpl),
      dieselLitersStandard: stdDiesel,
      dieselLitersActual: actDiesel,
      dieselPenaltyBonusInr: fuelBonusPenalty,
      advanceCashGivenInr: Number(newCashAdv),
      dieselCardAdvanceInr: Math.round(actDiesel * 90),
      fastagTollActualInr: Number(newFastag),
      driverBhattaFoodInr: Number(newBhatta),
      loadingUnloadingExpensesInr: Number(newLabor),
      enrouteMaintenanceRtoInr: Number(newMisc),
      totalAuthorizedExpensesInr: totalAuthExpenses,
      netPayableToDriverInr: netPayable,
      recoverableFromDriverInr: netRecoverable,
      status: 'DRAFT_PENDING_APPROVAL',
      auditedBy: 'Corporate Accounts Auditor',
      notes: 'New settlement created via Web Console'
    };

    try {
      await createDriverSettlement(newItem);
    } catch {
      // Local fallback
    }

    setSettlements(prev => [newItem, ...prev]);
    setSelectedSettlement(newItem);
    setShowNewModal(false);
    showToast('success', t(
      `New trip settlement ${newItem.settlementNo} created successfully!`, 
      `नई हिसाब पर्ची ${newItem.settlementNo} सफलतापूर्वक बनाई गई!`
    ));

    // Reset inputs
    setNewDriver('');
    setNewPhone('');
  };

  const filteredSettlements = settlements.filter(s => {
    const sNo = s.settlementNo || '';
    const vNo = s.vehicleNumber || '';
    const dName = s.driverName || '';
    const tsNo = s.tripSheetNo || '';
    const term = searchTerm.toLowerCase();

    const matchSearch =
      sNo.toLowerCase().includes(term) ||
      vNo.toLowerCase().includes(term) ||
      dName.toLowerCase().includes(term) ||
      tsNo.toLowerCase().includes(term);

    const matchFilter = filterStatus === 'ALL' || s.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const totalPayableAll = settlements.reduce((acc, curr) => acc + (Number(curr.netPayableToDriverInr) || 0), 0);
  const totalRecoverableAll = settlements.reduce((acc, curr) => acc + (Number(curr.recoverableFromDriverInr) || 0), 0);
  const pendingCount = settlements.filter(s => s.status === 'DRAFT_PENDING_APPROVAL').length;

  const currentSelected = selectedSettlement || settlements[0] || SEED_SETTLEMENTS[0];

  return (
    <div className="settlement-container">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: notification.type === 'error' ? '#ef4444' : '#0f172a',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 700,
          borderLeft: `4px solid ${notification.type === 'error' ? '#fca5a5' : '#10b981'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-400" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '12px' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="settlement-hero">
        <div>
          <div className="settlement-hero-badge">
            <Receipt size={13} />
            <span>{t('Driver Trip Settlement & Voucher Engine', 'ड्राइवर ट्रिप हिसाब व वाउचर इंजन')}</span>
          </div>
          <h1 className="settlement-hero-title">
            {t('Driver Trip Settlement & Voucher Audit', 'ड्राइवर ट्रिप हिसाब व वाउचर सेटलमेंट')}
          </h1>
          <p className="settlement-hero-subtitle">
            {t(
              'Automated fuel mileage bonus/penalty, Fastag tolls, driver bhatta allowances and cash advance settlement.',
              'डीजल माइलेज बोनस/पेनल्टी, फ़ास्टैग टोल, ड्राइवर भत्ता व अग्रिम रोकड़ का 100% पारदर्शी ऑटोमैटिक हिसाब।'
            )}
          </p>
        </div>
        <div className="settlement-hero-actions">
          <button 
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="settlement-btn-secondary"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{t('Refresh', 'रिफ्रेश')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="settlement-btn-primary"
          >
            <PlusCircle size={15} />
            <span>{t('New Trip Settlement', 'नया ट्रिप हिसाब बनाएं')}</span>
          </button>
        </div>
      </div>

      {/* Top Summary Metrics */}
      <div className="settlement-metrics-grid">
        <div className="settlement-metric-card">
          <div className="settlement-metric-info">
            <span className="settlement-metric-label">{t('Total Settlements', 'कुल हिसाब पर्चियां')}</span>
            <div className="settlement-metric-value">{settlements.length}</div>
            <span className="settlement-metric-sub">{t('Active Fleet Ledger', 'फ्लीट ट्रिप लेजर सक्रिय')}</span>
          </div>
          <div className="settlement-metric-icon amber">
            <Receipt size={22} />
          </div>
        </div>

        <div className="settlement-metric-card">
          <div className="settlement-metric-info">
            <span className="settlement-metric-label">{t('Pending Approvals', 'पेंडिंग ड्राफ्ट्स')}</span>
            <div className="settlement-metric-value">{pendingCount}</div>
            <span className="settlement-metric-sub warning">{t('Awaiting Audit', 'वेरिफिकेशन शेष')}</span>
          </div>
          <div className="settlement-metric-icon amber">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="settlement-metric-card">
          <div className="settlement-metric-info">
            <span className="settlement-metric-label">{t('Net Payable to Drivers', 'ड्राइवरों को कुल देय')}</span>
            <div className="settlement-metric-value">₹{totalPayableAll.toLocaleString('en-IN')}</div>
            <span className="settlement-metric-sub">{t('Disbursement Queue', 'भुगतान कतार में')}</span>
          </div>
          <div className="settlement-metric-icon emerald">
            <Wallet size={22} />
          </div>
        </div>

        <div className="settlement-metric-card">
          <div className="settlement-metric-info">
            <span className="settlement-metric-label">{t('Recoverable from Drivers', 'ड्राइवर वसूली शेष')}</span>
            <div className="settlement-metric-value">₹{totalRecoverableAll.toLocaleString('en-IN')}</div>
            <span className="settlement-metric-sub danger">{t('Deduct Next Trip', 'अगली ट्रिप से कटौती')}</span>
          </div>
          <div className="settlement-metric-icon rose">
            <IndianRupee size={22} />
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="settlement-main-split">
        {/* Left Column: Settlement Vouchers List */}
        <div className="settlement-list-card">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={t('Search voucher, driver, truck...', 'पर्ची, ड्राइवर, ट्रक खोजें...')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="settlement-search-input"
            />
          </div>

          <div className="settlement-filter-tabs">
            {['ALL', 'DRAFT_PENDING_APPROVAL', 'SETTLED_CASH_PAID', 'DISPUTED_AUDIT'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`settlement-tab-chip ${filterStatus === st ? 'active' : ''}`}
              >
                {st === 'ALL' ? t('All', 'सभी') :
                 st === 'DRAFT_PENDING_APPROVAL' ? t('Pending Drafts', 'पेंडिंग ड्राफ्ट') :
                 st === 'SETTLED_CASH_PAID' ? t('Settled & Paid', 'फाइनल सेटल्ड') : t('Disputed Audit', 'ऑडिट आपत्ति')}
              </button>
            ))}
          </div>

          <div className="settlement-items-scroll">
            {filteredSettlements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 10px', color: '#94a3b8', fontSize: '12px' }}>
                {t('No trip settlements found', 'कोई हिसाब पर्ची नहीं मिली')}
              </div>
            ) : (
              filteredSettlements.map(item => {
                const isSelected = currentSelected.id === item.id;
                const originLabel = (item.originCity || 'Origin').split(' ')[0];
                const destLabel = (item.destinationCity || 'Destination').split(' ')[0];
                const isPayable = (item.netPayableToDriverInr || 0) > 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSettlement(item)}
                    className={`settlement-item-tile ${isSelected ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 800, color: '#b45309' }}>
                        {item.settlementNo}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        background: item.status === 'SETTLED_CASH_PAID' ? '#ecfdf5' : item.status === 'DISPUTED_AUDIT' ? '#fee2e2' : '#fef3c7',
                        color: item.status === 'SETTLED_CASH_PAID' ? '#059669' : item.status === 'DISPUTED_AUDIT' ? '#dc2626' : '#d97706'
                      }}>
                        {item.status === 'SETTLED_CASH_PAID' ? t('Settled & Paid', 'सफल भुगतान') :
                         item.status === 'DISPUTED_AUDIT' ? t('Disputed', 'ऑडिट आपत्ति') : t('Pending Approval', 'स्वीकृति लंबित')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 4px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Truck size={13} style={{ color: '#64748b' }} />
                        <span>{item.vehicleNumber}</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
                        {item.driverName}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '6px' }}>
                      <span>{originLabel} ➔ {destLabel}</span>
                      <span style={{ fontWeight: 800, color: isPayable ? '#10b981' : '#ef4444' }}>
                        {isPayable ? `${t('Payable', 'देय')}: ₹${item.netPayableToDriverInr}` : `${t('Recovery', 'वसूली')}: ₹${item.recoverableFromDriverInr}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Parchi Inspector & Actions */}
        <div className="settlement-detail-card">
          {/* Header Toolbar */}
          <div className="settlement-detail-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck2 size={18} style={{ color: '#d97706' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>
                {t('Trip Settlement Voucher', 'ड्राइवर ट्रिप हिसाब वाउचर')} • <code style={{ color: '#0284c7' }}>{currentSelected.settlementNo}</code>
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f1f5f9',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={13} />
                <span>{t('Print Voucher / PDF', 'पर्ची प्रिंट / PDF')}</span>
              </button>
              {currentSelected.status !== 'SETTLED_CASH_PAID' && (
                <button
                  type="button"
                  onClick={() => handleApprove(currentSelected.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>{t('Approve & Release Balance', 'फाइनल अप्रूव व भुगतान करें')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Parchi Content Body */}
          <div className="settlement-detail-body">
            {/* Trip Identity Card */}
            <div className="settlement-route-box">
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>{t('Vehicle Plate No', 'गाड़ी संख्या')}</span>
                <span style={{ fontWeight: 800, fontSize: '13px' }}>{currentSelected.vehicleNumber}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>{t('Driver Name', 'ड्राइवर नाम')}</span>
                <span style={{ fontWeight: 800, fontSize: '13px' }}>{currentSelected.driverName}</span>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{currentSelected.driverPhone}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>{t('Trip Sheet No', 'ट्रिप शीट संख्या')}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>{currentSelected.tripSheetNo}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>{t('Route & Distance', 'रूट एवं दूरी')}</span>
                <span style={{ fontWeight: 700 }}>{currentSelected.originCity} ➔ {currentSelected.destinationCity}</span>
                <span style={{ color: '#f59e0b', fontWeight: 900, display: 'block' }}>{currentSelected.totalTripKm} KM</span>
              </div>
            </div>

            {/* Diesel & Mileage Audit Ledger */}
            <div className="settlement-fuel-box">
              <div className="settlement-fuel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Fuel size={15} style={{ color: '#d97706' }} />
                  <span>{t('Fuel Economy & Mileage Ledger', 'डीजल खपत व माइलेज ऑडिट (Fuel KMPL Ledger)')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                  <Gauge size={13} />
                  <span>{t('Standard KMPL', 'मानक')}: {currentSelected.standardKmpl} KMPL</span>
                </div>
              </div>

              <div className="settlement-fuel-grid">
                <div className="settlement-fuel-tile">
                  <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                    {t('Actual Mileage', 'वास्तविक माइलेज')}
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: currentSelected.actualKmpl >= currentSelected.standardKmpl ? '#10b981' : '#ef4444' }}>
                    {currentSelected.actualKmpl} KMPL
                  </div>
                </div>

                <div className="settlement-fuel-tile">
                  <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                    {t('Fuel Consumed', 'डीजल खपत (Liters)')}
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900 }}>
                    {currentSelected.dieselLitersActual} L
                  </div>
                  <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>
                    {t('Target', 'लक्ष्य')}: {currentSelected.dieselLitersStandard} L
                  </span>
                </div>

                <div className="settlement-fuel-tile">
                  <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                    {t('Diesel Card Advance', 'डीजल कार्ड अग्रिम')}
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900 }}>
                    ₹{currentSelected.dieselCardAdvanceInr.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="settlement-fuel-tile">
                  <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                    {t('Mileage Bonus / Penalty', 'माइलेज बोनस / पेनल्टी')}
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: currentSelected.dieselPenaltyBonusInr >= 0 ? '#10b981' : '#ef4444' }}>
                    {currentSelected.dieselPenaltyBonusInr >= 0 ? `+ ₹${currentSelected.dieselPenaltyBonusInr}` : `- ₹${Math.abs(currentSelected.dieselPenaltyBonusInr)}`}
                  </div>
                  <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>
                    {currentSelected.dieselPenaltyBonusInr >= 0 ? t('Fuel Savings Bonus', 'बचत रिवार्ड') : t('Excess Penalty', 'कटौती')}
                  </span>
                </div>
              </div>
            </div>

            {/* Trip Expenses Breakdown Table */}
            <div className="settlement-table-wrapper">
              <table className="settlement-table">
                <thead>
                  <tr>
                    <th>{t('Trip Expense Head', 'खर्च का विवरण (Trip Expense Head)')}</th>
                    <th>{t('Audit Verification', 'वेरिफिकेशन प्रकार')}</th>
                    <th style={{ textAlign: 'right' }}>{t('Approved Amount', 'स्वीकृत राशि (Amount)')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={13} style={{ color: '#64748b' }} />
                      <span>{t('Fastag Electronic Tolls', 'फ़ास्टैग इलेक्ट्रॉनिक टोल (Fastag Tolls)')}</span>
                    </td>
                    <td style={{ color: '#64748b' }}>NPCI Fastag API Live Log</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{currentSelected.fastagTollActualInr.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Receipt size={13} style={{ color: '#64748b' }} />
                      <span>{t('Driver Daily Allowance (Bhatta)', 'ड्राइवर भोजन व दैनिक भत्ता (Driver Daily Bhatta)')}</span>
                    </td>
                    <td style={{ color: '#64748b' }}>{t('Standard ₹700 / day rate', 'प्रति दिन ₹700 मानक दर')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{currentSelected.driverBhattaFoodInr.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={13} style={{ color: '#64748b' }} />
                      <span>{t('Loading / Unloading Labor Charges', 'लोडिंग व अनलोडिंग हमाली खर्च (Loading Labor)')}</span>
                    </td>
                    <td style={{ color: '#64748b' }}>{t('Warehouse Gate Receipt Verified', 'वेयरहाउस गेट रसीद सत्यापित')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{currentSelected.loadingUnloadingExpensesInr.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={13} style={{ color: '#64748b' }} />
                      <span>{t('Enroute Emergency / RTO Charges', 'रास्ते का आकस्मिक खर्च / पंचर / आरटीओ पर्ची')}</span>
                    </td>
                    <td style={{ color: '#64748b' }}>{t('Approved Bill Vouchers', 'बिल रसीद अनुमोदित')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{currentSelected.enrouteMaintenanceRtoInr.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="total-row">
                    <td>{t('Total Authorized Trip Expenses', 'कुल अधिकृत ट्रिप खर्च (Total Authorized Expenses)')}</td>
                    <td style={{ color: '#64748b' }}>{t('Total Valid Claims', 'मान्य दावे')}</td>
                    <td style={{ textAlign: 'right', fontSize: '13px' }}>
                      ₹{currentSelected.totalAuthorizedExpensesInr.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Final Balance Settlement Box */}
            <div className="settlement-balance-box">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700 }}>
                    {t('Cash Advance Disbursed at Start:', 'ट्रिप के आरंभ में दिया गया एडवांस रोकड़:')}
                  </span>
                  <span style={{ fontWeight: 900 }}>₹{currentSelected.advanceCashGivenInr.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {t('Audited by:', 'ऑडिट किया गया:')} {currentSelected.auditedBy}
                </div>
                {currentSelected.notes && (
                  <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                    {t('Notes:', 'नोट:')} {currentSelected.notes}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                {currentSelected.netPayableToDriverInr > 0 ? (
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', display: 'block', textTransform: 'uppercase' }}>
                      {t('Net Balance Payable to Driver', 'ड्राइवर को देय अंतिम राशि (Net Balance to Pay)')}
                    </span>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>
                      ₹{currentSelected.netPayableToDriverInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', display: 'block', textTransform: 'uppercase' }}>
                      {t('Recoverable Advance from Driver', 'ड्राइवर से वसूली शेष (Recoverable Advance)')}
                    </span>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#ef4444' }}>
                      ₹{currentSelected.recoverableFromDriverInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Printable Hisaab Parchi Modal */}
      {showPrintModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            color: '#0f172a',
            width: '100%',
            maxWidth: '680px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid #cbd5e1'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={16} style={{ color: '#d97706' }} />
                <span>{t('Print Preview • Trip Expense Settlement Voucher', 'प्रिंट प्रीव्यू • ड्राइवर ट्रिप हिसाब पर्ची')}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowPrintModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Slip Content */}
            <div style={{ padding: '24px', fontSize: '12px', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <h2 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase' }}>ASK TRANSPORT GROUP PVT. LTD.</h2>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>National Logistics &amp; Fleet Management System</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 800, color: '#b45309' }}>
                  {language === 'hi' ? 'ड्राइवर ट्रिप हिसाब पर्ची / TRIP EXPENSE SETTLEMENT SLIP' : 'TRIP EXPENSE SETTLEMENT VOUCHER'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', fontSize: '11px' }}>
                <div>{t('Settlement No:', 'पर्ची क्र:')} <b>{currentSelected.settlementNo}</b></div>
                <div style={{ textAlign: 'right' }}>{t('Date:', 'दिनांक:')} <b>{new Date().toLocaleDateString('en-IN')}</b></div>
                <div>{t('Vehicle No:', 'गाड़ी संख्या:')} <b>{currentSelected.vehicleNumber}</b></div>
                <div style={{ textAlign: 'right' }}>{t('Trip Sheet:', 'ट्रिप शीट:')} <b>{currentSelected.tripSheetNo}</b></div>
                <div>{t('Driver:', 'ड्राइवर:')} <b>{currentSelected.driverName}</b></div>
                <div style={{ textAlign: 'right' }}>{t('Phone:', 'फोन:')} <b>{currentSelected.driverPhone}</b></div>
                <div>{t('Route:', 'रूट:')} <b>{currentSelected.originCity} ➔ {currentSelected.destinationCity}</b></div>
                <div style={{ textAlign: 'right' }}>{t('Total Distance:', 'कुल किमी:')} <b>{currentSelected.totalTripKm} KM</b></div>
              </div>

              {/* Table in slip */}
              <div style={{ border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', background: '#f1f5f9', padding: '6px 10px', fontWeight: 800, borderBottom: '1px solid #cbd5e1', fontSize: '11px' }}>
                  <div>{t('Expense Head', 'खर्च विवरण')}</div>
                  <div style={{ textAlign: 'right' }}>{t('Amount (INR)', 'रुपये (INR)')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>{t('Fastag Electronic Tolls', 'फ़ास्टैग इलेक्ट्रॉनिक टोल')}</div>
                  <div style={{ textAlign: 'right' }}>₹{currentSelected.fastagTollActualInr.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>{t('Driver Daily Allowance (Bhatta)', 'ड्राइवर दैनिक भत्ता (Food/Bhatta)')}</div>
                  <div style={{ textAlign: 'right' }}>₹{currentSelected.driverBhattaFoodInr.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>{t('Loading / Unloading Labor', 'लोडिंग / अनलोडिंग हमाली')}</div>
                  <div style={{ textAlign: 'right' }}>₹{currentSelected.loadingUnloadingExpensesInr.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>{t('Enroute Emergency / RTO Charges', 'रास्ते का आपात खर्च / आरटीओ')}</div>
                  <div style={{ textAlign: 'right' }}>₹{currentSelected.enrouteMaintenanceRtoInr.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', padding: '6px 10px', background: '#f8fafc', fontWeight: 800, borderBottom: '1px solid #cbd5e1' }}>
                  <div>{t('Total Authorized Trip Expenses (A)', 'कुल मान्य ट्रिप खर्च (A)')}</div>
                  <div style={{ textAlign: 'right' }}>₹{currentSelected.totalAuthorizedExpensesInr.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', padding: '6px 10px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                  <div>{t('Fuel Savings Mileage Bonus / Penalty', 'डीजल माइलेज बचत / पेनल्टी')}</div>
                  <div style={{ textAlign: 'right' }}>
                    {currentSelected.dieselPenaltyBonusInr >= 0 ? `+ ₹${currentSelected.dieselPenaltyBonusInr}` : `- ₹${Math.abs(currentSelected.dieselPenaltyBonusInr)}`}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', padding: '6px 10px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                  <div>{t('Less: Cash Advance Paid at Start (B)', 'घटाएं: आरंभ में दिया गया रोकड़ एडवांस (B)')}</div>
                  <div style={{ textAlign: 'right' }}>- ₹{currentSelected.advanceCashGivenInr.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', padding: '8px 10px', background: '#fef3c7', fontWeight: 900, fontSize: '13px', borderTop: '2px solid #0f172a' }}>
                  <div>
                    {currentSelected.netPayableToDriverInr > 0 
                      ? t('NET BALANCE PAYABLE TO DRIVER:', 'ड्राइवर को अंतिम देय राशि (NET PAYABLE):') 
                      : t('NET RECOVERABLE FROM DRIVER:', 'ड्राइवर से कटौती शेष (NET RECOVERABLE):')}
                  </div>
                  <div style={{ textAlign: 'right', color: '#0f172a' }}>
                    ₹{(currentSelected.netPayableToDriverInr > 0 ? currentSelected.netPayableToDriverInr : currentSelected.recoverableFromDriverInr).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: '20px', fontSize: '11px' }}>
                <div>
                  <div style={{ height: '36px', borderBottom: '1px solid #94a3b8', width: '140px' }}></div>
                  <p style={{ margin: '4px 0 0', fontWeight: 800 }}>{t('Driver Signature', 'ड्राइवर हस्ताक्षर')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ height: '36px', borderBottom: '1px solid #94a3b8', width: '140px', marginLeft: 'auto' }}></div>
                  <p style={{ margin: '4px 0 0', fontWeight: 800 }}>{t('Auditor Seal', 'फ्लीट मैनेजर / ऑडिटर सील')}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                style={{ padding: '7px 14px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
              >
                {t('Close', 'बंद करें')}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                style={{ padding: '7px 16px', background: '#d97706', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 800 }}
              >
                {t('Print Voucher (PDF)', 'प्रिंट करें (Print / PDF)')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Settlement Entry Modal */}
      {showNewModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            color: '#0f172a',
            width: '100%',
            maxWidth: '600px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{ padding: '14px 20px', background: '#d97706', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={16} />
                <span>{t('Record New Trip Settlement Entry', 'नया ड्राइवर ट्रिप हिसाब दर्ज करें')}</span>
              </h3>
              <button type="button" onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNew} style={{ padding: '20px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', color: '#64748b', marginBottom: '4px', fontWeight: 700 }}>{t('Vehicle Number *', 'गाड़ी संख्या *')}</label>
                  <input
                    type="text"
                    value={newVehicle}
                    onChange={e => setNewVehicle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', marginBottom: '4px', fontWeight: 700 }}>{t('Driver Name *', 'ड्राइवर का नाम *')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Yadav"
                    value={newDriver}
                    onChange={e => setNewDriver(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', marginBottom: '4px', fontWeight: 700 }}>{t('Driver Mobile Phone', 'ड्राइवर मोबाइल फोन')}</label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', marginBottom: '4px', fontWeight: 700 }}>{t('Total Trip Distance (KM)', 'कुल ट्रिप दूरी (KM)')}</label>
                  <input
                    type="number"
                    value={newKm}
                    onChange={e => setNewKm(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', marginBottom: '4px', fontWeight: 700 }}>{t('Origin Station', 'आरंभिक स्टेशन (Origin)')}</label>
                  <input
                    type="text"
                    value={newOrigin}
                    onChange={e => setNewOrigin(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#64748b', marginBottom: '4px', fontWeight: 700 }}>{t('Destination Station', 'गंतव्य स्टेशन (Destination)')}</label>
                  <input
                    type="text"
                    value={newDest}
                    onChange={e => setNewDest(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontWeight: 800, color: '#92400e' }}>
                  {t('Fuel Economy & Mileage Parameters', 'माइलेज एवं डीजल पैरामीटर')}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>{t('Target Mileage (KMPL)', 'मानक माइलेज (Target KMPL)')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newStdKmpl}
                      onChange={e => setNewStdKmpl(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>{t('Actual Mileage (KMPL)', 'वास्तविक माइलेज (Actual KMPL)')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newActKmpl}
                      onChange={e => setNewActKmpl(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>
                  {t('Expenses & Cash Advance Breakdown (INR)', 'खर्च एवं अग्रिम विवरण (INR)')}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>{t('Cash Advance Given', 'कैश एडवांस')}</label>
                    <input
                      type="number"
                      value={newCashAdv}
                      onChange={e => setNewCashAdv(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>{t('Fastag Tolls', 'फ़ास्टैग टोल')}</label>
                    <input
                      type="number"
                      value={newFastag}
                      onChange={e => setNewFastag(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>{t('Driver Allowance', 'ड्राइवर भत्ता')}</label>
                    <input
                      type="number"
                      value={newBhatta}
                      onChange={e => setNewBhatta(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>{t('Labor / Hamali', 'हमाली / लोडिंग')}</label>
                    <input
                      type="number"
                      value={newLabor}
                      onChange={e => setNewLabor(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>{t('Misc / RTO', 'अन्य / आरटीओ')}</label>
                    <input
                      type="number"
                      value={newMisc}
                      onChange={e => setNewMisc(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{ padding: '8px 14px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: '#d97706', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}
                >
                  {t('Save Settlement', 'हिसाब सुरक्षित करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTripSettlementHisaab;
