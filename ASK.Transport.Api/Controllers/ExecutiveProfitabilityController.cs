namespace ASK.Group.Api.Controllers;

using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/executive-profitability")]
[Authorize]
public class ExecutiveProfitabilityController(IExecutiveProfitabilityService service) : ControllerBase
{
    [HttpGet("routes")]
    public async Task<IActionResult> GetRoutes()
    {
        var data = await service.GetRouteProfitabilityRadarAsync();
        return Ok(new { success = true, data });
    }

    [HttpGet("branches")]
    public async Task<IActionResult> GetBranches()
    {
        var data = await service.GetBranchRankingsAsync();
        return Ok(new { success = true, data });
    }

    [HttpPost("routes/{id}/recalculate")]
    public async Task<IActionResult> Recalculate(string id)
    {
        var data = await service.RecalculateRouteMarginAsync(id);
        if (data == null) return NotFound(new { success = false, message = "Route not found" });
        return Ok(new { success = true, data });
    }
}
