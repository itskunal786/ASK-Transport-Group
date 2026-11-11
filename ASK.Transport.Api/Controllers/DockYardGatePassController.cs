using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/dock-yard")]
[Authorize]
public class DockYardGatePassController : ControllerBase
{
    private readonly IDockYardGatePassService _dockYardService;

    public DockYardGatePassController(IDockYardGatePassService dockYardService)
    {
        _dockYardService = dockYardService;
    }

    [HttpGet("bays")]
    public async Task<IActionResult> GetBays()
    {
        var bays = await _dockYardService.GetDockBaysAsync();
        return Ok(new { success = true, data = bays });
    }

    [HttpGet("passes")]
    public async Task<IActionResult> GetPasses()
    {
        var passes = await _dockYardService.GetGatePassesAsync();
        return Ok(new { success = true, data = passes });
    }

    [HttpPost("gate-in")]
    public async Task<IActionResult> GenerateGateIn([FromBody] GatePassRecord request)
    {
        var record = await _dockYardService.GenerateGateInPassAsync(request);
        return Ok(new { success = true, message = "Gate-In pass issued successfully", data = record });
    }

    [HttpPost("passes/{passId}/expedite")]
    public async Task<IActionResult> ExpediteLoading(string passId)
    {
        var pass = await _dockYardService.ExpediteDockLoadingAsync(passId);
        if (pass == null) return NotFound(new { success = false, message = "Pass not found" });
        return Ok(new { success = true, message = "Dock expedited", data = pass });
    }

    [HttpPost("passes/{passId}/gate-out")]
    public async Task<IActionResult> AuthorizeGateOut(string passId)
    {
        var pass = await _dockYardService.AuthorizeGateOutAsync(passId);
        if (pass == null) return NotFound(new { success = false, message = "Pass not found" });
        return Ok(new { success = true, message = "Gate-Out cleared", data = pass });
    }
}
