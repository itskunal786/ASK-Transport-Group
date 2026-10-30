import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  IndianRupee,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  FileCheck
} from 'lucide-react';
import type { TaxAuditVaultEntry, GstTaxFilingType } from '../types/transportOperations';
import { getTaxAuditEntries, generateTaxAuditEntry, markEntryFiled } from '../api/taxAuditVaultApi';
import { useLanguage } from '../context/LanguageContext';

const SEED_AUDIT_ENTRIES: TaxAuditVaultEntry[] = [
  {
    id: 'tax-001',
    auditPeriodQuarter: 'Q3 FY 2026-27',
    taxFilingType: 'Gstr1B2B',
    documentReferenceNo: 'INV/2026/DEL-10492',
    partyGstin: '07AAACK1948Q1Z4',
    partyLegalName: 'Tata Steel Tubes Division Ltd',
    taxableFreightAmountInr: 450000,
    cgstAmountInr: 0,
    sgstAmountInr: 0,
    igstAmountInr: 54000,
    rcmApplicable: false,
    rcmTaxLiabilityInr: 0,
    section194CTdsDeductedInr: 9000,
    tdsCertificateNumber: 'TDS/26AS/OCT-8821',
    filingStatus: 'FILED_ACKNOWLEDGED',
    generatedTimestamp: '2026-10-24 16:30'
  },
  {
    id: 'tax-002',
    auditPeriodQuarter: 'Q3 FY 2026-27',
    taxFilingType: 'RcmFivePercent',
    documentReferenceNo: 'BILTY/2026/BOM-8921',
    partyGstin: '27AABCS1429B1Z8',
    partyLegalName: 'UltraTech Cement Dispatch Depot',
    taxableFreightAmountInr: 820000,
    cgstAmountInr: 20500,
    sgstAmountInr: 20500,
    igstAmountInr: 0,
    rcmApplicable: true,
    rcmTaxLiabilityInr: 41000,
    section194CTdsDeductedInr: 16400,
    tdsCertificateNumber: 'TDS/26AS/OCT-9012',
    filingStatus: 'READY_FOR_PORTAL',
    generatedTimestamp: '2026-10-26 11:15'
  },
  {
    id: 'tax-003',
    auditPeriodQuarter: 'Q3 FY 2026-27',
    taxFilingType: 'Gstr3BMonthlySummary',
    documentReferenceNo: 'ITC-RECON/OCT-2026/HQ',
    partyGstin: '07AABCA5555M1Z2',
    partyLegalName: 'ASK Transport Corporate HQ',
    taxableFreightAmountInr: 12500000,
    cgstAmountInr: 312500,
    sgstAmountInr: 312500,
    igstAmountInr: 875000,
    rcmApplicable: false,
    rcmTaxLiabilityInr: 0,
    section194CTdsDeductedInr: 250000,
    tdsCertificateNumber: 'FORM26AS-CONSOLIDATED-Q3',
    filingStatus: 'READY_FOR_PORTAL',
    generatedTimestamp: '2026-10-27 18:45'
  },
  {
    id: 'tax-004',
    auditPeriodQuarter: 'Q3 FY 2026-27',
    taxFilingType: 'Tds194C26As',
    documentReferenceNo: 'VCHR/TDS/2026/OCT-441',
    partyGstin: '08AABCM9102L1ZQ',
    partyLegalName: 'Reliance Retail Supply Chain Hub',
    taxableFreightAmountInr: 680000,
    cgstAmountInr: 0,
    sgstAmountInr: 0,
    igstAmountInr: 81600,
    rcmApplicable: false,
    rcmTaxLiabilityInr: 0,
    section194CTdsDeductedInr: 13600,
    tdsCertificateNumber: 'TDS/194C/RIL-112',
    filingStatus: 'FILED_ACKNOWLEDGED',
    generatedTimestamp: '2026-10-28 09:20'
  },
  {
    id: 'tax-005',
    auditPeriodQuarter: 'Q3 FY 2026-27',
    taxFilingType: 'Gstr1B2B',
    documentReferenceNo: 'INV/2026/BLR-5520',
    partyGstin: '29AAACH2234G1ZT',
    partyLegalName: 'Infosys Campus Logistics Cell',
    taxableFreightAmountInr: 340000,
    cgstAmountInr: 8500,
    sgstAmountInr: 8500,
    igstAmountInr: 0,
    rcmApplicable: false,
    rcmTaxLiabilityInr: 0,
    section194CTdsDeductedInr: 6800,
    tdsCertificateNumber: 'TDS/26AS/OCT-9430',
    filingStatus: 'UNDER_RECONCILIATION',
    generatedTimestamp: '2026-10-29 14:00'
  }
];

export default function CaTaxAuditVault() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<TaxAuditVaultEntry[]>(SEED_AUDIT_ENTRIES);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3 FY 2026-27');
  const [activeFilingTab, setActiveFilingTab] = useState<'ALL' | GstTaxFilingType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showNewEntryModal, setShowNewEntryModal] = useState<boolean>(false);
  const [showMarkFiledModal, setShowMarkFiledModal] = useState<TaxAuditVaultEntry | null>(null);
  const [ackRefInput, setAckRefInput] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    auditPeriodQuarter: 'Q3 FY 2026-27',
    taxFilingType: 'Gstr1B2B' as GstTaxFilingType,
    documentReferenceNo: '',
    partyGstin: '',
    partyLegalName: '',
    taxableFreightAmountInr: 0,
    cgstAmountInr: 0,
    sgstAmountInr: 0,
    igstAmountInr: 0,
    rcmApplicable: false,
    rcmTaxLiabilityInr: 0,
    section194CTdsDeductedInr: 0,
    tdsCertificateNumber: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const filingTypeArg = activeFilingTab === 'ALL' ? undefined : activeFilingTab;
      const data = await getTaxAuditEntries(selectedQuarter, filingTypeArg);
      if (data && data.length > 0) {
        setEntries(data);
      }
    } catch (err) {
      console.warn('Backend tax vault offline, running in offline demo mode', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedQuarter, activeFilingTab]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.documentReferenceNo || !newEntry.partyLegalName) {
      showToast(t('Please fill in required fields', 'कृपया सभी आवश्यक फ़ील्ड भरें'), 'error');
      return;
    }

    try {
      const created = await generateTaxAuditEntry({
        ...newEntry,
        filingStatus: 'READY_FOR_PORTAL',
        generatedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
      setEntries([created, ...entries]);
      showToast(t('Tax Audit record created successfully!', 'टैक्स ऑडिट रिकॉर्ड सफलतापूर्वक बनाया गया!'));
    } catch {
      // Local fallback
      const fallbackEntry: TaxAuditVaultEntry = {
        id: `tax-loc-${Date.now()}`,
        auditPeriodQuarter: newEntry.auditPeriodQuarter,
        taxFilingType: newEntry.taxFilingType,
        documentReferenceNo: newEntry.documentReferenceNo,
        partyGstin: newEntry.partyGstin || '07AABCS1234F1Z1',
        partyLegalName: newEntry.partyLegalName,
        taxableFreightAmountInr: Number(newEntry.taxableFreightAmountInr),
        cgstAmountInr: Number(newEntry.cgstAmountInr),
        sgstAmountInr: Number(newEntry.sgstAmountInr),
        igstAmountInr: Number(newEntry.igstAmountInr),
        rcmApplicable: newEntry.rcmApplicable,
        rcmTaxLiabilityInr: Number(newEntry.rcmTaxLiabilityInr),
        section194CTdsDeductedInr: Number(newEntry.section194CTdsDeductedInr),
        tdsCertificateNumber: newEntry.tdsCertificateNumber || 'TDS/PENDING',
        filingStatus: 'READY_FOR_PORTAL',
        generatedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setEntries([fallbackEntry, ...entries]);
      showToast(t('Record saved to local ledger!', 'रिकॉर्ड स्थानीय लेजर में सहेजा गया!'));
    }

    setShowNewEntryModal(false);
    setNewEntry({
      auditPeriodQuarter: selectedQuarter,
      taxFilingType: 'Gstr1B2B',
      documentReferenceNo: '',
      partyGstin: '',
      partyLegalName: '',
      taxableFreightAmountInr: 0,
      cgstAmountInr: 0,
      sgstAmountInr: 0,
      igstAmountInr: 0,
      rcmApplicable: false,
      rcmTaxLiabilityInr: 0,
      section194CTdsDeductedInr: 0,
      tdsCertificateNumber: ''
    });
  };

  const handleMarkFiledSubmit = async () => {
    if (!showMarkFiledModal || !ackRefInput) return;
    try {
      const updated = await markEntryFiled(showMarkFiledModal.id, ackRefInput);
      setEntries(entries.map(e => (e.id === updated.id ? updated : e)));
      showToast(t(`Filed successfully! Ack: ${ackRefInput}`, `सफलतापूर्वक फाइल किया गया! रसीद: ${ackRefInput}`));
    } catch {
      // Local fallback
      setEntries(entries.map(e => (e.id === showMarkFiledModal.id ? {
        ...e,
        filingStatus: 'FILED_ACKNOWLEDGED',
        documentReferenceNo: `${e.documentReferenceNo} (ACK: ${ackRefInput})`
      } : e)));
      showToast(t(`Filed marked offline! Ack: ${ackRefInput}`, `ऑफ़लाइन फ़ाइल मार्क की गई! रसीद: ${ackRefInput}`));
    }
    setShowMarkFiledModal(null);
    setAckRefInput('');
  };

  const handleExportJsonForCa = () => {
    const payload = {
      exportTitle: 'ASK Transport Group - CA & GST Portal Tax Vault Audit Extract',
      quarter: selectedQuarter,
      exportedAt: new Date().toISOString(),
      schemaVersion: 'GSTN-GTA-2026-v2',
      recordsCount: filteredEntries.length,
      records: filteredEntries
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GST_CA_Audit_Vault_${selectedQuarter.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('GST Portal & CA Schema JSON Exported!', 'GST पोर्टल और CA स्कीमा JSON डाउनलोड हो गया!'));
  };

  const filteredEntries = entries.filter(e => {
    const matchesTab = activeFilingTab === 'ALL' || e.taxFilingType === activeFilingTab;
    const matchesSearch = e.documentReferenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.partyLegalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.partyGstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tdsCertificateNumber && e.tdsCertificateNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // KPI Calculations
  const totalTaxable = filteredEntries.reduce((sum, e) => sum + e.taxableFreightAmountInr, 0);
  const totalGstLiability = filteredEntries.reduce((sum, e) => sum + e.cgstAmountInr + e.sgstAmountInr + e.igstAmountInr, 0);
  const totalRcmFreight = filteredEntries.filter(e => e.rcmApplicable).reduce((sum, e) => sum + e.taxableFreightAmountInr, 0);
  const totalTdsDeducted = filteredEntries.reduce((sum, e) => sum + e.section194CTdsDeductedInr, 0);
  const readyCount = filteredEntries.filter(e => e.filingStatus === 'READY_FOR_PORTAL').length;
  const filedCount = filteredEntries.filter(e => e.filingStatus === 'FILED_ACKNOWLEDGED').length;

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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('Accounts & Statutory Governance', 'अकाउंट्स और वैधानिक गवर्नेंस')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t('CA 1-Click Tax & Audit Vault', 'CA 1-क्लिक टैक्स और ऑडिट वॉल्ट')}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {t(
                'GTA GSTR-1, GSTR-3B monthly reconciliation, RCM 5% Reverse Charge ledger & Section 194C Form 26AS TDS verification vault.',
                'GTA GSTR-1, GSTR-3B मासिक सुलह, RCM 5% रिवर्स चार्ज लेजर और धारा 194C फॉर्म 26AS TDS सत्यापन वॉल्ट।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Q3 FY 2026-27">Q3 FY 2026-27 (Oct - Dec)</option>
              <option value="Q2 FY 2026-27">Q2 FY 2026-27 (Jul - Sep)</option>
              <option value="Q1 FY 2026-27">Q1 FY 2026-27 (Apr - Jun)</option>
              <option value="Q4 FY 2025-26">Q4 FY 2025-26 (Jan - Mar)</option>
            </select>

            <button
              onClick={handleExportJsonForCa}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition"
            >
              <Download className="w-4 h-4" />
              {t('Export for CA / Portal', 'CA / पोर्टल हेतु निर्यात')}
            </button>

            <button
              onClick={() => setShowNewEntryModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              {t('New Voucher', 'नया वाउचर')}
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

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          {[
            { id: 'ALL', label: t('All Tax Vault Records', 'सभी टैक्स वॉल्ट रिकॉर्ड्स') },
            { id: 'Gstr1B2B', label: t('GSTR-1 Outbound B2B Invoices', 'GSTR-1 आउटबाउंड B2B इनवॉइस') },
            { id: 'Gstr3BMonthlySummary', label: t('GSTR-3B Monthly ITC Reconciliation', 'GSTR-3B मासिक ITC सुलह') },
            { id: 'RcmFivePercent', label: t('RCM 5% GTA Reverse Charge', 'RCM 5% GTA रिवर्स चार्ज') },
            { id: 'Tds194C26As', label: t('Section 194C TDS (26AS)', 'धारा 194C TDS (26AS)') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilingTab(tab.id as 'ALL' | GstTaxFilingType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFilingTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('Taxable Freight', 'कर योग्य भाड़ा')}</span>
            <IndianRupee className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            ₹{totalTaxable.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {filteredEntries.length} {t('registered vouchers', 'पंजीकृत वाउचर')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('Total GST Liability', 'कुल GST देनदारी')}</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{totalGstLiability.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('Output GST (CGST + SGST + IGST)', 'आउटपुट GST (CGST + SGST + IGST)')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('RCM 5% Freight Ledger', 'RCM 5% भाड़ा लेजर')}</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            ₹{totalRcmFreight.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('Recipient Reverse Charge Liability', 'प्राप्तकर्ता रिवर्स चार्ज देयता')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('Sec 194C TDS Credited', 'धारा 194C TDS जमा')}</span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold text-sky-600 dark:text-sky-400">
            ₹{totalTdsDeducted.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('Transporter Form 26AS Tax Credit', 'ट्रांसपोर्टर फॉर्म 26AS टैक्स क्रेडिट')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('Filing Readiness', 'फाइलिंग तत्परता')}</span>
            <FileCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-500">{readyCount}</span>
            <span className="text-slate-400 text-sm">/</span>
            <span className="text-emerald-500">{filedCount}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('Ready for Portal vs Filed Ack', 'पोर्टल हेतु तैयार बनाम फाइल रसीद')}
          </div>
        </div>
      </div>

      {/* Main Table and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search by Doc #, GSTIN, Party or TDS Ref...', 'दस्तावेज़ #, GSTIN, पार्टी या TDS से खोजें...')}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {t('Showing', 'प्रदर्शित')} <b>{filteredEntries.length}</b> {t('entries for', 'प्रविष्टियां')} <b>{selectedQuarter}</b>
            </span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">{t('Doc / Invoice Ref', 'दस्तावेज़ / इनवॉइस सं.')}</th>
                <th className="py-3 px-4">{t('Party Name & GSTIN', 'पार्टी का नाम व GSTIN')}</th>
                <th className="py-3 px-4">{t('Filing Type', 'फाइलिंग प्रकार')}</th>
                <th className="py-3 px-4 text-right">{t('Taxable Value', 'कर योग्य मूल्य')}</th>
                <th className="py-3 px-4 text-right">{t('GST Output', 'GST आउटपुट')}</th>
                <th className="py-3 px-4 text-right">{t('194C TDS', '194C TDS')}</th>
                <th className="py-3 px-4 text-center">{t('Status', 'स्थिति')}</th>
                <th className="py-3 px-4 text-right">{t('Action', 'कार्रवाई')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>{t('No tax records found matching your filters.', 'आपके फ़िल्टर से मेल खाता कोई रिकॉर्ड नहीं मिला।')}</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{item.documentReferenceNo}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{item.generatedTimestamp}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.partyLegalName}</div>
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {item.partyGstin}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.taxFilingType === 'Gstr1B2B' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                          GSTR-1 (B2B)
                        </span>
                      )}
                      {item.taxFilingType === 'Gstr3BMonthlySummary' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                          GSTR-3B ITC
                        </span>
                      )}
                      {item.taxFilingType === 'RcmFivePercent' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                          RCM 5% GTA
                        </span>
                      )}
                      {item.taxFilingType === 'Tds194C26As' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          Sec 194C TDS
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                      ₹{item.taxableFreightAmountInr.toLocaleString('en-IN')}
                      {item.rcmApplicable && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                          {t('(RCM Exempt)', '(RCM छूट)')}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {item.cgstAmountInr + item.sgstAmountInr + item.igstAmountInr > 0 ? (
                        <>
                          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ₹{(item.cgstAmountInr + item.sgstAmountInr + item.igstAmountInr).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.igstAmountInr > 0 ? `IGST ₹${item.igstAmountInr.toLocaleString('en-IN')}` : `C+S ₹${(item.cgstAmountInr + item.sgstAmountInr).toLocaleString('en-IN')}`}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">₹0 (RCM)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-semibold text-sky-600 dark:text-sky-400">
                        ₹{item.section194CTdsDeductedInr.toLocaleString('en-IN')}
                      </div>
                      {item.tdsCertificateNumber && (
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] ml-auto">
                          {item.tdsCertificateNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.filingStatus === 'FILED_ACKNOWLEDGED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('Filed', 'दायर किया')}
                        </span>
                      )}
                      {item.filingStatus === 'READY_FOR_PORTAL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          {t('Ready to File', 'फाइल हेतु तैयार')}
                        </span>
                      )}
                      {item.filingStatus === 'UNDER_RECONCILIATION' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800">
                          <RefreshCw className="w-3 h-3" />
                          {t('Reconciliation', 'सुलह प्रक्रिया')}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {item.filingStatus !== 'FILED_ACKNOWLEDGED' ? (
                        <button
                          onClick={() => {
                            setShowMarkFiledModal(item);
                            setAckRefInput(`GSTN-ARN-${Math.floor(10000000 + Math.random() * 90000000)}`);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 transition"
                        >
                          {t('Mark Filed', 'फाइल चिह्नित करें')}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {t('Acknowledged', 'स्वीकृत')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: New Tax Audit Entry */}
      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                {t('Add Tax Audit / GST Voucher', 'टैक्स ऑडिट / GST वाउचर जोड़ें')}
              </h3>
              <button
                onClick={() => setShowNewEntryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Filing Type', 'फाइलिंग प्रकार')}
                  </label>
                  <select
                    value={newEntry.taxFilingType}
                    onChange={(e) => setNewEntry({ ...newEntry, taxFilingType: e.target.value as GstTaxFilingType })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Gstr1B2B">GSTR-1 Outbound B2B Invoices</option>
                    <option value="Gstr3BMonthlySummary">GSTR-3B Monthly ITC Summary</option>
                    <option value="RcmFivePercent">RCM 5% GTA Reverse Charge</option>
                    <option value="Tds194C26As">Section 194C TDS (Form 26AS)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Quarter Period', 'तिमाही अवधि')}
                  </label>
                  <input
                    type="text"
                    value={newEntry.auditPeriodQuarter}
                    onChange={(e) => setNewEntry({ ...newEntry, auditPeriodQuarter: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Document Ref / Invoice No *', 'दस्तावेज़ संदर्भ / इनवॉइस सं. *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newEntry.documentReferenceNo}
                    onChange={(e) => setNewEntry({ ...newEntry, documentReferenceNo: e.target.value })}
                    placeholder="e.g. INV/2026/DEL-9910"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Party GSTIN', 'पार्टी GSTIN')}
                  </label>
                  <input
                    type="text"
                    value={newEntry.partyGstin}
                    onChange={(e) => setNewEntry({ ...newEntry, partyGstin: e.target.value.toUpperCase() })}
                    placeholder="e.g. 07AAACK1948Q1Z4"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none uppercase font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t('Party Legal Title *', 'पार्टी का कानूनी नाम *')}
                </label>
                <input
                  type="text"
                  required
                  value={newEntry.partyLegalName}
                  onChange={(e) => setNewEntry({ ...newEntry, partyLegalName: e.target.value })}
                  placeholder="e.g. Jindal Steel & Power Ltd"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Taxable Value (₹)', 'कर योग्य मूल्य (₹)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newEntry.taxableFreightAmountInr}
                    onChange={(e) => setNewEntry({ ...newEntry, taxableFreightAmountInr: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('CGST + SGST (₹)', 'CGST + SGST (₹)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newEntry.cgstAmountInr + newEntry.sgstAmountInr}
                    onChange={(e) => {
                      const half = Number(e.target.value) / 2;
                      setNewEntry({ ...newEntry, cgstAmountInr: half, sgstAmountInr: half });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('IGST (₹)', 'IGST (₹)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newEntry.igstAmountInr}
                    onChange={(e) => setNewEntry({ ...newEntry, igstAmountInr: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('Sec 194C TDS (₹)', 'धारा 194C TDS (₹)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newEntry.section194CTdsDeductedInr}
                    onChange={(e) => setNewEntry({ ...newEntry, section194CTdsDeductedInr: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('TDS Certificate / 26AS Ref', 'TDS प्रमाण पत्र सं.')}
                  </label>
                  <input
                    type="text"
                    value={newEntry.tdsCertificateNumber}
                    onChange={(e) => setNewEntry({ ...newEntry, tdsCertificateNumber: e.target.value })}
                    placeholder="e.g. TDS/26AS/OCT-102"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rcmToggle"
                  checked={newEntry.rcmApplicable}
                  onChange={(e) => setNewEntry({ ...newEntry, rcmApplicable: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="rcmToggle" className="text-slate-700 dark:text-slate-300 font-medium">
                  {t('RCM 5% Applicable (Consignee/Consignor Pays GST directly to Govt)', 'RCM 5% लागू (प्राप्तकर्ता/प्रेषक सीधे सरकार को GST चुकाते हैं)')}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewEntryModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md transition"
                >
                  {t('Save to Audit Ledger', 'ऑडिट लेजर में सहेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Mark Filed & ARN Acknowledgment */}
      {showMarkFiledModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {t('Confirm GSTN ARN Filing', 'GSTN ARN फाइलिंग की पुष्टि करें')}
              </h3>
              <button
                onClick={() => setShowMarkFiledModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <p>
                <b>{t('Document Ref:', 'दस्तावेज़ सं:')}</b> {showMarkFiledModal.documentReferenceNo}
              </p>
              <p>
                <b>{t('Party:', 'पार्टी:')}</b> {showMarkFiledModal.partyLegalName}
              </p>
              <p>
                <b>{t('Taxable Value:', 'कर योग्य मूल्य:')}</b> ₹{showMarkFiledModal.taxableFreightAmountInr.toLocaleString('en-IN')}
              </p>

              <div className="pt-2">
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t('GST Portal Filing ARN / Acknowledgment Ref *', 'GST पोर्टल फाइलिंग ARN / रसीद संख्या *')}
                </label>
                <input
                  type="text"
                  value={ackRefInput}
                  onChange={(e) => setAckRefInput(e.target.value)}
                  placeholder="e.g. AA071026001928M"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowMarkFiledModal(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {t('Cancel', 'रद्द करें')}
              </button>
              <button
                type="button"
                onClick={handleMarkFiledSubmit}
                disabled={!ackRefInput}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-50"
              >
                {t('Confirm Acknowledged', 'पुष्टि करें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
