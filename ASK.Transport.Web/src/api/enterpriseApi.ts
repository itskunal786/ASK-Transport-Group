import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:5208/api';
const API_BASE = `${API_ROOT}/enterprise`;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// =============================================================================
// FEATURE 1: BULK EXCEL / CSV BOOKING TYPES & API
// =============================================================================

export interface BulkConsignmentItem {
  rowIndex: number;
  consignorName: string;
  consigneeName: string;
  consigneePhone: string;
  deliveryAddress: string;
  pincode: string;
  city: string;
  goodsDescription: string;
  packageCount: number;
  weightKg: number;
  declaredValue: number;
  paymentMode: string;
  estimatedFreight: number;
  isValid: boolean;
  validationErrors: string[];
}

export interface BulkImportPreviewResponse {
  totalRecords: number;
  validCount: number;
  errorCount: number;
  totalWeightKg: number;
  totalPackages: number;
  totalDeclaredValue: number;
  totalEstimatedFreight: number;
  previewItems: BulkConsignmentItem[];
}

export interface GeneratedBiltyDto {
  lrNumber: string;
  barcode: string;
  consigneeName: string;
  consigneeCity: string;
  pincode: string;
  goodsDescription: string;
  packages: number;
  weightKg: number;
  freightAmount: number;
  paymentMode: string;
  trackingUrl: string;
}

export interface BulkProcessResponse {
  batchId: string;
  batchTitle: string;
  shipperName: string;
  processedAt: string;
  totalProcessed: number;
  totalWeightKg: number;
  totalPackages: number;
  totalFreightAmount: number;
  generatedBilties: GeneratedBiltyDto[];
}

export interface BulkBatchRecord {
  batchId: string;
  batchTitle: string;
  shipperName: string;
  shipperGstin: string;
  createdAt: string;
  totalRecords: number;
  totalWeightKg: number;
  totalPackages: number;
  totalFreightAmount: number;
  status: string;
  bilties: GeneratedBiltyDto[];
}

export async function getBulkSampleTemplate(): Promise<{ sampleCsv: string; instructions: string }> {
  const res = await axios.get(`${API_BASE}/bulk-booking/sample-template`, { headers: getAuthHeaders() });
  return res.data;
}

export async function previewBulkConsignments(payload: { csvText?: string; items?: BulkConsignmentItem[] }): Promise<BulkImportPreviewResponse> {
  const res = await axios.post(`${API_BASE}/bulk-booking/preview`, payload, { headers: getAuthHeaders() });
  return res.data;
}

export async function processBulkBookings(payload: {
  batchTitle?: string;
  shipperName?: string;
  shipperGstin?: string;
  items?: BulkConsignmentItem[];
}): Promise<BulkProcessResponse> {
  const res = await axios.post(`${API_BASE}/bulk-booking/process`, payload, { headers: getAuthHeaders() });
  return res.data;
}

export async function getBulkBatches(): Promise<BulkBatchRecord[]> {
  const res = await axios.get(`${API_BASE}/bulk-booking/batches`, { headers: getAuthHeaders() });
  return res.data;
}

// =============================================================================
// FEATURE 2: FREIGHT BIDDING & REVERSE AUCTION MARKETPLACE TYPES & API
// =============================================================================

export interface MarketplaceBid {
  id: number;
  loadId: number;
  transporterName: string;
  transporterPhone: string;
  rating: number;
  totalTripsCompleted: number;
  truckNumber: string;
  offeredRate: number;
  etaPickupHours: number;
  bidPlacedAt: string;
  isSelected: boolean;
}

export interface MarketplaceLoad {
  id: number;
  loadNumber: string;
  shipperName: string;
  originHub: string;
  destinationHub: string;
  distanceKm: number;
  cargoDescription: string;
  weightTons: number;
  requiredTruckType: string;
  targetBudget: number;
  currentLowestBid: number;
  auctionExpiryTime: string;
  secondsRemaining: number;
  status: 'ActiveAuction' | 'ContractLocked' | 'AuctionClosed';
  winningTransporter?: string | null;
  acceptedRate?: number | null;
  brokerageFeeEarned?: number | null;
  bids: MarketplaceBid[];
}

export async function getMarketplaceLoads(): Promise<MarketplaceLoad[]> {
  const res = await axios.get(`${API_BASE}/marketplace/loads`, { headers: getAuthHeaders() });
  return res.data;
}

export async function createMarketplaceLoad(payload: {
  shipperName?: string;
  originHub: string;
  destinationHub: string;
  distanceKm: number;
  cargoDescription: string;
  weightTons: number;
  requiredTruckType: string;
  targetBudget: number;
  durationMinutes?: number;
}): Promise<{ success: boolean; load: MarketplaceLoad }> {
  const res = await axios.post(`${API_BASE}/marketplace/loads`, payload, { headers: getAuthHeaders() });
  return res.data;
}

export async function placeMarketplaceBid(
  loadId: number,
  payload: {
    transporterName: string;
    transporterPhone: string;
    truckNumber: string;
    offeredRate: number;
    etaPickupHours?: number;
  }
): Promise<{ success: boolean; message: string; load: MarketplaceLoad }> {
  const res = await axios.post(`${API_BASE}/marketplace/loads/${loadId}/bids`, payload, { headers: getAuthHeaders() });
  return res.data;
}

export async function acceptWinningBid(
  loadId: number,
  payload: { bidId?: number }
): Promise<{ success: boolean; message: string; contract: any; load: MarketplaceLoad }> {
  const res = await axios.post(`${API_BASE}/marketplace/loads/${loadId}/accept-bid`, payload, { headers: getAuthHeaders() });
  return res.data;
}

// =============================================================================
// FEATURE 3: REVERSE LOGISTICS & RTO TYPES & API
// =============================================================================

export interface RtoTimelineEvent {
  timestamp: string;
  title: string;
  description: string;
  location: string;
}

export interface RtoReturnCase {
  id: number;
  caseNumber: string;
  originalBookingNumber: string;
  originalLrNumber: string;
  reverseLrNumber: string;
  returnReason: string;
  damageSeverity: string;
  customerRefundClaimed: number;
  damagePhotoUrl: string;
  originFactory: string;
  consigneeWhoRejected: string;
  currentReverseHub: string;
  status: 'RTO_Initiated' | 'Reverse_In_Transit' | 'Arrived_At_Source_Hub' | 'Restocked_To_Factory' | 'Insurance_Claim_Filed';
  createdAt: string;
  updatedAt: string;
  timeline: RtoTimelineEvent[];
}

export interface RtoSummaryResponse {
  metrics: {
    totalReturns: number;
    inTransit: number;
    totalClaims: number;
    restocked: number;
  };
  cases: RtoReturnCase[];
}

const DEFAULT_RTO_CASES: RtoReturnCase[] = [
  {
    id: 1,
    caseNumber: 'RTO-2026-0041',
    originalBookingNumber: 'ASK-BK-9182',
    originalLrNumber: 'ASK-LR-2026-98102',
    reverseLrNumber: 'RLR-2026-8812',
    returnReason: 'Damaged in Transit / Water Ingress',
    damageSeverity: 'Major Goods Damaged',
    customerRefundClaimed: 48500,
    damagePhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
    originFactory: 'North Star Auto Components (Pune Hub 4)',
    consigneeWhoRejected: 'Speedcraft Motors Depot (Gurugram NH-48)',
    currentReverseHub: 'Jaipur SuperHub Transit Yard',
    status: 'Reverse_In_Transit',
    createdAt: '2026-10-27T08:30:00Z',
    updatedAt: '2026-10-28T14:15:00Z',
    timeline: [
      { timestamp: '2026-10-27 08:30', title: 'RTO Initiated', description: 'Consignee rejected delivery due to packaging damage and rain ingress.', location: 'Gurugram Depot' },
      { timestamp: '2026-10-27 16:45', title: 'RLR Generated', description: 'Reverse Lorry Receipt RLR-2026-8812 assigned to vehicle RJ-14-TG-9901.', location: 'Delhi NCR Hub' },
      { timestamp: '2026-10-28 14:15', title: 'In Transit', description: 'Arrived at Jaipur SuperHub for transit cross-docking towards Pune.', location: 'Jaipur SuperHub' }
    ]
  },
  {
    id: 2,
    caseNumber: 'RTO-2026-0038',
    originalBookingNumber: 'ASK-BK-8902',
    originalLrNumber: 'ASK-LR-2026-97451',
    reverseLrNumber: 'RLR-2026-8790',
    returnReason: 'Wrong SKU / Specification Mismatch',
    damageSeverity: 'No Damage (Wrong Dispatch)',
    customerRefundClaimed: 125000,
    damagePhotoUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400',
    originFactory: 'Tata Steel Tubes Division (Jamshedpur)',
    consigneeWhoRejected: 'Larsen & Toubro ECC Hub (Ahmedabad)',
    currentReverseHub: 'Jamshedpur Plant Warehouse',
    status: 'Restocked_To_Factory',
    createdAt: '2026-10-24T10:15:00Z',
    updatedAt: '2026-10-26T17:30:00Z',
    timeline: [
      { timestamp: '2026-10-24 10:15', title: 'RTO Initiated', description: 'Consignee refused unloading: Steel gauge thickness mismatch.', location: 'Ahmedabad ECC' },
      { timestamp: '2026-10-25 11:20', title: 'Arrived at Source', description: 'Vehicle unloaded at Jamshedpur QA dock.', location: 'Jamshedpur' },
      { timestamp: '2026-10-26 17:30', title: 'Restocked & Reconciled', description: 'Inventory reconciled in SAP ERP. Credit note issued.', location: 'Jamshedpur Plant' }
    ]
  },
  {
    id: 3,
    caseNumber: 'RTO-2026-0044',
    originalBookingNumber: 'ASK-BK-9311',
    originalLrNumber: 'ASK-LR-2026-98840',
    reverseLrNumber: 'RLR-2026-8845',
    returnReason: 'Severe Impact Breakage during Highway Transit',
    damageSeverity: 'Total Consignment Loss',
    customerRefundClaimed: 215000,
    damagePhotoUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400',
    originFactory: 'Bajaj Heavy Engineering Ltd (Bhosari)',
    consigneeWhoRejected: 'Hero MotoCorp Ancillary Hub (Haridwar)',
    currentReverseHub: 'Bhosari Central QA Lab',
    status: 'Insurance_Claim_Filed',
    createdAt: '2026-10-29T11:00:00Z',
    updatedAt: '2026-10-30T09:40:00Z',
    timeline: [
      { timestamp: '2026-10-29 11:00', title: 'RTO Initiated', description: 'Surveyor inspection logged total glass and mechanical impact breakage.', location: 'Haridwar Hub' },
      { timestamp: '2026-10-30 09:40', title: 'Insurance Claim Filed', description: 'Surveyor report submitted to New India Assurance under Policy 26-TR-998.', location: 'Pune Corporate Office' }
    ]
  }
];

export async function getReverseLogisticsCases(): Promise<RtoSummaryResponse> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.get(`${API_BASE}/reverse-logistics/cases`, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && res.data.cases && Array.isArray(res.data.cases)) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend unavailable, returning stored RTO cases:', err);
    }
  }

  let customCases: RtoReturnCase[] = [];
  try {
    const raw = localStorage.getItem('ask_custom_rto_cases');
    if (raw) customCases = JSON.parse(raw);
  } catch {
    // ignore
  }

  const allCases = [...customCases, ...DEFAULT_RTO_CASES];
  return {
    metrics: {
      totalReturns: allCases.length,
      inTransit: allCases.filter(c => c.status === 'Reverse_In_Transit').length,
      totalClaims: allCases.reduce((sum, c) => sum + (c.customerRefundClaimed || 0), 0),
      restocked: allCases.filter(c => c.status === 'Restocked_To_Factory').length
    },
    cases: allCases
  };
}

export async function initiateRtoCase(payload: {
  originalBookingNumber?: string;
  originalLrNumber?: string;
  returnReason?: string;
  damageSeverity?: string;
  claimAmount?: number;
  damagePhotoUrl?: string;
  originFactory?: string;
  consigneeWhoRejected?: string;
}): Promise<{ success: boolean; message: string; rtoCase: RtoReturnCase }> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.post(`${API_BASE}/reverse-logistics/initiate`, payload, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && res.data.rtoCase) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend offline, initiating RTO case locally:', err);
    }
  }

  const newId = Date.now();
  const caseNum = 'RTO-2026-00' + Math.floor(45 + Math.random() * 50);
  const rlrNum = 'RLR-2026-' + Math.floor(8850 + Math.random() * 100);
  const nowIso = new Date().toISOString();

  const newCase: RtoReturnCase = {
    id: newId,
    caseNumber: caseNum,
    originalBookingNumber: payload.originalBookingNumber || 'ASK-BK-9182',
    originalLrNumber: payload.originalLrNumber || 'ASK-LR-2026-98102',
    reverseLrNumber: rlrNum,
    returnReason: payload.returnReason || 'Damaged in Transit / Consignee Rejection',
    damageSeverity: payload.damageSeverity || 'Major Goods Damaged',
    customerRefundClaimed: Number(payload.claimAmount) || 48500,
    damagePhotoUrl: payload.damagePhotoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
    originFactory: payload.originFactory || 'North Star Auto Components (Pune Factory)',
    consigneeWhoRejected: payload.consigneeWhoRejected || 'Speedcraft Motors Depot',
    currentReverseHub: 'Origin Terminal QA Gate',
    status: 'RTO_Initiated',
    createdAt: nowIso,
    updatedAt: nowIso,
    timeline: [
      { timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), title: 'RTO Case Registered', description: `Consignee rejected delivery: ${payload.returnReason || 'Damaged'}. Reverse LR ${rlrNum} generated.`, location: 'Delivery Gate' }
    ]
  };

  try {
    const raw = localStorage.getItem('ask_custom_rto_cases');
    const list: RtoReturnCase[] = raw ? JSON.parse(raw) : [];
    list.unshift(newCase);
    localStorage.setItem('ask_custom_rto_cases', JSON.stringify(list));
  } catch {
    // ignore
  }

  return {
    success: true,
    message: `RTO Case ${caseNum} initiated with Reverse Lorry Receipt ${rlrNum}!`,
    rtoCase: newCase
  };
}

export async function updateRtoStatus(
  caseId: number,
  payload: { status: string; currentHub?: string; notes?: string }
): Promise<{ success: boolean; message: string; rtoCase: RtoReturnCase }> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.post(`${API_BASE}/reverse-logistics/cases/${caseId}/status`, payload, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend offline, updating status locally:', err);
    }
  }

  try {
    const raw = localStorage.getItem('ask_custom_rto_cases');
    let list: RtoReturnCase[] = raw ? JSON.parse(raw) : [];
    const nowStr = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    list = list.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          status: payload.status as any,
          currentReverseHub: payload.currentHub || c.currentReverseHub,
          updatedAt: new Date().toISOString(),
          timeline: [
            { timestamp: nowStr, title: `Status: ${payload.status.replace(/_/g, ' ')}`, description: payload.notes || 'Consignment milestone updated.', location: payload.currentHub || c.currentReverseHub },
            ...c.timeline
          ]
        };
      }
      return c;
    });
    localStorage.setItem('ask_custom_rto_cases', JSON.stringify(list));
  } catch {
    // ignore
  }

  return {
    success: true,
    message: `RTO case milestone updated to ${payload.status.replace(/_/g, ' ')}!`,
    rtoCase: {} as any
  };
}
