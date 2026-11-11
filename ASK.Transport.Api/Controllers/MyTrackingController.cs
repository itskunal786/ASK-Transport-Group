using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/my/tracking")]
public class MyTrackingController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly OwnershipService _ownershipService;

    public MyTrackingController(
        AskTransportDbContext db,
        OwnershipService ownershipService)
    {
        _db = db;
        _ownershipService =
            ownershipService;
    }

    [HttpGet("{bookingNumber}")]
    [HasPermission(
        Permissions.Tracking.View)]
    public async Task<IActionResult> Get(
        string bookingNumber)
    {
        var userId =
            GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var allowed =
            await _ownershipService
                .CanAccessBookingNumberAsync(
                    userId.Value,
                    bookingNumber);

        if (!allowed)
        {
            return Forbid();
        }

        var booking =
            await _db.Bookings
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                    bookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        var shipment =
            await _db.Shipments
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                    booking.Id);

        var tracking =
            await _db.ShipmentTrackings
                .AsNoTracking()
                .Where(x =>
                    x.BookingId ==
                    booking.Id)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .ToListAsync();

        return Ok(new
        {
            booking =
                new
                {
                    booking.Id,
                    booking.BookingNumber,
                    booking.BookingStatus,
                    booking.FromCity,
                    booking.ToCity,
                    booking.PickupDate,
                    booking.ExpectedDeliveryDate,
                    booking.DeliveredDate
                },

            shipment,

            tracking
        });
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