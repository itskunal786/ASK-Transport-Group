using ASK.Group.Api.Domain.Entities;

namespace ASK.Group.Api.Application.Common.Interfaces;

public interface ISpotFreightRateService
{
    Task<List<FreightCorridor>> GetFreightCorridorsAsync();
    Task<List<SpotBrokerBid>> GetBrokerBidsAsync();
    Task<SpotBrokerBid?> AcceptBrokerBidAsync(string bidId);
    Task<bool> BroadcastLoadRequirementAsync(string lane, double tonnage, decimal targetMaxHireRate);
}
