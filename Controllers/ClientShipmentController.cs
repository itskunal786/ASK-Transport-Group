using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/shipments")]
[Authorize]
public sealed class ClientShipmentController : ControllerBase
{
    private readonly ClientShipmentService _shipmentService;

    public ClientShipmentController(
        ClientShipmentService shipmentService)
    {
        _shipmentService = shipmentService;
    }


    [HttpGet]
    public async Task<IActionResult> GetMyShipments(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? sortBy = null,
        string? sortOrder = null,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }

        var result =
            await _shipmentService.GetMyShipmentsAsync(
                userId.Value,
                page,
                pageSize,
                search,
                status,
                fromDate,
                toDate,
                sortBy,
                sortOrder,
                cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Shipments loaded successfully.",
            data = result
        });
    }


    [HttpGet("{trackingNumber}")]
    public async Task<IActionResult> GetShipment(
        string trackingNumber,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }

        var shipment =
            await _shipmentService.GetShipmentAsync(
                userId.Value,
                trackingNumber,
                cancellationToken);

        if (shipment == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Shipment not found."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Shipment loaded successfully.",
            data = shipment
        });
    }


    [HttpGet("{trackingNumber}/timeline")]
    public async Task<IActionResult> GetTimeline(
        string trackingNumber,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }

        var timeline =
            await _shipmentService.GetTimelineAsync(
                userId.Value,
                trackingNumber,
                cancellationToken);

        if (timeline == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Shipment not found."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Shipment timeline loaded successfully.",
            data = timeline
        });
    }


    [HttpGet("{trackingNumber}/eta")]
    public async Task<IActionResult> GetEta(
        string trackingNumber,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }

        var eta =
            await _shipmentService.GetEtaAsync(
                userId.Value,
                trackingNumber,
                cancellationToken);

        if (eta == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Shipment not found."
            });
        }

        if (!eta.Success)
        {
            return Ok(new
            {
                success = false,
                message = eta.Message,
                data = eta
            });
        }

        return Ok(new
        {
            success = true,
            message = "Shipment ETA loaded successfully.",
            data = eta
        });
    }


    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
                value,
                out var userId))
        {
            return null;
        }

        return userId;
    }
}