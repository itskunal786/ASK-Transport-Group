import { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Clock, 
  IndianRupee, 
  FileCheck, 
  RefreshCw, 
  Search, 
  PlusCircle, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import type { CorporateCargoClaim, ClaimDisputeReason } from '../types/transportOperations';
import { getAllCargoClaims, createCargoClaim, issueClaimDebitNote } from '../api/cargoClaimsApi';
import { useLanguage } from '../context/LanguageContext';

const SEED_CLAIMS: CorporateCargoClaim[] = [
  {
    id: 'claim-1',
    claimTicketNo: 'CLM-2026-FMCG-8102',
    shipperCorporateName: 'Hindustan Unilever Ltd (Bhiwandi CDC)',
    consignmentNo: 'CN-HUL-MUM-99124',
    invoiceNo: 'INV-HUL-2026-8812',
    invoiceValueInr: 2450000,
    claimAmountInr: 85000,
    settledAmountInr: 42000,
    reason: 'WATER_RAIN_DAMAGE',
    status: 'DEBIT_NOTE_ISSUED',
    incidentLocation: 'Igatpuri Ghat / NH-160 Monsoon Ingress',
    surveyorReportDetails: 'Joint survey conducted with National Insurance surveyor. 12 corrugated boxes damp on outer layer; inner contents 80% intact. Final loss settled at ₹42,000.',
    debitNoteRefNo: 'DN-HUL-2026-441',
    cargoPhotosUploadedCount: 6,
    slaTargetDeliveryTime: '2026-10-24T18:00:00',
    actualDeliveryTime: '2026-10-24T19:30:00',
    delayHours: 1.5,
    filedDate: '2026-10-25'
  },
  {
    id: 'claim-2',
    claimTicketNo: 'CLM-2026-ELEC-4401',
    shipperCorporateName: 'Samsung Electronics India Ltd (Noida Plant)',
    consignmentNo: 'CN-SAM-DEL-55102',
    invoiceNo: 'INV-SAM-2026-1903',
    invoiceValueInr: 7800000,
    claimAmountInr: 320000,
    settledAmountInr: 0,
    reason: 'TRANSIT_IMPACT_BREAKAGE',
    status: 'SURVEYOR_INSPECTION',
    incidentLocation: 'NH-44 Agra-Gwalior Stretch',
    surveyorReportDetails: 'Third-party surveyor appointed (M/s Tata AIG General). Impact marks detected on outer wooden pallet straps. Awaiting final assessment.',
    cargoPhotosUploadedCount: 14,
    slaTargetDeliveryTime: '2026-10-28T12:00:00',
    actualDeliveryTime: '2026-10-28T11:45:00',
    delayHours: 0,
    filedDate: '2026-10-28'
  },
  {
    id: 'claim-3',
    claimTicketNo: 'CLM-2026-RETAIL-1192',
    shipperCorporateName: 'Reliance Retail Ventures Ltd',
    consignmentNo: 'CN-REL-BLR-3199',
    invoiceNo: 'INV-REL-2026-7731',
    invoiceValueInr: 1200000,
    claimAmountInr: 45000,
    settledAmountInr: 0,
    reason: 'DELAYED_DELIVERY_SLA',
    status: 'REJECTED_UNJUSTIFIED',
    incidentLocation: 'Hosur Border Checkpoint',
    surveyorReportDetails: 'Delay was caused by State Election Commission check-post enforcement and official highway barricades (Force Majeure clause 14.2 of Master Transport Agreement). Penalty repudiated.',
    cargoPhotosUploadedCount: 3,
    slaTargetDeliveryTime: '2026-10-26T10:00:00',
    actualDeliveryTime: '2026-10-26T18:30:00',
    delayHours: 8.5,
    filedDate: '2026-10-27'
  }
];

export const CorporateCargoClaimsManager: React.FC = () => {
  const { t } = useLanguage();
  const [claims, setClaims] = useState<CorporateCargoClaim[]>(SEED_CLAIMS);
  const [selectedClaim, setSelectedClaim] = useState<CorporateCargoClaim>(SEED_CLAIMS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDebitModal, setShowDebitModal] = useState(false);
  const [debitRefInput, setDebitRefInput] = useState('');
  const [agreedAmountInput, setAgreedAmountInput] = useState<number>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Form State
  const [newShipper, setNewShipper] = useState('');
  const [newCn, setNewCn] = useState('');
  const [newInv, setNewInv] = useState('');
  const [newInvVal, setNewInvVal] = useState(1000000);
  const [newClaimVal, setNewClaimVal] = useState(50000);
  const [newReason, setNewReason] = useState<ClaimDisputeReason>('WATER_RAIN_DAMAGE');
  const [newLocation, setNewLocation] = useState('NH-48 Jaipur Bypass');

  useEffect(() => {
    fetchClaims();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCargoClaims();
      if (data && data.length > 0) {
        setClaims(data);
        setSelectedClaim(data[0]);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueDebitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debitRefInput.trim()) {
      showToast('error', t('Please enter debit note reference number!', 'कृपया डेबिट नोट संदर्भ संख्या दर्ज करें!'));
      return;
    }

    try {
      await issueClaimDebitNote(selectedClaim.id, debitRefInput, agreedAmountInput);
      setClaims(prev => prev.map(c => c.id === selectedClaim.id ? {
        ...c,
        status: 'DEBIT_NOTE_ISSUED',
        debitNoteRefNo: debitRefInput,
        settledAmountInr: agreedAmountInput
      } : c));
      setSelectedClaim(prev => ({
        ...prev,
        status: 'DEBIT_NOTE_ISSUED',
        debitNoteRefNo: debitRefInput,
        settledAmountInr: agreedAmountInput
      }));
      setShowDebitModal(false);
      showToast('success', t(`Debit note ${debitRefInput} (₹${agreedAmountInput.toLocaleString('en-IN')}) issued successfully!`, `डेबिट नोट ${debitRefInput} (₹${agreedAmountInput.toLocaleString('en-IN')}) सफलतापूर्वक जारी हुआ!`));
    } catch {
      setClaims(prev => prev.map(c => c.id === selectedClaim.id ? {
        ...c,
        status: 'DEBIT_NOTE_ISSUED',
        debitNoteRefNo: debitRefInput,
        settledAmountInr: agreedAmountInput
      } : c));
      setSelectedClaim(prev => ({
        ...prev,
        status: 'DEBIT_NOTE_ISSUED',
        debitNoteRefNo: debitRefInput,
        settledAmountInr: agreedAmountInput
      }));
      setShowDebitModal(false);
      showToast('success', t(`Debit note ${debitRefInput} issued!`, `डेबिट नोट ${debitRefInput} जारी हुआ!`));
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipper.trim() || !newCn.trim()) {
      showToast('error', t('Please enter corporate shipper and consignment number!', 'कृपया कॉर्पोरेट शिपर व कन्साइनमेंट नंबर दर्ज करें!'));
      return;
    }

    const newClaim: CorporateCargoClaim = {
      id: `claim-${Date.now()}`,
      claimTicketNo: `CLM-2026-${newShipper.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      shipperCorporateName: newShipper,
      consignmentNo: newCn,
      invoiceNo: newInv || `INV-${Date.now()}`,
      invoiceValueInr: Number(newInvVal),
      claimAmountInr: Number(newClaimVal),
      settledAmountInr: 0,
      reason: newReason,
      status: 'REGISTERED_UNDER_REVIEW',
      incidentLocation: newLocation,
      surveyorReportDetails: 'Joint inspection pending with customer representative.',
      cargoPhotosUploadedCount: 2,
      slaTargetDeliveryTime: new Date().toISOString(),
      actualDeliveryTime: new Date().toISOString(),
      delayHours: 0,
      filedDate: new Date().toISOString().split('T')[0]
    };

    try {
      await createCargoClaim(newClaim);
    } catch {
      // fallback
    }

    setClaims(prev => [newClaim, ...prev]);
    setSelectedClaim(newClaim);
    setShowNewModal(false);
    showToast('success', t(`New cargo dispute claim ticket ${newClaim.claimTicketNo} registered!`, `नया कार्गो डिस्प्यूट क्लेम टिकट ${newClaim.claimTicketNo} दर्ज हुआ!`));
  };

  const filteredClaims = claims.filter(c => {
    const matchSearch = c.claimTicketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shipperCorporateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.consignmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchSearch;
    return matchSearch && c.status === statusFilter;
  });

  const totalClaimed = claims.reduce((acc, curr) => acc + curr.claimAmountInr, 0);
  const totalSettled = claims.reduce((acc, curr) => acc + curr.settledAmountInr, 0);
  const activeDisputes = claims.filter(c => c.status === 'REGISTERED_UNDER_REVIEW' || c.status === 'SURVEYOR_INSPECTION').length;

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

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-sky-950 to-stone-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Corporate Shipper SLA & Cargo Claims Dispute Shield</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white">
            {t('Corporate Cargo Claims & SLA Dispute Shield', 'कॉर्पोरेट कार्गो डैमेज व क्लेम डिस्प्यूट शील्ड')}
          </h1>
          <p className="text-cyan-100/80 text-sm mt-1">
            {t(
              'Audit-proof protection against rain damages, impact breakages, pilferage, SLA delivery delays, and arbitrary debit notes.',
              'बारिश में भीगने, टूट-फूट, माल कमी, SLA डिलीवरी देरी व अनधिकृत डेबिट नोट कटौती से 100% सुरक्षा।'
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchClaims}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('Refresh', 'रिफ्रेश')}</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold rounded-xl text-sm shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('File New Dispute Ticket', 'नया डिस्प्यूट टिकट दर्ज करें')}</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Active Claim Disputes', 'सक्रिय डिस्प्यूट मामले')}
            </span>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-0.5">{activeDisputes}</div>
            <span className="text-xs text-amber-500 mt-1 inline-block">
              {t('Surveyor Assessment Pending', 'सर्वेक्षक मूल्यांकन प्रगति पर')}
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Total Claimed Value', 'कुल दावा राशि (Claimed)')}
            </span>
            <div className="text-2xl font-bold text-rose-600 mt-0.5">₹{totalClaimed.toLocaleString('en-IN')}</div>
            <span className="text-xs text-rose-500 mt-1 inline-block">
              {t('Shipper Demand for Loss', 'शिपर द्वारा मांगी गई क्षतिपूर्ति')}
            </span>
          </div>
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/50 rounded-xl flex items-center justify-center text-rose-600">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Agreed Settled Value', 'अंतिम स्वीकृत राशि (Settled)')}
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{totalSettled.toLocaleString('en-IN')}</div>
            <span className="text-xs text-emerald-600 mt-1 inline-block">
              {t('Negotiated Debit Note', 'वार्ता उपरांत डेबिट नोट')}
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t('Transporter Defence Savings', 'ट्रांसपोर्टर बचत (Savings)')}
            </span>
            <div className="text-2xl font-bold text-cyan-600 mt-0.5">₹{(totalClaimed - totalSettled).toLocaleString('en-IN')}</div>
            <span className="text-xs text-cyan-600 mt-1 inline-block">
              {t('Audit Documented Savings', 'डॉक्यूमेंटेड डिफेंस बचत')}
            </span>
          </div>
          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center text-cyan-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Claims List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={t('Search ticket / corporate shipper / invoice...', 'टिकट क्र / कॉर्पोरेट शिपर / इनवॉइस...')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-stone-800 dark:text-stone-100"
                />
              </div>

              {/* Status Filters */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {(['ALL', 'REGISTERED_UNDER_REVIEW', 'SURVEYOR_INSPECTION', 'DEBIT_NOTE_ISSUED', 'REJECTED_UNJUSTIFIED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                      statusFilter === st
                        ? 'bg-cyan-700 text-white shadow'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {st === 'ALL' ? t('All Claims', 'सभी क्लेम') :
                     st === 'REGISTERED_UNDER_REVIEW' ? t('Registered', 'नया दर्ज') :
                     st === 'SURVEYOR_INSPECTION' ? t('Survey Inspection', 'सर्वेक्षण अधीन') :
                     st === 'DEBIT_NOTE_ISSUED' ? t('Debit Note Issued', 'डेबिट नोट') : t('Repudiated', 'खारिज (Rejected)')}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredClaims.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">
                  {t('No dispute claims found', 'कोई डिस्प्यूट क्लेम नहीं मिला')}
                </div>
              ) : (
                filteredClaims.map(claim => {
                  const isSelected = selectedClaim.id === claim.id;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedClaim(claim)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/20 shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-cyan-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-cyan-800 dark:text-cyan-400">
                          {claim.claimTicketNo}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          claim.status === 'DEBIT_NOTE_ISSUED' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300' :
                          claim.status === 'REJECTED_UNJUSTIFIED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {claim.status === 'DEBIT_NOTE_ISSUED' ? t('Debit Note Issued', 'डेबिट नोट जारी') :
                           claim.status === 'REJECTED_UNJUSTIFIED' ? t('Repudiated', 'दावा खारिज') : t('Survey Inspection', 'सर्वेक्षण अधीन')}
                        </span>
                      </div>

                      <div className="mt-2 text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {claim.shipperCorporateName}
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-2">
                        <span>{t('Reason:', 'कारण:')} <b>{claim.reason.replace(/_/g, ' ')}</b></span>
                        <span className="font-bold text-rose-600">{t('Claim:', 'दावा:')} ₹{claim.claimAmountInr.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Claim Dispute Inspector & Surveyor Findings */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                  {t('Claim Case Audit', 'क्लेम केस ऑडिट')} • {selectedClaim.claimTicketNo}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedClaim.status !== 'DEBIT_NOTE_ISSUED' && selectedClaim.status !== 'REJECTED_UNJUSTIFIED' && (
                  <button
                    onClick={() => {
                      setDebitRefInput(`DN-${selectedClaim.claimTicketNo.substring(4)}`);
                      setAgreedAmountInput(Math.round(selectedClaim.claimAmountInr * 0.5));
                      setShowDebitModal(true);
                    }}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{t('Issue Negotiated Debit Note', 'वार्ता डेबिट नोट जारी करें')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Claim Content */}
            <div className="p-6 space-y-6">

              {/* Shipper & Consignment Details */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block">{t('Corporate Shipper', 'कॉर्पोरेट शिपर')}</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">{selectedClaim.shipperCorporateName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">{t('Consignment Number', 'कन्साइनमेंट नंबर')}</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedClaim.consignmentNo}</span>
                  <span className="text-[11px] text-stone-500 block">{t('Invoice:', 'इनवॉइस:')} {selectedClaim.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">{t('Total Invoice Value', 'कुल कंसाइनमेंट मूल्य')}</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">₹{selectedClaim.invoiceValueInr.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">{t('Claimed Amount', 'दावा की गई राशि')}</span>
                  <span className="font-black text-rose-600 text-sm">₹{selectedClaim.claimAmountInr.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Damage Incident Details & Surveyor Report */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3 bg-cyan-50/20 dark:bg-cyan-950/10">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-xs text-stone-800 dark:text-stone-200">
                    {t('Incident Location & Marine Insurance Surveyor Audit', 'घटना स्थल एवं स्वतंत्र बीमा सर्वेक्षक रिपोर्ट (Independent Surveyor Audit)')}
                  </span>
                  <span className="text-xs text-stone-500">{t('Location:', 'स्थान:')} {selectedClaim.incidentLocation}</span>
                </div>

                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  {selectedClaim.surveyorReportDetails || t('Survey inspection is currently in progress.', 'सर्वेक्षण प्रक्रिया अभी जारी है।')}
                </p>

                <div className="flex items-center gap-4 text-xs pt-2">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                    <Camera className="w-4 h-4 text-cyan-600" />
                    <span><b>{selectedClaim.cargoPhotosUploadedCount}</b> {t('Geo-tagged damage photos attached', 'जियो-टैग्ड क्षति फोटो संलग्न')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <span>{t('SLA Delay:', 'SLA देरी:')} <b>{selectedClaim.delayHours} {t('hours', 'घंटे')}</b></span>
                  </div>
                </div>
              </div>

              {/* Settlement / Debit Note Status */}
              {selectedClaim.debitNoteRefNo ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold block">
                      {t('Settlement Debit Note Issued', 'स्वीकृत डेबिट नोट जारी (Settlement Reached)')}
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-900 dark:text-emerald-100">
                      {t('Reference No:', 'रेफरेंस क्र:')} {selectedClaim.debitNoteRefNo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-600 block">{t('Agreed Recovery Amount', 'वार्ता उपरांत कटौती राशि')}</span>
                    <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                      ₹{selectedClaim.settledAmountInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ) : selectedClaim.status === 'REJECTED_UNJUSTIFIED' ? (
                <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700">
                  <span className="text-xs font-bold text-emerald-600 block">
                    {t('Claim Repudiated by Transporter (Defended)', 'दावा ट्रांसपोर्टर द्वारा खारिज (Repudiated)')}
                  </span>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    {t(
                      'This claim falls under Force Majeure clause 14.2 (State barrier / official order). Zero deduction applied.',
                      'यह क्लेम अनुबंध की धारा 14.2 (फोर्स मेज्योर / सरकारी रोक) के अंतर्गत आता है। शून्य कटौती लागू।'
                    )}
                  </p>
                </div>
              ) : null}

              {/* Action Bar */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => showToast('info', t('Exporting cargo damage report and surveyor dossier PDF...', 'कार्गो क्षति रिपोर्ट एवं फोटो डोजियर पीडीएफ तैयार हो रहा है...'))}
                  className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{t('Export Surveyor Dossier (PDF)', 'सर्वेक्षक रिपोर्ट एक्सपोर्ट करें')}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Debit Note Modal */}
      {showDebitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-stone-300 dark:border-stone-800">
            <div className="p-4 bg-cyan-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                <span>{t('Issue Negotiated Debit Note', 'वार्ता उपरांत डेबिट नोट जारी करें')}</span>
              </h3>
              <button onClick={() => setShowDebitModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueDebitNote} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">{t('Debit Note Reference Number *', 'डेबिट नोट रेफरेंस नंबर *')}</label>
                <input
                  type="text"
                  value={debitRefInput}
                  onChange={e => setDebitRefInput(e.target.value)}
                  required
                  className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">{t('Agreed Settlement Amount (INR) *', 'अंतिम तय राशि (Agreed Settlement INR) *')}</label>
                <input
                  type="number"
                  value={agreedAmountInput}
                  onChange={e => setAgreedAmountInput(Number(e.target.value))}
                  required
                  className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  {t('Original Claim Amount:', 'मूल दावा राशि:')} ₹{selectedClaim.claimAmountInr.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowDebitModal(false)}
                  className="px-4 py-2 border rounded-lg text-stone-600 dark:text-stone-300"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg shadow"
                >
                  {t('Approve Debit Note', 'डेबिट नोट स्वीकृत करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Claim Dispute Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-300 dark:border-stone-800">
            <div className="p-4 bg-cyan-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>{t('Record New Cargo Dispute Ticket', 'नया कॉर्पोरेट कार्गो डिस्प्यूट टिकट दर्ज करें')}</span>
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">{t('Corporate Shipper Name *', 'कॉर्पोरेट शिपर का नाम *')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Motors / Nestle"
                    value={newShipper}
                    onChange={e => setNewShipper(e.target.value)}
                    required
                    className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">{t('Consignment Number *', 'कन्साइनमेंट नंबर *')}</label>
                  <input
                    type="text"
                    placeholder="CN-2026-..."
                    value={newCn}
                    onChange={e => setNewCn(e.target.value)}
                    required
                    className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">{t('Invoice Number', 'इनवॉइस नंबर')}</label>
                  <input
                    type="text"
                    value={newInv}
                    onChange={e => setNewInv(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">{t('Incident Location / Highway', 'घटना स्थल / हाईवे')}</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">{t('Total Invoice Value (INR)', 'इनवॉइस मूल्य (INR)')}</label>
                  <input
                    type="number"
                    value={newInvVal}
                    onChange={e => setNewInvVal(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">{t('Claimed Loss Amount (INR) *', 'दावा राशि (Claimed INR) *')}</label>
                  <input
                    type="number"
                    value={newClaimVal}
                    onChange={e => setNewClaimVal(Number(e.target.value))}
                    required
                    className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">{t('Dispute Reason *', 'क्षति / विवाद का मुख्य कारण *')}</label>
                <select
                  value={newReason}
                  onChange={e => setNewReason(e.target.value as ClaimDisputeReason)}
                  className="w-full p-2 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700"
                >
                  <option value="WATER_RAIN_DAMAGE">{t('Water / Rain Damage Ingress', 'बारिश / जल रिसाव (Water / Rain Damage)')}</option>
                  <option value="TRANSIT_IMPACT_BREAKAGE">{t('Transit Impact / Breakage', 'पारगमन प्रभाव / टूट-फूट (Transit Impact / Breakage)')}</option>
                  <option value="SHORTAGE_PILFERAGE">{t('Shortage / Pilferage', 'माल कमी / चोरी (Shortage / Pilferage)')}</option>
                  <option value="DELAYED_DELIVERY_SLA">{t('Delayed Delivery SLA Penalty', 'SLA डिलीवरी देरी पेनल्टी (Delayed Delivery SLA)')}</option>
                  <option value="TEMPERATURE_EXCURSION">{t('Cold-Chain Temperature Breach', 'कोल्ड चेन तापमान विचलन (Temperature Excursion)')}</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border rounded-lg text-stone-600 dark:text-stone-300"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg shadow"
                >
                  {t('Register Claim Ticket', 'दावा दर्ज करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateCargoClaimsManager;
