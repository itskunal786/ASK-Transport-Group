namespace ASK.Group.Api.Services;

using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

public class ExecutiveProfitabilityService : IExecutiveProfitabilityService
{
    private static readonly List<ExecutiveRouteProfitability> _routes =
    [
        new()
        {
            Id = "corridor-1",
            CorridorLane = "Delhi NCR - Mumbai SuperHub (NH-48)",
            OriginHub = "Delhi Bilaspur Hub",
            DestinationHub = "Bhiwandi CDC Hub (Mumbai)",
            TotalTripsExecuted = 142,
            TotalFreightRevenueInr = 18460000m,
            TotalDieselCostInr = 6840000m,
            TotalTollExpensesInr = 1120000m,
            TotalDriverBhattaInr = 980000m,
            TotalMarketFleetPayoutInr = 4200000m,
            TotalEnrouteMiscMaintenanceInr = 380000m,
            NetGrossMarginInr = 4940000m,
            NetProfitPercentage = 26.76m,
            HealthStatus = ProfitabilityHealthStatus.HighMarginProfitable,
            RankPosition = 1,
            PeriodMonthYear = "October 2026"
        },
        new()
        {
            Id = "corridor-2",
            CorridorLane = "Jaipur - Ahmedabad Express Freight Corridor",
            OriginHub = "Jaipur Transport Nagar",
            DestinationHub = "Ahmedabad Aslali Hub",
            TotalTripsExecuted = 98,
            TotalFreightRevenueInr = 9800000m,
            TotalDieselCostInr = 3920000m,
            TotalTollExpensesInr = 680000m,
            TotalDriverBhattaInr = 540000m,
            TotalMarketFleetPayoutInr = 2400000m,
            TotalEnrouteMiscMaintenanceInr = 210000m,
            NetGrossMarginInr = 2050000m,
            NetProfitPercentage = 20.92m,
            HealthStatus = ProfitabilityHealthStatus.HighMarginProfitable,
            RankPosition = 2,
            PeriodMonthYear = "October 2026"
        },
        new()
        {
            Id = "corridor-3",
            CorridorLane = "Pune - Bengaluru Industrial Freight Corridor",
            OriginHub = "Pune Chakan Auto Hub",
            DestinationHub = "Bengaluru Nelamangala Hub",
            TotalTripsExecuted = 84,
            TotalFreightRevenueInr = 11200000m,
            TotalDieselCostInr = 4800000m,
            TotalTollExpensesInr = 920000m,
            TotalDriverBhattaInr = 610000m,
            TotalMarketFleetPayoutInr = 3100000m,
            TotalEnrouteMiscMaintenanceInr = 290000m,
            NetGrossMarginInr = 1480000m,
            NetProfitPercentage = 13.21m,
            HealthStatus = ProfitabilityHealthStatus.ModerateMargin,
            RankPosition = 3,
            PeriodMonthYear = "October 2026"
        },
        new()
        {
            Id = "corridor-4",
            CorridorLane = "Kolkata Dankuni - Guwahati North-East Corridor",
            OriginHub = "Kolkata Dankuni Hub",
            DestinationHub = "Guwahati Jalukbari Terminal",
            TotalTripsExecuted = 46,
            TotalFreightRevenueInr = 6400000m,
            TotalDieselCostInr = 3200000m,
            TotalTollExpensesInr = 540000m,
            TotalDriverBhattaInr = 490000m,
            TotalMarketFleetPayoutInr = 1900000m,
            TotalEnrouteMiscMaintenanceInr = 410000m,
            NetGrossMarginInr = -140000m,
            NetProfitPercentage = -2.18m,
            HealthStatus = ProfitabilityHealthStatus.LossMakingCritical,
            RankPosition = 4,
            PeriodMonthYear = "October 2026"
        }
    ];

    private static readonly List<BranchPerformanceRanking> _branches =
    [
        new()
        {
            Id = "branch-1",
            BranchCode = "DEL-HQ-01",
            BranchCity = "Delhi Bilaspur Hub",
            RegionZone = "North Hub",
            MonthlyDispatchedTonnage = 14850.5m,
            AverageTurnaroundTimeHours = 3.2m,
            SlaDeliveryCompliancePercent = 98.4m,
            TotalRevenueInr = 28400000m,
            BranchNetProfitInr = 6840000m,
            PerformanceTier = "Platinum Alpha"
        },
        new()
        {
            Id = "branch-2",
            BranchCode = "BOM-WH-02",
            BranchCity = "Bhiwandi Mumbai Terminal",
            RegionZone = "West Hub",
            MonthlyDispatchedTonnage = 18420.0m,
            AverageTurnaroundTimeHours = 3.6m,
            SlaDeliveryCompliancePercent = 97.8m,
            TotalRevenueInr = 34500000m,
            BranchNetProfitInr = 8120000m,
            PerformanceTier = "Platinum Alpha"
        },
        new()
        {
            Id = "branch-3",
            BranchCode = "JAI-TN-03",
            BranchCity = "Jaipur Transport Nagar Hub",
            RegionZone = "North Hub",
            MonthlyDispatchedTonnage = 9240.0m,
            AverageTurnaroundTimeHours = 4.1m,
            SlaDeliveryCompliancePercent = 95.6m,
            TotalRevenueInr = 14800000m,
            BranchNetProfitInr = 3150000m,
            PerformanceTier = "Gold Standard"
        },
        new()
        {
            Id = "branch-4",
            BranchCode = "KOL-DN-04",
            BranchCity = "Kolkata Dankuni Hub",
            RegionZone = "East Hub",
            MonthlyDispatchedTonnage = 6810.0m,
            AverageTurnaroundTimeHours = 5.8m,
            SlaDeliveryCompliancePercent = 89.2m,
            TotalRevenueInr = 9400000m,
            BranchNetProfitInr = 620000m,
            PerformanceTier = "Under Review"
        }
    ];

    public Task<List<ExecutiveRouteProfitability>> GetRouteProfitabilityRadarAsync()
    {
        return Task.FromResult(_routes);
    }

    public Task<List<BranchPerformanceRanking>> GetBranchRankingsAsync()
    {
        return Task.FromResult(_branches);
    }

    public Task<ExecutiveRouteProfitability?> RecalculateRouteMarginAsync(string routeId)
    {
        var route = _routes.FirstOrDefault(r => r.Id == routeId);
        if (route != null)
        {
            var totalExpenses = route.TotalDieselCostInr + route.TotalTollExpensesInr + route.TotalDriverBhattaInr + route.TotalMarketFleetPayoutInr + route.TotalEnrouteMiscMaintenanceInr;
            route.NetGrossMarginInr = route.TotalFreightRevenueInr - totalExpenses;
            route.NetProfitPercentage = route.TotalFreightRevenueInr > 0 ? (route.NetGrossMarginInr / route.TotalFreightRevenueInr) * 100 : 0;
            route.HealthStatus = route.NetProfitPercentage switch
            {
                >= 18 => ProfitabilityHealthStatus.HighMarginProfitable,
                >= 5 => ProfitabilityHealthStatus.ModerateMargin,
                _ => ProfitabilityHealthStatus.LossMakingCritical
            };
        }
        return Task.FromResult(route);
    }
}
