using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/my/bookings")]
public class MyBookingDetailsController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly OwnershipService _ownershipService;

    public MyBookingDetailsController(
        AskTransportDbContext db,
        OwnershipService ownershipService)
    {
        _db = db;
        _ownershipService =
            ownershipService;
    }

    [HttpGet("{bookingNumber}")]
    [HasPermission(
        Permissions.Bookings.ViewOwn)]
    public async Task<IActionResult> GetByNumber(
        string bookingNumber,
        CancellationToken cancellationToken)
    {
        var userId =
            GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid user session"
            });
        }

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
                .Where(x =>
                    x.BookingNumber ==
                    bookingNumber)
                .Select(x => new
                {
                    x.Id,
                    x.BookingNumber,
                    x.OrderType,

                    sender =
                        new
                        {
                            x.SenderName,
                            x.SenderPhone,
                            x.FromAddress,
                            x.FromPinCode,
                            x.FromCity,
                            x.FromState
                        },

                    receiver =
                        new
                        {
                            x.ReceiverName,
                            x.ReceiverPhone,
                            x.ToAddress,
                            x.ToPinCode,
                            x.ToCity,
                            x.ToState
                        },

                    goods =
                        new
                        {
                            x.GoodsType,
                            x.GoodsDescription,
                            x.Weight,
                            x.Quantity
                        },

                    service =
                        x.TransportService == null
                            ? null
                            : new
                            {
                                x.TransportService.Id,
                                x.TransportService.Name
                            },

                    charges =
                        new
                        {
                            x.FreightAmount,
                            x.GstPercentage,
                            x.GstAmount,
                            x.DiscountAmount,
                            x.TotalAmount
                        },

                    x.BookingStatus,
                    x.PaymentStatus,
                    x.PickupDate,
                    x.ExpectedDeliveryDate,
                    x.DeliveredDate,
                    x.Notes,
                    x.CreatedAt,
                    x.UpdatedAt,

                    items =
                        x.BookingItems
                            .Select(item =>
                                new
                                {
                                    item.Id,
                                    item.ItemName,
                                    item.Description,
                                    item.GoodsType,
                                    item.Quantity,
                                    item.Weight,
                                    item.Length,
                                    item.Width,
                                    item.Height,
                                    item.DeclaredValue,
                                    item.IsFragile,
                                    item.SpecialInstructions
                                })
                            .ToList(),

                    tracking =
                        x.ShipmentTrackings
                            .OrderByDescending(t =>
                                t.StatusDate)
                            .Select(t =>
                                new
                                {
                                    t.Id,
                                    t.Status,
                                    t.Location,
                                    t.Description,
                                    t.StatusDate
                                })
                            .ToList(),

                    invoice =
                        x.Invoice == null
                            ? null
                            : new
                            {
                                x.Invoice.Id,
                                x.Invoice.InvoiceNumber,
                                x.Invoice.SubTotal,
                                x.Invoice.GstAmount,
                                x.Invoice.DiscountAmount,
                                x.Invoice.TotalAmount,
                                x.Invoice.PaymentStatus,
                                x.Invoice.CreatedAt
                            },

                    payments =
                        x.PaymentTransactions
                            .OrderByDescending(p =>
                                p.CreatedAt)
                            .Select(p =>
                                new
                                {
                                    p.Id,
                                    p.TransactionId,
                                    p.Amount,
                                    p.PaymentMethod,
                                    p.PaymentStatus,
                                    p.PaidAt,
                                    p.CreatedAt
                                })
                            .ToList()
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

        return Ok(booking);
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