using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/driver-settlement")]
[Authorize]
public class DriverTripSettlementController : ControllerBase
{
    private readonly IDriverTripSettlementService _settlementService;

    public DriverTripSettlementController(IDriverTripSettlementService settlementService)
    {
        _settlementService = settlementService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettlements()
    {
        var data = await _settlementService.GetSettlementsAsync();
        return Ok(new { success = true, data });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSettlement(string id)
    {
        var item = await _settlementService.GetSettlementByIdAsync(id);
        if (item == null) return NotFound(new { success = false, message = "Settlement not found" });
        return Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> CreateSettlement([FromBody] DriverTripSettlement request)
    {
        var created = await _settlementService.CreateSettlementAsync(request);
        return Ok(new { success = true, message = "Trip settlement logged", data = created });
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveSettlement(string id, [FromQuery] string auditorName = "Senior Fleet Auditor")
    {
        var approved = await _settlementService.ApproveSettlementAsync(id, auditorName);
        if (approved == null) return NotFound(new { success = false, message = "Settlement not found" });
        return Ok(new { success = true, message = "Settlement audit approved", data = approved });
    }

    [HttpPost("{id}/finalize")]
    public async Task<IActionResult> FinalizePayout(string id)
    {
        var finalized = await _settlementService.FinalizeCashPayoutAsync(id);
        if (finalized == null) return NotFound(new { success = false, message = "Settlement not found" });
        return Ok(new { success = true, message = "Cash payout/recovery finalized", data = finalized });
    }
}
