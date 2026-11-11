using ASK.Group.Api.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/spot-freight")]
[Authorize]
public class SpotFreightRateAiController : ControllerBase
{
    private readonly ISpotFreightRateService _spotRateService;

    public SpotFreightRateAiController(ISpotFreightRateService spotRateService)
    {
        _spotRateService = spotRateService;
    }

    [HttpGet("corridors")]
    public async Task<IActionResult> GetCorridors()
    {
        var corridors = await _spotRateService.GetFreightCorridorsAsync();
        return Ok(new { success = true, data = corridors });
    }

    [HttpGet("bids")]
    public async Task<IActionResult> GetBids()
    {
        var bids = await _spotRateService.GetBrokerBidsAsync();
        return Ok(new { success = true, data = bids });
    }

    [HttpPost("bids/{bidId}/accept")]
    public async Task<IActionResult> AcceptBid(string bidId)
    {
        var bid = await _spotRateService.AcceptBrokerBidAsync(bidId);
        if (bid == null) return NotFound(new { success = false, message = "Bid not found" });
        return Ok(new { success = true, message = "Bid accepted and trip issued with 70:30 settlement", data = bid });
    }

    [HttpPost("broadcast")]
    public async Task<IActionResult> BroadcastLoad([FromQuery] string lane, [FromQuery] double tonnage, [FromQuery] decimal targetMaxHireRate)
    {
        var broadcast = await _spotRateService.BroadcastLoadRequirementAsync(lane, tonnage, targetMaxHireRate);
        return Ok(new { success = true, message = "Load requirement broadcasted to 65+ WhatsApp broker channels", data = broadcast });
    }
}
