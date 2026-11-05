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

export const DEFAULT_DEMO_BULK_CONSIGNMENTS: BulkConsignmentItem[] = [
  {
    rowIndex: 1,
    consignorName: 'Tata AutoComp Systems Ltd',
    consigneeName: 'North Star Motors',
    consigneePhone: '+91 98110 44219',
    deliveryAddress: 'Plot 88 Phase 2 IMT Manesar',
    pincode: '122050',
    city: 'Gurugram, HR',
    goodsDescription: 'Auto Gear Castings & Bearings',
    packageCount: 24,
    weightKg: 650.0,
    declaredValue: 78000,
    paymentMode: 'To-Pay',
    isValid: true,
    validationErrors: [],
    estimatedFreight: 6956
  },
  {
    rowIndex: 2,
    consignorName: 'Tata AutoComp Systems Ltd',
    consigneeName: 'Speedway Parts Depot',
    consigneePhone: '+91 98230 11452',
    deliveryAddress: 'Gala 14 Phase 3 GIDC Naroda',
    pincode: '382330',
    city: 'Ahmedabad, GJ',
    goodsDescription: 'Two-Wheeler Disc Brake Kits',
    packageCount: 16,
    weightKg: 420.0,
    declaredValue: 46000,
    paymentMode: 'Prepaid',
    isValid: true,
    validationErrors: [],
    estimatedFreight: 4662
  },
  {
    rowIndex: 3,
    consignorName: 'Tata AutoComp Systems Ltd',
    consigneeName: 'Kirloskar Power Assemblies',
    consigneePhone: '+91 98900 44123',
    deliveryAddress: 'Plot 14 Peenya Industrial Area',
    pincode: '560058',
    city: 'Bengaluru, KA',
    goodsDescription: 'Heavy Forged Crankshafts',
    packageCount: 8,
    weightKg: 890.0,
    declaredValue: 125000,
    paymentMode: 'To-Pay',
    isValid: true,
    validationErrors: [],
    estimatedFreight: 9350
  },
  {
    rowIndex: 4,
    consignorName: 'Tata AutoComp Systems Ltd',
    consigneeName: 'Apex Auto Sub-Assemblies',
    consigneePhone: '+91 97110 33214',
    deliveryAddress: 'Sector 8 DSIIDC Complex',
    pincode: '201301',
    city: 'Noida, UP',
    goodsDescription: 'Polymer Dashboards & Panels',
    packageCount: 30,
    weightKg: 510.0,
    declaredValue: 62000,
    paymentMode: 'COD',
    isValid: true,
    validationErrors: [],
    estimatedFreight: 5560
  },
  {
    rowIndex: 5,
    consignorName: 'Tata AutoComp Systems Ltd',
    consigneeName: 'Southern Auto Engineering',
    consigneePhone: '+91 94440 12891',
    deliveryAddress: 'Road 3 Ambattur Industrial Estate',
    pincode: '600058',
    city: 'Chennai, TN',
    goodsDescription: 'Alternators & Starter Motors',
    packageCount: 18,
    weightKg: 340.0,
    declaredValue: 55000,
    paymentMode: 'Prepaid',
    isValid: true,
    validationErrors: [],
    estimatedFreight: 3864
  },
  {
    rowIndex: 6,
    consignorName: 'Tata AutoComp Systems Ltd',
    consigneeName: 'Jaipur Wheels Hub',
    consigneePhone: '+91 94140 33901',
    deliveryAddress: 'VKI Industrial Area Road 9',
    pincode: '302013',
    city: 'Jaipur, RJ',
    goodsDescription: 'Alloy Wheel Rims & Studs',
    packageCount: 12,
    weightKg: 390.0,
    declaredValue: 42000,
    paymentMode: 'To-Pay',
    isValid: true,
    validationErrors: [],
    estimatedFreight: 4363
  },
  {
    rowIndex: 7,
    consignorName: 'Tata AutoComp Systems Ltd',
    consigneeName: 'Deccan Heavy Spares',
    consigneePhone: '+91 98490 88210',
    deliveryAddress: 'Plot 66 IDA Jeedimetla',
    pincode: '500055',
    city: 'Hyderabad, TS',
    goodsDescription: 'Radiators & Cooling Fans',
    packageCount: 20,
    weightKg: 470.0,
    declaredValue: 59000,
    paymentMode: 'To-Pay',
    isValid: true,
    validationErrors: [],
    estimatedFreight: 5161
  },
  {
    rowIndex: 8,
    consignorName: 'Tata AutoComp Systems Ltd',
    consigneeName: 'Central India Trans Hub',
    consigneePhone: '+91 97550 44102',
    deliveryAddress: 'Transport Nagar Ring Road',
    pincode: '482002',
    city: 'Jabalpur, MP',
    goodsDescription: 'Suspension Bushings & Shocks',
    packageCount: 15,
    weightKg: 360.0,
    declaredValue: 38000,
    paymentMode: 'Prepaid',
    isValid: true,
    validationErrors: [],
    estimatedFreight: 4064
  }
];

export function computeBulkPreview(items: BulkConsignmentItem[]): BulkImportPreviewResponse {
  const totalWeight = items.reduce((acc, it) => acc + (it.weightKg || 0), 0);
  const totalPackages = items.reduce((acc, it) => acc + (it.packageCount || 0), 0);
  const totalDeclared = items.reduce((acc, it) => acc + (it.declaredValue || 0), 0);
  const totalFreight = items.reduce((acc, it) => acc + (it.estimatedFreight || 0), 0);
  const validCount = items.filter(it => it.isValid).length;
  const errorCount = items.filter(it => !it.isValid).length;

  return {
    totalRecords: items.length,
    validCount,
    errorCount,
    totalWeightKg: totalWeight,
    totalPackages,
    totalDeclaredValue: totalDeclared,
    totalEstimatedFreight: totalFreight,
    previewItems: items
  };
}

export async function getBulkSampleTemplate(): Promise<{ sampleCsv: string; instructions: string }> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.get(`${API_BASE}/bulk-booking/sample-template`, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && res.data.sampleCsv) return res.data;
    } catch {
      // fallback
    }
  }

  const sampleCsv = `ConsignorName,ConsigneeName,ConsigneePhone,DeliveryAddress,Pincode,City,GoodsDescription,PackageCount,WeightKg,DeclaredValue,PaymentMode
Tata Motors Ltd,North Star Auto,9811044219,Plot 88 Phase 2 IMT Manesar,122050,Gurugram,Auto Gear Castings,24,650.0,78000,To-Pay
Bajaj Industrial,Speedway Logistics,9823011452,Warehouse 4 GIDC Naroda,382330,Ahmedabad,Two-Wheeler Brake Discs,16,420.0,46000,Prepaid
Bharat Forge Ltd,Kirloskar Engine Hub,9890044123,Plot 14 Industrial Area,560058,Bengaluru,Forged Crankshafts,8,890.0,125000,To-Pay
Mahindra Auto,Apex Assemblies,9711033214,Gala 102 Sector 8,201301,Noida,Engine Mount Brackets,30,510.0,62000,COD
Lucas TVS Ltd,Southern Auto Spares,9444012891,Ambattur Estate Road 3,600058,Chennai,Alternator Assemblies,18,340.0,55000,Prepaid`;

  return {
    sampleCsv,
    instructions: 'Upload or paste comma-separated values (CSV) with valid 6-digit Indian PIN codes and 10-digit mobile numbers.'
  };
}

export async function previewBulkConsignments(payload: { csvText?: string; items?: BulkConsignmentItem[] }): Promise<BulkImportPreviewResponse> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.post(`${API_BASE}/bulk-booking/preview`, payload, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && res.data.previewItems) return res.data;
    } catch {
      // fallback
    }
  }

  if (payload.csvText && payload.csvText.trim().length > 0) {
    const lines = payload.csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    const parsed: BulkConsignmentItem[] = [];
    let isHeader = true;
    let rIdx = 1;

    for (const line of lines) {
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 5) continue;
      if (isHeader && (cols[0].toLowerCase().includes('consignor') || cols[1].toLowerCase().includes('consignee'))) {
        isHeader = false;
        continue;
      }
      isHeader = false;

      const wt = parseFloat(cols[8]) || 250;
      const val = parseFloat(cols[9]) || 35000;
      const pk = parseInt(cols[7], 10) || 10;
      const phone = cols[2] || '9800000000';
      const pin = cols[4] || '411001';

      const errors: string[] = [];
      if (!cols[1]) errors.push('Consignee name is required.');
      if (phone.replace(/\D/g, '').length < 10) errors.push('Consignee phone must have at least 10 digits.');
      if (pin.replace(/\D/g, '').length !== 6) errors.push('Indian PIN code must be exactly 6 digits.');

      const estFreight = Math.round((450 + wt * 9.5) * 1.05);

      parsed.push({
        rowIndex: rIdx++,
        consignorName: cols[0] || 'Factory Shipper',
        consigneeName: cols[1] || 'Consignee Partner',
        consigneePhone: phone,
        deliveryAddress: cols[3] || 'Industrial Depot',
        pincode: pin,
        city: cols[5] || 'Destination Hub',
        goodsDescription: cols[6] || 'General Cargo',
        packageCount: pk,
        weightKg: wt,
        declaredValue: val,
        paymentMode: cols[10] || 'To-Pay',
        isValid: errors.length === 0,
        validationErrors: errors,
        estimatedFreight: estFreight
      });
    }

    if (parsed.length > 0) {
      return computeBulkPreview(parsed);
    }
  }

  if (payload.items && payload.items.length > 0) {
    return computeBulkPreview(payload.items);
  }

  return computeBulkPreview(DEFAULT_DEMO_BULK_CONSIGNMENTS);
}

export async function processBulkBookings(payload: {
  batchTitle?: string;
  shipperName?: string;
  shipperGstin?: string;
  items?: BulkConsignmentItem[];
}): Promise<BulkProcessResponse> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.post(`${API_BASE}/bulk-booking/process`, payload, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && res.data.generatedBilties) return res.data;
    } catch {
      // fallback
    }
  }

  const itemsToProcess = payload.items && payload.items.length > 0 ? payload.items : DEFAULT_DEMO_BULK_CONSIGNMENTS;
  const validItems = itemsToProcess.filter(x => x.isValid);
  const items = validItems.length > 0 ? validItems : itemsToProcess;

  const batchId = `BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const baseLr = Math.floor(88200 + Math.random() * 600);

  const bilties: GeneratedBiltyDto[] = items.map((it, idx) => {
    const lrNum = baseLr + idx;
    const lrStr = `ASK-LR-2026-${lrNum}`;
    const freight = it.estimatedFreight || Math.round(450 + it.weightKg * 9.5);

    return {
      lrNumber: lrStr,
      barcode: `*ASK${lrNum}*`,
      consigneeName: it.consigneeName,
      consigneeCity: `${it.city} (${it.pincode})`,
      pincode: it.pincode,
      goodsDescription: it.goodsDescription,
      packages: it.packageCount,
      weightKg: it.weightKg,
      freightAmount: freight,
      paymentMode: it.paymentMode,
      trackingUrl: `/track?lr=${lrStr}`
    };
  });

  const totalWeight = bilties.reduce((a, b) => a + b.weightKg, 0);
  const totalPkgs = bilties.reduce((a, b) => a + b.packages, 0);
  const totalFreight = bilties.reduce((a, b) => a + b.freightAmount, 0);

  const result: BulkProcessResponse = {
    batchId,
    batchTitle: payload.batchTitle || `Corporate Dispatch Batch #${batchId}`,
    shipperName: payload.shipperName || 'Tata AutoComp Systems Ltd',
    processedAt: new Date().toISOString(),
    totalProcessed: bilties.length,
    totalWeightKg: totalWeight,
    totalPackages: totalPkgs,
    totalFreightAmount: totalFreight,
    generatedBilties: bilties
  };

  try {
    const raw = localStorage.getItem('ask_custom_bulk_batches');
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(result);
    localStorage.setItem('ask_custom_bulk_batches', JSON.stringify(list));
  } catch {
    // ignore
  }

  return result;
}

export async function getBulkBatches(): Promise<BulkBatchRecord[]> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.get(`${API_BASE}/bulk-booking/batches`, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {
      // fallback
    }
  }

  try {
    const raw = localStorage.getItem('ask_custom_bulk_batches');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }

  return [];
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

export const DEFAULT_MARKETPLACE_LOADS: MarketplaceLoad[] = [
  {
    id: 1,
    loadNumber: 'LOAD-2026-9810',
    shipperName: 'Tata Motors Commercial Vehicles Ltd',
    originHub: 'Pune Chakan Hub, Maharashtra',
    destinationHub: 'Gurugram IMT Manesar Hub, Haryana',
    distanceKm: 1450,
    cargoDescription: 'Heavy Auto Transmission Gearboxes & Sub-Assemblies',
    weightTons: 16.5,
    requiredTruckType: '32 Ft MXL Container (Multi-Axle)',
    targetBudget: 85000,
    currentLowestBid: 78500,
    auctionExpiryTime: new Date(Date.now() + 485000).toISOString(),
    secondsRemaining: 485,
    status: 'ActiveAuction',
    bids: [
      { id: 101, loadId: 1, transporterName: 'Jai Hind Express Logistics', transporterPhone: '+91 98210 44102', rating: 4.8, totalTripsCompleted: 142, truckNumber: 'MH-04-AB-9921', offeredRate: 78500, etaPickupHours: 2, bidPlacedAt: '10:30 PM', isSelected: true },
      { id: 102, loadId: 1, transporterName: 'Northern Freight Carrier', transporterPhone: '+91 98112 33451', rating: 4.6, totalTripsCompleted: 88, truckNumber: 'HR-55-XY-4412', offeredRate: 81000, etaPickupHours: 3, bidPlacedAt: '10:15 PM', isSelected: false },
      { id: 103, loadId: 1, transporterName: 'Surat Highway Roadlines', transporterPhone: '+91 98250 88912', rating: 4.5, totalTripsCompleted: 64, truckNumber: 'GJ-05-BZ-7810', offeredRate: 83500, etaPickupHours: 4, bidPlacedAt: '09:50 PM', isSelected: false }
    ]
  },
  {
    id: 2,
    loadNumber: 'LOAD-2026-9812',
    shipperName: 'Reliance Retail FMCG Hub',
    originHub: 'Bengaluru Hoskote CDC, Karnataka',
    destinationHub: 'Chennai Sriperumbudur Hub, Tamil Nadu',
    distanceKm: 340,
    cargoDescription: 'Packaged Foods & Beverages (Palletized FMCG)',
    weightTons: 10.0,
    requiredTruckType: '24 Ft Multi-Axle Container',
    targetBudget: 32000,
    currentLowestBid: 28400,
    auctionExpiryTime: new Date(Date.now() + 720000).toISOString(),
    secondsRemaining: 720,
    status: 'ActiveAuction',
    bids: [
      { id: 201, loadId: 2, transporterName: 'Southern Star Roadways', transporterPhone: '+91 94440 12890', rating: 4.9, totalTripsCompleted: 210, truckNumber: 'KA-01-MJ-5510', offeredRate: 28400, etaPickupHours: 1, bidPlacedAt: '10:38 PM', isSelected: true },
      { id: 202, loadId: 2, transporterName: 'Kaveri Transport Corporation', transporterPhone: '+91 94480 33910', rating: 4.7, totalTripsCompleted: 115, truckNumber: 'TN-09-CD-3390', offeredRate: 29800, etaPickupHours: 2, bidPlacedAt: '10:20 PM', isSelected: false }
    ]
  },
  {
    id: 3,
    loadNumber: 'LOAD-2026-9805',
    shipperName: 'Jindal Steel & Power Ltd',
    originHub: 'Raigarh Heavy Steel Works, Chhattisgarh',
    destinationHub: 'Faridabad Industrial Area, Haryana',
    distanceKm: 1220,
    cargoDescription: 'Cold Rolled Steel Coils (ODC Industrial Freight)',
    weightTons: 28.0,
    requiredTruckType: '40 Ft High-Bed Trailer (Triple-Axle)',
    targetBudget: 145000,
    currentLowestBid: 138000,
    auctionExpiryTime: '2026-11-04T20:00:00Z',
    secondsRemaining: 0,
    status: 'ContractLocked',
    winningTransporter: 'National Heavy Haulage Pvt Ltd',
    acceptedRate: 138000,
    brokerageFeeEarned: 7000,
    bids: [
      { id: 301, loadId: 3, transporterName: 'National Heavy Haulage Pvt Ltd', transporterPhone: '+91 98100 99420', rating: 4.9, totalTripsCompleted: 340, truckNumber: 'CG-04-TR-9012', offeredRate: 138000, etaPickupHours: 2, bidPlacedAt: '06:20 PM', isSelected: true }
    ]
  }
];

export async function getMarketplaceLoads(): Promise<MarketplaceLoad[]> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.get(`${API_BASE}/marketplace/loads`, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend unavailable, returning stored marketplace loads:', err);
    }
  }

  let customLoads: MarketplaceLoad[] = [];
  try {
    const raw = localStorage.getItem('ask_custom_marketplace_loads');
    if (raw) customLoads = JSON.parse(raw);
  } catch {
    // ignore
  }

  return [...customLoads, ...DEFAULT_MARKETPLACE_LOADS];
}

export async function refreshMarketplaceRates(): Promise<MarketplaceLoad[]> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.get(`${API_BASE}/marketplace/loads`, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // fallback to live simulation below
    }
  }

  const current = await getMarketplaceLoads();
  const transporters = [
    { name: 'Northern Roadways Carrier', phone: '+91 98114 99012', rating: 4.8, truck: 'HR-55-AF-1140' },
    { name: 'Apex Fast Haulage Pvt Ltd', phone: '+91 98220 33812', rating: 4.9, truck: 'MH-14-GH-7840' },
    { name: 'Kavita Freight Movers', phone: '+91 94140 88201', rating: 4.7, truck: 'RJ-14-TG-9901' },
    { name: 'Southern Highway Express', phone: '+91 94440 77123', rating: 4.8, truck: 'KA-04-MB-4512' }
  ];

  const updatedLoads = current.map(load => {
    if (load.status === 'ActiveAuction') {
      const transporter = transporters[Math.floor(Math.random() * transporters.length)];
      const drop = Math.floor(Math.random() * 800) + 300;
      const newRate = Math.max(12000, load.currentLowestBid - drop);

      const newBid: MarketplaceBid = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        loadId: load.id,
        transporterName: transporter.name,
        transporterPhone: transporter.phone,
        rating: transporter.rating,
        totalTripsCompleted: Math.floor(75 + Math.random() * 180),
        truckNumber: transporter.truck,
        offeredRate: newRate,
        etaPickupHours: Math.floor(1 + Math.random() * 3),
        bidPlacedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isSelected: true
      };

      const updatedBids = [
        newBid,
        ...(load.bids || []).map(b => ({ ...b, isSelected: false }))
      ];

      return {
        ...load,
        currentLowestBid: newRate,
        secondsRemaining: Math.floor(350 + Math.random() * 500),
        bids: updatedBids
      };
    }
    return load;
  });

  try {
    localStorage.setItem('ask_custom_marketplace_loads', JSON.stringify(updatedLoads));
  } catch {
    // ignore
  }

  return updatedLoads;
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
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.post(`${API_BASE}/marketplace/loads`, payload, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && res.data.load) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend offline, creating marketplace load locally:', err);
    }
  }

  const newId = Date.now();
  const loadNum = 'LOAD-2026-' + Math.floor(9820 + Math.random() * 80);
  const duration = payload.durationMinutes || 15;
  const newLoad: MarketplaceLoad = {
    id: newId,
    loadNumber: loadNum,
    shipperName: payload.shipperName || 'Enterprise Corporate Client',
    originHub: payload.originHub,
    destinationHub: payload.destinationHub,
    distanceKm: Number(payload.distanceKm) || 1200,
    cargoDescription: payload.cargoDescription,
    weightTons: Number(payload.weightTons) || 16,
    requiredTruckType: payload.requiredTruckType,
    targetBudget: Number(payload.targetBudget),
    currentLowestBid: Number(payload.targetBudget),
    auctionExpiryTime: new Date(Date.now() + duration * 60000).toISOString(),
    secondsRemaining: duration * 60,
    status: 'ActiveAuction',
    bids: []
  };

  try {
    const raw = localStorage.getItem('ask_custom_marketplace_loads');
    const list: MarketplaceLoad[] = raw ? JSON.parse(raw) : [];
    list.unshift(newLoad);
    localStorage.setItem('ask_custom_marketplace_loads', JSON.stringify(list));
  } catch {
    // ignore
  }

  return { success: true, load: newLoad };
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
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.post(`${API_BASE}/marketplace/loads/${loadId}/bids`, payload, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data && res.data.load) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend offline, placing bid locally:', err);
    }
  }

  let allLoads = await getMarketplaceLoads();
  let targetLoad = allLoads.find(l => l.id === loadId);
  if (!targetLoad) {
    targetLoad = DEFAULT_MARKETPLACE_LOADS[0];
  }

  const newBid: MarketplaceBid = {
    id: Date.now(),
    loadId,
    transporterName: payload.transporterName,
    transporterPhone: payload.transporterPhone,
    rating: 4.8,
    totalTripsCompleted: Math.floor(40 + Math.random() * 120),
    truckNumber: payload.truckNumber,
    offeredRate: Number(payload.offeredRate),
    etaPickupHours: Number(payload.etaPickupHours) || 2,
    bidPlacedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    isSelected: true
  };

  const updatedBids = [newBid, ...(targetLoad.bids || []).map(b => ({ ...b, isSelected: false }))];
  const lowest = Math.min(...updatedBids.map(b => b.offeredRate));
  const updatedLoad: MarketplaceLoad = {
    ...targetLoad,
    currentLowestBid: lowest,
    bids: updatedBids
  };

  try {
    const raw = localStorage.getItem('ask_custom_marketplace_loads');
    let list: MarketplaceLoad[] = raw ? JSON.parse(raw) : [];
    const exists = list.some(l => l.id === loadId);
    if (exists) {
      list = list.map(l => l.id === loadId ? updatedLoad : l);
    } else {
      list.unshift(updatedLoad);
    }
    localStorage.setItem('ask_custom_marketplace_loads', JSON.stringify(list));
  } catch {
    // ignore
  }

  return { success: true, message: `Bid of ₹${payload.offeredRate.toLocaleString('en-IN')} placed successfully!`, load: updatedLoad };
}

export async function acceptWinningBid(
  loadId: number,
  payload: { bidId?: number }
): Promise<{ success: boolean; message: string; contract: any; load: MarketplaceLoad }> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhostRoot = API_ROOT.includes('localhost') || API_ROOT.includes('127.0.0.1');

  if (!isHttps || !isLocalhostRoot) {
    try {
      const res = await axios.post(`${API_BASE}/marketplace/loads/${loadId}/accept-bid`, payload, { headers: getAuthHeaders(), timeout: 2500 });
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend offline, locking contract locally:', err);
    }
  }

  let allLoads = await getMarketplaceLoads();
  let targetLoad = allLoads.find(l => l.id === loadId) || DEFAULT_MARKETPLACE_LOADS[0];
  const winningBid = targetLoad.bids.find(b => b.id === payload.bidId) || targetLoad.bids[0];
  const acceptedRate = winningBid ? winningBid.offeredRate : targetLoad.currentLowestBid;
  const brokerage = Math.max(1500, Math.round(targetLoad.targetBudget - acceptedRate));

  const lockedLoad: MarketplaceLoad = {
    ...targetLoad,
    status: 'ContractLocked',
    winningTransporter: winningBid ? winningBid.transporterName : 'Accepted Transporter',
    acceptedRate,
    brokerageFeeEarned: brokerage,
    secondsRemaining: 0
  };

  try {
    const raw = localStorage.getItem('ask_custom_marketplace_loads');
    let list: MarketplaceLoad[] = raw ? JSON.parse(raw) : [];
    const exists = list.some(l => l.id === loadId);
    if (exists) {
      list = list.map(l => l.id === loadId ? lockedLoad : l);
    } else {
      list.unshift(lockedLoad);
    }
    localStorage.setItem('ask_custom_marketplace_loads', JSON.stringify(list));
  } catch {
    // ignore
  }

  return {
    success: true,
    message: `Contract locked with ${lockedLoad.winningTransporter} at ₹${acceptedRate.toLocaleString('en-IN')}! Brokerage earned: ₹${brokerage.toLocaleString('en-IN')}`,
    contract: { contractId: `CTR-${Date.now()}`, loadNumber: lockedLoad.loadNumber, acceptedRate },
    load: lockedLoad
  };
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
