using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

namespace ASK.Group.Api.Services;

public class DriverTripSettlementService : IDriverTripSettlementService
{
    private static readonly List<DriverTripSettlement> _settlements =
    [
        new DriverTripSettlement
        {
            Id = "SETTLE-001",
            SettlementNo = "TRP-2026-SET-0891",
            TripSheetNo = "TS-DEL-BOM-4892",
            TripNumber = "TRIP-2026-9041",
            VehicleNumber = "RJ-14-GH-4921",
            DriverName = "Suresh Kumar Gurjar",
            DriverPhone = "+91 98290 41203",
            TripRoute = "Jaipur SuperHub ➔ Bhiwandi Hub (Mumbai)",
            OriginCity = "Jaipur SuperHub",
            DestinationCity = "Bhiwandi Hub (Mumbai)",
            TripCompletedAt = DateTime.UtcNow.AddHours(-4),
            TotalTripKm = 1148,
            StandardKmpl = 4.2,
            ActualKmpl = 4.4,
            DieselLitersStandard = 273.3,
            DieselLitersActual = 260.9,
            DieselPenaltyBonusInr = 1116m,
            AdvanceCashGivenInr = 12000m,
            DieselCardAdvanceInr = 23500m,
            DieselFuelExpensesInr = 23500m,
            FastagTollsInr = 4320m,
            FastagTollActualInr = 4320m,
            FoodBhattaInr = 3500m,
            DriverBhattaFoodInr = 3500m,
            UnloadingPettyExpenseInr = 1800m,
            LoadingUnloadingExpensesInr = 1800m,
            EnrouteMaintenanceRtoInr = 750m,
            TotalAuthorizedExpensesInr = 10370m,
            NetPayableToDriverInr = 3850m,
            RecoverableFromDriverInr = 0m,
            Status = DriverSettlementStatus.Draft,
            SettlementVoucherNo = "TRP-2026-SET-0891",
            AuditedBy = "Jaipur Depot Fleet Auditor (Kishan Lal)",
            Notes = "Safe delivery at Bhiwandi Godown #4. Clean fuel economy bonus approved by manager."
        },
        new DriverTripSettlement
        {
            Id = "SETTLE-002",
            SettlementNo = "TRP-2026-SET-0892",
            TripSheetNo = "TS-DEL-KOL-7714",
            TripNumber = "TRIP-2026-9038",
            VehicleNumber = "HR-55-AN-8102",
            DriverName = "Manjeet Singh Dhillon",
            DriverPhone = "+91 98112 76431",
            TripRoute = "Delhi Bilaspur Hub ➔ Kolkata Dankuni Hub",
            OriginCity = "Delhi Bilaspur Hub",
            DestinationCity = "Kolkata Dankuni Hub",
            TripCompletedAt = DateTime.UtcNow.AddDays(-1),
            TotalTripKm = 1480,
            StandardKmpl = 4.1,
            ActualKmpl = 3.7,
            DieselLitersStandard = 360.9,
            DieselLitersActual = 400.0,
            DieselPenaltyBonusInr = -3519m,
            AdvanceCashGivenInr = 18000m,
            DieselCardAdvanceInr = 32000m,
            DieselFuelExpensesInr = 32000m,
            FastagTollsInr = 5850m,
            FastagTollActualInr = 5850m,
            FoodBhattaInr = 4500m,
            DriverBhattaFoodInr = 4500m,
            UnloadingPettyExpenseInr = 2200m,
            LoadingUnloadingExpensesInr = 2200m,
            EnrouteMaintenanceRtoInr = 1200m,
            TotalAuthorizedExpensesInr = 13750m,
            NetPayableToDriverInr = 0m,
            RecoverableFromDriverInr = 1420m,
            Status = DriverSettlementStatus.AuditApproved,
            SettlementVoucherNo = "TRP-2026-SET-0892",
            AuditedBy = "Bilaspur Logistics HQ (Aman Verma)",
            AuditedAt = DateTime.UtcNow.AddHours(-18),
            Notes = "Low KMPL on NH-19 corridor. Driver claims excessive idling due to Varanasi highway jam."
        },
        new DriverTripSettlement
        {
            Id = "SETTLE-003",
            SettlementNo = "TRP-2026-SET-0893",
            TripSheetNo = "TS-PUN-BLR-3108",
            TripNumber = "TRIP-2026-9040",
            VehicleNumber = "MH-12-PQ-9024",
            DriverName = "Ramesh Balu Shinde",
            DriverPhone = "+91 97654 32910",
            TripRoute = "Pune Chakan Hub ➔ Bengaluru Nelamangala",
            OriginCity = "Pune Chakan Hub",
            DestinationCity = "Bengaluru Nelamangala",
            TripCompletedAt = DateTime.UtcNow.AddDays(-2),
            TotalTripKm = 840,
            StandardKmpl = 4.3,
            ActualKmpl = 4.5,
            DieselLitersStandard = 195.3,
            DieselLitersActual = 186.6,
            DieselPenaltyBonusInr = 783m,
            AdvanceCashGivenInr = 9000m,
            DieselCardAdvanceInr = 16800m,
            DieselFuelExpensesInr = 16800m,
            FastagTollsInr = 3100m,
            FastagTollActualInr = 3100m,
            FoodBhattaInr = 2800m,
            DriverBhattaFoodInr = 2800m,
            UnloadingPettyExpenseInr = 1500m,
            LoadingUnloadingExpensesInr = 1500m,
            EnrouteMaintenanceRtoInr = 400m,
            TotalAuthorizedExpensesInr = 7800m,
            NetPayableToDriverInr = 4620m,
            RecoverableFromDriverInr = 0m,
            Status = DriverSettlementStatus.PaidOut,
            SettlementVoucherNo = "TRP-2026-SET-0893",
            AuditedBy = "Pune Regional Finance Desk (Sunil Kadam)",
            AuditedAt = DateTime.UtcNow.AddDays(-1),
            SettledDate = DateTime.UtcNow.AddDays(-1),
            Notes = "Complete digital voucher verified. Payment disbursed via instant IMPS."
        }
    ];

    public Task<List<DriverTripSettlement>> GetSettlementsAsync()
    {
        return Task.FromResult(_settlements);
    }

    public Task<DriverTripSettlement?> GetSettlementByIdAsync(string id)
    {
        var match = _settlements.FirstOrDefault(s => s.Id == id || s.TripNumber == id || s.SettlementNo == id);
        return Task.FromResult(match);
    }

    public Task<DriverTripSettlement> CreateSettlementAsync(DriverTripSettlement settlement)
    {
        settlement.Id = $"SETTLE-{DateTime.UtcNow.Ticks}";
        if (string.IsNullOrWhiteSpace(settlement.SettlementNo))
        {
            settlement.SettlementNo = $"TRP-{DateTime.UtcNow.Year}-SET-{Random.Shared.Next(1000, 9999)}";
        }
        settlement.SettlementVoucherNo = settlement.SettlementNo;
        settlement.TripCompletedAt = DateTime.UtcNow;
        _settlements.Insert(0, settlement);
        return Task.FromResult(settlement);
    }

    public Task<DriverTripSettlement?> ApproveSettlementAsync(string id, string auditorName)
    {
        var match = _settlements.FirstOrDefault(s => s.Id == id || s.SettlementNo == id);
        if (match != null)
        {
            match.Status = DriverSettlementStatus.AuditApproved;
            match.AuditedBy = auditorName;
            match.AuditedAt = DateTime.UtcNow;
        }
        return Task.FromResult(match);
    }

    public Task<DriverTripSettlement?> FinalizeCashPayoutAsync(string id)
    {
        var match = _settlements.FirstOrDefault(s => s.Id == id || s.SettlementNo == id);
        if (match != null)
        {
            match.Status = match.NetPayableToDriverInr > 0
                ? DriverSettlementStatus.PaidOut 
                : DriverSettlementStatus.RecoveredFromDriver;
            match.SettledDate = DateTime.UtcNow;
        }
        return Task.FromResult(match);
    }
}
