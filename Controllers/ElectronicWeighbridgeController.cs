using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/weighbridge")]
[Authorize]
public class ElectronicWeighbridgeController : ControllerBase
{
    private readonly IElectronicWeighbridgeService _weighbridgeService;

    public ElectronicWeighbridgeController(IElectronicWeighbridgeService weighbridgeService)
    {
        _weighbridgeService = weighbridgeService;
    }

    [HttpGet("slips")]
    public async Task<IActionResult> GetSlips()
    {
        var slips = await _weighbridgeService.GetWeighbridgeSlipsAsync();
        return Ok(new { success = true, data = slips });
    }

    [HttpGet("slips/{slipNumber}")]
    public async Task<IActionResult> GetSlipByNumber(string slipNumber)
    {
        var slip = await _weighbridgeService.GetSlipByNumberAsync(slipNumber);
        if (slip == null) return NotFound(new { success = false, message = "Weighbridge slip not found" });
        return Ok(new { success = true, data = slip });
    }

    [HttpPost("record")]
    public async Task<IActionResult> RecordWeighment([FromBody] WeighbridgeSlip request)
    {
        var slip = await _weighbridgeService.RecordWeighmentAsync(request);
        return Ok(new { success = true, message = "Weight recorded successfully", data = slip });
    }

    [HttpPost("slips/{slipId}/cross-dock-deload")]
    public async Task<IActionResult> AuthorizeCrossDockDeLoad(string slipId)
    {
        var slip = await _weighbridgeService.AuthorizeCrossDockDeLoadAsync(slipId);
        if (slip == null) return NotFound(new { success = false, message = "Slip not found" });
        return Ok(new { success = true, message = "Cross-dock de-load authorized. Overload cleared.", data = slip });
    }
}
