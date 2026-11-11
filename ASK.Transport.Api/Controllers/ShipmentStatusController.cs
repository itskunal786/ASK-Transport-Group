using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/shipments")]
public class ShipmentStatusController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;
    private readonly NotificationService _notificationService;
    private readonly WebhookService _webhookService;

    public ShipmentStatusController(
        AskTransportDbContext db,
        AuditService auditService,
        NotificationService notificationService,
        WebhookService webhookService)
    {
        _db = db;
        _auditService = auditService;
        _notificationService = notificationService;
        _webhookService = webhookService;
    }

    [HttpGet("{shipmentNumber}")]
    [HasPermission(
        Permissions.Shipments.View)]
    public async Task<IActionResult> GetShipment(
        string shipmentNumber,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(
            shipmentNumber))
        {
            return BadRequest(new
            {
                message =
                    "Shipment number is required"
            });
        }

        shipmentNumber =
            shipmentNumber.Trim();

        var shipment =
            await _db.Shipments
                .AsNoTracking()
                .Include(x => x.Booking)
                .Include(x => x.OriginHub)
                .Include(x => x.DestinationHub)
                .Include(x => x.CurrentHub)
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

        return Ok(new
        {
            shipment.Id,
            shipment.ShipmentNumber,
            shipment.BookingId,

            BookingNumber =
                shipment.Booking?
                    .BookingNumber,

            shipment.Status,
            shipment.TotalWeight,
            shipment.TotalQuantity,

            shipment.OriginHubId,

            OriginHub =
                shipment.OriginHub?
                    .Name,

            shipment.DestinationHubId,

            DestinationHub =
                shipment.DestinationHub?
                    .Name,

            shipment.CurrentHubId,

            CurrentHub =
                shipment.CurrentHub?
                    .Name,

            shipment.DispatchedAt,
            shipment.ArrivedAtDestinationHub,
            shipment.DeliveredAt,
            shipment.Notes,
            shipment.CreatedAt,
            shipment.UpdatedAt
        });
    }

    [HttpPut(
        "{shipmentNumber}/status")]
    [HasPermission(
        Permissions.Shipments.UpdateStatus)]
    public async Task<IActionResult> UpdateStatus(
        string shipmentNumber,
        UpdateShipmentStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(
            shipmentNumber))
        {
            return BadRequest(new
            {
                message =
                    "Shipment number is required"
            });
        }

        if (string.IsNullOrWhiteSpace(
            request.Status))
        {
            return BadRequest(new
            {
                message =
                    "Shipment status is required"
            });
        }

        shipmentNumber =
            shipmentNumber.Trim();

        var shipment =
            await _db.Shipments
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

        if (string.Equals(
            shipment.Status,
            "Delivered",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Delivered shipment cannot be updated"
            });
        }

        if (string.Equals(
            shipment.Status,
            "Cancelled",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Cancelled shipment cannot be updated"
            });
        }

        var allowedStatuses =
            new[]
            {
                "Created",
                "Dispatched",
                "In Transit",
                "Reached Hub",
                "Arrived At Destination Hub",
                "Out For Delivery",
                "Delivered",
                "Cancelled"
            };

        var status =
            allowedStatuses
                .FirstOrDefault(x =>
                    string.Equals(
                        x,
                        request.Status.Trim(),
                        StringComparison
                            .OrdinalIgnoreCase));

        if (status == null)
        {
            return BadRequest(new
            {
                message =
                    "Invalid shipment status",

                allowedStatuses
            });
        }

        if (string.Equals(
            shipment.Status,
            status,
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    $"Shipment is already in {status} status"
            });
        }

        if (request.CurrentHubId.HasValue)
        {
            var hubExists =
                await _db.Hubs
                    .AsNoTracking()
                    .AnyAsync(
                        x =>
                            x.Id ==
                            request.CurrentHubId.Value,
                        cancellationToken);

            if (!hubExists)
            {
                return BadRequest(new
                {
                    message =
                        "Current hub not found"
                });
            }

            shipment.CurrentHubId =
                request.CurrentHubId.Value;
        }

        var now =
            DateTime.UtcNow;

        shipment.Status =
            status;

        shipment.UpdatedAt =
            now;

        if (!string.IsNullOrWhiteSpace(
            request.Notes))
        {
            shipment.Notes =
                request.Notes.Trim();
        }

        if (string.Equals(
            status,
            "Dispatched",
            StringComparison.OrdinalIgnoreCase))
        {
            shipment.DispatchedAt ??=
                now;
        }

        if (string.Equals(
            status,
            "Arrived At Destination Hub",
            StringComparison.OrdinalIgnoreCase))
        {
            shipment.ArrivedAtDestinationHub ??=
                now;

            if (shipment.DestinationHubId.HasValue)
            {
                shipment.CurrentHubId =
                    shipment.DestinationHubId;
            }
        }

        if (string.Equals(
            status,
            "Delivered",
            StringComparison.OrdinalIgnoreCase))
        {
            shipment.DeliveredAt ??=
                now;
        }

        var bookingStatus =
            MapBookingStatus(
                status);

        var bookingStatusChanged =
            false;

        if (shipment.Booking != null &&
            bookingStatus != null &&
            !string.Equals(
                shipment.Booking.BookingStatus,
                bookingStatus,
                StringComparison.OrdinalIgnoreCase))
        {
            shipment.Booking.BookingStatus =
                bookingStatus;

            shipment.Booking.UpdatedAt =
                now;

            if (string.Equals(
                bookingStatus,
                "Delivered",
                StringComparison.OrdinalIgnoreCase))
            {
                shipment.Booking.DeliveredDate ??=
                    now;
            }

            bookingStatusChanged =
                true;
        }

        if (shipment.Booking != null)
        {
            var tracking =
                new ShipmentTracking
                {
                    BookingId =
                        shipment.Booking.Id,

                    Status =
                        bookingStatus ??
                        status,

                    Location =
                        string.IsNullOrWhiteSpace(
                            request.Location)
                            ? GetDefaultLocation(
                                shipment.Booking)
                            : request.Location.Trim(),

                    Description =
                        string.IsNullOrWhiteSpace(
                            request.Description)
                            ? $"Shipment {shipment.ShipmentNumber} status changed to {status}"
                            : request.Description.Trim(),

                    StatusDate =
                        now,

                    CreatedAt =
                        now
                };

            _db.ShipmentTrackings.Add(
                tracking);
        }

        // Add movement history for customer tracking timeline
        var movement =
            new ShipmentMovement
            {
                ShipmentId =
                    shipment.Id,

                Status =
                    status,

                Location =
                    string.IsNullOrWhiteSpace(
                        request.Location)
                        ? shipment.Booking != null
                            ? GetDefaultLocation(
                                shipment.Booking)
                            : null
                        : request.Location.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(
                        request.Description)
                        ? $"Shipment status changed to {status}"
                        : request.Description.Trim(),

                MovementDate =
                    now,

                CreatedAt =
                    now
            };

        _db.ShipmentMovements.Add(
            movement);

        await _db.SaveChangesAsync(
            cancellationToken);

        await _auditService.LogAsync(
            "SHIPMENT_STATUS_UPDATE",
            $"Shipment {shipment.ShipmentNumber} changed to {shipment.Status}",
            shipment.Booking?.UserId);

        await _webhookService
            .ShipmentUpdatedAsync(
                shipment.Id,
                shipment.ShipmentNumber,
                shipment.Status,
                shipment.DeliveredAt,
                cancellationToken);

        if (shipment.Booking != null &&
            bookingStatusChanged)
        {
            await _notificationService
                .CreateBookingStatusAsync(
                    shipment.Booking,
                    shipment.Booking.BookingStatus);

            await _webhookService
                .BookingStatusChangedAsync(
                    shipment.Booking.Id,
                    shipment.Booking.BookingNumber,
                    shipment.Booking.BookingStatus,
                    string.IsNullOrWhiteSpace(
                        request.Location)
                        ? GetDefaultLocation(
                            shipment.Booking)
                        : request.Location.Trim(),
                    cancellationToken);
        }

        return Ok(new
        {
            message =
                "Shipment status updated successfully",

            shipment = new
            {
                shipment.Id,
                shipment.ShipmentNumber,
                shipment.Status,
                shipment.CurrentHubId,
                shipment.DispatchedAt,
                shipment.ArrivedAtDestinationHub,
                shipment.DeliveredAt,
                shipment.UpdatedAt
            },

            booking = shipment.Booking == null
                ? null
                : new
                {
                    shipment.Booking.Id,
                    shipment.Booking.BookingNumber,
                    shipment.Booking.BookingStatus,
                    shipment.Booking.DeliveredDate
                }
        });
    }

    private static string? MapBookingStatus(
        string shipmentStatus)
    {
        if (string.Equals(
            shipmentStatus,
            "Created",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Booked";
        }

        if (string.Equals(
            shipmentStatus,
            "Dispatched",
            StringComparison.OrdinalIgnoreCase))
        {
            return "In Transit";
        }

        if (string.Equals(
            shipmentStatus,
            "In Transit",
            StringComparison.OrdinalIgnoreCase))
        {
            return "In Transit";
        }

        if (string.Equals(
            shipmentStatus,
            "Reached Hub",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Reached Hub";
        }

        if (string.Equals(
            shipmentStatus,
            "Arrived At Destination Hub",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Reached Hub";
        }

        if (string.Equals(
            shipmentStatus,
            "Out For Delivery",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Out For Delivery";
        }

        if (string.Equals(
            shipmentStatus,
            "Delivered",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Delivered";
        }

        if (string.Equals(
            shipmentStatus,
            "Cancelled",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Cancelled";
        }

        return null;
    }

    private static string GetDefaultLocation(
        Booking booking)
    {
        if (string.Equals(
            booking.BookingStatus,
            "Delivered",
            StringComparison.OrdinalIgnoreCase) ||
            string.Equals(
                booking.BookingStatus,
                "Out For Delivery",
                StringComparison.OrdinalIgnoreCase))
        {
            return booking.ToCity;
        }

        return booking.FromCity;
    }
}

public class UpdateShipmentStatusRequest
{
    public string Status { get; set; } =
        string.Empty;

    public int? CurrentHubId { get; set; }

    public string? Location { get; set; }

    public string? Description { get; set; }

    public string? Notes { get; set; }
}