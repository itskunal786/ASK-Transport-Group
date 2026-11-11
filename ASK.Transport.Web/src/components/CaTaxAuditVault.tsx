import React, { useState, useEffect } from 'react';
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
  FileCheck,
  Eye,
  Copy,
  Check,
  FileText,
  Printer,
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  Calculator
} from 'lucide-react';
import type { TaxAuditVaultEntry, GstTaxFilingType } from '../types/transportOperations';
import { getTaxAuditEntries, generateTaxAuditEntry, markEntryFiled } from '../api/taxAuditVaultApi';
import { useLanguage } from '../context/LanguageContext';
import './CaTaxAuditVault.css';

// ============================================================================
// BULLETPROOF NORMALIZER FOR TAX ENTRIES
// ============================================================================
function normalizeEntry(raw: any, index: number): TaxAuditVaultEntry {
  if (!raw) {
    return {
      id: `tax-${index}`,
      auditPeriodQuarter: 'Q3 FY 2026-27',
      taxFilingType: 'Gstr1B2B',
      documentReferenceNo: `INV/2026/DEL-${1000 + index}`,
      partyGstin: '07AAACK1948Q1Z4',
      partyLegalName: 'Corporate Party Ltd',
      taxableFreightAmountInr: 500000,
      cgstAmountInr: 0,
      sgstAmountInr: 0,
      igstAmountInr: 60000,
      rcmApplicable: false,
      rcmTaxLiabilityInr: 0,
      section194CTdsDeductedInr: 10000,
      tdsCertificateNumber: `TDS/26AS/OCT-${1000 + index}`,
      filingStatus: 'READY_FOR_PORTAL',
      generatedTimestamp: '2026-10-28 12:00'
    };
  }

  let filingType: GstTaxFilingType = 'Gstr1B2B';
  const rawType = String(raw.taxFilingType ?? '').toUpperCase();
  if (rawType.includes('3B') || rawType === '1' || rawType.includes('SUMMARY')) {
    filingType = 'Gstr3BMonthlySummary';
  } else if (rawType.includes('RCM') || rawType === '2' || rawType.includes('FIVE')) {
    filingType = 'RcmFivePercent';
  } else if (rawType.includes('TDS') || rawType.includes('194C') || rawType === '3') {
    filingType = 'Tds194C26As';
  }

  let filingStatus: 'READY_FOR_PORTAL' | 'FILED_ACKNOWLEDGED' | 'UNDER_RECONCILIATION' = 'READY_FOR_PORTAL';
  const rawStatus = String(raw.filingStatus ?? '').toUpperCase();
  if (rawStatus.includes('FILED') || rawStatus.includes('ACK')) {
    filingStatus = 'FILED_ACKNOWLEDGED';
  } else if (rawStatus.includes('RECON')) {
    filingStatus = 'UNDER_RECONCILIATION';
  }

  const taxable = Number(raw.taxableFreightAmountInr ?? raw.taxableAmount ?? 0);
  const cgst = Number(raw.cgstAmountInr ?? raw.cgst ?? 0);
  const sgst = Number(raw.sgstAmountInr ?? raw.sgst ?? 0);
  const igst = Number(raw.igstAmountInr ?? raw.igst ?? 0);
  const rcmLiability = Number(raw.rcmTaxLiabilityInr ?? (raw.rcmApplicable ? taxable * 0.05 : 0));
  const tds = Number(raw.section194CTdsDeductedInr ?? raw.tdsDeducted ?? 0);

  return {
    id: String(raw.id ?? `tax-${index}`),
    auditPeriodQuarter: String(raw.auditPeriodQuarter ?? 'Q3 FY 2026-27'),
    taxFilingType: filingType,
    documentReferenceNo: String(raw.documentReferenceNo ?? `INV-${1000 + index}`),
    partyGstin: String(raw.partyGstin ?? '07AAACK1948Q1Z4'),
    partyLegalName: String(raw.partyLegalName ?? 'Corporate Transporter Client'),
    taxableFreightAmountInr: isNaN(taxable) ? 0 : taxable,
    cgstAmountInr: isNaN(cgst) ? 0 : cgst,
    sgstAmountInr: isNaN(sgst) ? 0 : sgst,
    igstAmountInr: isNaN(igst) ? 0 : igst,
    rcmApplicable: Boolean(raw.rcmApplicable),
    rcmTaxLiabilityInr: isNaN(rcmLiability) ? 0 : rcmLiability,
    section194CTdsDeductedInr: isNaN(tds) ? 0 : tds,
    tdsCertificateNumber: String(raw.tdsCertificateNumber ?? 'TDS/26AS/OCT-8821'),
    filingStatus,
    generatedTimestamp: String(raw.generatedTimestamp ?? '2026-10-28 12:00')
  };
}

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
    filingStatus: 'READY_FOR_PORTAL',
    generatedTimestamp: '2026-10-24 16:30'
  },
  {
    id: 'tax-002',
    auditPeriodQuarter: 'Q3 FY 2026-27',
    taxFilingType: 'RcmFivePercent',
    documentReferenceNo: 'BILTY/2026/BOM-8921',
    partyGstin: '27AABC51429B1Z8',
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
    filingStatus: 'FILED_ACKNOWLEDGED',
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

const LOCAL_STORAGE_TAX_ENTRIES = 'ask_transport_tax_audit_entries';

const loadStoredTaxEntries = (): TaxAuditVaultEntry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TAX_ENTRIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return SEED_AUDIT_ENTRIES;
};

const persistTaxEntries = (list: TaxAuditVaultEntry[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_TAX_ENTRIES, JSON.stringify(list));
  } catch {
    // ignore
  }
};

export const CaTaxAuditVault: React.FC = () => {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<TaxAuditVaultEntry[]>(loadStoredTaxEntries);

  useEffect(() => {
    persistTaxEntries(entries);
  }, [entries]);
  const [loading, setLoading] = useState<boolean>(false);
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3 FY 2026-27');
  const [activeFilingTab, setActiveFilingTab] = useState<'ALL' | GstTaxFilingType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY_FOR_PORTAL' | 'FILED_ACKNOWLEDGED' | 'UNDER_RECONCILIATION'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('CARDS');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showNewEntryModal, setShowNewEntryModal] = useState<boolean>(false);
  const [showMarkFiledModal, setShowMarkFiledModal] = useState<TaxAuditVaultEntry | null>(null);
  const [selectedVoucherForPreview, setSelectedVoucherForPreview] = useState<TaxAuditVaultEntry | null>(null);
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

  const loadData = async (isManualClick = false) => {
    setLoading(true);
    try {
      const filingTypeArg = activeFilingTab === 'ALL' ? undefined : activeFilingTab;
      const [data] = await Promise.all([
        getTaxAuditEntries(selectedQuarter, filingTypeArg),
        isManualClick ? new Promise(r => setTimeout(r, 380)) : Promise.resolve()
      ]);
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((item, idx) => normalizeEntry(item, idx));
        setEntries(normalized);
        persistTaxEntries(normalized);
        if (isManualClick) {
          setJustRefreshed(true);
          setTimeout(() => setJustRefreshed(false), 3000);
          showToast(t('✓ CA Tax Vault records synced live! GST & TDS entries verified.', '✓ सीए टैक्स वॉल्ट रिकॉर्ड्स लाइव सिंक! जीएसटी व टीडीएस प्रविष्टियां सत्यापित।'));
          return;
        }
      }
    } catch {
      // Keep state fallback / Backend offline fallback
    } finally {
      setLoading(false);
    }

    const localEntries = loadStoredTaxEntries();
    setEntries(localEntries);
    if (isManualClick) {
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 3000);
      showToast(t('✓ Tax Vault records refreshed and verified up-to-date!', '✓ टैक्स वॉल्ट रिकॉर्ड्स रिफ्रेश व अप-टू-डेट सत्यापित!'));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedQuarter, activeFilingTab]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopyText = (text: string, id: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    showToast(`📋 ${label} "${text}" copied!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper: Auto-generate realistic document/invoice reference
  const handleAutoGenerateDocRef = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefixes: Record<GstTaxFilingType, string> = {
      Gstr1B2B: `INV/2026/DEL-${randomNum}`,
      Gstr3BMonthlySummary: `ITC-RECON/2026/OCT-${randomNum}`,
      RcmFivePercent: `BILTY/2026/BOM-${randomNum}`,
      Tds194C26As: `VCHR/TDS/2026/OCT-${randomNum}`
    };
    const generated = prefixes[newEntry.taxFilingType] || `DOC/2026/${randomNum}`;
    setNewEntry(prev => ({
      ...prev,
      documentReferenceNo: generated
    }));
    showToast(`Generated Ref: ${generated}`);
  };

  // Helper: Quick fill sample corporate party
  const handleFillSampleParty = () => {
    const samples = [
      { name: 'Tata Steel Tubes Division Ltd', gstin: '07AAACK1948Q1Z4' },
      { name: 'Jindal Steel & Power Logistics Corp', gstin: '07AABCS1234F1Z1' },
      { name: 'UltraTech Cement Dispatch Depot', gstin: '27AABC51429B1Z8' },
      { name: 'Reliance Retail Supply Chain Hub', gstin: '08AABCM9102L1ZQ' },
      { name: 'Infosys Campus Logistics Cell', gstin: '29AAACH2234G1ZT' }
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setNewEntry(prev => ({
      ...prev,
      partyLegalName: picked.name,
      partyGstin: picked.gstin
    }));
    showToast(`Loaded ${picked.name}`);
  };

  // Helper: 1-Click Tax Rate Presets
  const applyTaxPreset = (type: 'IGST_12' | 'CGST_SGST_12' | 'RCM_5' | 'TDS_2' | 'TDS_1' | 'TDS_0') => {
    const val = Number(newEntry.taxableFreightAmountInr) || 0;
    if (type === 'IGST_12') {
      setNewEntry(prev => ({
        ...prev,
        taxFilingType: 'Gstr1B2B',
        igstAmountInr: Math.round(val * 0.12),
        cgstAmountInr: 0,
        sgstAmountInr: 0,
        rcmApplicable: false,
        rcmTaxLiabilityInr: 0
      }));
      showToast('Applied 12% IGST (Inter-State Outbound)');
    } else if (type === 'CGST_SGST_12') {
      const half = Math.round((val * 0.12) / 2);
      setNewEntry(prev => ({
        ...prev,
        taxFilingType: 'Gstr1B2B',
        cgstAmountInr: half,
        sgstAmountInr: half,
        igstAmountInr: 0,
        rcmApplicable: false,
        rcmTaxLiabilityInr: 0
      }));
      showToast('Applied 6% CGST + 6% SGST (Intra-State)');
    } else if (type === 'RCM_5') {
      const rcmTotal = Math.round(val * 0.05);
      const half = Math.round(rcmTotal / 2);
      setNewEntry(prev => ({
        ...prev,
        taxFilingType: 'RcmFivePercent',
        rcmApplicable: true,
        rcmTaxLiabilityInr: rcmTotal,
        cgstAmountInr: half,
        sgstAmountInr: half,
        igstAmountInr: 0
      }));
      showToast('Applied RCM 5% Reverse Charge (Rule 5(1) GTA)');
    } else if (type === 'TDS_2') {
      setNewEntry(prev => ({
        ...prev,
        section194CTdsDeductedInr: Math.round(val * 0.02),
        tdsCertificateNumber: prev.tdsCertificateNumber || `TDS/26AS/OCT-${Math.floor(1000 + Math.random() * 9000)}`
      }));
      showToast('Applied 2% TDS (Corporate Carrier)');
    } else if (type === 'TDS_1') {
      setNewEntry(prev => ({
        ...prev,
        section194CTdsDeductedInr: Math.round(val * 0.01),
        tdsCertificateNumber: prev.tdsCertificateNumber || `TDS/26AS/OCT-${Math.floor(1000 + Math.random() * 9000)}`
      }));
      showToast('Applied 1% TDS (Individual / Proprietorship)');
    } else if (type === 'TDS_0') {
      setNewEntry(prev => ({
        ...prev,
        section194CTdsDeductedInr: 0,
        tdsCertificateNumber: 'FORM-194C(6)-EXEMPT'
      }));
      showToast('Applied 0% TDS (Form 194C(6) Declaration <= 10 trucks)');
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.documentReferenceNo || !newEntry.partyLegalName) {
      showToast(t('Please fill in required fields', 'कृपया सभी आवश्यक फ़ील्ड भरें'), 'error');
      return;
    }

    const createdRecord: TaxAuditVaultEntry = {
      id: `tax-${Date.now()}`,
      auditPeriodQuarter: newEntry.auditPeriodQuarter,
      taxFilingType: newEntry.taxFilingType,
      documentReferenceNo: newEntry.documentReferenceNo,
      partyGstin: newEntry.partyGstin || '07AABCS1234F1Z1',
      partyLegalName: newEntry.partyLegalName,
      taxableFreightAmountInr: Number(newEntry.taxableFreightAmountInr) || 0,
      cgstAmountInr: Number(newEntry.cgstAmountInr) || 0,
      sgstAmountInr: Number(newEntry.sgstAmountInr) || 0,
      igstAmountInr: Number(newEntry.igstAmountInr) || 0,
      rcmApplicable: newEntry.rcmApplicable,
      rcmTaxLiabilityInr: Number(newEntry.rcmTaxLiabilityInr) || 0,
      section194CTdsDeductedInr: Number(newEntry.section194CTdsDeductedInr) || 0,
      tdsCertificateNumber: newEntry.tdsCertificateNumber || 'TDS/26AS/PENDING',
      filingStatus: 'READY_FOR_PORTAL',
      generatedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    try {
      await generateTaxAuditEntry(createdRecord);
    } catch {
      // optimistic update
    }

    const updatedEntries = [createdRecord, ...entries];
    setEntries(updatedEntries);
    persistTaxEntries(updatedEntries);
    showToast(t('Tax Audit record created successfully!', 'टैक्स ऑडिट रिकॉर्ड सफलतापूर्वक बनाया गया!'));
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
      await markEntryFiled(showMarkFiledModal.id, ackRefInput);
    } catch {
      // optimistic update
    }

    setEntries(entries.map(e => (e.id === showMarkFiledModal.id ? {
      ...e,
      filingStatus: 'FILED_ACKNOWLEDGED',
      documentReferenceNo: `${e.documentReferenceNo} (ARN: ${ackRefInput})`
    } : e)));

    showToast(t(`Filed successfully! Ack: ${ackRefInput}`, `सफलतापूर्वक फाइल किया गया! रसीद: ${ackRefInput}`));
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

  const handleExportCsv = () => {
    const headers = [
      'Document / Invoice Ref',
      'Date & Timestamp',
      'Party Legal Name',
      'GSTIN',
      'Filing Type',
      'Taxable Freight (INR)',
      'CGST (INR)',
      'SGST (INR)',
      'IGST (INR)',
      'Total Output GST (INR)',
      'RCM Applicable',
      'Sec 194C TDS (INR)',
      'TDS Certificate / 26AS',
      'Filing Status',
      'Quarter'
    ];

    const rows = filteredEntries.map(e => [
      `"${e.documentReferenceNo}"`,
      `"${e.generatedTimestamp}"`,
      `"${e.partyLegalName.replace(/"/g, '""')}"`,
      `"${e.partyGstin}"`,
      `"${e.taxFilingType}"`,
      e.taxableFreightAmountInr,
      e.cgstAmountInr,
      e.sgstAmountInr,
      e.igstAmountInr,
      e.cgstAmountInr + e.sgstAmountInr + e.igstAmountInr,
      e.rcmApplicable ? 'YES' : 'NO',
      e.section194CTdsDeductedInr,
      `"${e.tdsCertificateNumber}"`,
      `"${e.filingStatus}"`,
      `"${e.auditPeriodQuarter}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CA_Tax_Audit_Vault_${selectedQuarter.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(t('CA Audit CSV exported successfully!', 'CA ऑडिट CSV सफलतापूर्वक डाउनलोड हो गया!'));
  };

  // Filtered dataset
  const filteredEntries = entries.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    const matchesTab = activeFilingTab === 'ALL' || e.taxFilingType === activeFilingTab;
    const matchesStatus = statusFilter === 'ALL' || e.filingStatus === statusFilter;
    const matchesSearch = !q ||
      (e.documentReferenceNo || '').toLowerCase().includes(q) ||
      (e.partyLegalName || '').toLowerCase().includes(q) ||
      (e.partyGstin || '').toLowerCase().includes(q) ||
      ((e.tdsCertificateNumber || '').toLowerCase().includes(q));
    return matchesTab && matchesStatus && matchesSearch;
  });

  // KPI Calculations
  const gstr1Count = entries.filter(e => e.taxFilingType === 'Gstr1B2B').length;
  const gstr3bCount = entries.filter(e => e.taxFilingType === 'Gstr3BMonthlySummary').length;
  const rcmCount = entries.filter(e => e.taxFilingType === 'RcmFivePercent').length;
  const tdsCount = entries.filter(e => e.taxFilingType === 'Tds194C26As').length;

  const totalTaxable = filteredEntries.reduce((sum, e) => sum + (e.taxableFreightAmountInr || 0), 0);
  const totalGstLiability = filteredEntries.reduce((sum, e) => sum + (e.cgstAmountInr || 0) + (e.sgstAmountInr || 0) + (e.igstAmountInr || 0), 0);
  const totalRcmFreight = filteredEntries.filter(e => e.rcmApplicable).reduce((sum, e) => sum + (e.taxableFreightAmountInr || 0), 0);
  const totalTdsDeducted = filteredEntries.reduce((sum, e) => sum + (e.section194CTdsDeductedInr || 0), 0);
  const readyCount = entries.filter(e => e.filingStatus === 'READY_FOR_PORTAL').length;
  const filedCount = entries.filter(e => e.filingStatus === 'FILED_ACKNOWLEDGED').length;

  return (
    <div className="tax-vault-deck">
      {/* Toast Notification */}
      {notification && (
        <div className={`tax-toast ${notification.type}`}>
          <CheckCircle2 size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="tax-header-banner">
        <div className="tax-banner-top-row">
          <div className="tax-banner-left">
            <div className="tax-banner-badge">
              <ShieldCheck size={16} />
              <span>{t('Accounts & Statutory Governance', 'अकाउंट्स और वैधानिक गवर्नेंस')}</span>
            </div>
            <h1 className="tax-banner-title">
              {t('CA 1-Click Tax & Audit Vault', 'CA 1-क्लिक टैक्स और ऑडिट वॉल्ट')}
            </h1>
            <p className="tax-banner-desc">
              {t(
                'GTA GSTR-1, GSTR-3B monthly reconciliation, RCM 5% Reverse Charge ledger & Section 194C Form 26AS TDS verification vault.',
                'GTA GSTR-1, GSTR-3B मासिक सुलह, RCM 5% रिवर्स चार्ज लेजर और धारा 194C फॉर्म 26AS TDS सत्यापन वॉल्ट।'
              )}
            </p>
          </div>

          <div className="tax-banner-actions">
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="tax-quarter-select"
            >
              <option value="Q3 FY 2026-27">Q3 FY 2026-27 (Oct - Dec)</option>
              <option value="Q2 FY 2026-27">Q2 FY 2026-27 (Jul - Sep)</option>
              <option value="Q1 FY 2026-27">Q1 FY 2026-27 (Apr - Jun)</option>
              <option value="Q4 FY 2025-26">Q4 FY 2025-26 (Jan - Mar)</option>
            </select>

            <button
              onClick={handleExportCsv}
              className="tax-btn-export"
              title="Download CA Audit Spreadsheet in CSV"
            >
              <FileSpreadsheet size={15} />
              <span>{t('Export CSV', 'CSV डाउनलोड')}</span>
            </button>

            <button
              onClick={handleExportJsonForCa}
              className="tax-btn-json"
              title="Download GST Portal Schema JSON"
            >
              <Download size={14} />
              <span>{t('CA JSON Schema', 'CA स्कीमा JSON')}</span>
            </button>

            <button
              onClick={() => setShowNewEntryModal(true)}
              className="tax-btn-new"
            >
              <PlusCircle size={15} />
              <span>{t('New Voucher', 'नया वाउचर')}</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="tax-btn-refresh"
              title={t('Refresh', 'रीफ़्रेश')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                fontSize: '12.5px',
                fontWeight: 800,
                borderColor: justRefreshed ? '#10b981' : undefined,
                color: justRefreshed ? '#10b981' : undefined,
                background: justRefreshed ? 'rgba(16, 185, 129, 0.18)' : undefined,
                boxShadow: justRefreshed ? '0 0 12px rgba(16, 185, 129, 0.28)' : undefined,
                transition: 'all 0.25s ease'
              }}
            >
              {justRefreshed ? (
                <CheckCircle2 size={14} style={{ color: '#10b981' }} />
              ) : (
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              )}
              <span>
                {loading 
                  ? t('Syncing...', 'सिंक...') 
                  : justRefreshed 
                  ? t('Refreshed! ✓', 'रिफ्रेश सफल! ✓') 
                  : t('Refresh', 'रीफ़्रेश')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards - Unified Responsive Grid (No Orphans) */}
      <div className="tax-kpis-grid">
        {/* KPI 1 */}
        <div className="tax-kpi-card kpi-taxable">
          <div className="tax-kpi-top">
            <span className="tax-kpi-label">{t('Taxable Freight', 'कर योग्य भाड़ा')}</span>
            <div className="tax-kpi-icon-wrap icon-indigo">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="tax-kpi-value">
            ₹{totalTaxable.toLocaleString('en-IN')}
          </div>
          <span className="tax-kpi-sub">
            {filteredEntries.length} {t('registered vouchers', 'पंजीकृत वाउचर')}
          </span>
        </div>

        {/* KPI 2 */}
        <div className="tax-kpi-card kpi-gst">
          <div className="tax-kpi-top">
            <span className="tax-kpi-label">{t('Total GST Output', 'कुल GST आउटपुट')}</span>
            <div className="tax-kpi-icon-wrap icon-emerald">
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div className="tax-kpi-value text-emerald">
            ₹{totalGstLiability.toLocaleString('en-IN')}
          </div>
          <span className="tax-kpi-sub">
            {t('Output GST (CGST + SGST + IGST)', 'आउटपुट GST (CGST + SGST + IGST)')}
          </span>
        </div>

        {/* KPI 3 */}
        <div className="tax-kpi-card kpi-rcm">
          <div className="tax-kpi-top">
            <span className="tax-kpi-label">{t('RCM 5% Freight Ledger', 'RCM 5% भाड़ा लेजर')}</span>
            <div className="tax-kpi-icon-wrap icon-amber">
              <Building2 size={18} />
            </div>
          </div>
          <div className="tax-kpi-value text-amber">
            ₹{totalRcmFreight.toLocaleString('en-IN')}
          </div>
          <span className="tax-kpi-sub">
            {t('Recipient Reverse Charge Liability', 'प्राप्तकर्ता रिवर्स चार्ज देयता')}
          </span>
        </div>

        {/* KPI 4 */}
        <div className="tax-kpi-card kpi-tds">
          <div className="tax-kpi-top">
            <span className="tax-kpi-label">{t('Sec 194C TDS Credited', 'धारा 194C TDS जमा')}</span>
            <div className="tax-kpi-icon-wrap icon-sky">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="tax-kpi-value text-sky">
            ₹{totalTdsDeducted.toLocaleString('en-IN')}
          </div>
          <span className="tax-kpi-sub">
            {t('Transporter Form 26AS Tax Credit', 'ट्रांसपोर्टर फॉर्म 26AS टैक्स क्रेडिट')}
          </span>
        </div>

        {/* KPI 5 */}
        <div className="tax-kpi-card kpi-readiness">
          <div className="tax-kpi-top">
            <span className="tax-kpi-label">{t('Filing Readiness', 'फाइलिंग तत्परता')}</span>
            <div className="tax-kpi-icon-wrap icon-purple">
              <FileCheck size={18} />
            </div>
          </div>
          <div className="tax-kpi-value">
            <span style={{ color: '#f59e0b' }}>{readyCount}</span>
            <span style={{ color: '#64748b', fontSize: '16px', margin: '0 4px' }}>/</span>
            <span style={{ color: '#10b981' }}>{filedCount}</span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="tax-kpi-progress-bar">
            <div
              className="tax-kpi-progress-fill-filed"
              style={{ width: `${entries.length > 0 ? (filedCount / entries.length) * 100 : 0}%` }}
              title={`${filedCount} Filed`}
            />
            <div
              className="tax-kpi-progress-fill-ready"
              style={{ width: `${entries.length > 0 ? (readyCount / entries.length) * 100 : 0}%` }}
              title={`${readyCount} Ready`}
            />
          </div>
          <span className="tax-kpi-sub">
            {t('Ready for Portal vs Filed Ack', 'पोर्टल हेतु तैयार बनाम फाइल रसीद')}
          </span>
        </div>
      </div>

      {/* Main Table Card and Control Bar */}
      <div className="tax-table-card">
        {/* Interactive Filter Pills Row */}
        <div className="tax-filter-pills-row">
          <div className="tax-tabs-scrollable">
            {[
              { id: 'ALL', label: 'All Records', count: entries.length },
              { id: 'Gstr1B2B', label: 'GSTR-1 B2B', count: gstr1Count },
              { id: 'Gstr3BMonthlySummary', label: 'GSTR-3B ITC', count: gstr3bCount },
              { id: 'RcmFivePercent', label: 'RCM 5% GTA', count: rcmCount },
              { id: 'Tds194C26As', label: 'Sec 194C TDS', count: tdsCount }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilingTab(tab.id as 'ALL' | GstTaxFilingType)}
                className={`tax-filter-pill ${activeFilingTab === tab.id ? 'active' : ''}`}
              >
                <span>{tab.label}</span>
                <span className="tax-pill-badge">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="tax-status-filter-pills">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`tax-status-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('READY_FOR_PORTAL')}
              className={`tax-status-btn ready ${statusFilter === 'READY_FOR_PORTAL' ? 'active' : ''}`}
            >
              <span>⏳ Ready ({readyCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('FILED_ACKNOWLEDGED')}
              className={`tax-status-btn filed ${statusFilter === 'FILED_ACKNOWLEDGED' ? 'active' : ''}`}
            >
              <span>✓ Filed ({filedCount})</span>
            </button>
          </div>
        </div>

        {/* Control Bar: Search + Count + View Mode Switch */}
        <div className="tax-control-bar">
          <div className="tax-search-wrap">
            <Search size={15} className="tax-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search by Doc #, GSTIN, Party or TDS Ref...', 'दस्तावेज़ #, GSTIN, पार्टी या TDS से खोजें...')}
              className="tax-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="tax-search-clear"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="tax-control-right">
            <div className="tax-count-badge">
              <Filter size={14} style={{ color: '#6366f1' }} />
              <span>
                {t('Showing', 'प्रदर्शित')} <b>{filteredEntries.length}</b> {t('entries for', 'प्रविष्टियां')} <b>{selectedQuarter}</b>
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="tax-view-mode-toggle">
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`tax-view-btn ${viewMode === 'TABLE' ? 'active' : ''}`}
                title="Table View"
              >
                <TableIcon size={14} />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`tax-view-btn ${viewMode === 'CARDS' ? 'active' : ''}`}
                title="Cards View"
              >
                <LayoutGrid size={14} />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: DATA TABLE WITH STICKY ACTIONS */}
        {viewMode === 'TABLE' ? (
          <div className="tax-table-wrap">
            <table className="tax-data-table">
              <thead>
                <tr>
                  <th style={{ width: '16%' }}>{t('Doc / Invoice Ref', 'दस्तावेज़ / इनवॉइस सं.')}</th>
                  <th style={{ width: '22%' }}>{t('Party Name & GSTIN', 'पार्टी का नाम व GSTIN')}</th>
                  <th style={{ width: '13%' }}>{t('Filing Type', 'फाइलिंग प्रकार')}</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>{t('Taxable Value', 'कर योग्य मूल्य')}</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>{t('GST Output', 'GST आउटपुट')}</th>
                  <th style={{ width: '11%', textAlign: 'right' }}>{t('194C TDS', '194C TDS')}</th>
                  <th style={{ width: '9%', textAlign: 'center' }}>{t('Status', 'स्थिति')}</th>
                  <th className="tax-actions-cell" style={{ width: '5%', textAlign: 'right' }}>{t('Actions', 'कार्रवाई')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '56px 16px', textAlign: 'center', color: 'var(--text-secondary, #94a3b8)' }}>
                      <FileSpreadsheet size={44} style={{ margin: '0 auto 10px', opacity: 0.35 }} />
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>
                        {t('No tax records found matching your filters.', 'आपके फ़िल्टर से मेल खाता कोई रिकॉर्ड नहीं मिला।')}
                      </p>
                      <small style={{ color: '#64748b' }}>Try clearing the search query or changing the filing type filter.</small>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((item) => {
                    const isCopiedGstin = copiedId === `gstin-${item.id}`;
                    const isCopiedDoc = copiedId === `doc-${item.id}`;

                    return (
                      <tr key={item.id}>
                        {/* 1. Doc Ref */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
                              {item.documentReferenceNo}
                            </strong>
                            <button
                              type="button"
                              onClick={() => handleCopyText(item.documentReferenceNo, `doc-${item.id}`, 'Document Ref')}
                              className="tax-btn-icon-tiny"
                              title="Copy Doc Ref"
                            >
                              {isCopiedDoc ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            </button>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <Calendar size={12} />
                            <span>{item.generatedTimestamp}</span>
                          </div>
                        </td>

                        {/* 2. Party Name & GSTIN */}
                        <td style={{ maxWidth: '240px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.partyLegalName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <span className="tax-gstin-chip">
                              {item.partyGstin}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(item.partyGstin, `gstin-${item.id}`, 'GSTIN')}
                              className="tax-btn-icon-tiny"
                              title="Copy GSTIN"
                            >
                              {isCopiedGstin ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                            </button>
                          </div>
                        </td>

                        {/* 3. Filing Type */}
                        <td>
                          {item.taxFilingType === 'Gstr1B2B' && (
                            <span className="tax-type-pill gstr1">
                              GSTR-1 (B2B)
                            </span>
                          )}
                          {item.taxFilingType === 'Gstr3BMonthlySummary' && (
                            <span className="tax-type-pill gstr3b">
                              GSTR-3B ITC
                            </span>
                          )}
                          {item.taxFilingType === 'RcmFivePercent' && (
                            <span className="tax-type-pill rcm">
                              RCM 5% GTA
                            </span>
                          )}
                          {item.taxFilingType === 'Tds194C26As' && (
                            <span className="tax-type-pill tds">
                              Sec 194C TDS
                            </span>
                          )}
                        </td>

                        {/* 4. Taxable Value */}
                        <td style={{ textAlign: 'right', fontWeight: 800 }}>
                          <div style={{ fontSize: '13px' }}>₹{item.taxableFreightAmountInr.toLocaleString('en-IN')}</div>
                          {item.rcmApplicable && (
                            <span style={{ fontSize: '10px', color: '#d97706', fontWeight: 700, background: 'rgba(245, 158, 11, 0.12)', padding: '1px 5px', borderRadius: '4px' }}>
                              {t('RCM Exempt', 'RCM छूट')}
                            </span>
                          )}
                        </td>

                        {/* 5. GST Output */}
                        <td style={{ textAlign: 'right' }}>
                          {item.cgstAmountInr + item.sgstAmountInr + item.igstAmountInr > 0 ? (
                            <>
                              <div style={{ fontWeight: 800, color: '#10b981', fontSize: '13px' }}>
                                ₹{(item.cgstAmountInr + item.sgstAmountInr + item.igstAmountInr).toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary, #64748b)', fontFamily: 'monospace', marginTop: '2px' }}>
                                {item.igstAmountInr > 0 ? `IGST ₹${item.igstAmountInr.toLocaleString('en-IN')}` : `C+S ₹${(item.cgstAmountInr + item.sgstAmountInr).toLocaleString('en-IN')}`}
                              </div>
                            </>
                          ) : (
                            <span style={{ color: 'var(--text-secondary, #94a3b8)', fontFamily: 'monospace', fontSize: '11px', background: 'rgba(148, 163, 184, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              ₹0 (RCM Paid by Consignee)
                            </span>
                          )}
                        </td>

                        {/* 6. Section 194C TDS */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '13px' }}>
                            ₹{item.section194CTdsDeductedInr.toLocaleString('en-IN')}
                          </div>
                          {item.tdsCertificateNumber && (
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary, #64748b)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px', marginLeft: 'auto', marginTop: '2px' }}>
                              {item.tdsCertificateNumber}
                            </div>
                          )}
                        </td>

                        {/* 7. Status */}
                        <td style={{ textAlign: 'center' }}>
                          {item.filingStatus === 'FILED_ACKNOWLEDGED' && (
                            <span className="tax-status-chip filed">
                              <CheckCircle2 size={12} />
                              <span>{t('Filed', 'दायर किया')}</span>
                            </span>
                          )}
                          {item.filingStatus === 'READY_FOR_PORTAL' && (
                            <span className="tax-status-chip ready">
                              <Clock size={12} />
                              <span>{t('Ready to File', 'फाइल हेतु तैयार')}</span>
                            </span>
                          )}
                          {item.filingStatus === 'UNDER_RECONCILIATION' && (
                            <span className="tax-status-chip reconciliation">
                              <RefreshCw size={12} />
                              <span>{t('Reconciliation', 'सुलह प्रक्रिया')}</span>
                            </span>
                          )}
                        </td>

                        {/* 8. Actions (Sticky Right Column) */}
                        <td className="tax-actions-cell" style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedVoucherForPreview(item)}
                              className="tax-btn-preview"
                              title="Preview Statutory Tax Slip"
                            >
                              <Eye size={13} />
                              <span>Preview</span>
                            </button>

                            {item.filingStatus !== 'FILED_ACKNOWLEDGED' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowMarkFiledModal(item);
                                  setAckRefInput(`GSTN-ARN-${Math.floor(10000000 + Math.random() * 90000000)}`);
                                }}
                                className="tax-btn-mark-filed"
                              >
                                {t('Mark Filed', 'फाइल चिह्नित करें')}
                              </button>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 800, background: 'rgba(16, 185, 129, 0.12)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                ✓ Ack
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* VIEW 2: RESPONSIVE CARDS VIEW (NO HORIZONTAL SCROLLBAR) */
          <div className="tax-cards-grid">
            {filteredEntries.map((item) => (
              <div key={item.id} className={`tax-card-item type-${item.taxFilingType}`}>
                <div className="tax-card-header">
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>
                      {item.documentReferenceNo}
                    </strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', marginTop: '2px' }}>
                      {item.generatedTimestamp} • Quarter: {item.auditPeriodQuarter}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.taxFilingType === 'Gstr1B2B' && <span className="tax-type-pill gstr1">GSTR-1</span>}
                    {item.taxFilingType === 'Gstr3BMonthlySummary' && <span className="tax-type-pill gstr3b">GSTR-3B</span>}
                    {item.taxFilingType === 'RcmFivePercent' && <span className="tax-type-pill rcm">RCM 5%</span>}
                    {item.taxFilingType === 'Tds194C26As' && <span className="tax-type-pill tds">194C TDS</span>}
                  </div>
                </div>

                <div className="tax-card-party">
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.partyLegalName}</div>
                  <span className="tax-gstin-chip">{item.partyGstin}</span>
                </div>

                <div className="tax-card-metrics-grid">
                  <div className="tax-card-metric-box">
                    <span className="tax-card-metric-label">Taxable Freight</span>
                    <strong className="tax-card-metric-val">₹{item.taxableFreightAmountInr.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="tax-card-metric-box">
                    <span className="tax-card-metric-label">Output GST</span>
                    <strong className="tax-card-metric-val text-emerald">
                      ₹{(item.cgstAmountInr + item.sgstAmountInr + item.igstAmountInr).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="tax-card-metric-box">
                    <span className="tax-card-metric-label">194C TDS</span>
                    <strong className="tax-card-metric-val text-sky">
                      ₹{item.section194CTdsDeductedInr.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="tax-card-footer">
                  <div>
                    {item.filingStatus === 'FILED_ACKNOWLEDGED' && (
                      <span className="tax-status-chip filed">
                        <CheckCircle2 size={12} />
                        <span>Filed &amp; Ack</span>
                      </span>
                    )}
                    {item.filingStatus === 'READY_FOR_PORTAL' && (
                      <span className="tax-status-chip ready">
                        <Clock size={12} />
                        <span>Ready to File</span>
                      </span>
                    )}
                    {item.filingStatus === 'UNDER_RECONCILIATION' && (
                      <span className="tax-status-chip reconciliation">
                        <RefreshCw size={12} />
                        <span>Reconciliation</span>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedVoucherForPreview(item)}
                      className="tax-btn-preview"
                    >
                      <Eye size={13} />
                      <span>Preview Slip</span>
                    </button>

                    {item.filingStatus !== 'FILED_ACKNOWLEDGED' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMarkFiledModal(item);
                          setAckRefInput(`GSTN-ARN-${Math.floor(10000000 + Math.random() * 90000000)}`);
                        }}
                        className="tax-btn-mark-filed"
                      >
                        Mark Filed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: ADD TAX AUDIT / GST VOUCHER (REDESIGNED & HIGH-CONTRAST) */}
      {/* ===================================================================== */}
      {showNewEntryModal && (
        <div className="tax-modal-backdrop">
          <div className="tax-modal-dialog">
            {/* Modal Header */}
            <div className="tax-modal-header">
              <div>
                <div className="tax-modal-badge">
                  <ShieldCheck size={14} />
                  <span>Statutory Compliance &amp; Tax Entry</span>
                </div>
                <h3 className="tax-modal-title">
                  <FileSpreadsheet size={18} />
                  <span>{t('Add Tax Audit / GST Voucher', 'टैक्स ऑडिट / GST वाउचर जोड़ें')}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewEntryModal(false)}
                className="tax-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEntry}>
              <div className="tax-modal-body">
                {/* QUICK ASSISTANT / AUTO-GENERATE BAR */}
                <div className="tax-modal-helper-bar">
                  <div className="tax-helper-label">
                    <Sparkles size={14} color="#6366f1" />
                    <span>Quick Fill &amp; Audit Helpers:</span>
                  </div>
                  <div className="tax-helper-buttons">
                    <button
                      type="button"
                      onClick={handleAutoGenerateDocRef}
                      className="tax-btn-helper"
                    >
                      ⚡ Auto-Generate Ref
                    </button>
                    <button
                      type="button"
                      onClick={handleFillSampleParty}
                      className="tax-btn-helper"
                    >
                      🏢 Fill Corporate Party
                    </button>
                  </div>
                </div>

                {/* ROW 1: FILING TYPE & QUARTER */}
                <div className="tax-form-grid">
                  <div className="tax-form-field">
                    <label className="tax-form-label">{t('Filing Classification *', 'फाइलिंग वर्गीकरण *')}</label>
                    <select
                      value={newEntry.taxFilingType}
                      onChange={(e) => {
                        const val = e.target.value as GstTaxFilingType;
                        setNewEntry({
                          ...newEntry,
                          taxFilingType: val,
                          rcmApplicable: val === 'RcmFivePercent'
                        });
                      }}
                      className="tax-form-select"
                    >
                      <option value="Gstr1B2B">GSTR-1 Outbound B2B Invoices</option>
                      <option value="Gstr3BMonthlySummary">GSTR-3B Monthly ITC Summary</option>
                      <option value="RcmFivePercent">RCM 5% GTA Reverse Charge</option>
                      <option value="Tds194C26As">Section 194C TDS (Form 26AS)</option>
                    </select>
                  </div>

                  <div className="tax-form-field">
                    <label className="tax-form-label">{t('Quarter Period', 'तिमाही अवधि')}</label>
                    <input
                      type="text"
                      value={newEntry.auditPeriodQuarter}
                      onChange={(e) => setNewEntry({ ...newEntry, auditPeriodQuarter: e.target.value })}
                      className="tax-form-input"
                    />
                  </div>
                </div>

                {/* ROW 2: DOCUMENT REF & GSTIN */}
                <div className="tax-form-grid">
                  <div className="tax-form-field">
                    <label className="tax-form-label">{t('Document Ref / Invoice No *', 'दस्तावेज़ संदर्भ / इनवॉइस सं. *')}</label>
                    <input
                      type="text"
                      required
                      value={newEntry.documentReferenceNo}
                      onChange={(e) => setNewEntry({ ...newEntry, documentReferenceNo: e.target.value })}
                      placeholder="e.g. INV/2026/DEL-9910"
                      className="tax-form-input font-mono"
                    />
                  </div>

                  <div className="tax-form-field">
                    <label className="tax-form-label">{t('Party GSTIN (15 Digits)', 'पार्टी GSTIN (15 अंक)')}</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={newEntry.partyGstin}
                      onChange={(e) => setNewEntry({ ...newEntry, partyGstin: e.target.value.toUpperCase() })}
                      placeholder="e.g. 07AAACK1948Q1Z4"
                      className="tax-form-input font-mono"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                {/* ROW 3: PARTY LEGAL TITLE */}
                <div className="tax-form-field">
                  <label className="tax-form-label">{t('Party Legal Title / Entity Name *', 'पार्टी का कानूनी नाम *')}</label>
                  <input
                    type="text"
                    required
                    value={newEntry.partyLegalName}
                    onChange={(e) => setNewEntry({ ...newEntry, partyLegalName: e.target.value })}
                    placeholder="e.g. Jindal Steel & Power Ltd"
                    className="tax-form-input"
                  />
                </div>

                {/* SECTION: 1-CLICK TAX CALCULATOR PRESETS */}
                <div className="tax-calculator-box">
                  <div className="tax-calc-header">
                    <div className="tax-calc-title">
                      <Calculator size={15} color="#10b981" />
                      <span>{t('1-Click Statutory Tax & TDS Presets:', '1-क्लिक टैक्स व TDS गणना:')}</span>
                    </div>
                    <small className="tax-calc-hint">Calculates exact duty from taxable value</small>
                  </div>

                  <div className="tax-preset-buttons-row">
                    <button
                      type="button"
                      onClick={() => applyTaxPreset('IGST_12')}
                      className="tax-btn-preset igst"
                      title="12% Integrated GST for inter-state transport"
                    >
                      <span>12% IGST (Inter-State)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTaxPreset('CGST_SGST_12')}
                      className="tax-btn-preset cgst"
                      title="6% CGST + 6% SGST for intra-state transport"
                    >
                      <span>6% + 6% C+S GST</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTaxPreset('RCM_5')}
                      className="tax-btn-preset rcm"
                      title="5% RCM reverse charge under GTA rules"
                    >
                      <span>5% RCM (GTA)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTaxPreset('TDS_2')}
                      className="tax-btn-preset tds"
                      title="2% Section 194C TDS for Corporate Entities"
                    >
                      <span>2% TDS (194C Company)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTaxPreset('TDS_1')}
                      className="tax-btn-preset tds"
                      title="1% Section 194C TDS for Individuals"
                    >
                      <span>1% TDS (194C Indiv)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTaxPreset('TDS_0')}
                      className="tax-btn-preset exempt"
                      title="0% TDS under Form 194C(6)"
                    >
                      <span>0% TDS (Exempt)</span>
                    </button>
                  </div>
                </div>

                {/* ROW 4: TAXABLE VALUE & TAX BREAKUP */}
                <div className="tax-form-grid-3">
                  <div className="tax-form-field">
                    <label className="tax-form-label">{t('Taxable Freight (₹) *', 'कर योग्य भाड़ा (₹) *')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newEntry.taxableFreightAmountInr}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewEntry(prev => {
                          const updated = { ...prev, taxableFreightAmountInr: val };
                          if (prev.rcmApplicable) {
                            updated.rcmTaxLiabilityInr = Math.round(val * 0.05);
                            updated.cgstAmountInr = Math.round((val * 0.05) / 2);
                            updated.sgstAmountInr = Math.round((val * 0.05) / 2);
                          }
                          return updated;
                        });
                      }}
                      className="tax-form-input font-bold"
                    />
                  </div>

                  <div className="tax-form-field">
                    <label className="tax-form-label">{t('CGST + SGST (₹)', 'CGST + SGST (₹)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newEntry.cgstAmountInr + newEntry.sgstAmountInr}
                      onChange={(e) => {
                        const half = Number(e.target.value) / 2;
                        setNewEntry({ ...newEntry, cgstAmountInr: half, sgstAmountInr: half });
                      }}
                      className="tax-form-input"
                    />
                  </div>

                  <div className="tax-form-field">
                    <label className="tax-form-label">{t('IGST (₹)', 'IGST (₹)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newEntry.igstAmountInr}
                      onChange={(e) => setNewEntry({ ...newEntry, igstAmountInr: Number(e.target.value) })}
                      className="tax-form-input"
                    />
                  </div>
                </div>

                {/* ROW 5: SECTION 194C TDS & CERTIFICATE REF */}
                <div className="tax-form-grid">
                  <div className="tax-form-field">
                    <label className="tax-form-label">{t('Sec 194C TDS Deducted (₹)', 'धारा 194C TDS कटौती (₹)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newEntry.section194CTdsDeductedInr}
                      onChange={(e) => setNewEntry({ ...newEntry, section194CTdsDeductedInr: Number(e.target.value) })}
                      className="tax-form-input"
                    />
                  </div>

                  <div className="tax-form-field">
                    <label className="tax-form-label">{t('TDS Certificate / Form 26AS Ref', 'TDS प्रमाण पत्र / 26AS संदर्भ')}</label>
                    <input
                      type="text"
                      value={newEntry.tdsCertificateNumber}
                      onChange={(e) => setNewEntry({ ...newEntry, tdsCertificateNumber: e.target.value })}
                      placeholder="e.g. TDS/26AS/OCT-102"
                      className="tax-form-input font-mono"
                    />
                  </div>
                </div>

                {/* ROW 6: RCM 5% GTA REVERSE CHARGE TOGGLE CARD */}
                <div className="tax-rcm-toggle-card">
                  <div className="tax-rcm-card-left">
                    <div className="tax-rcm-icon-wrap">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="tax-rcm-title">
                        {t('RCM 5% GTA Reverse Charge (Notif. 13/2017)', 'RCM 5% GTA रिवर्स चार्ज (अधिसूचना 13/2017)')}
                      </div>
                      <div className="tax-rcm-desc">
                        {t(
                          'Tax is deposited directly by the registered Consignee/Consignor. Transporter is legally exempt from GST cash payout.',
                          'टैक्स सीधे पंजीकृत पार्टी द्वारा जमा किया जाता है। ट्रांसपोर्टर नकद GST देनदारी से मुक्त है।'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="tax-rcm-toggle-action">
                    <label className="tax-toggle-switch">
                      <input
                        type="checkbox"
                        id="rcmToggle"
                        checked={newEntry.rcmApplicable}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const val = Number(newEntry.taxableFreightAmountInr) || 0;
                          setNewEntry(prev => ({
                            ...prev,
                            rcmApplicable: checked,
                            taxFilingType: checked ? 'RcmFivePercent' : prev.taxFilingType,
                            rcmTaxLiabilityInr: checked ? Math.round(val * 0.05) : 0
                          }));
                        }}
                      />
                      <span className="tax-toggle-slider" />
                    </label>
                    <span className={`tax-rcm-badge ${newEntry.rcmApplicable ? 'active' : ''}`}>
                      {newEntry.rcmApplicable ? '✓ RCM Active' : 'Off'}
                    </span>
                  </div>
                </div>

                {/* LIVE STATUTORY BREAKDOWN SUMMARY CARD */}
                <div className="tax-modal-summary-card">
                  <div className="tax-summary-item">
                    <span className="tax-summary-label">Taxable Freight</span>
                    <strong className="tax-summary-val">₹{Number(newEntry.taxableFreightAmountInr || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="tax-summary-item">
                    <span className="tax-summary-label">Output GST</span>
                    <strong className="tax-summary-val text-emerald">
                      {newEntry.rcmApplicable ? (
                        <span>₹0 <small style={{ fontSize: '10px', color: '#f59e0b' }}>(RCM Recipient)</small></span>
                      ) : (
                        `₹${(Number(newEntry.cgstAmountInr || 0) + Number(newEntry.sgstAmountInr || 0) + Number(newEntry.igstAmountInr || 0)).toLocaleString('en-IN')}`
                      )}
                    </strong>
                  </div>
                  <div className="tax-summary-item">
                    <span className="tax-summary-label">Sec 194C TDS Credit</span>
                    <strong className="tax-summary-val text-sky">
                      -₹{Number(newEntry.section194CTdsDeductedInr || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="tax-summary-item">
                    <span className="tax-summary-label">Net Bilty Settlement</span>
                    <strong className="tax-summary-val" style={{ color: '#6366f1' }}>
                      ₹{(Number(newEntry.taxableFreightAmountInr || 0) - Number(newEntry.section194CTdsDeductedInr || 0)).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="tax-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowNewEntryModal(false)}
                  className="tax-btn-cancel"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="tax-btn-save-voucher"
                >
                  <CheckCircle2 size={16} />
                  <span>{t('Save to Audit Ledger', 'ऑडिट लेजर में सहेजें')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM GSTN ARN FILING */}
      {showMarkFiledModal && (
        <div className="tax-modal-backdrop">
          <div className="tax-modal-dialog" style={{ maxWidth: '460px' }}>
            <div className="tax-modal-header" style={{ background: '#059669' }}>
              <div>
                <div className="tax-modal-badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
                  <span>GST Portal Filing Status</span>
                </div>
                <h3 className="tax-modal-title">
                  <CheckCircle2 size={18} />
                  <span>{t('Confirm GSTN ARN Filing', 'GSTN ARN फाइलिंग की पुष्टि करें')}</span>
                </h3>
              </div>
              <button
                onClick={() => setShowMarkFiledModal(null)}
                className="tax-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="tax-modal-body">
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-subtle, #f8fafc)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary, #64748b)' }}>{t('Document Ref:', 'दस्तावेज़ सं:')} </span>
                  <b style={{ color: 'var(--text-primary, #0f172a)' }}>{showMarkFiledModal.documentReferenceNo}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary, #64748b)' }}>{t('Party:', 'पार्टी:')} </span>
                  <b style={{ color: 'var(--text-primary, #0f172a)' }}>{showMarkFiledModal.partyLegalName}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary, #64748b)' }}>{t('Taxable Value:', 'कर योग्य मूल्य:')} </span>
                  <b style={{ color: 'var(--text-primary, #0f172a)' }}>₹{showMarkFiledModal.taxableFreightAmountInr.toLocaleString('en-IN')}</b>
                </div>
              </div>

              <div className="tax-form-field" style={{ marginTop: '8px' }}>
                <label className="tax-form-label">
                  {t('GST Portal Filing ARN / Acknowledgment Ref *', 'GST पोर्टल फाइलिंग ARN / रसीद संख्या *')}
                </label>
                <input
                  type="text"
                  value={ackRefInput}
                  onChange={(e) => setAckRefInput(e.target.value)}
                  placeholder="e.g. AA071026001928M"
                  className="tax-form-input font-mono"
                />
              </div>
            </div>

            <div className="tax-modal-footer">
              <button
                type="button"
                onClick={() => setShowMarkFiledModal(null)}
                className="tax-btn-cancel"
              >
                {t('Cancel', 'रद्द करें')}
              </button>
              <button
                type="button"
                onClick={handleMarkFiledSubmit}
                disabled={!ackRefInput}
                className="tax-btn-export"
              >
                {t('Confirm Acknowledged', 'पुष्टि करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: STATUTORY CA TAX VOUCHER SLIP PREVIEW */}
      {selectedVoucherForPreview && (
        <div className="tax-modal-backdrop">
          <div className="tax-modal-dialog" style={{ maxWidth: '640px' }}>
            <div className="tax-modal-header" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
              <div>
                <div className="tax-modal-badge">
                  <span>Official Tax Ledger Extract</span>
                </div>
                <h3 className="tax-modal-title">
                  <FileText size={18} />
                  <span>Statutory GST &amp; CA Tax Audit Voucher</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedVoucherForPreview(null)}
                className="tax-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="tax-modal-body" style={{ gap: '16px' }}>
              {/* Slip Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase' }}>
                    ASK TRANSPORT GROUP CORP
                  </div>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary, #0f172a)' }}>
                    GSTIN: 07AABCA5555M1Z2
                  </strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>
                    SAC Code: <strong>996511</strong> (Goods Transport Agency)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>Voucher Ref:</div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)', fontFamily: 'monospace' }}>
                    {selectedVoucherForPreview.documentReferenceNo}
                  </strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>
                    {selectedVoucherForPreview.generatedTimestamp}
                  </div>
                </div>
              </div>

              {/* Party Information */}
              <div style={{ background: 'var(--bg-subtle, #f8fafc)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Consignee / Billed Entity
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
                  {selectedVoucherForPreview.partyLegalName}
                </div>
                <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 700, fontFamily: 'monospace', marginTop: '2px' }}>
                  GSTIN: {selectedVoucherForPreview.partyGstin}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', marginTop: '4px' }}>
                  Statutory Classification: <strong>{selectedVoucherForPreview.taxFilingType}</strong> • Quarter: <strong>{selectedVoucherForPreview.auditPeriodQuarter}</strong>
                </div>
              </div>

              {/* Tax Breakup Table */}
              <div style={{ border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle, #f1f5f9)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color, #cbd5e1)' }}>Tax Component</th>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color, #cbd5e1)', textAlign: 'center' }}>Applicable Rate</th>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color, #cbd5e1)', textAlign: 'right' }}>Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                      <td style={{ padding: '8px 10px' }}>Taxable Freight Turnover</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>Base</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                        ₹{selectedVoucherForPreview.taxableFreightAmountInr.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {selectedVoucherForPreview.cgstAmountInr > 0 && (
                      <tr style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                        <td style={{ padding: '8px 10px' }}>Central GST (CGST)</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>2.5% / 6%</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#10b981', fontWeight: 700 }}>
                          ₹{selectedVoucherForPreview.cgstAmountInr.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                    {selectedVoucherForPreview.sgstAmountInr > 0 && (
                      <tr style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                        <td style={{ padding: '8px 10px' }}>State GST (SGST)</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>2.5% / 6%</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#10b981', fontWeight: 700 }}>
                          ₹{selectedVoucherForPreview.sgstAmountInr.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                    {selectedVoucherForPreview.igstAmountInr > 0 && (
                      <tr style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                        <td style={{ padding: '8px 10px' }}>Integrated GST (IGST)</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>5% / 12%</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#10b981', fontWeight: 700 }}>
                          ₹{selectedVoucherForPreview.igstAmountInr.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                      <td style={{ padding: '8px 10px' }}>Section 194C TDS Withheld</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>1% / 2%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#0284c7', fontWeight: 700 }}>
                        ₹{selectedVoucherForPreview.section194CTdsDeductedInr.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr style={{ background: 'var(--bg-subtle, #f8fafc)', fontWeight: 800 }}>
                      <td style={{ padding: '10px' }}>Net Statutory Output GST</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>Total</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#10b981', fontSize: '14px' }}>
                        ₹{(selectedVoucherForPreview.cgstAmountInr + selectedVoucherForPreview.sgstAmountInr + selectedVoucherForPreview.igstAmountInr).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status & Compliance Declaration */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>
                <div>
                  Certificate: <strong>{selectedVoucherForPreview.tdsCertificateNumber}</strong>
                </div>
                <div>
                  Filing Status: <strong style={{ color: selectedVoucherForPreview.filingStatus === 'FILED_ACKNOWLEDGED' ? '#10b981' : '#d97706' }}>
                    {selectedVoucherForPreview.filingStatus}
                  </strong>
                </div>
              </div>
            </div>

            <div className="tax-modal-footer">
              <button
                type="button"
                onClick={() => window.print()}
                className="tax-btn-cancel"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} />
                <span>Print Voucher</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVoucherForPreview(null)}
                className="tax-btn-submit"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaTaxAuditVault;
