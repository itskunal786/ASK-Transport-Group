namespace ASK.Group.Api.Domain.Enums;

public enum TyreWheelPosition
{
    FL,
    FR,
    R1_LO,
    R1_LI,
    R1_RI,
    R1_RO,
    R2_LO,
    R2_LI,
    R2_RI,
    R2_RO,
    LIFT_L,
    LIFT_R
}

public enum TyreConditionStatus
{
    Optimal,
    WarningLow,
    CriticalPuncture,
    Overheated
}

public enum TyreLifecycleStage
{
    Virgin,
    FirstRetread,
    SecondRetread,
    Scrap
}

public enum DockBayType
{
    Unloading,
    Loading,
    ReeferColdBay,
    Staging
}

public enum DockBayStatus
{
    Available,
    Occupied,
    Maintenance
}

public enum GatePassType
{
    InboundUnload,
    OutboundDispatch,
    EmptyStaging,
    MaintenanceBay
}

public enum GatePassStatus
{
    AtGate,
    Docked,
    LoadingUnloading,
    InspectionPending,
    GateOutCleared,
    DetentionWarning
}

public enum SealStatus
{
    IntactVerified,
    TamperedBroken,
    NotApplicable
}

public enum VehicleAxleCategory
{
    TwoAxle6Wheel,     // 18.5 Ton Limit
    ThreeAxle10Wheel,  // 28.0 Ton Limit
    FourAxle14Wheel,   // 35.0 Ton Limit
    FiveAxle16Wheel,   // 43.5 Ton Limit
    SixAxleTrailer     // 55.0 Ton Limit
}

public enum WeighbridgeComplianceStatus
{
    LegalCompliant,
    OverloadCritical,
    TarePending
}

public enum SpotFreightTrendDirection
{
    Up,
    Down,
    Stable
}

public enum SpotMarketLorryAvailability
{
    Surplus,
    Balanced,
    DeficitHighDemand
}

public enum SpotBidStatus
{
    Pending,
    Accepted,
    Rejected
}
