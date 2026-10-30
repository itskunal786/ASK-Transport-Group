// ============================================================================
// CLEAN ARCHITECTURE COMPONENT BARREL EXPORTS
// ============================================================================

// 1. OPERATIONS & TERMINAL DISPATCH
export { default as DockYardGatePassManager } from './DockYardGatePassManager';
export { default as ElectronicWeighbridgeDeck } from './ElectronicWeighbridgeDeck';
export { default as NicEwayBillAutoExtensionSuite } from './NicEwayBillAutoExtensionSuite';
export { default as RtoBorderCheckpostVault } from './RtoBorderCheckpostVault';
export { default as ConsignmentLRModal } from './ConsignmentLRModal';
export type { ConsignmentLRData } from './ConsignmentLRModal';
export { default as DispatchChallanModal } from './DispatchChallanModal';
export type { DispatchChallanData } from './DispatchChallanModal';
export { default as ManualBiltyModal } from './ManualBiltyModal';
export { default as ElectronicPodModal } from './ElectronicPodModal';
export type { PodData } from './ElectronicPodModal';
export { default as DigitalPodVerifyModal } from './DigitalPodVerifyModal';

// 2. FLEET, DRIVERS & TELEMATICS
export { default as FleetOperationsDeck } from './FleetOperationsDeck';
export { default as TyreLifecycleTpmsRadar } from './TyreLifecycleTpmsRadar';
export { default as DriverTripSettlementHisaab } from './DriverTripSettlementHisaab';
export { default as Ais140SafetyTelematicsRadar } from './Ais140SafetyTelematicsRadar';
export { default as FleetFuelAntiTheftRadar } from './FleetFuelAntiTheftRadar';
export { default as ColdChainTemperatureRadar } from './ColdChainTemperatureRadar';
export { default as VehicleMaintenanceRadar } from './VehicleMaintenanceRadar';
export { default as FleetTripExpenseManager } from './FleetTripExpenseManager';
export { default as LiveGpsRouteMap } from './LiveGpsRouteMap';

// 3. FINANCE, ERP & BILLING
export { default as FinanceAccountingDeck } from './FinanceAccountingDeck';
export { default as MarketFleetSettlementDeck } from './MarketFleetSettlementDeck';
export { default as GovtEInvoiceManager } from './GovtEInvoiceManager';
export { default as CustomerCreditLedgerManager } from './CustomerCreditLedgerManager';
export { default as TallyZohoErpSyncDeck } from './TallyZohoErpSyncDeck';
export { default as GstTaxInvoiceModal } from './GstTaxInvoiceModal';
export type { GstInvoiceData } from './GstTaxInvoiceModal';

// 4. AI & AUTOMATION DECK
export { default as AiOperationsDeck } from './AiOperationsDeck';
export { default as SpotFreightRateAiPredictor } from './SpotFreightRateAiPredictor';
export { default as WhatsAppAiLogisticsBot } from './WhatsAppAiLogisticsBot';
export { default as AiTruckLoadVisualizer } from './AiTruckLoadVisualizer';
export { default as AiRouteCostPredictor } from './AiRouteCostPredictor';
export { default as AiOcrScannerModal } from './AiOcrScannerModal';

// 5. ENTERPRISE B2B, BULK & REVERSE LOGISTICS
export { default as EnterpriseB2BDeck } from './EnterpriseB2BDeck';
export { default as BulkBookingUpload } from './BulkBookingUpload';
export { default as BulkExcelBookingEngine } from './BulkExcelBookingEngine';
export { default as FreightBiddingMarketplace } from './FreightBiddingMarketplace';
export { default as ReverseLogisticsRtoManager } from './ReverseLogisticsRtoManager';
export { default as CorporateCargoClaimsManager } from './CorporateCargoClaimsManager';

// 6. EXECUTIVE GOVERNANCE, AUDIT & CUSTOMER CONNECT
export { default as ExecutiveProfitabilityRadar } from './ExecutiveProfitabilityRadar';
export { default as CaTaxAuditVault } from './CaTaxAuditVault';
export { default as PhysicalPodInwardDeck } from './PhysicalPodInwardDeck';
export { default as ConsigneeAddressBookModal } from './ConsigneeAddressBookModal';
export { default as WhatsAppTrackShareModal } from './WhatsAppTrackShareModal';

// 7. COMMON & CORE INFRASTRUCTURE
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ThemeToggle } from './ThemeToggle';
export { default as AccessRestrictedNotice } from './AccessRestrictedNotice';
export { default as PublicNavbar } from './PublicNavbar';
export { default as PublicFooter } from './PublicFooter';
export { default as LanguageToggle } from './LanguageToggle';
