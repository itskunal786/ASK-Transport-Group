using ASK.Group.Api.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/rto-vault")]
[Authorize]
public class RtoBorderVaultController : ControllerBase
{
    private readonly IRtoBorderVaultService _vaultService;

    public RtoBorderVaultController(IRtoBorderVaultService vaultService)
    {
        _vaultService = vaultService;
    }

    [HttpGet("dossiers")]
    public async Task<IActionResult> GetDossiers()
    {
        var data = await _vaultService.GetDossiersAsync();
        return Ok(new { success = true, data });
    }

    [HttpGet("vehicle/{vehicleNumber}")]
    public async Task<IActionResult> GetDossier(string vehicleNumber)
    {
        var item = await _vaultService.GetDossierByVehicleAsync(vehicleNumber);
        if (item == null) return NotFound(new { success = false, message = "RTO compliance dossier not found" });
        return Ok(new { success = true, data = item });
    }

    [AllowAnonymous]
    [HttpGet("verify/{token}")]
    public async Task<IActionResult> VerifyByToken(string token)
    {
        var item = await _vaultService.VerifyDossierByTokenAsync(token);
        if (item == null) return NotFound(new { success = false, message = "Invalid or expired inspection QR token" });
        return Ok(new { success = true, data = item });
    }
}
