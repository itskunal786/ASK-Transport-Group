import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:5208/api';
const API_BASE = `${API_ROOT}/ai`;

export interface BoxItem {
  id: string;
  label: string;
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  weightKg: number;
  quantity: number;
  color: string;
  isFragile: boolean;
}

export interface PackedBox {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  l: number;
  w: number;
  h: number;
  weightKg: number;
  color: string;
  isFragile: boolean;
}

export interface TruckSpecs {
  truckType: string;
  displayName: string;
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  totalVolumeFt3: number;
  maxPayloadKg: number;
  axles: number;
}

export interface LoadUtilization {
  loadedBoxesCount: number;
  unplacedBoxesCount: number;
  loadedVolumeFt3: number;
  volumeUtilizationPercent: number;
  totalWeightKg: number;
  weightUtilizationPercent: number;
  remainingCapacityKg: number;
  isAxleOverloaded: boolean;
  axleSafetyRating: string;
  centerOfGravity: {
    status: string;
    frontAxlePercent: number;
    rearAxlePercent: number;
    stabilityScore: number;
  };
}

export interface LoadOptimizationResult {
  truckSpecs: TruckSpecs;
  utilization: LoadUtilization;
  stackingRecommendations: string[];
  packedBoxes: PackedBox[];
}

export interface OcrScanResult {
  documentType: string;
  documentCategory: string;
  extractedData: Record<string, any>;
  confidenceScore: number;
  processingTimeMs: number;
  securityVerification: Record<string, any>;
}

export interface TollPlazaItem {
  name: string;
  highway: string;
  fastagCost: number;
  location: string;
}

export interface CityNoEntryItem {
  city: string;
  timing: string;
  rule: string;
  windowStatus: string;
}

export interface RouteCostPredictionResult {
  corridor: {
    originCity: string;
    destinationCity: string;
    highwayName: string;
    distanceKm: number;
    transitTimeHours: number;
    commercialConvoySpeedKmh: number;
  };
  costBreakdown: {
    truckCategory: string;
    mileageKmPerLiter: number;
    dieselPricePerLiter: number;
    dieselRequiredLiters: number;
    dieselCost: number;
    fastagTollCost: number;
    tollPlazaCount: number;
    driverAllowanceBhatta: number;
    incidentalMaintenance: number;
    totalOperatingCost: number;
  };
  profitability: {
    recommendedFreightQuote: number;
    netOperatingProfit: number;
    marginPercentage: number;
    breakEvenKmRate: number;
    recommendedPerKmRate: number;
  };
  tollPlazas: TollPlazaItem[];
  cityNoEntryRestrictions: CityNoEntryItem[];
}

export async function ocrScanDocument(params: {
  documentType: string;
  presetType?: string;
  imageBase64?: string;
  rawText?: string;
}): Promise<OcrScanResult> {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_BASE}/ocr-scan`, params, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
}

export async function optimize3dLoad(params: {
  truckType: string;
  boxes?: BoxItem[];
}): Promise<LoadOptimizationResult> {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_BASE}/optimize-3d-load`, params, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
}

export async function predictRouteAndCosts(params: {
  originCity: string;
  destinationCity: string;
  truckCategory?: string;
  dieselPricePerLiter?: number;
  customMileageKmPerLiter?: number;
}): Promise<RouteCostPredictionResult> {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_BASE}/route-toll-cost-predictor`, params, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
}
