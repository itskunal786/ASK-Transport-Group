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
            TripNumber = "TRIP-2026-9041",
            VehicleNumber = "MH-12-RN-4421",
            DriverName = "Ramesh Singh Yadav",
            DriverPhone = "+91 98220 11445",
            TripRoute = "Pune ➔ Surat ➔ Ahmedabad (820 KM)",
            TripCompletedAt = DateTime.UtcNow.AddHours(-4),
            AdvanceCashGivenInr = 18000m,
            DieselFuelExpensesInr = 11400m,
            FastagTollsInr = 2850m,
            FoodBhattaInr = 1600m,
            UnloadingPettyExpenseInr = 650m,
            Status = DriverSettlementStatus.Draft,
            SettlementVoucherNo = "VOUCH-PN-9912",
            Notes = "All fuel pump bills verified via IOCL digital slip. Fastag auto-reconciled."
        },
        new DriverTripSettlement
        {
            Id = "SETTLE-002",
            TripNumber = "TRIP-2026-9038",
            VehicleNumber = "DL-01-AJ-8829",
            DriverName = "Sardar Baldev Singh",
            DriverPhone = "+91 97110 33882",
            TripRoute = "Delhi NCR ➔ Mumbai (1,420 KM)",
            TripCompletedAt = DateTime.UtcNow.AddDays(-1),
            AdvanceCashGivenInr = 25000m,
            DieselFuelExpensesInr = 17800m,
            FastagTollsInr = 4600m,
            FoodBhattaInr = 2800m,
            UnloadingPettyExpenseInr = 900m,
            Status = DriverSettlementStatus.AuditApproved,
            SettlementVoucherNo = "VOUCH-DL-8824",
            AuditedBy = "Kailash Joshi (Sr. Auditor)",
            AuditedAt = DateTime.UtcNow.AddHours(-18),
            Notes = "Driver spent ₹1,100 from own pocket (Negative balance: Payable to driver)."
        }
    ];

    public Task<List<DriverTripSettlement>> GetSettlementsAsync()
    {
        return Task.FromResult(_settlements);
    }

    public Task<DriverTripSettlement?> GetSettlementByIdAsync(string id)
    {
        var match = _settlements.FirstOrDefault(s => s.Id == id || s.TripNumber == id);
        return Task.FromResult(match);
    }

    public Task<DriverTripSettlement> CreateSettlementAsync(DriverTripSettlement settlement)
    {
        settlement.Id = $"SETTLE-{DateTime.UtcNow.Ticks}";
        settlement.SettlementVoucherNo = $"VOUCH-{Random.Shared.Next(1000, 9999)}";
        settlement.TripCompletedAt = DateTime.UtcNow;
        _settlements.Insert(0, settlement);
        return Task.FromResult(settlement);
    }

    public Task<DriverTripSettlement?> ApproveSettlementAsync(string id, string auditorName)
    {
        var match = _settlements.FirstOrDefault(s => s.Id == id);
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
        var match = _settlements.FirstOrDefault(s => s.Id == id);
        if (match != null)
        {
            match.Status = match.NetBalanceInr < 0 
                ? DriverSettlementStatus.PaidOut 
                : DriverSettlementStatus.RecoveredFromDriver;
        }
        return Task.FromResult(match);
    }
}
