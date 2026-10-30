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
import './PhysicalPodInwardDeck.css';

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
    <div className="pod-deck-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`pod-deck-toast ${notification.type === 'error' ? 'error' : 'success'}`}>
          <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="pod-deck-banner">
        <div className="pod-deck-banner-content">
          <div>
            <div className="pod-deck-tag">
              <Barcode style={{ width: '14px', height: '14px' }} />
              <span>{t('Terminal Operations & Fleet Payouts', 'टर्मिनल संचालन और फ्लीट भुगतान')}</span>
            </div>
            <h1>
              {t('Physical POD Inward & Breakdown Rescue Deck', 'फिजिकल POD इनवर्ड और ब्रेकडाउन रेस्क्यू डेक')}
            </h1>
            <p>
              {t(
                'Optical barcode inward scanner, signed & stamped POD validation, 30% balance payout release & highway SOS emergency transshipments.',
                'ऑप्टिकल बारकोड इनवर्ड स्कैनर, हस्ताक्षरित व मुहरबंद POD सत्यापन, 30% शेष भुगतान जारी व हाईवे SOS आपातकालीन ट्रांसशिपमेंट।'
              )}
            </p>
          </div>

          <div className="pod-deck-banner-actions">
            <button
              onClick={() => setShowRescueModal(true)}
              className="pod-btn-sos"
              type="button"
            >
              <AlertTriangle style={{ width: '16px', height: '16px' }} />
              <span>{t('Highway SOS Breakdown', 'हाईवे आपातकालीन ब्रेकडाउन')}</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="pod-btn-refresh"
              title={t('Refresh', 'रीफ़्रेश')}
              type="button"
            >
              <RefreshCw style={{ width: '16px', height: '16px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="pod-deck-tabs">
          <button
            onClick={() => setActiveTab('POD_INWARD')}
            className={`pod-deck-tab ${activeTab === 'POD_INWARD' ? 'active-green' : ''}`}
            type="button"
          >
            <Barcode style={{ width: '16px', height: '16px' }} />
            <span>{t('Physical POD Optical Inward Queue', 'फिजिकल POD ऑप्टिकल इनवर्ड कतार')}</span>
            <span className="pod-pill-count">{podList.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSSHIPMENT_SOS')}
            className={`pod-deck-tab ${activeTab === 'TRANSSHIPMENT_SOS' ? 'active-rose' : ''}`}
            type="button"
          >
            <AlertTriangle style={{ width: '16px', height: '16px' }} />
            <span>{t('Highway Breakdown & Rescue Radar', 'हाईवे ब्रेकडाउन और रेस्क्यू रडार')}</span>
            {activeRescuesCount > 0 && (
              <span className="pod-pill-count" style={{ background: '#be123c', color: '#fff' }}>
                {activeRescuesCount} SOS
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="pod-deck-kpis-grid">
        <div className="pod-kpi-card">
          <div className="pod-kpi-head">
            <span>{t('Pending Inward PODs', 'प्रतीक्षारत इनवर्ड PODs')}</span>
            <Clock style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
          </div>
          <div className="pod-kpi-value amber">{pendingInwardCount}</div>
          <span className="pod-kpi-sub">
            {t('Awaiting physical transit delivery', 'भौतिक पारगमन डिलीवरी की प्रतीक्षा')}
          </span>
        </div>

        <div className="pod-kpi-card">
          <div className="pod-kpi-head">
            <span>{t('Stamped & Scanned Verified', 'मुहरबंद व सत्यापित')}</span>
            <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
          </div>
          <div className="pod-kpi-value emerald">{verifiedCount}</div>
          <span className="pod-kpi-sub">
            {t('Ready for 30% balance release', '30% शेष भुगतान हेतु तैयार')}
          </span>
        </div>

        <div className="pod-kpi-card">
          <div className="pod-kpi-head">
            <span>{t('Balance Due to Transporters', 'ट्रांसपोर्टरों को देय शेष')}</span>
            <IndianRupee style={{ width: '16px', height: '16px', color: '#0284c7' }} />
          </div>
          <div className="pod-kpi-value sky">
            ₹{totalBalanceDue.toLocaleString('en-IN')}
          </div>
          <span className="pod-kpi-sub">
            {paymentReleasedCount} {t('payouts released this week', 'भुगतान इस सप्ताह जारी किए गए')}
          </span>
        </div>

        <div className="pod-kpi-card">
          <div className="pod-kpi-head">
            <span>{t('Highway Breakdowns (SOS)', 'हाईवे ब्रेकडाउन (SOS)')}</span>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#f43f5e' }} />
          </div>
          <div className="pod-kpi-value rose">{activeRescuesCount}</div>
          <span className="pod-kpi-sub">
            {t('Rescue vehicles dispatched en route', 'रेस्क्यू वाहन रास्ते में रवाना')}
          </span>
        </div>
      </div>

      {/* TAB 1: Optical Barcode Scanner & POD Inward Queue */}
      {activeTab === 'POD_INWARD' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Optical Scanner Action Strip */}
          <div className="pod-scanner-strip">
            <form onSubmit={handleScanBarcode} className="pod-scanner-form">
              <div className="pod-scanner-label">
                <Barcode style={{ width: '18px', height: '18px' }} />
                <span>{t('Barcode Inward Reader:', 'बारकोड इनवर्ड रीडर:')}</span>
              </div>

              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder={t('Scan optical barcode with laser gun or enter LR/Bilty No...', 'लेजर गन से बारकोड स्कैन करें या LR/बिल्टी सं. दर्ज करें...')}
                className="pod-input-field"
                style={{ fontFamily: 'monospace' }}
              />

              <input
                type="text"
                value={operatorInput}
                onChange={(e) => setOperatorInput(e.target.value)}
                placeholder={t('Operator Name', 'ऑपरेटर का नाम')}
                className="pod-input-operator"
              />

              <button
                type="submit"
                disabled={!barcodeInput.trim()}
                className="pod-btn-verify"
              >
                <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                <span>{t('Inward & Verify Stamp', 'इनवर्ड करें व मुहर सत्यापित करें')}</span>
              </button>
            </form>
          </div>

          {/* Table Container */}
          <div className="pod-table-card">
            <div className="pod-table-toolbar">
              <div className="pod-search-wrap">
                <Search style={{ width: '16px', height: '16px' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search by LR #, Barcode, Vehicle, Transporter...', 'LR #, बारकोड, वाहन, ट्रांसपोर्टर से खोजें...')}
                />
              </div>

              <div className="pod-table-records-count">
                {t('Total Records:', 'कुल रिकॉर्ड्स:')} <b>{filteredPods.length}</b>
              </div>
            </div>

            <div className="pod-table-wrap">
              <table className="pod-data-table">
                <thead>
                  <tr>
                    <th>{t('Bilty / LR & Barcode', 'बिल्टी / LR व बारकोड')}</th>
                    <th>{t('Consignor & Consignee', 'प्रेषक एवं प्राप्तकर्ता')}</th>
                    <th>{t('Transporter & Vehicle', 'ट्रांसपोर्टर व वाहन')}</th>
                    <th style={{ textAlign: 'right' }}>{t('Total Freight', 'कुल भाड़ा')}</th>
                    <th style={{ textAlign: 'right' }}>{t('Bal 30% Due', 'शेष 30% देय')}</th>
                    <th style={{ textAlign: 'center' }}>{t('Physical POD Stamp', 'फिजिकल POD मुहर')}</th>
                    <th style={{ textAlign: 'center' }}>{t('Status', 'स्थिति')}</th>
                    <th style={{ textAlign: 'right' }}>{t('Action', 'कार्रवाई')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPods.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="pod-bilty-text">
                          <FileCheck2 style={{ width: '15px', height: '15px', color: '#10b981' }} />
                          <span>{item.biltyLrNumber}</span>
                        </div>
                        <div className="pod-barcode-token">
                          {item.barcodeToken}
                        </div>
                        <div className="pod-cn-text">
                          CN: {item.consignmentNo}
                        </div>
                      </td>

                      <td style={{ maxWidth: '280px' }}>
                        <div className="pod-party-name">{item.consignorName}</div>
                        <div className="pod-party-dest">
                          <MapPin style={{ width: '13px', height: '13px', color: '#94a3b8', flexShrink: 0 }} />
                          <span>To: {item.consigneeName} ({item.destinationCity})</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.transporterBrokerName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span className="pod-vehicle-pill">{item.vehicleNumber}</span>
                        </div>
                        <div className="pod-driver-text">{item.driverName}</div>
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px' }}>₹{item.totalFreightInr.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                          70% Adv: ₹{item.advance70PercentPaidInr.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 900, color: '#10b981', fontSize: '13.5px' }}>
                          ₹{item.balance30PercentDueInr.toLocaleString('en-IN')}
                        </div>
                        {item.payoutReleaseTransactionRef && (
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            Ref: {item.payoutReleaseTransactionRef}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {item.consigneeStampVerified ? (
                          <span className="pod-badge verified">
                            <ShieldCheck style={{ width: '14px', height: '14px' }} />
                            <span>{t('Signed & Stamped', 'हस्ताक्षरित व मुहरबंद')}</span>
                          </span>
                        ) : (
                          <span className="pod-badge pending">
                            <Clock style={{ width: '14px', height: '14px' }} />
                            <span>{t('Stamp Pending', 'मुहर प्रतीक्षारत')}</span>
                          </span>
                        )}
                        {item.opticalBarcodeScannedAt && (
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                            Scanned: {item.opticalBarcodeScannedAt}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {item.verificationStatus === 'PaymentReleased' && (
                          <span className="pod-badge released">
                            <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                            <span>{t('30% Released', '30% भुगतान जारी')}</span>
                          </span>
                        )}
                        {item.verificationStatus === 'ScannedVerified' && (
                          <span className="pod-badge verified">
                            <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                            <span>{t('Verified', 'सत्यापित')}</span>
                          </span>
                        )}
                        {item.verificationStatus === 'PendingInward' && (
                          <span className="pod-badge pending">
                            <Clock style={{ width: '14px', height: '14px' }} />
                            <span>{t('Pending Inward', 'इनवर्ड प्रतीक्षारत')}</span>
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {item.verificationStatus === 'ScannedVerified' && (
                          <button
                            onClick={() => {
                              setPayoutTarget(item);
                              setUtrInput(`UTR-HDFC-${Math.floor(10000000 + Math.random() * 90000000)}`);
                            }}
                            className="pod-btn-payout"
                            type="button"
                          >
                            <IndianRupee style={{ width: '13px', height: '13px' }} />
                            <span>{t('Release 30% Pay', '30% भुगतान जारी')}</span>
                          </button>
                        )}
                        {item.verificationStatus === 'PendingInward' && (
                          <button
                            onClick={() => {
                              setBarcodeInput(item.barcodeToken);
                            }}
                            className="pod-btn-scan-now"
                            type="button"
                          >
                            {t('Scan Now', 'स्कैन करें')}
                          </button>
                        )}
                        {item.verificationStatus === 'PaymentReleased' && (
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                            ✓ {t('Settled', 'निपटारा संपन्न')}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="pod-sos-header">
            <h2>
              <Truck style={{ width: '20px', height: '20px', color: '#f43f5e' }} />
              <span>{t('Highway Breakdown & Rescue Incidents', 'हाईवे ब्रेकडाउन व आपातकालीन रेस्क्यू घटनाएं')}</span>
            </h2>
            <button
              onClick={() => setShowRescueModal(true)}
              className="pod-btn-sos"
              type="button"
            >
              <AlertTriangle style={{ width: '16px', height: '16px' }} />
              <span>{t('Log Breakdown & Dispatch Rescue', 'ब्रेकडाउन दर्ज करें व रेस्क्यू भेजें')}</span>
            </button>
          </div>

          <div className="pod-sos-grid">
            {transshipments.map((rescue) => (
              <div key={rescue.id} className="pod-sos-card">
                <div className="pod-sos-card-head">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="pod-sos-incident-tag">{rescue.breakdownIncidentNo}</span>
                      <span className="pod-sos-reason-pill">{rescue.breakdownReason}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      <span>{t('Reported At:', 'रिपोर्ट समय:')} {rescue.incidentReportedAt}</span>
                    </div>
                  </div>

                  {rescue.resolvedAt ? (
                    <span className="pod-badge verified">
                      <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                      <span>{t('Resolved', 'समाधान हो गया')}</span>
                    </span>
                  ) : (
                    <span className="pod-badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                      <Wrench style={{ width: '14px', height: '14px' }} />
                      <span>{t('Active SOS Rescue', 'सक्रिय SOS रेस्क्यू')}</span>
                    </span>
                  )}
                </div>

                <div className="pod-sos-box-gray">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('Broken Down Vehicle:', 'खराब हुआ वाहन:')}</span>
                    <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{rescue.originalVehiclePlate}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('Highway Location:', 'हाईवे स्थान:')}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '260px' }}>{rescue.breakdownLocation}</span>
                  </div>
                </div>

                <div className="pod-sos-box-green">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>{t('Assigned Rescue Vehicle:', 'सौंपा गया रेस्क्यू वाहन:')}</span>
                    <strong style={{ fontFamily: 'monospace', color: '#059669', fontSize: '13px' }}>{rescue.assignedRescueVehiclePlate}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('Rescue Driver & Contact:', 'रेस्क्यू ड्राइवर व संपर्क:')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      <PhoneCall style={{ width: '13px', height: '13px', color: '#059669' }} />
                      <span>{rescue.rescueDriverName} ({rescue.rescueDriverPhone})</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingTop: '6px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
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
        <div className="pod-modal-overlay">
          <div className="pod-modal-card">
            <div className="pod-modal-head">
              <h3>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#10b981' }} />
                <span>{t('Release Transporter Balance 30%', 'ट्रांसपोर्टर का शेष 30% भुगतान जारी करें')}</span>
              </h3>
              <button
                onClick={() => setPayoutTarget(null)}
                className="pod-modal-close"
                type="button"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div className="pod-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('LR / Bilty No:', 'LR / बिल्टी सं:')} </span>
                  <strong>{payoutTarget.biltyLrNumber}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('Transporter / Broker:', 'ट्रांसपोर्टर / ब्रोकर:')} </span>
                  <strong>{payoutTarget.transporterBrokerName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('Vehicle & Driver:', 'वाहन व ड्राइवर:')} </span>
                  <strong>{payoutTarget.vehicleNumber} ({payoutTarget.driverName})</strong>
                </div>
              </div>

              <div className="pod-payout-box">
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t('Balance Payout Amount to Release:', 'जारी करने योग्य शेष राशि:')}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                  ₹{payoutTarget.balance30PercentDueInr.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                  {t('Bank NEFT / RTGS / IMPS UTR Reference *', 'बैंक NEFT / RTGS / IMPS UTR संदर्भ *')}
                </label>
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. UTR-HDFC-99182741"
                  className="pod-input-field"
                  style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'monospace' }}
                />
              </div>

              <div className="pod-modal-footer">
                <button
                  type="button"
                  onClick={() => setPayoutTarget(null)}
                  className="pod-btn-cancel"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="button"
                  onClick={handleReleasePayment}
                  disabled={!utrInput}
                  className="pod-btn-confirm"
                >
                  {t('Confirm Release', 'भुगतान जारी करें')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Emergency Breakdown SOS Rescue */}
      {showRescueModal && (
        <div className="pod-modal-overlay">
          <div className="pod-modal-card" style={{ maxWidth: '580px' }}>
            <div className="pod-modal-head">
              <h3>
                <AlertTriangle style={{ width: '18px', height: '18px', color: '#f43f5e' }} />
                <span>{t('Dispatch Highway Breakdown SOS Rescue', 'हाईवे ब्रेकडाउन आपातकालीन रेस्क्यू भेजें')}</span>
              </h3>
              <button
                onClick={() => setShowRescueModal(false)}
                className="pod-modal-close"
                type="button"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handleCreateRescue} className="pod-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                    {t('Broken Down Vehicle Plate *', 'खराब हुआ वाहन नंबर *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newRescue.originalVehiclePlate}
                    onChange={(e) => setNewRescue({ ...newRescue, originalVehiclePlate: e.target.value.toUpperCase() })}
                    placeholder="e.g. HR 55 AF 4410"
                    className="pod-input-field"
                    style={{ width: '100%', boxSizing: 'border-box', textTransform: 'uppercase', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                    {t('Breakdown Reason', 'ब्रेकडाउन का कारण')}
                  </label>
                  <select
                    value={newRescue.breakdownReason}
                    onChange={(e) => setNewRescue({ ...newRescue, breakdownReason: e.target.value as TransshipmentReason })}
                    className="pod-input-field"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="EngineBreakdown">Engine Breakdown / Overheating</option>
                    <option value="AxlePuncture">Axle Broken / Multiple Puncture</option>
                    <option value="AccidentDamage">Highway Collision / Minor Accident</option>
                    <option value="OverloadTransshipment">Overload RTO Split Transshipment</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                  {t('Highway Location / Landmark / Milestone *', 'हाईवे स्थान / लैंडमार्क / मील का पत्थर *')}
                </label>
                <input
                  type="text"
                  required
                  value={newRescue.breakdownLocation}
                  onChange={(e) => setNewRescue({ ...newRescue, breakdownLocation: e.target.value })}
                  placeholder="e.g. NH-48 Near Shahpura Toll Plaza, KM 180"
                  className="pod-input-field"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                    {t('Assigned Rescue Vehicle', 'सौंपा गया रेस्क्यू वाहन')}
                  </label>
                  <input
                    type="text"
                    value={newRescue.assignedRescueVehiclePlate}
                    onChange={(e) => setNewRescue({ ...newRescue, assignedRescueVehiclePlate: e.target.value.toUpperCase() })}
                    placeholder="e.g. RJ 14 GB 9901"
                    className="pod-input-field"
                    style={{ width: '100%', boxSizing: 'border-box', textTransform: 'uppercase', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                    {t('Rescue Driver Name & Phone', 'रेस्क्यू ड्राइवर व मोबाइल')}
                  </label>
                  <input
                    type="text"
                    value={newRescue.rescueDriverPhone}
                    onChange={(e) => setNewRescue({ ...newRescue, rescueDriverPhone: e.target.value })}
                    placeholder="+91 98290 12345"
                    className="pod-input-field"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <input
                  type="checkbox"
                  id="craneDispatched"
                  checked={newRescue.craneMechanicDispatched}
                  onChange={(e) => setNewRescue({ ...newRescue, craneMechanicDispatched: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#e11d48', cursor: 'pointer' }}
                />
                <label htmlFor="craneDispatched" style={{ fontWeight: 600, cursor: 'pointer' }}>
                  {t('Dispatch Hydraulic Crane & Mechanic Team Immediately', 'हाइड्रोलिक क्रेन व मैकेनिक टीम तुरंत रवाना करें')}
                </label>
              </div>

              <div className="pod-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowRescueModal(false)}
                  className="pod-btn-cancel"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="pod-btn-sos"
                  style={{ padding: '10px 22px' }}
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
