using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/trip-workflow")]
[Authorize(Roles = "Admin")]
public class TripWorkflowController
    : ControllerBase
{
    private readonly TripWorkflowService
        _tripWorkflowService;

    private readonly AuditService
        _auditService;

    public TripWorkflowController(
        TripWorkflowService tripWorkflowService,
        AuditService auditService)
    {
        _tripWorkflowService =
            tripWorkflowService;

        _auditService =
            auditService;
    }

    [HttpPost("{tripId:int}/dispatch")]
    public async Task<IActionResult> Dispatch(
        int tripId,
        DispatchTripRequest request)
    {
        var result =
            await _tripWorkflowService.DispatchAsync(
                tripId,
                request.DriverId,
                request.VehicleId);

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = result.Message
            });
        }

        await WriteAudit(
            "TRIP_DISPATCHED",
            tripId,
            result.Status);

        return Ok(result);
    }

    [HttpPost("{tripId:int}/start")]
    public async Task<IActionResult> Start(
        int tripId)
    {
        var result =
            await _tripWorkflowService
                .StartAsync(tripId);

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = result.Message
            });
        }

        await WriteAudit(
            "TRIP_STARTED",
            tripId,
            result.Status);

        return Ok(result);
    }

    [HttpPost("{tripId:int}/complete")]
    public async Task<IActionResult> Complete(
        int tripId)
    {
        var result =
            await _tripWorkflowService
                .CompleteAsync(tripId);

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = result.Message
            });
        }

        await WriteAudit(
            "TRIP_COMPLETED",
            tripId,
            result.Status);

        return Ok(result);
    }

    [HttpPost("{tripId:int}/cancel")]
    public async Task<IActionResult> Cancel(
        int tripId)
    {
        var result =
            await _tripWorkflowService
                .CancelAsync(tripId);

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = result.Message
            });
        }

        await WriteAudit(
            "TRIP_CANCELLED",
            tripId,
            result.Status);

        return Ok(result);
    }

    private async Task WriteAudit(
        string action,
        int tripId,
        string status)
    {
        await _auditService.LogAsync(
            action,
            $"Trip {tripId} changed to {status}",
            null,
            User.Identity?.Name);
    }
}