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


// 5. DRIVER TRIP SETTLEMENT & HISAAB PARCHI
export type DriverSettlementStatus = 
  | 'DRAFT_PENDING_APPROVAL' 
  | 'SETTLED_CASH_PAID' 
  | 'RECOVERED_FROM_NEXT_TRIP' 
  | 'DISPUTED_AUDIT';

export interface DriverTripSettlement {
  id: string;
  settlementNo: string;
  tripSheetNo: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  originCity: string;
  destinationCity: string;
  totalTripKm: number;
  standardKmpl: number;
  actualKmpl: number;
  dieselLitersActual: number;
  dieselLitersStandard: number;
  dieselPenaltyBonusInr: number;
  advanceCashGivenInr: number;
  dieselCardAdvanceInr: number;
  fastagTollActualInr: number;
  driverBhattaFoodInr: number;
  loadingUnloadingExpensesInr: number;
  enrouteMaintenanceRtoInr: number;
  totalAuthorizedExpensesInr: number;
  netPayableToDriverInr: number;
  recoverableFromDriverInr: number;
  status: DriverSettlementStatus;
  settledDate?: string;
  auditedBy: string;
  notes?: string;
}

// 6. GOVT AIS-140 GPS & HIGHWAY SAFETY RADAR
export type Ais140AlertSeverity = 
  | 'NORMAL_COMPLIANT' 
  | 'WARNING_SPEED' 
  | 'FATIGUE_REST_REQUIRED' 
  | 'EMERGENCY_PANIC_SOS';

export interface Ais140SafetyTelemetry {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  currentSpeedKmph: number;
  speedLimitKmph: number;
  latitude: number;
  longitude: number;
  currentHighwayLocation: string;
  continuousDrivingHours: number;
  isNightDriving: boolean;
  fatigueWarning: boolean;
  panicButtonTriggered: boolean;
  gpsTamperAlert: boolean;
  harshBrakingCount: number;
  rapidAccelerationCount: number;
  severity: Ais140AlertSeverity;
  lastPingAt: string;
  nearestPoliceEmergencyContact: string;
}

// 7. RTO BORDER CHECK-POST COMPLIANCE VAULT
export interface RtoBorderInspectionDossier {
  id: string;
  dossierQrToken: string;
  vehicleNumber: string;
  driverName: string;
  driverDlNumber: string;
  driverDlExpiry: string;
  rcNumber: string;
  rcFitnessExpiry: string;
  nationalPermitExpiry: string;
  insurancePolicyNo: string;
  insuranceExpiry: string;
  pucPollutionExpiry: string;
  activeEwbNo: string;
  activeBiltyNo: string;
  taxTokenReceiptNo: string;
  isAllClearForInterstate: boolean;
  flaggedComplianceNotes?: string;
  verifiedAt: string;
}

// 8. CORPORATE CLAIMS & SLA DISPUTE SHIELD
export type CargoClaimStatus = 
  | 'REGISTERED_UNDER_REVIEW' 
  | 'SURVEYOR_INSPECTION' 
  | 'DEBIT_NOTE_ISSUED' 
  | 'APPROVED_SETTLED' 
  | 'REJECTED_UNJUSTIFIED';

export type ClaimDisputeReason = 
  | 'WATER_RAIN_DAMAGE' 
  | 'TRANSIT_IMPACT_BREAKAGE' 
  | 'SHORTAGE_PILFERAGE' 
  | 'DELAYED_DELIVERY_SLA' 
  | 'TEMPERATURE_EXCURSION';

export interface CorporateCargoClaim {
  id: string;
  claimTicketNo: string;
  shipperCorporateName: string;
  consignmentNo: string;
  invoiceNo: string;
  invoiceValueInr: number;
  claimAmountInr: number;
  settledAmountInr: number;
  reason: ClaimDisputeReason;
  status: CargoClaimStatus;
  incidentLocation: string;
  surveyorReportDetails?: string;
  debitNoteRefNo?: string;
  cargoPhotosUploadedCount: number;
  slaTargetDeliveryTime: string;
  actualDeliveryTime: string;
  delayHours: number;
  filedDate: string;
}


// 9. SUPERADMIN EXECUTIVE PROFITABILITY & MARGIN RADAR
export type ProfitabilityHealthStatus = 'HighMarginProfitable' | 'ModerateMargin' | 'LossMakingCritical';

export interface ExecutiveRouteProfitability {
  id: string;
  corridorLane: string;
  originHub: string;
  destinationHub: string;
  totalTripsExecuted: number;
  totalFreightRevenueInr: number;
  totalDieselCostInr: number;
  totalTollExpensesInr: number;
  totalDriverBhattaInr: number;
  totalMarketFleetPayoutInr: number;
  totalEnrouteMiscMaintenanceInr: number;
  netGrossMarginInr: number;
  netProfitPercentage: number;
  healthStatus: ProfitabilityHealthStatus;
  rankPosition: number;
  periodMonthYear: string;
}

export interface BranchPerformanceRanking {
  id: string;
  branchCode: string;
  branchCity: string;
  regionZone: string;
  monthlyDispatchedTonnage: number;
  averageTurnaroundTimeHours: number;
  slaDeliveryCompliancePercent: number;
  totalRevenueInr: number;
  branchNetProfitInr: number;
  performanceTier: 'Platinum Alpha' | 'Gold Standard' | 'Under Review';
}

// 10. CA & TAX AUDIT VAULT
export type GstTaxFilingType = 'Gstr1B2B' | 'Gstr3BMonthlySummary' | 'RcmFivePercent' | 'Tds194C26As';

export interface TaxAuditVaultEntry {
  id: string;
  auditPeriodQuarter: string;
  taxFilingType: GstTaxFilingType;
  documentReferenceNo: string;
  partyGstin: string;
  partyLegalName: string;
  taxableFreightAmountInr: number;
  cgstAmountInr: number;
  sgstAmountInr: number;
  igstAmountInr: number;
  rcmApplicable: boolean;
  rcmTaxLiabilityInr: number;
  section194CTdsDeductedInr: number;
  tdsCertificateNumber: string;
  filingStatus: 'READY_FOR_PORTAL' | 'FILED_ACKNOWLEDGED' | 'UNDER_RECONCILIATION';
  generatedTimestamp: string;
}

// 11. PHYSICAL POD INWARD & BARCODE SCANNER
export type PhysicalPodVerificationStatus = 'PendingInward' | 'ScannedVerified' | 'ShortageRejected' | 'PaymentReleased';
export type TransshipmentReason = 'EngineBreakdown' | 'AccidentDamage' | 'AxlePuncture' | 'OverloadTransshipment';

export interface PhysicalPodInwardReceipt {
  id: string;
  biltyLrNumber: string;
  barcodeToken: string;
  consignmentNo: string;
  consignorName: string;
  consigneeName: string;
  destinationCity: string;
  transporterBrokerName: string;
  vehicleNumber: string;
  driverName: string;
  totalFreightInr: number;
  advance70PercentPaidInr: number;
  balance30PercentDueInr: number;
  physicalSignedCopyReceived: boolean;
  consigneeStampVerified: boolean;
  opticalBarcodeScannedAt?: string;
  scannedByOperator: string;
  verificationStatus: PhysicalPodVerificationStatus;
  payoutReleaseTransactionRef?: string;
}

export interface EmergencyTransshipmentRescue {
  id: string;
  breakdownIncidentNo: string;
  originalVehiclePlate: string;
  breakdownLocation: string;
  breakdownReason: TransshipmentReason;
  assignedRescueVehiclePlate: string;
  rescueDriverName: string;
  rescueDriverPhone: string;
  craneMechanicDispatched: boolean;
  transshipmentCargoStatus: string;
  incidentReportedAt: string;
  resolvedAt?: string;
}

// 12. CUSTOMER CONSIGNEE DIRECTORY & SHAREABLE TRACKING
export interface CustomerConsigneeDirectory {
  id: string;
  customerId: string;
  consigneeLegalTitle: string;
  tradeBrandName: string;
  gstinNumber: string;
  completeAddress: string;
  destinationCity: string;
  pincode: string;
  stateCode: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  dockUnloadingInstructions: string;
  isFavorite: boolean;
}

export interface ShareableTrackingSession {
  id: string;
  consignmentNo: string;
  secureAccessPin: string;
  shareToken: string;
  publicUrlSlug: string;
  receiverPartyName: string;
  receiverPhone: string;
  expiresAt: string;
  isActive: boolean;
}
