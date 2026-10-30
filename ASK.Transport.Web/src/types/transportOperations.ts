// ============================================================================
// CLEAN ARCHITECTURE DOMAIN TYPES: TRANSPORT OPERATIONS
// ============================================================================

// 1. TYRE TELEMATICS & RETREADING
export type WheelPositionKey = 
  | 'FL' | 'FR' 
  | 'R1_LO' | 'R1_LI' | 'R1_RI' | 'R1_RO' 
  | 'R2_LO' | 'R2_LI' | 'R2_RI' | 'R2_RO'
  | 'LIFT_L' | 'LIFT_R';

export type TyreBrand = 'Apollo EnduRace' | 'MRF Steel Muscle' | 'JK Tyre Jetsteel' | 'CEAT Winmile';
export type TyreConditionStatus = 'OPTIMAL' | 'WARNING_LOW' | 'CRITICAL_PUNCTURE' | 'OVER_HEATED';
export type TyreLifecycleStage = 'Virgin (Original)' | '1st Retread (Cold)' | '2nd Retread' | 'Scrap';

export interface TyreItem {
  id: string;
  serialNumber: string;
  brand: TyreBrand;
  sizePattern: string;
  position: WheelPositionKey;
  positionName: string;
  pressurePsi: number;
  temperatureC: number;
  status: TyreConditionStatus;
  treadDepthMm: number;
  stage: TyreLifecycleStage;
  purchaseCostInr: number;
  retreadingCostsInr: number;
  totalKmRun: number;
  costPerKmInr: number;
  fittedDate: string;
  lastInspectionDate: string;
  recommendedAction?: string;
}

export interface TruckTyreFleetRecord {
  plateNo: string;
  truckModel: string;
  configuration: '10-Wheeler (6x4)' | '16-Wheeler Multi-Axle (8x2)';
  driverName: string;
  driverPhone: string;
  currentLocation: string;
  totalTyresCount: number;
  criticalAlertCount: number;
  avgFleetPsi: number;
  avgTreadDepthMm: number;
  tyres: TyreItem[];
}

// 2. DOCK YARD & GATE PASS
export type GatePassType = 'INBOUND_UNLOAD' | 'OUTBOUND_DISPATCH' | 'EMPTY_STAGING' | 'MAINTENANCE_BAY';
export type GatePassStatus = 'AT_GATE' | 'DOCKED' | 'LOADING_UNLOADING' | 'INSPECTION_PENDING' | 'GATE_OUT_CLEARED' | 'DETENTION_WARNING';
export type SealStatus = 'INTACT_VERIFIED' | 'TAMPERED_BROKEN' | 'NOT_APPLICABLE';

export interface GatePassRecord {
  id: string;
  passNumber: string;
  type: GatePassType;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  transporterName: string;
  consignmentNo: string;
  materialType: string;
  cargoWeightTon: number;
  assignedBay: string;
  sealNumber: string;
  sealStatus: SealStatus;
  status: GatePassStatus;
  gateInTime: string;
  dockInTime?: string;
  gateOutTime?: string;
  elapsedMinutes: number;
  targetTatMinutes: number;
  demurrageChargesInr: number;
  securityGuardName: string;
  odometerReadingKm: number;
}

export interface DockBayStatus {
  bayId: string;
  bayName: string;
  type: 'UNLOADING' | 'LOADING' | 'REEFER_COLD_BAY' | 'STAGING';
  status: 'OCCUPIED' | 'AVAILABLE' | 'MAINTENANCE';
  activePassNumber?: string;
  activeVehicle?: string;
  material?: string;
  progressPercent?: number;
  elapsedMinutes?: number;
  targetMinutes: number;
}

// 3. WEIGHBRIDGE & DHARAM KANTA
export type VehicleAxleCategory = 
  | '2-AXLE_6WHEEL'    // 18.5T Limit
  | '3-AXLE_10WHEEL'   // 28.0T Limit
  | '4-AXLE_14WHEEL'   // 35.0T Limit
  | '5-AXLE_16WHEEL'   // 43.5T Limit
  | '6-AXLE_TRAILER';  // 55.0T Limit

export interface WeighbridgeSlipRecord {
  id: string;
  slipNumber: string;
  vehicleNumber: string;
  truckModel: string;
  axleCategory: VehicleAxleCategory;
  axleLabel: string;
  driverName: string;
  driverPhone: string;
  transporterName: string;
  consignmentNo: string;
  materialName: string;
  tareWeightKg: number;
  grossWeightKg: number;
  netCargoWeightKg: number;
  permissibleGvwKg: number;
  overloadKg: number;
  overloadPercent: number;
  status: 'LEGAL_COMPLIANT' | 'OVERLOAD_CRITICAL' | 'TARE_PENDING';
  potentialRtoFineInr: number;
  gatePassLocked: boolean;
  weighedAt: string;
  operatorName: string;
  calibrationCertificateId: string;
}

// 4. SPOT FREIGHT & REVERSE BIDDING
export interface FreightCorridorIndex {
  id: string;
  lane: string;
  originHub: string;
  destinationHub: string;
  distanceKm: number;
  bodyType: 'Container 32ft' | '16-Wheeler Open' | '22-Wheeler Trailer' | 'Reefer Cold';
  recommendedCapacityTon: number;
  currentSpotRateInr: number;
  thirtyDayAvgRateInr: number;
  trendPercentage: number;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
  marketLorryAvailability: 'SURPLUS' | 'BALANCED' | 'DEFICIT_HIGH_DEMAND';
  dieselImpactNote: string;
}

export interface SpotBrokerBid {
  id: string;
  brokerName: string;
  contactPerson: string;
  phone: string;
  vehicleNumber: string;
  vehicleBody: string;
  quotedRateInr: number;
  varianceVsTargetInr: number;
  driverRating: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  bidReceivedTime: string;
}
