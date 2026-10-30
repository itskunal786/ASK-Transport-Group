using ASK.Group.Api.Domain.Enums;

namespace ASK.Group.Api.Domain.Entities;

public class TyreRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string SerialNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = "Apollo EnduRace";
    public string SizePattern { get; set; } = "10.00R20 16PR";
    public TyreWheelPosition Position { get; set; }
    public string PositionName { get; set; } = string.Empty;
    
    // Live TPMS
    public double PressurePsi { get; set; }
    public double TemperatureC { get; set; }
    public TyreConditionStatus Status { get; set; } = TyreConditionStatus.Optimal;
    public double TreadDepthMm { get; set; } = 14.0;
    
    // Financial Lifecycle
    public TyreLifecycleStage Stage { get; set; } = TyreLifecycleStage.Virgin;
    public decimal PurchaseCostInr { get; set; } = 26000m;
    public decimal RetreadingCostsInr { get; set; }
    public double TotalKmRun { get; set; }
    public decimal CostPerKmInr => TotalKmRun > 0 ? (PurchaseCostInr + RetreadingCostsInr) / (decimal)TotalKmRun : 0m;
    
    public DateTime FittedDate { get; set; } = DateTime.UtcNow.AddMonths(-3);
    public DateTime LastInspectionDate { get; set; } = DateTime.UtcNow;
    public string? RecommendedAction { get; set; }
}

public class TruckTyreFleet
{
    public string PlateNo { get; set; } = string.Empty;
    public string TruckModel { get; set; } = string.Empty;
    public string Configuration { get; set; } = "10-Wheeler (6x4)";
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string CurrentLocation { get; set; } = string.Empty;
    public List<TyreRecord> Tyres { get; set; } = [];
}

public class DockBay
{
    public string BayId { get; set; } = string.Empty;
    public string BayName { get; set; } = string.Empty;
    public DockBayType Type { get; set; }
    public DockBayStatus Status { get; set; } = DockBayStatus.Available;
    public string? ActivePassNumber { get; set; }
    public string? ActiveVehicle { get; set; }
    public string? Material { get; set; }
    public int ProgressPercent { get; set; }
    public int ElapsedMinutes { get; set; }
    public int TargetMinutes { get; set; } = 75;
}

public class GatePassRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string PassNumber { get; set; } = string.Empty;
    public GatePassType Type { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string TransporterName { get; set; } = "ASK Dedicated Fleet";
    public string ConsignmentNo { get; set; } = string.Empty;
    public string MaterialType { get; set; } = string.Empty;
    public double CargoWeightTon { get; set; }
    public string AssignedBay { get; set; } = string.Empty;
    public string SealNumber { get; set; } = string.Empty;
    public SealStatus SealStatus { get; set; } = SealStatus.IntactVerified;
    public GatePassStatus Status { get; set; } = GatePassStatus.Docked;
    public DateTime GateInTime { get; set; } = DateTime.UtcNow;
    public DateTime? DockInTime { get; set; }
    public DateTime? GateOutTime { get; set; }
    public int ElapsedMinutes { get; set; }
    public int TargetTatMinutes { get; set; } = 75;
    public decimal DemurrageChargesInr { get; set; }
    public string SecurityGuardName { get; set; } = "Prem Chand (Gate 1)";
    public double OdometerReadingKm { get; set; }
}

public class WeighbridgeSlip
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string SlipNumber { get; set; } = string.Empty;
    public string VehicleNumber { get; set; } = string.Empty;
    public string TruckModel { get; set; } = string.Empty;
    public VehicleAxleCategory AxleCategory { get; set; }
    public string AxleLabel { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string TransporterName { get; set; } = "ASK Dedicated Fleet";
    public string ConsignmentNo { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    
    // Scale Readings (KG)
    public double TareWeightKg { get; set; }
    public double GrossWeightKg { get; set; }
    public double NetCargoWeightKg => Math.Max(0, GrossWeightKg - TareWeightKg);
    public double PermissibleGvwKg { get; set; }
    
    public double OverloadKg => Math.Max(0, GrossWeightKg - PermissibleGvwKg);
    public double OverloadPercent => PermissibleGvwKg > 0 && OverloadKg > 0 ? (OverloadKg / PermissibleGvwKg) * 100 : 0;
    public WeighbridgeComplianceStatus Status { get; set; } = WeighbridgeComplianceStatus.LegalCompliant;
    public decimal PotentialRtoFineInr => OverloadKg > 0 ? 20000m + (decimal)Math.Ceiling(OverloadKg / 1000.0) * 2000m : 0m;
    public bool GatePassLocked => Status == WeighbridgeComplianceStatus.OverloadCritical;
    
    public DateTime WeighedAt { get; set; } = DateTime.UtcNow;
    public string OperatorName { get; set; } = "Sunil Jagtap (Scale Op 01)";
    public string CalibrationCertificateId { get; set; } = "W&M-GOVT-PN-2026-90";
}

public class FreightCorridor
{
    public string Id { get; set; } = string.Empty;
    public string Lane { get; set; } = string.Empty;
    public string OriginHub { get; set; } = string.Empty;
    public string DestinationHub { get; set; } = string.Empty;
    public double DistanceKm { get; set; }
    public string BodyType { get; set; } = "16-Wheeler Open";
    public double RecommendedCapacityTon { get; set; }
    public decimal CurrentSpotRateInr { get; set; }
    public decimal ThirtyDayAvgRateInr { get; set; }
    public double TrendPercentage { get; set; }
    public SpotFreightTrendDirection TrendDirection { get; set; } = SpotFreightTrendDirection.Stable;
    public SpotMarketLorryAvailability MarketLorryAvailability { get; set; } = SpotMarketLorryAvailability.Balanced;
    public string DieselImpactNote { get; set; } = string.Empty;
}

public class SpotBrokerBid
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string BrokerName { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string VehicleNumber { get; set; } = string.Empty;
    public string VehicleBody { get; set; } = string.Empty;
    public decimal QuotedRateInr { get; set; }
    public decimal VarianceVsTargetInr { get; set; }
    public double DriverRating { get; set; } = 4.8;
    public SpotBidStatus Status { get; set; } = SpotBidStatus.Pending;
    public DateTime BidReceivedTime { get; set; } = DateTime.UtcNow;
}

public class DriverTripSettlement
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string TripNumber { get; set; } = string.Empty;
    public string VehicleNumber { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string TripRoute { get; set; } = string.Empty;
    public DateTime TripCompletedAt { get; set; } = DateTime.UtcNow;
    
    // Financial Breakdown
    public decimal AdvanceCashGivenInr { get; set; }
    public decimal DieselFuelExpensesInr { get; set; }
    public decimal FastagTollsInr { get; set; }
    public decimal FoodBhattaInr { get; set; }
    public decimal UnloadingPettyExpenseInr { get; set; }
    public decimal TotalExpensesInr => DieselFuelExpensesInr + FastagTollsInr + FoodBhattaInr + UnloadingPettyExpenseInr;
    public decimal NetBalanceInr => AdvanceCashGivenInr - TotalExpensesInr;
    
    public DriverSettlementStatus Status { get; set; } = DriverSettlementStatus.Draft;
    public string SettlementVoucherNo { get; set; } = string.Empty;
    public string AuditedBy { get; set; } = "Senior Fleet Auditor";
    public DateTime? AuditedAt { get; set; }
    public string? Notes { get; set; }
}

public class Ais140SafetyTelemetry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string VehicleNumber { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public double GpsLatitude { get; set; }
    public double GpsLongitude { get; set; }
    public double CurrentSpeedKmh { get; set; }
    public double SpeedLimitKmh { get; set; } = 80.0;
    public bool SosEmergencyTriggered { get; set; }
    public DateTime? SosTriggeredAt { get; set; }
    public double ContinuousNightDrivingHours { get; set; }
    public int HarshBrakingCount { get; set; }
    public int HarshAccelerationCount { get; set; }
    public bool IgnitionOn { get; set; } = true;
    public double BatteryVoltage { get; set; } = 24.2;
    public string LocationAddress { get; set; } = string.Empty;
    public Ais140AlertSeverity Severity { get; set; } = Ais140AlertSeverity.Normal;
    public DateTime LastTelemetryTimestamp { get; set; } = DateTime.UtcNow;
}

public class RtoBorderInspectionDossier
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string VehicleNumber { get; set; } = string.Empty;
    public string TripNumber { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string TransporterName { get; set; } = "ASK Dedicated Fleet";
    
    // Core Compliance Documents
    public string EwayBillNo { get; set; } = string.Empty;
    public DateTime EwayBillValidTill { get; set; } = DateTime.UtcNow.AddDays(2);
    public string BiltyNo { get; set; } = string.Empty;
    public string ConsignorName { get; set; } = string.Empty;
    public string ConsigneeName { get; set; } = string.Empty;
    public string RcNumber { get; set; } = string.Empty;
    public string RcOwnerName { get; set; } = "ASK Transport Group Ltd";
    public DateTime FitnessValidTill { get; set; } = DateTime.UtcNow.AddMonths(8);
    public string NationalPermitNo { get; set; } = string.Empty;
    public DateTime NationalPermitValidTill { get; set; } = DateTime.UtcNow.AddMonths(11);
    public string InsurancePolicyNo { get; set; } = string.Empty;
    public DateTime InsuranceValidTill { get; set; } = DateTime.UtcNow.AddMonths(6);
    public DateTime PucValidTill { get; set; } = DateTime.UtcNow.AddMonths(4);
    public string QrVerificationToken { get; set; } = Guid.NewGuid().ToString("N");
    public bool AllDocumentsCompliant => DateTime.UtcNow < EwayBillValidTill && DateTime.UtcNow < FitnessValidTill && DateTime.UtcNow < InsuranceValidTill;
}

public class CorporateCargoClaim
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string ClaimTicketNo { get; set; } = string.Empty;
    public string ConsignmentNo { get; set; } = string.Empty;
    public string ClientCorporateName { get; set; } = string.Empty;
    public string ConsigneeName { get; set; } = string.Empty;
    public ClaimDisputeReason DisputeReason { get; set; }
    public CargoClaimStatus Status { get; set; } = CargoClaimStatus.Logged;
    public decimal InvoiceDeclaredValueInr { get; set; }
    public decimal ClaimAmountDemandedInr { get; set; }
    public decimal SurveyorApprovedAmountInr { get; set; }
    public decimal DebitNoteDeductionInr { get; set; }
    public string DamageDescription { get; set; } = string.Empty;
    public List<string> DamagePhotoUrls { get; set; } = [];
    public string SurveyorName { get; set; } = "National Marine Surveyor";
    public string? SurveyorReportUrl { get; set; }
    public DateTime LoggedDate { get; set; } = DateTime.UtcNow;
}
