import { useState, useEffect } from 'react';
import {
  Barcode,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  IndianRupee,
  ShieldCheck,
  X,
  PhoneCall,
  MapPin,
  Wrench,
  FileCheck2,
} from 'lucide-react';
import type { PhysicalPodInwardReceipt, EmergencyTransshipmentRescue, TransshipmentReason } from '../types/transportOperations';
import {
  getPendingPodReceipts,
  scanAndVerifyBarcode,
  releaseTransporterBalancePayment,
  getActiveTransshipments,
  createTransshipmentRescue
} from '../api/physicalPodApi';
import { useLanguage } from '../context/LanguageContext';

const SEED_POD_RECEIPTS: PhysicalPodInwardReceipt[] = [
  {
    id: 'pod-001',
    biltyLrNumber: 'LR/2026/DEL-9012',
    barcodeToken: 'BC-9012-DEL-BOM',
    consignmentNo: 'CN-884920',
    consignorName: 'Havells India Ltd (Neemrana)',
    consigneeName: 'Reliance Retail CDC Hub (Bhiwandi)',
    destinationCity: 'Mumbai',
    transporterBrokerName: 'Grewal Golden Transport Co',
    vehicleNumber: 'HR 55 AF 4410',
    driverName: 'Sardar Manjit Singh',
    totalFreightInr: 95000,
    advance70PercentPaidInr: 66500,
    balance30PercentDueInr: 28500,
    physicalSignedCopyReceived: true,
    consigneeStampVerified: true,
    opticalBarcodeScannedAt: '2026-10-29 11:20',
    scannedByOperator: 'Ramesh Sharma (Hub Inward)',
    verificationStatus: 'ScannedVerified'
  },
  {
    id: 'pod-002',
    biltyLrNumber: 'LR/2026/JAI-3301',
    barcodeToken: 'BC-3301-JAI-AMD',
    consignmentNo: 'CN-884935',
    consignorName: 'Daikin Airconditioning India',
    consigneeName: 'Gujarat Electronics Mega Hub',
    destinationCity: 'Ahmedabad',
    transporterBrokerName: 'Marwar Road Carriers',
    vehicleNumber: 'RJ 14 GC 8920',
    driverName: 'Ramprasad Gurjar',
    totalFreightInr: 68000,
    advance70PercentPaidInr: 47600,
    balance30PercentDueInr: 20400,
    physicalSignedCopyReceived: false,
    consigneeStampVerified: false,
    scannedByOperator: 'Pending',
    verificationStatus: 'PendingInward'
  },
  {
    id: 'pod-003',
    biltyLrNumber: 'LR/2026/BLR-4100',
    barcodeToken: 'BC-4100-BLR-HYD',
    consignmentNo: 'CN-884940',
    consignorName: 'Bosch Automotive Components',
    consigneeName: 'Tata Motors Assembly Depot',
    destinationCity: 'Hyderabad',
    transporterBrokerName: 'Deccan Cargo Movers',
    vehicleNumber: 'KA 04 E 7731',
    driverName: 'K. Venkateshwara Rao',
    totalFreightInr: 54000,
    advance70PercentPaidInr: 37800,
    balance30PercentDueInr: 16200,
    physicalSignedCopyReceived: true,
    consigneeStampVerified: true,
    opticalBarcodeScannedAt: '2026-10-28 14:10',
    scannedByOperator: 'Satish Babu',
    verificationStatus: 'PaymentReleased',
    payoutReleaseTransactionRef: 'NEFT-AXIS-99281726'
  }
];

const SEED_TRANSSHIPMENTS: EmergencyTransshipmentRescue[] = [
  {
    id: 'rescue-001',
    breakdownIncidentNo: 'SOS-2026-OCT-192',
    originalVehiclePlate: 'NL 01 AB 8912',
    breakdownLocation: 'NH-48 Near Behror, Rajasthan (KM 134)',
    breakdownReason: 'EngineBreakdown',
    assignedRescueVehiclePlate: 'RJ 02 GB 4120',
    rescueDriverName: 'Mukesh Choudhary',
    rescueDriverPhone: '+91 98291 00291',
    craneMechanicDispatched: true,
    transshipmentCargoStatus: 'Cargo Transfer In Progress (70% Transferred)',
    incidentReportedAt: '2026-10-30 08:30'
  },
  {
    id: 'rescue-002',
    breakdownIncidentNo: 'SOS-2026-OCT-188',
    originalVehiclePlate: 'HR 38 W 3391',
    breakdownLocation: 'NH-44 Near Lalitpur, Uttar Pradesh',
    breakdownReason: 'AxlePuncture',
    assignedRescueVehiclePlate: 'UP 93 E 2280',
    rescueDriverName: 'Dharmendra Yadav',
    rescueDriverPhone: '+91 94150 88219',
    craneMechanicDispatched: true,
    transshipmentCargoStatus: 'Transshipment Completed - En Route Destination',
    incidentReportedAt: '2026-10-29 17:15',
    resolvedAt: '2026-10-29 23:40'
  }
];

export default function PhysicalPodInwardDeck() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'POD_INWARD' | 'TRANSSHIPMENT_SOS'>('POD_INWARD');
  const [podList, setPodList] = useState<PhysicalPodInwardReceipt[]>(SEED_POD_RECEIPTS);
  const [transshipments, setTransshipments] = useState<EmergencyTransshipmentRescue[]>(SEED_TRANSSHIPMENTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scanner Input State
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [operatorInput, setOperatorInput] = useState<string>('Hub Logistics Manager');

  // Payout Release Modal
  const [payoutTarget, setPayoutTarget] = useState<PhysicalPodInwardReceipt | null>(null);
  const [utrInput, setUtrInput] = useState<string>('');

  // Emergency Breakdown Modal
  const [showRescueModal, setShowRescueModal] = useState<boolean>(false);
  const [newRescue, setNewRescue] = useState({
    originalVehiclePlate: '',
    breakdownLocation: '',
    breakdownReason: 'EngineBreakdown' as TransshipmentReason,
    assignedRescueVehiclePlate: '',
    rescueDriverName: '',
    rescueDriverPhone: '',
    craneMechanicDispatched: true,
    transshipmentCargoStatus: 'Rescue Vehicle & Crane Dispatched to Highway'
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pods, rescues] = await Promise.all([
        getPendingPodReceipts(),
        getActiveTransshipments()
      ]);
      if (pods && pods.length > 0) setPodList(pods);
      if (rescues && rescues.length > 0) setTransshipments(rescues);
    } catch (err) {
      console.warn('Backend physical POD API offline, running in offline demo mode', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScanBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const verified = await scanAndVerifyBarcode(barcodeInput.trim(), operatorInput);
      setPodList(podList.map(p => (p.id === verified.id ? verified : p)));
      showToast(t(`Barcode ${barcodeInput} verified & inwarded successfully!`, `बारकोड ${barcodeInput} सत्यापित और इनवर्ड किया गया!`));
    } catch {
      // Local fallback
      const matched = podList.find(p => 
        p.barcodeToken.toLowerCase() === barcodeInput.toLowerCase() ||
        p.biltyLrNumber.toLowerCase() === barcodeInput.toLowerCase() ||
        p.consignmentNo.toLowerCase() === barcodeInput.toLowerCase()
      );

      if (matched) {
        setPodList(podList.map(p => (p.id === matched.id ? {
          ...p,
          physicalSignedCopyReceived: true,
          consigneeStampVerified: true,
          opticalBarcodeScannedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          scannedByOperator: operatorInput,
          verificationStatus: 'ScannedVerified'
        } : p)));
        showToast(t(`POD for LR ${matched.biltyLrNumber} verified & inwarded!`, `LR ${matched.biltyLrNumber} का POD सत्यापित और इनवर्ड किया गया!`));
      } else {
        // Create new inward record
        const newRecord: PhysicalPodInwardReceipt = {
          id: `pod-scanned-${Date.now()}`,
          biltyLrNumber: `LR/2026/EXP-${Math.floor(1000 + Math.random() * 9000)}`,
          barcodeToken: barcodeInput,
          consignmentNo: `CN-${Math.floor(100000 + Math.random() * 900000)}`,
          consignorName: 'Corporate Freight Consignor',
          consigneeName: 'Verified Destination Consignee',
          destinationCity: 'Metro Logistics Terminal',
          transporterBrokerName: 'Fleet Operations Express',
          vehicleNumber: 'DL 01 AB 9912',
          driverName: 'Professional Pilot',
          totalFreightInr: 75000,
          advance70PercentPaidInr: 52500,
          balance30PercentDueInr: 22500,
          physicalSignedCopyReceived: true,
          consigneeStampVerified: true,
          opticalBarcodeScannedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          scannedByOperator: operatorInput,
          verificationStatus: 'ScannedVerified'
        };
        setPodList([newRecord, ...podList]);
        showToast(t(`New POD inwarded from optical barcode: ${barcodeInput}`, `ऑप्टिकल बारकोड से नया POD इनवर्ड किया गया: ${barcodeInput}`));
      }
    }
    setBarcodeInput('');
  };

  const handleReleasePayment = async () => {
    if (!payoutTarget || !utrInput) return;
    try {
      const updated = await releaseTransporterBalancePayment(payoutTarget.id, utrInput);
      setPodList(podList.map(p => (p.id === updated.id ? updated : p)));
      showToast(t(`Balance 30% Payment released (UTR: ${utrInput})!`, `शेष 30% भुगतान जारी किया गया (UTR: ${utrInput})!`));
    } catch {
      // Local fallback
      setPodList(podList.map(p => (p.id === payoutTarget.id ? {
        ...p,
        verificationStatus: 'PaymentReleased',
        payoutReleaseTransactionRef: utrInput
      } : p)));
      showToast(t(`Payment marked released (UTR: ${utrInput})!`, `भुगतान जारी चिह्नित किया गया (UTR: ${utrInput})!`));
    }
    setPayoutTarget(null);
    setUtrInput('');
  };

  const handleCreateRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRescue.originalVehiclePlate || !newRescue.breakdownLocation) {
      showToast(t('Please enter broken down vehicle and location', 'कृपया खराब वाहन और स्थान दर्ज करें'), 'error');
      return;
    }

    try {
      const created = await createTransshipmentRescue({
        ...newRescue,
        incidentReportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
      setTransshipments([created, ...transshipments]);
      showToast(t('Highway breakdown rescue dispatched!', 'हाईवे ब्रेकडाउन रेस्क्यू रवाना कर दिया गया!'));
    } catch {
      // Local fallback
      const fallbackRescue: EmergencyTransshipmentRescue = {
        id: `rescue-${Date.now()}`,
        breakdownIncidentNo: `SOS-2026-OCT-${Math.floor(100 + Math.random() * 900)}`,
        originalVehiclePlate: newRescue.originalVehiclePlate.toUpperCase(),
        breakdownLocation: newRescue.breakdownLocation,
        breakdownReason: newRescue.breakdownReason,
        assignedRescueVehiclePlate: newRescue.assignedRescueVehiclePlate.toUpperCase() || 'RJ 14 GB 9901',
        rescueDriverName: newRescue.rescueDriverName || 'Emergency Pilot Dispatched',
        rescueDriverPhone: newRescue.rescueDriverPhone || '+91 98290 12345',
        craneMechanicDispatched: newRescue.craneMechanicDispatched,
        transshipmentCargoStatus: newRescue.transshipmentCargoStatus,
        incidentReportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setTransshipments([fallbackRescue, ...transshipments]);
      showToast(t('Emergency rescue logged and dispatched!', 'आपातकालीन रेस्क्यू दर्ज और रवाना किया गया!'));
    }

    setShowRescueModal(false);
    setNewRescue({
      originalVehiclePlate: '',
      breakdownLocation: '',
      breakdownReason: 'EngineBreakdown',
      assignedRescueVehiclePlate: '',
      rescueDriverName: '',
      rescueDriverPhone: '',
      craneMechanicDispatched: true,
      transshipmentCargoStatus: 'Rescue Vehicle & Crane Dispatched to Highway'
    });
  };

  const filteredPods = podList.filter(p =>
    p.biltyLrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcodeToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.consignmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.transporterBrokerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // KPI Calculations
  const pendingInwardCount = podList.filter(p => p.verificationStatus === 'PendingInward').length;
  const verifiedCount = podList.filter(p => p.verificationStatus === 'ScannedVerified').length;
  const paymentReleasedCount = podList.filter(p => p.verificationStatus === 'PaymentReleased').length;
  const totalBalanceDue = podList.filter(p => p.verificationStatus !== 'PaymentReleased').reduce((sum, p) => sum + p.balance30PercentDueInr, 0);
  const activeRescuesCount = transshipments.filter(r => !r.resolvedAt).length;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-white ${
          notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Barcode className="w-4 h-4 text-emerald-400" />
              <span>{t('Terminal Operations & Fleet Payouts', 'टर्मिनल संचालन और फ्लीट भुगतान')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t('Physical POD Inward & Breakdown Rescue Deck', 'फिजिकल POD इनवर्ड और ब्रेकडाउन रेस्क्यू डेक')}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {t(
                'Optical barcode inward scanner, signed & stamped POD validation, 30% balance payout release & highway SOS emergency transshipments.',
                'ऑप्टिकल बारकोड इनवर्ड स्कैनर, हस्ताक्षरित व मुहरबंद POD सत्यापन, 30% शेष भुगतान जारी व हाईवे SOS आपातकालीन ट्रांसशिपमेंट।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRescueModal(true)}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition"
            >
              <AlertTriangle className="w-4 h-4" />
              {t('Highway SOS Breakdown', 'हाईवे आपातकालीन ब्रेकडाउन')}
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title={t('Refresh', 'रीफ़्रेश')}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('POD_INWARD')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'POD_INWARD'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Barcode className="w-4 h-4" />
            {t('Physical POD Optical Inward Queue', 'फिजिकल POD ऑप्टिकल इनवर्ड कतार')}
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-800 text-emerald-200">
              {podList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSSHIPMENT_SOS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'TRANSSHIPMENT_SOS'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {t('Highway Breakdown & Rescue Radar', 'हाईवे ब्रेकडाउन और रेस्क्यू रडार')}
            {activeRescuesCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-800 text-rose-100 animate-pulse">
                {activeRescuesCount} SOS
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('Pending Inward PODs', 'प्रतीक्षारत इनवर्ड PODs')}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingInwardCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('Awaiting physical transit delivery', 'भौतिक पारगमन डिलीवरी की प्रतीक्षा')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('Stamped & Scanned Verified', 'मुहरबंद व सत्यापित')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {verifiedCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('Ready for 30% balance release', '30% शेष भुगतान हेतु तैयार')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('Balance Due to Transporters', 'ट्रांसपोर्टरों को देय शेष')}</span>
            <IndianRupee className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ₹{totalBalanceDue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {paymentReleasedCount} {t('payouts released this week', 'भुगतान इस सप्ताह जारी किए गए')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('Highway Breakdowns (SOS)', 'हाईवे ब्रेकडाउन (SOS)')}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {activeRescuesCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('Rescue vehicles dispatched en route', 'रेस्क्यू वाहन रास्ते में रवाना')}
          </div>
        </div>
      </div>

      {/* TAB 1: Optical Barcode Scanner & POD Inward Queue */}
      {activeTab === 'POD_INWARD' && (
        <div className="space-y-6">
          {/* Optical Scanner Action Strip */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 shadow-sm">
            <form onSubmit={handleScanBarcode} className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs whitespace-nowrap">
                <Barcode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('Barcode Inward Reader:', 'बारकोड इनवर्ड रीडर:')}</span>
              </div>

              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder={t('Scan optical barcode with laser gun or enter LR/Bilty No...', 'लेजर गन से बारकोड स्कैन करें या LR/बिल्टी सं. दर्ज करें...')}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-xs rounded-xl outline-none font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="w-full md:w-56">
                <input
                  type="text"
                  value={operatorInput}
                  onChange={(e) => setOperatorInput(e.target.value)}
                  placeholder={t('Operator Name', 'ऑपरेटर का नाम')}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-xs rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={!barcodeInput.trim()}
                className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition whitespace-nowrap flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('Inward & Verify Stamp', 'इनवर्ड करें व मुहर सत्यापित करें')}
              </button>
            </form>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search by LR #, Barcode, Vehicle, Transporter...', 'LR #, बारकोड, वाहन, ट्रांसपोर्टर से खोजें...')}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-500">
                {t('Total Records:', 'कुल रिकॉर्ड्स:')} <b>{filteredPods.length}</b>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t('Bilty / LR & Barcode', 'बिल्टी / LR व बारकोड')}</th>
                    <th className="py-3 px-4">{t('Consignor & Consignee', 'प्रेषक एवं प्राप्तकर्ता')}</th>
                    <th className="py-3 px-4">{t('Transporter & Vehicle', 'ट्रांसपोर्टर व वाहन')}</th>
                    <th className="py-3 px-4 text-right">{t('Total Freight', 'कुल भाड़ा')}</th>
                    <th className="py-3 px-4 text-right">{t('Bal 30% Due', 'शेष 30% देय')}</th>
                    <th className="py-3 px-4 text-center">{t('Physical POD Stamp', 'फिजिकल POD मुहर')}</th>
                    <th className="py-3 px-4 text-center">{t('Status', 'स्थिति')}</th>
                    <th className="py-3 px-4 text-right">{t('Action', 'कार्रवाई')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPods.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.biltyLrNumber}</span>
                        </div>
                        <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {item.barcodeToken}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          CN: {item.consignmentNo}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.consignorName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>To: {item.consigneeName} ({item.destinationCity})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{item.vehicleNumber}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.transporterBrokerName}</div>
                        <div className="text-[10px] text-slate-400">{item.driverName}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          ₹{item.totalFreightInr.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-600">
                          {t('Adv 70% Paid:', '70% अग्रिम:')} ₹{item.advance70PercentPaidInr.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-sky-600 dark:text-sky-400 text-sm">
                          ₹{item.balance30PercentDueInr.toLocaleString('en-IN')}
                        </div>
                        {item.payoutReleaseTransactionRef && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] ml-auto">
                            {item.payoutReleaseTransactionRef}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {item.consigneeStampVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            {t('Stamp Verified', 'मुहर सत्यापित')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            {t('Pending Stamp', 'मुहर प्रतीक्षारत')}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {item.verificationStatus === 'PaymentReleased' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('Paid 100%', '100% भुगतान')}
                          </span>
                        )}
                        {item.verificationStatus === 'ScannedVerified' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('Verified', 'सत्यापित')}
                          </span>
                        )}
                        {item.verificationStatus === 'PendingInward' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <Clock className="w-3 h-3" />
                            {t('Pending Inward', 'इनवर्ड प्रतीक्षारत')}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {item.verificationStatus === 'ScannedVerified' && (
                          <button
                            onClick={() => {
                              setPayoutTarget(item);
                              setUtrInput(`UTR-HDFC-${Math.floor(10000000 + Math.random() * 90000000)}`);
                            }}
                            className="px-3 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition"
                          >
                            {t('Release 30% Pay', '30% भुगतान जारी')}
                          </button>
                        )}
                        {item.verificationStatus === 'PendingInward' && (
                          <button
                            onClick={() => {
                              setBarcodeInput(item.barcodeToken);
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition"
                          >
                            {t('Scan Now', 'स्कैन करें')}
                          </button>
                        )}
                        {item.verificationStatus === 'PaymentReleased' && (
                          <span className="text-[11px] text-slate-400">
                            {t('Settled', 'निपटारा संपन्न')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Highway Breakdown & Emergency Transshipment Rescue Radar */}
      {activeTab === 'TRANSSHIPMENT_SOS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-rose-500" />
              {t('Highway Breakdown & Rescue Incidents', 'हाईवे ब्रेकडाउन व आपातकालीन रेस्क्यू घटनाएं')}
            </h2>
            <button
              onClick={() => setShowRescueModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
            >
              <AlertTriangle className="w-4 h-4" />
              {t('Log Breakdown & Dispatch Rescue', 'ब्रेकडाउन दर्ज करें व रेस्क्यू भेजें')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transshipments.map((rescue) => (
              <div
                key={rescue.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">{rescue.breakdownIncidentNo}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                        {rescue.breakdownReason}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{t('Reported At:', 'रिपोर्ट समय:')} {rescue.incidentReportedAt}</span>
                    </div>
                  </div>

                  {rescue.resolvedAt ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('Resolved', 'समाधान हो गया')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 animate-pulse">
                      <Wrench className="w-3.5 h-3.5" />
                      {t('Active SOS Rescue', 'सक्रिय SOS रेस्क्यू')}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('Broken Down Vehicle:', 'खराब हुआ वाहन:')}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{rescue.originalVehiclePlate}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">{t('Highway Location:', 'हाईवे स्थान:')}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-xs">{rescue.breakdownLocation}</span>
                  </div>
                </div>

                {/* Rescue Vehicle Dispatched */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-800 dark:text-emerald-300 font-semibold">{t('Assigned Rescue Vehicle:', 'सौंपा गया रेस्क्यू वाहन:')}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{rescue.assignedRescueVehiclePlate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('Rescue Driver & Contact:', 'रेस्क्यू ड्राइवर व संपर्क:')}</span>
                    <span className="font-medium flex items-center gap-1 text-slate-800 dark:text-slate-200">
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      {rescue.rescueDriverName} ({rescue.rescueDriverPhone})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-emerald-200 dark:border-emerald-800/40">
                    <b>{t('Cargo Transshipment Status:', 'कार्गो ट्रांसफर स्थिति:')}</b> {rescue.transshipmentCargoStatus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Balance 30% Payout Release */}
      {payoutTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {t('Release Transporter Balance 30%', 'ट्रांसपोर्टर का शेष 30% भुगतान जारी करें')}
              </h3>
              <button
                onClick={() => setPayoutTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <p>
                <b>{t('LR / Bilty No:', 'LR / बिल्टी सं:')}</b> {payoutTarget.biltyLrNumber}
              </p>
              <p>
                <b>{t('Transporter / Broker:', 'ट्रांसपोर्टर / ब्रोकर:')}</b> {payoutTarget.transporterBrokerName}
              </p>
              <p>
                <b>{t('Vehicle & Driver:', 'वाहन व ड्राइवर:')}</b> {payoutTarget.vehicleNumber} ({payoutTarget.driverName})
              </p>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="text-slate-500 text-[11px]">{t('Balance Payout Amount to Release:', 'जारी करने योग्य शेष राशि:')}</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{payoutTarget.balance30PercentDueInr.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="pt-2">
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t('Bank NEFT / RTGS / IMPS UTR Reference *', 'बैंक NEFT / RTGS / IMPS UTR संदर्भ *')}
                </label>
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. UTR-HDFC-99182741"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPayoutTarget(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {t('Cancel', 'रद्द करें')}
              </button>
              <button
                type="button"
                onClick={handleReleasePayment}
                disabled={!utrInput}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-50"
              >
                {t('Confirm Release', 'भुगतान जारी करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Emergency Breakdown SOS Rescue */}
      {showRescueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                {t('Dispatch Highway Breakdown SOS Rescue', 'हाईवे ब्रेकडाउन आपातकालीन रेस्क्यू भेजें')}
              </h3>
              <button
                onClick={() => setShowRescueModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRescue} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Broken Down Vehicle Plate *', 'खराब हुआ वाहन नंबर *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newRescue.originalVehiclePlate}
                    onChange={(e) => setNewRescue({ ...newRescue, originalVehiclePlate: e.target.value.toUpperCase() })}
                    placeholder="e.g. HR 55 AF 4410"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 uppercase font-mono rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Breakdown Reason', 'ब्रेकडाउन का कारण')}
                  </label>
                  <select
                    value={newRescue.breakdownReason}
                    onChange={(e) => setNewRescue({ ...newRescue, breakdownReason: e.target.value as TransshipmentReason })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="EngineBreakdown">Engine Breakdown / Overheating</option>
                    <option value="AxlePuncture">Axle Broken / Multiple Puncture</option>
                    <option value="AccidentDamage">Highway Collision / Minor Accident</option>
                    <option value="OverloadTransshipment">Overload RTO Split Transshipment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t('Highway Location / Landmark / Milestone *', 'हाईवे स्थान / लैंडमार्क / मील का पत्थर *')}
                </label>
                <input
                  type="text"
                  required
                  value={newRescue.breakdownLocation}
                  onChange={(e) => setNewRescue({ ...newRescue, breakdownLocation: e.target.value })}
                  placeholder="e.g. NH-48 Near Shahpura Toll Plaza, KM 180"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Assigned Rescue Vehicle', 'सौंपा गया रेस्क्यू वाहन')}
                  </label>
                  <input
                    type="text"
                    value={newRescue.assignedRescueVehiclePlate}
                    onChange={(e) => setNewRescue({ ...newRescue, assignedRescueVehiclePlate: e.target.value.toUpperCase() })}
                    placeholder="e.g. RJ 14 GB 9901"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 uppercase font-mono rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Rescue Driver Name & Phone', 'रेस्क्यू ड्राइवर व मोबाइल')}
                  </label>
                  <input
                    type="text"
                    value={newRescue.rescueDriverPhone}
                    onChange={(e) => setNewRescue({ ...newRescue, rescueDriverPhone: e.target.value })}
                    placeholder="+91 98290 12345"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="craneDispatched"
                  checked={newRescue.craneMechanicDispatched}
                  onChange={(e) => setNewRescue({ ...newRescue, craneMechanicDispatched: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="craneDispatched" className="text-slate-700 dark:text-slate-300 font-medium">
                  {t('Dispatch Hydraulic Crane & Mechanic Team Immediately', 'हाइड्रोलिक क्रेन व मैकेनिक टीम तुरंत रवाना करें')}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRescueModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-md transition"
                >
                  {t('Dispatch SOS Rescue', 'SOS रेस्क्यू रवाना करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
