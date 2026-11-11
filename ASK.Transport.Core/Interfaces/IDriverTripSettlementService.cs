using ASK.Group.Api.Domain.Entities;

namespace ASK.Group.Api.Application.Common.Interfaces;

public interface IDriverTripSettlementService
{
    Task<List<DriverTripSettlement>> GetSettlementsAsync();
    Task<DriverTripSettlement?> GetSettlementByIdAsync(string id);
    Task<DriverTripSettlement> CreateSettlementAsync(DriverTripSettlement settlement);
    Task<DriverTripSettlement?> ApproveSettlementAsync(string id, string auditorName);
    Task<DriverTripSettlement?> FinalizeCashPayoutAsync(string id);
}
