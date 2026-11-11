namespace ASK.Group.Api.Application.Common.Interfaces;

using ASK.Group.Api.Domain.Entities;

public interface IExecutiveProfitabilityService
{
    Task<List<ExecutiveRouteProfitability>> GetRouteProfitabilityRadarAsync();
    Task<List<BranchPerformanceRanking>> GetBranchRankingsAsync();
    Task<ExecutiveRouteProfitability?> RecalculateRouteMarginAsync(string routeId);
}
