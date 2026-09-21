using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/shipment-scans")]
public class ShipmentScanController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;
    private readonly RealtimeOperationsService _realtimeOperationsService;

    public ShipmentScanController(
        AskTransportDbContext db,
        AuditService auditService,
        RealtimeOperationsService realtimeOperationsService)
    {
        _db = db;
        _auditService = auditService;
        _realtimeOperationsService =
            realtimeOperationsService;
    }

    [HttpGet("code/{shipmentNumber}")]
    [HasPermission(Permissions.Shipments.View)]
    public async Task<IActionResult> GetScanCode(
        string shipmentNumber,
        CancellationToken cancellationToken)
    {
        shipmentNumber =
            shipmentNumber.Trim();

        var shipment =
            await _db.Shipments
                .AsNoTracking()
                .Include(x => x.Booking)
                .FirstOrDefaultAsync(
                    x =>
                        x.ShipmentNumber ==
                        shipmentNumber,
                    cancellationToken);

        if (shipment == null)
        {
            return NotFound(new
            {
                message =
                    "Shipment not found"
            });
        }

        var scanCode =
            $"ASK-SHP-{shipment.Id}-{shipment.ShipmentNumber}"
                .ToUpperInvariant();

        return Ok(new
        {
            shipment.Id,
            shipment.ShipmentNumber,
            shipment.BookingId,

            bookingNumber =
                shipment.Booking?
                    .BookingNumber,

            scanCode,

            qrPayload =
                scanCode,

            barcodeValue =
                scanCode
        });
    }

    [HttpPost]
    [HasPermission(
        Permissions.Shipments.UpdateStatus)]
    public async Task<IActionResult> ScanShipment(
        ShipmentScanRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(
            request.ScanCode))
        {
            return BadRequest(new
            {
                message =
                    "Scan code is required"
            });
        }

        if (string.IsNullOrWhiteSpace(
            request.ScanType))
        {
            return BadRequest(new
            {
                message =
                    "Scan type is required"
            });
        }

        var scanCode =
            request.ScanCode
                .Trim()
                .ToUpperInvariant();

        var shipment =
            await _db.Shipments
                .Include(x => x.Booking)
                .FirstOrDefaultAsync(
                    x =>
                        scanCode ==
                        (
                            "ASK-SHP-" +
                            x.Id +
                            "-" +
                            x.ShipmentNumber
                        ).ToUpper(),
                    cancellationToken);

        if (shipment == null)
        {
            return NotFound(new
            {
                message =
                    "Invalid shipment scan code"
            });
        }

        var userId =
            GetCurrentUserId();

        var scan =
            new ShipmentScan
            {
                ShipmentId =
                    shipment.Id,

                BookingId =
                    shipment.BookingId,

                ScanCode =
                    scanCode,

                ScanType =
                    request.ScanType
                        .Trim(),

                Location =
                    request.Location?
                        .Trim(),

                HubId =
                    request.HubId,

                ScannedByUserId =
                    userId,

                Notes =
                    request.Notes?
                        .Trim(),

                ScannedAt =
                    DateTime.UtcNow,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.ShipmentScans.Add(
            scan);

        ApplyShipmentStatus(
            shipment,
            request.ScanType);

        await _db.SaveChangesAsync(
            cancellationToken);

        if (shipment.Booking != null)
        {
            await _realtimeOperationsService
                .BookingStatusChangedAsync(
                    shipment.Booking
                        .BookingNumber,
                    shipment.Status,
                    shipment.Booking
                        .UserId);
        }

        await _auditService.LogAsync(
            "SHIPMENT_SCANNED",
            $"Shipment {shipment.ShipmentNumber} scanned as {scan.ScanType}",
            userId);

        return Ok(new
        {
            message =
                "Shipment scanned successfully",

            scan = new
            {
                scan.Id,
                scan.ScanCode,
                scan.ScanType,
                scan.Location,
                scan.HubId,
                scan.ScannedByUserId,
                scan.ScannedAt
            },

            shipment = new
            {
                shipment.Id,
                shipment.ShipmentNumber,
                shipment.Status
            }
        });
    }

    [HttpGet("{shipmentNumber}/history")]
    [HasPermission(Permissions.Shipments.View)]
    public async Task<IActionResult> GetHistory(
        string shipmentNumber,
        CancellationToken cancellationToken)
    {
        var shipment =
            await _db.Shipments
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x =>
                        x.ShipmentNumber ==
                        shipmentNumber,
                    cancellationToken);

        if (shipment == null)
        {
            return NotFound(new
            {
                message =
                    "Shipment not found"
            });
        }

        var history =
            await _db.ShipmentScans
                .AsNoTracking()
                .Where(x =>
                    x.ShipmentId ==
                    shipment.Id)
                .OrderByDescending(x =>
                    x.ScannedAt)
                .Select(x => new
                {
                    x.Id,
                    x.ScanCode,
                    x.ScanType,
                    x.Location,
                    x.HubId,
                    x.ScannedByUserId,
                    x.Notes,
                    x.ScannedAt
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(new
        {
            shipment.ShipmentNumber,
            shipment.Status,
            history
        });
    }

    private static void ApplyShipmentStatus(
        Shipment shipment,
        string scanType)
    {
        var type =
            scanType
                .Trim()
                .ToUpperInvariant();

        switch (type)
        {
            case "PICKUP":
                shipment.Status =
                    "Picked Up";
                break;

            case "HUB_IN":
                shipment.Status =
                    "Reached Hub";
                break;

            case "LOADED":
                shipment.Status =
                    "Loaded";
                break;

            case "DISPATCH":
                shipment.Status =
                    "In Transit";

                shipment.DispatchedAt ??=
                    DateTime.UtcNow;
                break;

            case "HUB_OUT":
                shipment.Status =
                    "Departed Hub";
                break;

            case "DESTINATION_HUB":
                shipment.Status =
                    "Reached Destination Hub";

                shipment
                    .ArrivedAtDestinationHub ??=
                    DateTime.UtcNow;
                break;

            case "OUT_FOR_DELIVERY":
                shipment.Status =
                    "Out For Delivery";
                break;

            case "DELIVERED":
                shipment.Status =
                    "Delivered";

                shipment.DeliveredAt ??=
                    DateTime.UtcNow;
                break;

            default:
                shipment.Status =
                    scanType.Trim();
                break;
        }

        shipment.UpdatedAt =
            DateTime.UtcNow;
    }

    private int? GetCurrentUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(
            value,
            out var userId)
            ? userId
            : null;
    }
}

public class ShipmentScanRequest
{
    public string ScanCode { get; set; } =
        string.Empty;

    public string ScanType { get; set; } =
        string.Empty;

    public string? Location { get; set; }

    public int? HubId { get; set; }

    public string? Notes { get; set; }
}