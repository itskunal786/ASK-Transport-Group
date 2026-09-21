using ASK.Group.Api.Authorization;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/operations/smart-eta")]
[Authorize]
public class SmartEtaController : ControllerBase
{
    private readonly SmartEtaService _smartEtaService;

    public SmartEtaController(
        SmartEtaService smartEtaService)
    {
        _smartEtaService =
            smartEtaService;
    }

    [HttpGet("trip/{tripId:int}")]
    [HasPermission(Permissions.Trips.View)]
    public async Task<IActionResult> GetTripEta(
        int tripId,
        CancellationToken cancellationToken)
    {
        var result =
            await _smartEtaService
                .CalculateTripEtaAsync(
                    tripId,
                    cancellationToken);

        if (!result.Success)
        {
            return BadRequest(
                result);
        }

        return Ok(
            result);
    }

    [HttpPost("trip/{tripId:int}/update")]
    [HasPermission(Permissions.Trips.Edit)]
    public async Task<IActionResult> UpdateTripEta(
        int tripId,
        CancellationToken cancellationToken)
    {
        int? userId =
            null;

        var userIdValue =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (int.TryParse(
            userIdValue,
            out var parsedUserId))
        {
            userId =
                parsedUserId;
        }

        var result =
            await _smartEtaService
                .CalculateAndUpdateTripEtaAsync(
                    tripId,
                    userId,
                    cancellationToken);

        if (!result.Success)
        {
            return BadRequest(
                result);
        }

        return Ok(
            result);
    }

    [HttpGet("active-trips")]
    [HasPermission(Permissions.Trips.View)]
    public async Task<IActionResult> GetActiveTripEtas(
        CancellationToken cancellationToken)
    {
        var results =
            await _smartEtaService
                .GetActiveTripEtasAsync(
                    cancellationToken);

        return Ok(
            new
            {
                success = true,
                count = results.Count,
                data = results
            });
    }
}