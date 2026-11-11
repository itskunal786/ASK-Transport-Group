using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/tracking")]
public class TrackingController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;
    private readonly RealtimeOperationsService _realtimeOperationsService;

    public TrackingController(
        AskTransportDbContext db,
        NotificationService notificationService,
        AuditService auditService,
        RealtimeOperationsService realtimeOperationsService)
    {
        _db = db;
        _notificationService = notificationService;
        _auditService = auditService;
        _realtimeOperationsService = realtimeOperationsService;
    }

    [HttpGet("{bookingNumber}")]
    [HasPermission(Permissions.Tracking.View)]
    public async Task<IActionResult> GetTracking(
        string bookingNumber,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(
            bookingNumber))
        {
            return BadRequest(new
            {
                message =
                    "Booking number is required"
            });
        }

        bookingNumber =
            bookingNumber.Trim();

        var booking =
            await _db.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.BookingNumber ==
                    bookingNumber)
                .Select(x => new
                {
                    x.Id,
                    x.BookingNumber,
                    x.BookingStatus,
                    x.FromCity,
                    x.ToCity,
                    x.ExpectedDeliveryDate,
                    x.DeliveredDate
                })
                .FirstOrDefaultAsync(
                    cancellationToken);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        var tracking =
            await _db.ShipmentTrackings
                .AsNoTracking()
                .Where(x =>
                    x.BookingId ==
                    booking.Id)
                .OrderBy(x =>
                    x.StatusDate)
                .Select(x => new
                {
                    x.Id,
                    x.Status,
                    x.Location,
                    x.Description,
                    x.StatusDate
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(new
        {
            booking,
            tracking
        });
    }

    [HttpPost("{bookingNumber}")]
    [HasPermission(Permissions.Tracking.Update)]
    public async Task<IActionResult> AddTracking(
        string bookingNumber,
        UpdateTrackingRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(
            bookingNumber))
        {
            return BadRequest(new
            {
                message =
                    "Booking number is required"
            });
        }

        if (string.IsNullOrWhiteSpace(
            request.Status))
        {
            return BadRequest(new
            {
                message =
                    "Tracking status is required"
            });
        }

        bookingNumber =
            bookingNumber.Trim();

        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(
                    x =>
                        x.BookingNumber ==
                        bookingNumber,
                    cancellationToken);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        var status =
            request.Status.Trim();

        var location =
            request.Location?
                .Trim()
            ?? "";

        var description =
            request.Description?
                .Trim()
            ?? "";

        var tracking =
            new ShipmentTracking
            {
                BookingId =
                    booking.Id,

                Status =
                    status,

                Location =
                    location,

                Description =
                    description,

                StatusDate =
                    DateTime.UtcNow,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.ShipmentTrackings.Add(
            tracking);

        booking.BookingStatus =
            status;

        booking.UpdatedAt =
            DateTime.UtcNow;

        if (status.Equals(
            "Delivered",
            StringComparison.OrdinalIgnoreCase))
        {
            booking.DeliveredDate =
                DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(
            cancellationToken);

        await _notificationService
            .CreateBookingStatusAsync(
                booking,
                status);

        await _realtimeOperationsService
            .TrackingUpdatedAsync(
                booking.BookingNumber,
                status,
                location,
                booking.UserId);

        await _realtimeOperationsService
            .BookingStatusChangedAsync(
                booking.BookingNumber,
                status,
                booking.UserId);

        await _auditService.LogAsync(
            "TRACKING_UPDATED",
            $"Tracking updated for booking {booking.BookingNumber}. Status: {status}",
            booking.UserId);

        return Ok(new
        {
            message =
                "Tracking updated successfully",

            booking.BookingNumber,
            booking.BookingStatus,

            tracking = new
            {
                tracking.Id,
                tracking.Status,
                tracking.Location,
                tracking.Description,
                tracking.StatusDate
            }
        });
    }
}

public class UpdateTrackingRequest
{
    public string Status { get; set; } =
        string.Empty;

    public string? Location { get; set; }

    public string? Description { get; set; }
}