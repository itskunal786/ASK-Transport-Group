using ASK.Group.Api.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/tyre-management")]
[Authorize]
public class TyreManagementController : ControllerBase
{
    private readonly ITyreManagementService _tyreService;

    public TyreManagementController(ITyreManagementService tyreService)
    {
        _tyreService = tyreService;
    }

    [HttpGet("fleet")]
    public async Task<IActionResult> GetFleetTyres()
    {
        var fleet = await _tyreService.GetFleetTyresAsync();
        return Ok(new { success = true, data = fleet });
    }

    [HttpGet("truck/{plateNo}")]
    public async Task<IActionResult> GetTruckTyres(string plateNo)
    {
        var truck = await _tyreService.GetTruckTyresAsync(plateNo);
        if (truck == null) return NotFound(new { success = false, message = "Truck not found" });
        return Ok(new { success = true, data = truck });
    }

    [HttpPost("truck/{plateNo}/tyres/{tyreId}/inflate")]
    public async Task<IActionResult> InflateTyre(string plateNo, string tyreId, [FromQuery] double targetPsi = 118)
    {
        var tyre = await _tyreService.InflateAndCalibrateTyreAsync(plateNo, tyreId, targetPsi);
        if (tyre == null) return NotFound(new { success = false, message = "Tyre not found" });
        return Ok(new { success = true, message = "Tyre inflated successfully", data = tyre });
    }

    [HttpPost("truck/{plateNo}/tyres/{tyreId}/retread")]
    public async Task<IActionResult> RetreadTyre(string plateNo, string tyreId)
    {
        var tyre = await _tyreService.DispatchTyreForColdRetreadAsync(plateNo, tyreId);
        if (tyre == null) return NotFound(new { success = false, message = "Tyre not found" });
        return Ok(new { success = true, message = "Tyre sent for cold retreading", data = tyre });
    }
}
