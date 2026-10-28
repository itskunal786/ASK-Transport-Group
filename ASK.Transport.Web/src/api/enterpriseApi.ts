import axios from 'axios';

const API_BASE = '/api/enterprise';

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

export async function getReverseLogisticsCases(): Promise<RtoSummaryResponse> {
  const res = await axios.get(`${API_BASE}/reverse-logistics/cases`, { headers: getAuthHeaders() });
  return res.data;
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
  const res = await axios.post(`${API_BASE}/reverse-logistics/initiate`, payload, { headers: getAuthHeaders() });
  return res.data;
}

export async function updateRtoStatus(
  caseId: number,
  payload: { status: string; currentHub?: string; notes?: string }
): Promise<{ success: boolean; message: string; rtoCase: RtoReturnCase }> {
  const res = await axios.post(`${API_BASE}/reverse-logistics/cases/${caseId}/status`, payload, { headers: getAuthHeaders() });
  return res.data;
}
