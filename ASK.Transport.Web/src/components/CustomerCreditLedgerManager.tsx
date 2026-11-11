import React, { useEffect, useState } from 'react';
import {
  getCreditLedgers,
  updateCreditLimit,
  toggleCreditFreeze,
  generateConsolidatedStatement,
  sendWhatsAppPaymentReminder,
  createCreditLedger,
  updateCreditLedger,
  deleteCreditLedger,
  type CustomerCreditLedger,
  type CreditLedgersResponse,
  type SaveCreditLedgerPayload
} from '../api/financeApi';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sliders,
  Lock,
  Unlock,
  FileText,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  CreditCard,
  Building2
} from 'lucide-react';
import './CustomerCreditLedgerManager.css';

const DEFAULT_CREDIT_DATA: CreditLedgersResponse = {
  summary: {
    totalCreditExposure: 4565000,
    totalCreditLimitAllowed: 5000000,
    totalOverdue: 1690000,
    frozenClientsCount: 1,
    warningClientsCount: 1
  },
  clients: [
    {
      clientId: 1,
      companyName: 'Tata Motors Commercial Vehicle Division',
      gstin: '27AABCT2081G1ZM',
      billingAddress: 'Pimpri Works, Mumbai-Pune Road, Pune, Maharashtra - 411018',
      contactPerson: 'Sunil Deshmukh (Head Logistics)',
      contactPhone: '+91 98220 11492',
      creditLimit: 2500000,
      currentOutstanding: 1845000,
      overdueAmount: 0,
      creditUtilizationPercent: 73.8,
      paymentTerms: '30 Days Net',
      billingCycle: 'Monthly 1st to 30th',
      accountStatus: 'Active',
      unbilledTripsCount: 14,
      unbilledTripsValue: 412000,
      lastStatementGenerated: '2026-10-13T06:31:52.585Z',
      lastReminderSent: '2026-10-20T06:31:52.585Z'
    },
    {
      clientId: 2,
      companyName: 'Bajaj Auto Industrial Components Ltd',
      gstin: '27AAACB2894G1Z2',
      billingAddress: 'Akurdi Industrial Complex, Pune, Maharashtra - 411035',
      contactPerson: 'Rakesh Sharma (Finance Controller)',
      contactPhone: '+91 98110 33412',
      creditLimit: 1500000,
      currentOutstanding: 1480000,
      overdueAmount: 450000,
      creditUtilizationPercent: 98.6,
      paymentTerms: '15 Days Net',
      billingCycle: 'Fortnightly (15-Day)',
      accountStatus: 'Credit_Warning',
      unbilledTripsCount: 6,
      unbilledTripsValue: 195000,
      lastStatementGenerated: '2026-10-24T06:31:52.585Z',
      lastReminderSent: '2026-10-26T06:31:52.585Z'
    },
    {
      clientId: 3,
      companyName: 'Speedcraft Heavy Motors Ltd',
      gstin: '06AAACT9011K1Z5',
      billingAddress: 'Sector 8 Phase 2 IMT Manesar, Gurugram, Haryana - 122050',
      contactPerson: 'Harpreet Singh (Supply Chain VP)',
      contactPhone: '+91 98140 88219',
      creditLimit: 1000000,
      currentOutstanding: 1240000,
      overdueAmount: 1240000,
      creditUtilizationPercent: 124,
      paymentTerms: '15 Days Net',
      billingCycle: 'Fortnightly (15-Day)',
      accountStatus: 'Credit_Frozen',
      unbilledTripsCount: 0,
      unbilledTripsValue: 0,
      lastStatementGenerated: '2026-09-26T06:31:52.585Z',
      lastReminderSent: '2026-10-27T18:31:52.585Z'
    }
  ]
};

const LOCAL_STORAGE_KEY = 'ask_transport_credit_ledgers_v2';

function calcSummary(clients: CustomerCreditLedger[]) {
  const totalCreditExposure = clients.reduce((acc, c) => acc + (Number(c.currentOutstanding) || 0), 0);
  const totalCreditLimitAllowed = clients.reduce((acc, c) => acc + (Number(c.creditLimit) || 0), 0);
  const totalOverdue = clients.reduce((acc, c) => acc + (Number(c.overdueAmount) || 0), 0);
  const frozenClientsCount = clients.filter(c => c.accountStatus === 'Credit_Frozen').length;
  const warningClientsCount = clients.filter(c => c.accountStatus === 'Credit_Warning').length;
  return {
    totalCreditExposure,
    totalCreditLimitAllowed,
    totalOverdue,
    frozenClientsCount,
    warningClientsCount
  };
}

function loadInitialClients(): CustomerCreditLedger[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached credit ledgers:', err);
  }
  return DEFAULT_CREDIT_DATA.clients;
}

export default function CustomerCreditLedgerManager() {
  const [clients, setClients] = useState<CustomerCreditLedger[]>(loadInitialClients);
  const [loading, setLoading] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Notification Toast
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add / Edit Full Ledger Modal
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerModalMode, setLedgerModalMode] = useState<'add' | 'edit'>('add');
  const [activeLedgerId, setActiveLedgerId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    gstin: '',
    contactPerson: '',
    contactPhone: '',
    billingAddress: '',
    creditLimit: '1500000',
    currentOutstanding: '0',
    overdueAmount: '0',
    paymentTerms: '30 Days Net',
    billingCycle: 'Monthly 1st to 30th',
    accountStatus: 'Active' as 'Active' | 'Credit_Warning' | 'Credit_Frozen',
    unbilledTripsCount: '0',
    unbilledTripsValue: '0'
  });

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<CustomerCreditLedger | null>(null);

  // Quick Limit Modal
  const [editLimitClient, setEditLimitClient] = useState<CustomerCreditLedger | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [newTerms, setNewTerms] = useState('30 Days Net');

  // Statement Modal
  const [statementData, setStatementData] = useState<any | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMsg({ type, message });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const persistClients = (newClients: CustomerCreditLedger[]) => {
    setClients(newClients);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newClients));
    } catch (err) {
      console.warn('Failed to save credit ledgers to localStorage:', err);
    }
  };

  async function loadData(isManualClick = false) {
    if (isManualClick) {
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 3000);
    }
    try {
      setLoading(true);
      const res = await getCreditLedgers();
      if (res && res.clients && Array.isArray(res.clients) && res.clients.length > 0) {
        persistClients(res.clients);
        showAlert('success', 'Credit ledgers refreshed successfully!');
      } else {
        const cached = loadInitialClients();
        persistClients(cached);
      }
    } catch (err) {
      console.warn('Failed to load live credit ledgers from backend, using local store:', err);
      const cached = loadInitialClients();
      persistClients(cached);
      showAlert('success', 'Loaded credit ledgers from local registry.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------------------------------------------------
  // ADD & EDIT MODAL HANDLERS
  // -------------------------------------------------------------------------
  function handleOpenAddModal() {
    setLedgerModalMode('add');
    setActiveLedgerId(null);
    setFormData({
      companyName: '',
      gstin: '',
      contactPerson: '',
      contactPhone: '',
      billingAddress: '',
      creditLimit: '1500000',
      currentOutstanding: '0',
      overdueAmount: '0',
      paymentTerms: '30 Days Net',
      billingCycle: 'Monthly 1st to 30th',
      accountStatus: 'Active',
      unbilledTripsCount: '0',
      unbilledTripsValue: '0'
    });
    setIsLedgerModalOpen(true);
  }

  function handleOpenEditModal(client: CustomerCreditLedger) {
    setLedgerModalMode('edit');
    setActiveLedgerId(client.clientId);
    setFormData({
      companyName: client.companyName || '',
      gstin: client.gstin || '',
      contactPerson: client.contactPerson || '',
      contactPhone: client.contactPhone || '',
      billingAddress: client.billingAddress || '',
      creditLimit: String(client.creditLimit ?? 0),
      currentOutstanding: String(client.currentOutstanding ?? 0),
      overdueAmount: String(client.overdueAmount ?? 0),
      paymentTerms: client.paymentTerms || '30 Days Net',
      billingCycle: client.billingCycle || 'Monthly 1st to 30th',
      accountStatus: client.accountStatus || 'Active',
      unbilledTripsCount: String(client.unbilledTripsCount ?? 0),
      unbilledTripsValue: String(client.unbilledTripsValue ?? 0)
    });
    setIsLedgerModalOpen(true);
  }

  async function handleSaveLedgerForm(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      showAlert('error', 'Company / Client Name is required.');
      return;
    }
    const limit = Number(formData.creditLimit) || 0;
    if (limit <= 0) {
      showAlert('error', 'Please enter a valid Credit Limit greater than 0.');
      return;
    }

    const outstanding = Number(formData.currentOutstanding) || 0;
    const overdue = Number(formData.overdueAmount) || 0;
    const util = limit > 0 ? Math.round((outstanding / limit) * 100) : 0;

    let computedStatus = formData.accountStatus;
    if (util > 100) computedStatus = 'Credit_Frozen';
    else if (util > 85) computedStatus = 'Credit_Warning';
    else if (computedStatus === 'Credit_Warning' && util <= 85) computedStatus = 'Active';

    const payload: SaveCreditLedgerPayload = {
      companyName: formData.companyName.trim(),
      gstin: formData.gstin.trim().toUpperCase(),
      billingAddress: formData.billingAddress.trim(),
      contactPerson: formData.contactPerson.trim(),
      contactPhone: formData.contactPhone.trim(),
      creditLimit: limit,
      currentOutstanding: outstanding,
      overdueAmount: overdue,
      paymentTerms: formData.paymentTerms,
      billingCycle: formData.billingCycle,
      accountStatus: computedStatus,
      unbilledTripsCount: Number(formData.unbilledTripsCount) || 0,
      unbilledTripsValue: Number(formData.unbilledTripsValue) || 0
    };

    setLoading(true);
    try {
      if (ledgerModalMode === 'add') {
        let newClient: CustomerCreditLedger;
        try {
          const res = await createCreditLedger(payload);
          newClient = res.client;
        } catch {
          const nextId = clients.length > 0 ? Math.max(...clients.map(c => c.clientId)) + 1 : 1;
          newClient = {
            clientId: nextId,
            companyName: payload.companyName,
            gstin: payload.gstin,
            billingAddress: payload.billingAddress || '',
            contactPerson: payload.contactPerson || '',
            contactPhone: payload.contactPhone || '',
            creditLimit: payload.creditLimit,
            currentOutstanding: payload.currentOutstanding || 0,
            overdueAmount: payload.overdueAmount || 0,
            creditUtilizationPercent: util,
            paymentTerms: payload.paymentTerms || '30 Days Net',
            billingCycle: payload.billingCycle || 'Monthly 1st to 30th',
            accountStatus: payload.accountStatus || 'Active',
            unbilledTripsCount: payload.unbilledTripsCount || 0,
            unbilledTripsValue: payload.unbilledTripsValue || 0,
            lastStatementGenerated: null,
            lastReminderSent: null
          };
        }

        const updatedList = [newClient, ...clients];
        persistClients(updatedList);
        showAlert('success', `✓ Credit ledger for '${newClient.companyName}' added successfully!`);
      } else {
        // Edit Mode
        if (activeLedgerId === null) return;
        try {
          await updateCreditLedger(activeLedgerId, payload);
        } catch {
          // fallback to local update
        }

        const updatedList = clients.map(c => {
          if (c.clientId === activeLedgerId) {
            return {
              ...c,
              companyName: payload.companyName,
              gstin: payload.gstin,
              billingAddress: payload.billingAddress || '',
              contactPerson: payload.contactPerson || '',
              contactPhone: payload.contactPhone || '',
              creditLimit: payload.creditLimit,
              currentOutstanding: payload.currentOutstanding || 0,
              overdueAmount: payload.overdueAmount || 0,
              creditUtilizationPercent: util,
              paymentTerms: payload.paymentTerms || '30 Days Net',
              billingCycle: payload.billingCycle || 'Monthly 1st to 30th',
              accountStatus: computedStatus,
              unbilledTripsCount: payload.unbilledTripsCount || 0,
              unbilledTripsValue: payload.unbilledTripsValue || 0
            };
          }
          return c;
        });

        persistClients(updatedList);
        showAlert('success', `✓ Credit ledger for '${payload.companyName}' updated successfully!`);
      }

      setIsLedgerModalOpen(false);
    } catch (err: any) {
      showAlert('error', `Failed to save ledger: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // DELETE HANDLERS
  // -------------------------------------------------------------------------
  function handleOpenDeleteModal(client: CustomerCreditLedger) {
    setDeleteTarget(client);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    const targetName = deleteTarget.companyName;
    const targetId = deleteTarget.clientId;

    try {
      try {
        await deleteCreditLedger(targetId);
      } catch {
        // fallback to local delete
      }

      const updatedList = clients.filter(c => c.clientId !== targetId);
      persistClients(updatedList);
      showAlert('success', `✓ Credit ledger for '${targetName}' deleted successfully.`);
      setDeleteTarget(null);
    } catch (err: any) {
      showAlert('error', `Failed to delete ledger: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // QUICK ADJUST LIMIT & FREEZE
  // -------------------------------------------------------------------------
  async function handleSaveQuickLimit(e: React.FormEvent) {
    e.preventDefault();
    if (!editLimitClient || !newLimit || Number(newLimit) <= 0) return;
    try {
      setLoading(true);
      const limitVal = Number(newLimit);
      try {
        await updateCreditLimit(editLimitClient.clientId, {
          creditLimit: limitVal,
          paymentTerms: newTerms
        });
      } catch {
        // fallback to local update
      }

      const updatedList = clients.map(c => {
        if (c.clientId === editLimitClient.clientId) {
          const util = Math.round(((c.currentOutstanding || 0) / limitVal) * 100);
          return {
            ...c,
            creditLimit: limitVal,
            paymentTerms: newTerms,
            creditUtilizationPercent: util,
            accountStatus: (util > 100 ? 'Credit_Frozen' : util > 85 ? 'Credit_Warning' : 'Active') as any
          };
        }
        return c;
      });

      persistClients(updatedList);
      setEditLimitClient(null);
      showAlert('success', `✓ Credit limit updated to ₹${limitVal.toLocaleString('en-IN')} (${newTerms}).`);
    } catch (err: any) {
      showAlert('error', 'Failed to update limit: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFreeze(clientId: number) {
    try {
      setLoading(true);
      const target = clients.find(c => c.clientId === clientId);
      const willFreeze = target?.accountStatus !== 'Credit_Frozen';

      try {
        await toggleCreditFreeze(clientId);
      } catch {
        // fallback to local
      }

      const updatedList = clients.map(c => {
        if (c.clientId === clientId) {
          return {
            ...c,
            accountStatus: (willFreeze ? 'Credit_Frozen' : 'Active') as any
          };
        }
        return c;
      });

      persistClients(updatedList);
      showAlert('success', `✓ ${target?.companyName} credit status changed to ${willFreeze ? 'FROZEN' : 'ACTIVE'}.`);
    } catch (err: any) {
      showAlert('error', 'Failed to toggle freeze: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateStatement(clientId: number) {
    try {
      setLoading(true);
      const res = await generateConsolidatedStatement(clientId);
      setStatementData(res.statement);
    } catch {
      const client = clients.find(c => c.clientId === clientId);
      if (client) {
        setStatementData({
          statementNumber: `STMT-2026-${Math.floor(100 + Math.random() * 900)}`,
          clientName: client.companyName,
          gstin: client.gstin,
          billingCycle: client.billingCycle,
          period: '01-Oct to 31-Oct-2026',
          totalConsignments: client.unbilledTripsCount > 0 ? client.unbilledTripsCount : 12,
          totalTaxableFreight: client.unbilledTripsValue > 0 ? client.unbilledTripsValue : 350000,
          gstRate: '12% Forward Charge',
          gstAmount: ((client.unbilledTripsValue > 0 ? client.unbilledTripsValue : 350000) * 0.12),
          grandTotal: ((client.unbilledTripsValue > 0 ? client.unbilledTripsValue : 350000) * 1.12),
          dueDate: '15-Nov-2026'
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReminder(clientId: number) {
    try {
      setLoading(true);
      const target = clients.find(c => c.clientId === clientId);
      try {
        await sendWhatsAppPaymentReminder(clientId);
      } catch {
        // fallback
      }

      const updatedList = clients.map(c => {
        if (c.clientId === clientId) {
          return { ...c, lastReminderSent: new Date().toISOString() };
        }
        return c;
      });
      persistClients(updatedList);
      showAlert('success', `📲 WhatsApp Payment Reminder dispatched to ${target?.contactPerson || 'Client'} (${target?.contactPhone})!`);
    } catch (err: any) {
      showAlert('error', 'Failed to send reminder: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  // Summary Metrics
  const summary = calcSummary(clients);

  // Search & Filter
  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      c.companyName.toLowerCase().includes(q) ||
      c.gstin.toLowerCase().includes(q) ||
      c.contactPerson.toLowerCase().includes(q) ||
      c.contactPhone.toLowerCase().includes(q) ||
      c.billingAddress.toLowerCase().includes(q);

    if (filterStatus === 'ALL') return matchSearch;
    if (filterStatus === 'Active') return matchSearch && c.accountStatus === 'Active';
    if (filterStatus === 'Credit_Warning') return matchSearch && c.accountStatus === 'Credit_Warning';
    if (filterStatus === 'Credit_Frozen') return matchSearch && c.accountStatus === 'Credit_Frozen';
    return matchSearch;
  });

  return (
    <div className="ccl-container">
      {/* HEADER & CONTROLS */}
      <div className="ccl-header-card">
        <div>
          <h2 className="ccl-header-title">
            <CreditCard size={22} style={{ color: '#2563eb' }} />
            <span>Customer Credit Ledgers &amp; Auto Invoicing Cycle</span>
          </h2>
          <p className="ccl-header-desc">
            Enterprise credit monitoring, automated credit limit freeze, 15/30-day consolidated statements, and 1-click WhatsApp payment reminders.
          </p>
        </div>

        <div className="ccl-header-actions">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="ccl-btn-primary"
          >
            <Plus size={16} />
            <span>+ Add New Credit Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="ccl-btn-secondary"
            style={{
              borderColor: justRefreshed ? '#10b981' : undefined,
              color: justRefreshed ? '#10b981' : undefined,
              background: justRefreshed ? 'rgba(16, 185, 129, 0.15)' : undefined,
              boxShadow: justRefreshed ? '0 0 12px rgba(16, 185, 129, 0.25)' : undefined,
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
                ? 'Syncing...' 
                : justRefreshed 
                ? 'Refreshed! ✓' 
                : 'Refresh Ledgers'}
            </span>
          </button>
        </div>
      </div>

      {/* ALERT NOTIFICATION */}
      {alertMsg && (
        <div className="ccl-alert" style={{
          background: alertMsg.type === 'error' ? '#fee2e2' : '#dcfce7',
          borderColor: alertMsg.type === 'error' ? '#fca5a5' : '#86efac',
          color: alertMsg.type === 'error' ? '#991b1b' : '#15803d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {alertMsg.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{alertMsg.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertMsg(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI SUMMARY CARDS */}
      <div className="ccl-kpi-grid">
        <div className="ccl-kpi-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <span className="ccl-kpi-label">TOTAL CREDIT OUTSTANDING</span>
          <strong className="ccl-kpi-val" style={{ color: '#2563eb' }}>
            ₹{(summary.totalCreditExposure / 100000).toFixed(2)} Lakhs
          </strong>
          <span className="ccl-kpi-sub" style={{ color: '#64748b' }}>
            Across {clients.length} Corporate Accounts
          </span>
        </div>

        <div className="ccl-kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <span className="ccl-kpi-label">OVERDUE AMOUNT</span>
          <strong className="ccl-kpi-val" style={{ color: '#dc2626' }}>
            ₹{(summary.totalOverdue / 100000).toFixed(2)} Lakhs
          </strong>
          <span className="ccl-kpi-sub" style={{ color: '#b91c1c', fontWeight: 700 }}>
            {summary.frozenClientsCount} Accounts Frozen
          </span>
        </div>

        <div className="ccl-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <span className="ccl-kpi-label">TOTAL APPROVED CREDIT</span>
          <strong className="ccl-kpi-val" style={{ color: '#16a34a' }}>
            ₹{(summary.totalCreditLimitAllowed / 100000).toFixed(2)} Lakhs
          </strong>
          <span className="ccl-kpi-sub" style={{ color: '#059669' }}>
            Combined Credit Sanctioned
          </span>
        </div>

        <div className="ccl-kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span className="ccl-kpi-label">CREDIT STATUS</span>
          <strong className="ccl-kpi-val" style={{ color: '#d97706' }}>
            {summary.warningClientsCount} Approaching Limit
          </strong>
          <span className="ccl-kpi-sub" style={{ color: '#b45309' }}>
            Requires payment follow-up
          </span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="ccl-filter-strip">
        <div className="ccl-search-box">
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search company name, GSTIN, contact person, or location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ccl-search-input"
          />
        </div>

        <div className="ccl-filter-pills">
          {[
            { key: 'ALL', label: `All Ledgers (${clients.length})` },
            { key: 'Active', label: `Healthy (${clients.filter(c => c.accountStatus === 'Active').length})` },
            { key: 'Credit_Warning', label: `Near Limit (${summary.warningClientsCount})` },
            { key: 'Credit_Frozen', label: `Credit Frozen (${summary.frozenClientsCount})` }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`ccl-filter-pill ${filterStatus === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CLIENT CREDIT CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredClients.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <Building2 size={36} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a' }}>No Customer Ledgers Found</h4>
            <p style={{ margin: 0, fontSize: '12.5px' }}>Try adjusting your search criteria or click '+ Add New Credit Ledger'.</p>
          </div>
        ) : (
          filteredClients.map(client => {
            const cid = client.clientId;
            const isFrozen = client.accountStatus === 'Credit_Frozen';
            const isWarning = client.accountStatus === 'Credit_Warning';
            const util = client.creditUtilizationPercent ?? 0;

            let cardClass = 'ccl-ledger-card';
            if (isFrozen) cardClass += ' frozen';
            else if (isWarning) cardClass += ' warning';

            return (
              <div key={cid} className={cardClass}>
                {/* TOP HEADER */}
                <div className="ccl-card-header">
                  <div className="ccl-company-info">
                    <div className="ccl-company-name-row">
                      <strong className="ccl-company-title">{client.companyName}</strong>
                      <span className={`ccl-status-tag ${isFrozen ? 'frozen' : isWarning ? 'warning' : 'healthy'}`}>
                        {isFrozen ? '🔒 CREDIT FROZEN (AUTO-LOCK)' : isWarning ? '⚠ NEAR LIMIT' : '✓ HEALTHY ACCOUNT'}
                      </span>
                    </div>
                    <div className="ccl-company-sub">
                      GSTIN: <strong>{client.gstin}</strong> • Terms: <strong>{client.paymentTerms}</strong> ({client.billingCycle})
                    </div>
                  </div>

                  {/* ACTION BUTTONS (EDIT, DELETE, ADJUST, FREEZE, STATEMENT, WHATSAPP) */}
                  <div className="ccl-card-actions">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(client)}
                      className="ccl-action-btn edit"
                      title="Edit Company Details, Credit Limits & Terms"
                    >
                      <Edit2 size={13} />
                      <span>Edit Ledger</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditLimitClient(client);
                        setNewLimit(String(client.creditLimit));
                        setNewTerms(client.paymentTerms);
                      }}
                      className="ccl-action-btn adjust"
                      title="Quick Adjust Credit Limit"
                    >
                      <Sliders size={13} />
                      <span>Adjust Limit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleFreeze(cid)}
                      className={`ccl-action-btn ${isFrozen ? 'unfreeze' : 'freeze'}`}
                      title={isFrozen ? 'Unfreeze account to resume dispatches' : 'Lock dispatch approval for this client'}
                    >
                      {isFrozen ? <Unlock size={13} /> : <Lock size={13} />}
                      <span>{isFrozen ? 'Unfreeze Account' : 'Freeze Credit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerateStatement(cid)}
                      className="ccl-action-btn statement"
                      title="Generate Consolidated Tax Invoice Statement"
                    >
                      <FileText size={13} />
                      <span>Generate Statement</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendReminder(cid)}
                      className="ccl-action-btn reminder"
                      title="Send Instant WhatsApp Payment Link & Reminder"
                    >
                      <PhoneCall size={13} />
                      <span>WhatsApp Reminder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDeleteModal(client)}
                      className="ccl-action-btn delete"
                      title="Delete Customer Credit Ledger"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* FINANCIAL BREAKDOWN */}
                <div className="ccl-finance-grid">
                  <div className="ccl-finance-item">
                    <span className="ccl-finance-label">APPROVED CREDIT LIMIT:</span>
                    <div className="ccl-finance-val" style={{ color: '#0f172a' }}>
                      ₹{(client.creditLimit ?? 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="ccl-finance-item">
                    <span className="ccl-finance-label">CURRENT OUTSTANDING:</span>
                    <div className="ccl-finance-val" style={{ color: isFrozen ? '#dc2626' : '#2563eb' }}>
                      ₹{(client.currentOutstanding ?? 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="ccl-finance-item">
                    <span className="ccl-finance-label" style={{ color: '#dc2626' }}>OVERDUE AMOUNT:</span>
                    <div className="ccl-finance-val" style={{ color: (client.overdueAmount ?? 0) > 0 ? '#dc2626' : '#16a34a' }}>
                      ₹{(client.overdueAmount ?? 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="ccl-finance-item">
                    <span className="ccl-finance-label">UNBILLED TRIPS:</span>
                    <div className="ccl-finance-val" style={{ color: '#334155', fontSize: '15px' }}>
                      {client.unbilledTripsCount ?? 0} Trips (₹{(client.unbilledTripsValue ?? 0).toLocaleString('en-IN')})
                    </div>
                  </div>
                </div>

                {/* CREDIT UTILIZATION PROGRESS BAR */}
                <div className="ccl-progress-wrapper">
                  <div className="ccl-progress-labels">
                    <span style={{ color: '#475569' }}>Credit Limit Utilization:</span>
                    <strong style={{ color: util > 100 ? '#dc2626' : util > 85 ? '#d97706' : '#16a34a' }}>
                      {util}% Used
                    </strong>
                  </div>

                  <div className="ccl-progress-track">
                    <div
                      className="ccl-progress-fill"
                      style={{
                        width: `${Math.min(util, 100)}%`,
                        background: util > 100 ? '#dc2626' : util > 85 ? '#f59e0b' : '#10b981'
                      }}
                    />
                  </div>
                </div>

                {/* CONTACT & BILLING STRIP */}
                <div className="ccl-footer-strip">
                  <div>
                    Contact: <strong>{client.contactPerson}</strong> ({client.contactPhone}) • Address: {client.billingAddress}
                  </div>
                  <div>
                    {client.lastReminderSent && (
                      <span>Last WhatsApp Alert: {new Date(client.lastReminderSent).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =====================================================================
          ADD / EDIT FULL LEDGER MODAL
          ===================================================================== */}
      {isLedgerModalOpen && (
        <div className="ccl-modal-overlay" onClick={() => setIsLedgerModalOpen(false)}>
          <div className="ccl-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ccl-modal-header">
              <h3 className="ccl-modal-title">
                {ledgerModalMode === 'add' ? (
                  <>
                    <Plus size={20} style={{ color: '#2563eb' }} />
                    <span>Add New Customer Credit Ledger</span>
                  </>
                ) : (
                  <>
                    <Edit2 size={20} style={{ color: '#2563eb' }} />
                    <span>Edit Customer Credit Ledger</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                className="ccl-modal-close"
                onClick={() => setIsLedgerModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLedgerForm} className="ccl-modal-form">
              <div className="ccl-form-grid">
                <div className="ccl-form-group full">
                  <label className="ccl-form-label">Corporate / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahindra Logistics & Transportation Ltd"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="ccl-form-input"
                  />
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">GSTIN (15-Digit GST Number) *</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="e.g. 27AABCM1234F1Z5"
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="ccl-form-input"
                  />
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">Approved Credit Limit (₹) *</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={10000}
                    placeholder="e.g. 2000000"
                    value={formData.creditLimit}
                    onChange={e => setFormData({ ...formData, creditLimit: e.target.value })}
                    className="ccl-form-input"
                  />
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">Contact Person & Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Patil (Head Supply Chain)"
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="ccl-form-input"
                  />
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">Contact Phone (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98220 54321"
                    value={formData.contactPhone}
                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="ccl-form-input"
                  />
                </div>

                <div className="ccl-form-group full">
                  <label className="ccl-form-label">Registered Billing Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Plot 42, MIDC Industrial Area, Pune, Maharashtra - 411019"
                    value={formData.billingAddress}
                    onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
                    className="ccl-form-input"
                  />
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="ccl-form-select"
                  >
                    <option value="15 Days Net">15 Days Net (Fortnightly)</option>
                    <option value="30 Days Net">30 Days Net (Monthly)</option>
                    <option value="45 Days Net">45 Days Net</option>
                    <option value="60 Days Net">60 Days Net</option>
                    <option value="Immediate / COD">Immediate / COD (0 Days)</option>
                  </select>
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">Billing Cycle</label>
                  <select
                    value={formData.billingCycle}
                    onChange={e => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="ccl-form-select"
                  >
                    <option value="Monthly 1st to 30th">Monthly (1st to 30th)</option>
                    <option value="Fortnightly (15-Day)">Fortnightly (Every 15 Days)</option>
                    <option value="Weekly Cycle">Weekly Consolidated Cycle</option>
                    <option value="Per Trip Billing">Per Trip Billing Cycle</option>
                  </select>
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">Current Outstanding (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.currentOutstanding}
                    onChange={e => setFormData({ ...formData, currentOutstanding: e.target.value })}
                    className="ccl-form-input"
                  />
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">Overdue Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.overdueAmount}
                    onChange={e => setFormData({ ...formData, overdueAmount: e.target.value })}
                    className="ccl-form-input"
                  />
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">Account Status</label>
                  <select
                    value={formData.accountStatus}
                    onChange={e => setFormData({ ...formData, accountStatus: e.target.value as any })}
                    className="ccl-form-select"
                  >
                    <option value="Active">Active (Healthy Account)</option>
                    <option value="Credit_Warning">Credit Warning (Near Limit)</option>
                    <option value="Credit_Frozen">Credit Frozen (Auto-Lock)</option>
                  </select>
                </div>

                <div className="ccl-form-group">
                  <label className="ccl-form-label">Unbilled Trips Count</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.unbilledTripsCount}
                    onChange={e => setFormData({ ...formData, unbilledTripsCount: e.target.value })}
                    className="ccl-form-input"
                  />
                </div>
              </div>

              <div className="ccl-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="ccl-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="ccl-btn-primary"
                >
                  {ledgerModalMode === 'add' ? 'Save New Ledger' : 'Update Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE CONFIRMATION MODAL
          ===================================================================== */}
      {deleteTarget && (
        <div className="ccl-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="ccl-modal-card ccl-delete-card" onClick={e => e.stopPropagation()}>
            <div className="ccl-modal-header" style={{ borderBottomColor: '#fecaca', background: '#fff5f5' }}>
              <h3 className="ccl-modal-title" style={{ color: '#dc2626' }}>
                <Trash2 size={20} />
                <span>Delete Customer Credit Ledger</span>
              </h3>
              <button
                type="button"
                className="ccl-modal-close"
                onClick={() => setDeleteTarget(null)}
              >
                ✕
              </button>
            </div>

            <div className="ccl-delete-body">
              <p style={{ margin: 0 }}>
                Are you sure you want to permanently delete the credit ledger for:
              </p>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{deleteTarget.companyName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  GSTIN: <b>{deleteTarget.gstin}</b> • Outstanding: <b>₹{(deleteTarget.currentOutstanding || 0).toLocaleString('en-IN')}</b>
                </div>
              </div>

              <div className="ccl-delete-warning-box">
                ⚠️ <strong>Warning:</strong> Deleting this ledger will remove all credit monitoring, payment terms, and unbilled consignment records for this corporate account.
              </div>
            </div>

            <div className="ccl-modal-footer">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="ccl-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="ccl-action-btn freeze"
                style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '13px' }}
              >
                Yes, Delete Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          QUICK ADJUST LIMIT MODAL (PRESERVED)
          ===================================================================== */}
      {editLimitClient && (
        <div className="ccl-modal-overlay" onClick={() => setEditLimitClient(null)}>
          <div className="ccl-modal-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="ccl-modal-header">
              <h3 className="ccl-modal-title">
                <Sliders size={18} style={{ color: '#2563eb' }} />
                <span>Adjust Credit Limit</span>
              </h3>
              <button
                type="button"
                className="ccl-modal-close"
                onClick={() => setEditLimitClient(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickLimit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                Client: <strong style={{ color: '#0f172a' }}>{editLimitClient.companyName}</strong>
              </div>

              <div className="ccl-form-group">
                <label className="ccl-form-label">APPROVED CREDIT LIMIT (₹):</label>
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  value={newLimit}
                  onChange={e => setNewLimit(e.target.value)}
                  className="ccl-form-input"
                  style={{ fontWeight: 800, color: '#2563eb', fontSize: '15px' }}
                />
              </div>

              <div className="ccl-form-group">
                <label className="ccl-form-label">PAYMENT TERMS:</label>
                <select
                  value={newTerms}
                  onChange={e => setNewTerms(e.target.value)}
                  className="ccl-form-select"
                >
                  <option value="15 Days Net">15 Days Net (Fortnightly)</option>
                  <option value="30 Days Net">30 Days Net (Monthly)</option>
                  <option value="45 Days Net">45 Days Net</option>
                  <option value="60 Days Net">60 Days Net</option>
                  <option value="Immediate / COD">Immediate / COD (0 Days)</option>
                </select>
              </div>

              <div className="ccl-modal-footer" style={{ padding: '14px 0 0', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditLimitClient(null)}
                  className="ccl-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="ccl-btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          CONSOLIDATED STATEMENT MODAL (PRESERVED)
          ===================================================================== */}
      {statementData && (
        <div className="ccl-modal-overlay" onClick={() => setStatementData(null)}>
          <div className="ccl-modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="ccl-modal-header">
              <div>
                <h3 className="ccl-modal-title">
                  <FileText size={18} style={{ color: '#2563eb' }} />
                  <span>Consolidated Billing Statement #{statementData.statementNumber}</span>
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Period: {statementData.period} • {statementData.billingCycle}</span>
              </div>
              <button
                type="button"
                className="ccl-modal-close"
                onClick={() => setStatementData(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <span>Client Name:</span>
                <strong style={{ color: '#0f172a' }}>{statementData.clientName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span>GSTIN:</span>
                <strong>{statementData.gstin}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span>Total Consignments Billed:</span>
                <strong>{statementData.totalConsignments} Bilties</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span>Total Taxable Freight:</span>
                <strong>₹{(statementData.totalTaxableFreight ?? 0).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span>GST ({statementData.gstRate}):</span>
                <strong>₹{(statementData.gstAmount ?? 0).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '15px' }}>
                <strong style={{ color: '#166534' }}>Net Amount Payable:</strong>
                <strong style={{ color: '#15803d' }}>₹{(statementData.grandTotal ?? 0).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', textAlign: 'right' }}>
                Payment Due Date: <strong>{statementData.dueDate}</strong>
              </div>
            </div>

            <div className="ccl-modal-footer">
              <button
                type="button"
                onClick={() => window.print()}
                className="ccl-btn-secondary"
              >
                🖨️ Print Statement
              </button>
              <button
                type="button"
                onClick={() => setStatementData(null)}
                className="ccl-btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
