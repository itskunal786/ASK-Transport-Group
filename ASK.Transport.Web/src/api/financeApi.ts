import axios from 'axios';

const API_BASE = '/api/finance';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// =============================================================================
// FEATURE 1: GOVT E-INVOICE TYPES & API
// =============================================================================

export interface EInvoiceRecord {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  bookingNumber: string;
  lrNumber: string;
  supplierGstin: string;
  supplierName: string;
  supplierAddress: string;
  recipientGstin: string;
  recipientName: string;
  recipientAddress: string;
  placeOfSupply: string;
  isInterState: boolean;
  hsnCode: string;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalInvoiceValue: number;
  isRcmApplicable: boolean;
  vehicleNumber: string;
  irn: string;
  ackNumber: string;
  ackDate: string;
  qrCodeData: string;
  irnStatus: 'Active' | 'Cancelled';
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  signedInvoicePayload: string;
  createdBy: string;
  createdAt: string;
}

export interface EInvoiceSummaryResponse {
  summary: {
    totalInvoiced: number;
    totalGstCollected: number;
    activeIrnCount: number;
    cancelledIrnCount: number;
  };
  eInvoices: EInvoiceRecord[];
}

export async function getEInvoices(): Promise<EInvoiceSummaryResponse> {
  const res = await axios.get(`${API_BASE}/e-invoices`, { headers: getAuthHeaders() });
  return res.data;
}

export async function generateGovtEInvoiceIrn(payload: {
  bookingNumber?: string;
  lrNumber?: string;
  supplierGstin?: string;
  recipientGstin?: string;
  recipientName?: string;
  recipientAddress?: string;
  isInterState?: boolean;
  taxableAmount?: number;
  vehicleNumber?: string;
}): Promise<{ success: boolean; message: string; eInvoice: EInvoiceRecord }> {
  const res = await axios.post(`${API_BASE}/e-invoices/generate-irn`, payload, { headers: getAuthHeaders() });
  return res.data;
}

export async function cancelIrn(id: number, payload: { reason: string }): Promise<{ success: boolean; message: string; eInvoice: EInvoiceRecord }> {
  const res = await axios.post(`${API_BASE}/e-invoices/${id}/cancel-irn`, payload, { headers: getAuthHeaders() });
  return res.data;
}

// =============================================================================
// FEATURE 2: TALLY & ZOHO BOOKS ERP SYNC TYPES & API
// =============================================================================

export interface ErpVoucherRecord {
  id: number;
  voucherType: string;
  voucherNumber: string;
  referenceNumber: string;
  date: string;
  partyLedgerName: string;
  salesLedgerName: string;
  gstLedgerName: string;
  amount: number;
  taxAmount: number;
  narration: string;
  tallySyncStatus: 'Pending' | 'Synced' | 'Failed';
  zohoSyncStatus: 'Pending' | 'Synced' | 'Failed';
  lastSyncedAt?: string | null;
  erpReferenceId?: string | null;
}

export interface ErpSyncStatusResponse {
  metrics: {
    totalVouchers: number;
    syncedCount: number;
    pendingCount: number;
    totalSyncedValue: number;
    tallyPrimePort: string;
    zohoBooksOrg: string;
    autoSyncIntervalMinutes: number;
  };
  vouchers: ErpVoucherRecord[];
}

export async function getErpSyncStatus(): Promise<ErpSyncStatusResponse> {
  const res = await axios.get(`${API_BASE}/erp-sync/status`, { headers: getAuthHeaders() });
  return res.data;
}

export async function triggerErpSync(): Promise<{ success: boolean; message: string; syncedAt: string; updatedCount: number }> {
  const res = await axios.post(`${API_BASE}/erp-sync/trigger-sync`, {}, { headers: getAuthHeaders() });
  return res.data;
}

export async function exportTallyXml(): Promise<{ xmlContent: string; filename: string }> {
  const res = await axios.get(`${API_BASE}/erp-sync/export-tally-xml`, { headers: getAuthHeaders() });
  return res.data;
}

// =============================================================================
// FEATURE 3: CUSTOMER CREDIT LEDGER & 15/30-DAY INVOICING TYPES & API
// =============================================================================

export interface CustomerCreditLedger {
  clientId: number;
  companyName: string;
  gstin: string;
  billingAddress: string;
  contactPerson: string;
  contactPhone: string;
  creditLimit: number;
  currentOutstanding: number;
  overdueAmount: number;
  creditUtilizationPercent: number;
  paymentTerms: string;
  billingCycle: string;
  accountStatus: 'Active' | 'Credit_Warning' | 'Credit_Frozen';
  unbilledTripsCount: number;
  unbilledTripsValue: number;
  lastStatementGenerated?: string | null;
  lastReminderSent?: string | null;
}

export interface CreditLedgersResponse {
  summary: {
    totalCreditExposure: number;
    totalCreditLimitAllowed: number;
    totalOverdue: number;
    frozenClientsCount: number;
    warningClientsCount: number;
  };
  clients: CustomerCreditLedger[];
}

export async function getCreditLedgers(): Promise<CreditLedgersResponse> {
  const res = await axios.get(`${API_BASE}/credit-ledgers`, { headers: getAuthHeaders() });
  return res.data;
}

export async function updateCreditLimit(
  clientId: number,
  payload: { creditLimit: number; paymentTerms?: string }
): Promise<{ success: boolean; message: string; client: CustomerCreditLedger }> {
  const res = await axios.post(`${API_BASE}/credit-ledgers/${clientId}/update-limit`, payload, { headers: getAuthHeaders() });
  return res.data;
}

export async function toggleCreditFreeze(clientId: number): Promise<{ success: boolean; message: string; client: CustomerCreditLedger }> {
  const res = await axios.post(`${API_BASE}/credit-ledgers/${clientId}/toggle-freeze`, {}, { headers: getAuthHeaders() });
  return res.data;
}

export async function generateConsolidatedStatement(clientId: number): Promise<{
  success: boolean;
  message: string;
  statement: {
    statementNumber: string;
    clientName: string;
    gstin: string;
    billingCycle: string;
    period: string;
    totalConsignments: number;
    totalTaxableFreight: number;
    gstRate: string;
    gstAmount: number;
    grandTotal: number;
    dueDate: string;
  };
  client: CustomerCreditLedger;
}> {
  const res = await axios.post(`${API_BASE}/credit-ledgers/${clientId}/generate-statement`, {}, { headers: getAuthHeaders() });
  return res.data;
}

export async function sendWhatsAppPaymentReminder(clientId: number): Promise<{
  success: boolean;
  message: string;
  reminderText: string;
  recipient: string;
  dispatchedAt: string;
}> {
  const res = await axios.post(`${API_BASE}/credit-ledgers/${clientId}/send-whatsapp-reminder`, {}, { headers: getAuthHeaders() });
  return res.data;
}
