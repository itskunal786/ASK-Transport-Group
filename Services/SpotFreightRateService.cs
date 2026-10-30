using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

namespace ASK.Group.Api.Services;

public class SpotFreightRateService : ISpotFreightRateService
{
    private static readonly List<FreightCorridor> _corridors =
    [
        new FreightCorridor
        {
            Id = "LANE-01",
            Lane = "Pune ➔ Kolkata (NH-53)",
            OriginHub = "Pune Logistics Park (MH)",
            DestinationHub = "Dankuni Hub, Kolkata (WB)",
            DistanceKm = 1840,
            BodyType = "16-Wheeler Open",
            RecommendedCapacityTon = 22.0,
            CurrentSpotRateInr = 92000m,
            ThirtyDayAvgRateInr = 94500m,
            TrendPercentage = -2.6,
            TrendDirection = SpotFreightTrendDirection.Down,
            MarketLorryAvailability = SpotMarketLorryAvailability.Surplus,
            DieselImpactNote = "Surplus return empty lorries from Maharashtra manufacturing belt."
        },
        new FreightCorridor
        {
            Id = "LANE-02",
            Lane = "Delhi ➔ Mumbai (NH-48)",
            OriginHub = "Kundli Terminal, Delhi NCR",
            DestinationHub = "Bhiwandi Hub, Mumbai (MH)",
            DistanceKm = 1420,
            BodyType = "Container 32ft",
            RecommendedCapacityTon = 20.0,
            CurrentSpotRateInr = 68500m,
            ThirtyDayAvgRateInr = 66200m,
            TrendPercentage = +3.4,
            TrendDirection = SpotFreightTrendDirection.Up,
            MarketLorryAvailability = SpotMarketLorryAvailability.DeficitHighDemand,
            DieselImpactNote = "Festive retail e-commerce surge. Lorry demand exceeds supply."
        },
        new FreightCorridor
        {
            Id = "LANE-03",
            Lane = "Bengaluru ➔ Delhi (NH-44)",
            OriginHub = "Nelamangala Hub, Bengaluru",
            DestinationHub = "Kundli Terminal, Delhi NCR",
            DistanceKm = 2150,
            BodyType = "22-Wheeler Trailer",
            RecommendedCapacityTon = 25.0,
            CurrentSpotRateInr = 112000m,
            ThirtyDayAvgRateInr = 110000m,
            TrendPercentage = +1.8,
            TrendDirection = SpotFreightTrendDirection.Up,
            MarketLorryAvailability = SpotMarketLorryAvailability.Balanced,
            DieselImpactNote = "Steady South-North industrial electronics and textile flow."
        }
    ];

    private static readonly List<SpotBrokerBid> _bids =
    [
        new SpotBrokerBid
        {
            Id = "BID-01",
            BrokerName = "Shree Ram Roadlines (Vapi)",
            ContactPerson = "Sukhwinder Singh",
            Phone = "+91 98251 44021",
            VehicleNumber = "GJ-15-AT-7819",
            VehicleBody = "16-Wheeler 28 Ton Multi-Axle",
            QuotedRateInr = 89500m,
            VarianceVsTargetInr = -500m,
            DriverRating = 4.8,
            Status = SpotBidStatus.Accepted
        },
        new SpotBrokerBid
        {
            Id = "BID-02",
            BrokerName = "Western Fleet Carrier (Thane)",
            ContactPerson = "Karan Sharma",
            Phone = "+91 98200 99122",
            VehicleNumber = "MH-04-HY-6612",
            VehicleBody = "16-Wheeler Tata Signa",
            QuotedRateInr = 91000m,
            VarianceVsTargetInr = +1000m,
            DriverRating = 4.6,
            Status = SpotBidStatus.Pending
        }
    ];

    public Task<List<FreightCorridor>> GetFreightCorridorsAsync()
    {
        return Task.FromResult(_corridors);
    }

    public Task<List<SpotBrokerBid>> GetBrokerBidsAsync()
    {
        return Task.FromResult(_bids);
    }

    public Task<SpotBrokerBid?> AcceptBrokerBidAsync(string bidId)
    {
        var bid = _bids.FirstOrDefault(b => b.Id == bidId);
        if (bid != null)
        {
            foreach (var b in _bids)
            {
                b.Status = b.Id == bidId ? SpotBidStatus.Accepted : SpotBidStatus.Rejected;
            }
        }
        return Task.FromResult(bid);
    }

    public Task<bool> BroadcastLoadRequirementAsync(string lane, double tonnage, decimal targetMaxHireRate)
    {
        // Generates new simulation bids from WhatsApp network
        _bids.Add(new SpotBrokerBid
        {
            Id = $"BID-{Guid.NewGuid():N}"[..6].ToUpper(),
            BrokerName = "Rajputana Logistics Syndicate",
            ContactPerson = "Vikram Rathore",
            Phone = "+91 94140 77192",
            VehicleNumber = "RJ-19-GA-4412",
            VehicleBody = $"{tonnage:0}T Multi-Axle",
            QuotedRateInr = targetMaxHireRate - 800m,
            VarianceVsTargetInr = -800m,
            DriverRating = 4.9,
            Status = SpotBidStatus.Pending
        });

        return Task.FromResult(true);
    }
}
