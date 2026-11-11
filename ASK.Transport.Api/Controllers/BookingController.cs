using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly FreightService _freightService;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;

    public BookingController(
        AskTransportDbContext db,
        FreightService freightService,
        NotificationService notificationService,
        AuditService auditService)
    {
        _db = db;
        _freightService = freightService;
        _notificationService = notificationService;
        _auditService = auditService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking(
        CreateBookingRequest request)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid user token"
            });
        }

        if (request.PickupDate != default &&
            request.PickupDate.Date < DateTime.UtcNow.Date)
        {
            return BadRequest(new
            {
                message =
                    "Pickup date cannot be in the past"
            });
        }

        if (request.DiscountAmount < 0)
        {
            return BadRequest(new
            {
                message =
                    "Discount amount cannot be negative"
            });
        }

        SavedContact? senderContact = null;
        SavedContact? receiverContact = null;

        if (request.SenderContactId.HasValue)
        {
            senderContact = await _db.SavedContacts
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == request.SenderContactId.Value &&
                    x.UserId == userId.Value &&
                    x.ContactType == "Sender");

            if (senderContact == null)
            {
                return BadRequest(new
                {
                    message = "Sender contact not found"
                });
            }

            request.SenderName = senderContact.Name;
            request.SenderPhone = senderContact.Phone;
            request.FromAddress = senderContact.Address;
            request.FromPinCode = senderContact.PinCode;
        }

        if (request.ReceiverContactId.HasValue)
        {
            receiverContact = await _db.SavedContacts
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == request.ReceiverContactId.Value &&
                    x.UserId == userId.Value &&
                    x.ContactType == "Receiver");

            if (receiverContact == null)
            {
                return BadRequest(new
                {
                    message = "Receiver contact not found"
                });
            }

            request.ReceiverName = receiverContact.Name;
            request.ReceiverPhone = receiverContact.Phone;
            request.ToAddress = receiverContact.Address;
            request.ToPinCode = receiverContact.PinCode;
        }
        var fromPin = await _db.PinCodes
            .FirstOrDefaultAsync(x =>
                x.Pin == request.FromPinCode);

        if (fromPin == null)
        {
            return BadRequest(new
            {
                message =
                    "Pickup PIN code not found"
            });
        }

        if (!fromPin.Serviceable)
        {
            return BadRequest(new
            {
                message =
                    "Pickup PIN is not serviceable"
            });
        }

        var toPin = await _db.PinCodes
            .FirstOrDefaultAsync(x =>
                x.Pin == request.ToPinCode);

        if (toPin == null)
        {
            return BadRequest(new
            {
                message =
                    "Delivery PIN code not found"
            });
        }

        if (!toPin.Serviceable)
        {
            return BadRequest(new
            {
                message =
                    "Delivery PIN is not serviceable"
            });
        }

        if (fromPin.Pin == toPin.Pin)
        {
            return BadRequest(new
            {
                message =
                    "Pickup and delivery PIN cannot be the same"
            });
        }

        var service = await _db.TransportServices
            .FirstOrDefaultAsync(x =>
                x.Id == request.TransportServiceId &&
                x.IsActive);

        if (service == null)
        {
            return BadRequest(new
            {
                message =
                    "Invalid transport service"
            });
        }

        decimal totalWeight;
        int totalQuantity;

        if (request.Items != null &&
            request.Items.Count > 0)
        {
            totalWeight = request.Items
                .Sum(x =>
                    x.Weight * x.Quantity);

            totalQuantity = request.Items
                .Sum(x =>
                    x.Quantity);
        }
        else
        {
            totalWeight =
                request.Weight;

            totalQuantity =
                request.Quantity;
        }

        if (totalWeight <= 0)
        {
            return BadRequest(new
            {
                message =
                    "Total weight must be greater than zero"
            });
        }

        if (totalQuantity <= 0)
        {
            return BadRequest(new
            {
                message =
                    "Total quantity must be greater than zero"
            });
        }

        var freight =
            _freightService.CalculateFreight(
                service,
                totalWeight,
                1);

        var gst =
            _freightService.CalculateGst(
                freight);

        if (request.DiscountAmount >
            freight + gst)
        {
            return BadRequest(new
            {
                message =
                    "Discount cannot be greater than booking amount"
            });
        }

        var total =
            _freightService.CalculateTotal(
                freight,
                gst,
                request.DiscountAmount);

        var pickupDate =
            request.PickupDate == default
                ? DateTime.UtcNow
                : request.PickupDate;

        var deliveryDays =
            toPin.DeliveryDays +
            service.ExtraDeliveryDays;

        var expectedDeliveryDate =
            pickupDate.AddDays(
                deliveryDays);

        var bookingNumber =
            await GenerateBookingNumberAsync();

        var booking = new Booking
        {
            BookingNumber =
                bookingNumber,

            UserId =
                userId.Value,

            OrderType =
                request.OrderType.Trim(),

            SenderName =
                request.SenderName.Trim(),

            SenderPhone =
                request.SenderPhone.Trim(),

            FromAddress =
                request.FromAddress.Trim(),

            FromPinCode =
                fromPin.Pin,

            FromCity =
                fromPin.City,

            FromState =
                fromPin.State,

            ReceiverName =
                request.ReceiverName.Trim(),

            ReceiverPhone =
                request.ReceiverPhone.Trim(),

            ToAddress =
                request.ToAddress.Trim(),

            ToPinCode =
                toPin.Pin,

            ToCity =
                toPin.City,

            ToState =
                toPin.State,

            GoodsType =
                request.GoodsType.Trim(),

            Weight =
                totalWeight,

            Quantity =
                totalQuantity,

            GoodsDescription =
                request.GoodsDescription?.Trim(),

            TransportServiceId =
                service.Id,

            PickupDate =
                pickupDate,

            ExpectedDeliveryDate =
                expectedDeliveryDate,

            FreightAmount =
                freight,

            GstPercentage =
                18,

            GstAmount =
                gst,

            DiscountAmount =
                request.DiscountAmount,

            TotalAmount =
                total,

            BookingStatus =
                "Booked",

            PaymentStatus =
                "Pending",

            Notes =
                request.Notes?.Trim(),

            CreatedAt =
                DateTime.UtcNow
        };

        if (request.Items != null)
        {
            foreach (var item in request.Items)
            {
                booking.BookingItems.Add(
                    new BookingItem
                    {
                        ItemName =
                            item.ItemName.Trim(),

                        Description =
                            item.Description?.Trim(),

                        GoodsType =
                            item.GoodsType.Trim(),

                        Quantity =
                            item.Quantity,

                        Weight =
                            item.Weight,

                        Length =
                            item.Length,

                        Width =
                            item.Width,

                        Height =
                            item.Height,

                        DeclaredValue =
                            item.DeclaredValue,

                        IsFragile =
                            item.IsFragile,

                        SpecialInstructions =
                            item.SpecialInstructions?.Trim(),

                        CreatedAt =
                            DateTime.UtcNow
                    });
            }
        }

        _db.Bookings.Add(
            booking);

        await _db.SaveChangesAsync();

        _db.ShipmentTrackings.Add(
            new ShipmentTracking
            {
                BookingId =
                    booking.Id,

                Status =
                    "Booked",

                Location =
                    fromPin.City,

                Description =
                    "Booking created successfully",

                StatusDate =
                    DateTime.UtcNow,

                CreatedAt =
                    DateTime.UtcNow
            });

        await _db.SaveChangesAsync();

        await _notificationService
            .CreateAsync(
                booking.UserId,
                "Booking Created",
                $"Your booking {booking.BookingNumber} has been created successfully.",
                "Booking",
                booking.Id);

        await _auditService.LogAsync(
            "BOOKING_CREATED",
            $"Booking {booking.BookingNumber} created",
            booking.UserId,
            User.FindFirstValue(
                ClaimTypes.Email));

        return Ok(new
        {
            message =
                "Booking created successfully",

            booking = new
            {
                booking.Id,
                booking.BookingNumber,
                booking.BookingStatus,
                booking.PaymentStatus,

                service =
                    service.Name,

                booking.FromCity,
                booking.ToCity,
                booking.Weight,
                booking.Quantity,
                booking.FreightAmount,
                booking.GstAmount,
                booking.DiscountAmount,
                booking.TotalAmount,
                booking.PickupDate,
                booking.ExpectedDeliveryDate
            }
        });
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyBookings(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        page =
            page < 1
                ? 1
                : page;

        pageSize =
            pageSize < 1
                ? 10
                : pageSize;

        pageSize =
            pageSize > 100
                ? 100
                : pageSize;

        var query =
            _db.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.UserId ==
                    userId.Value);

        if (!string.IsNullOrWhiteSpace(
            search))
        {
            search =
                search.Trim();

            query = query.Where(x =>
                x.BookingNumber.Contains(search) ||
                x.FromCity.Contains(search) ||
                x.ToCity.Contains(search) ||
                x.SenderName.Contains(search) ||
                x.ReceiverName.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(
            status))
        {
            status =
                status.Trim();

            query = query.Where(x =>
                x.BookingStatus ==
                status);
        }

        var totalRecords =
            await query.CountAsync();

        var data =
            await query
                .Include(x =>
                    x.TransportService)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Skip(
                    (page - 1) *
                    pageSize)
                .Take(
                    pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.BookingNumber,
                    x.OrderType,
                    x.SenderName,
                    x.ReceiverName,
                    x.FromCity,
                    x.ToCity,
                    x.GoodsType,
                    x.Weight,
                    x.Quantity,
                    x.TotalAmount,
                    x.BookingStatus,
                    x.PaymentStatus,

                    Service =
                        x.TransportService != null
                            ? x.TransportService.Name
                            : "",

                    x.PickupDate,
                    x.ExpectedDeliveryDate,
                    x.CreatedAt
                })
                .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            totalRecords,

            totalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize),

            data
        });
    }

    [HttpGet("{bookingNumber}")]
    public async Task<IActionResult> GetBooking(
        string bookingNumber)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var booking =
            await _db.Bookings
                .Include(x =>
                    x.TransportService)
                .Include(x =>
                    x.BookingItems)
                .Include(x =>
                    x.ShipmentTrackings)
                .Include(x =>
                    x.Invoice)
                .Include(x =>
                    x.PaymentTransactions)
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                        bookingNumber &&
                    x.UserId ==
                        userId.Value);

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

    [HttpPost("{bookingNumber}/cancel")]
    public async Task<IActionResult> CancelBooking(
        string bookingNumber,
        CancelBookingRequest request)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                        bookingNumber &&
                    x.UserId ==
                        userId.Value);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        if (booking.BookingStatus ==
            "Cancelled")
        {
            return BadRequest(new
            {
                message =
                    "Booking is already cancelled"
            });
        }

        if (booking.BookingStatus ==
            "Delivered")
        {
            return BadRequest(new
            {
                message =
                    "Delivered booking cannot be cancelled"
            });
        }

        var blockedStatuses =
            new[]
            {
                "In Transit",
                "Reached Hub",
                "Out For Delivery"
            };

        if (blockedStatuses.Contains(
            booking.BookingStatus))
        {
            return BadRequest(new
            {
                message =
                    "Booking cannot be cancelled after dispatch"
            });
        }

        booking.BookingStatus =
            "Cancelled";

        booking.UpdatedAt =
            DateTime.UtcNow;

        _db.ShipmentTrackings.Add(
            new ShipmentTracking
            {
                BookingId =
                    booking.Id,

                Status =
                    "Cancelled",

                Location =
                    booking.FromCity,

                Description =
                    request.Reason.Trim(),

                StatusDate =
                    DateTime.UtcNow,

                CreatedAt =
                    DateTime.UtcNow
            });

        await _db.SaveChangesAsync();

        await _notificationService
            .CreateBookingStatusAsync(
                booking,
                "Cancelled");

        await _auditService.LogAsync(
            "BOOKING_CANCELLED",
            $"Booking {booking.BookingNumber} cancelled. Reason: {request.Reason.Trim()}",
            booking.UserId,
            User.FindFirstValue(
                ClaimTypes.Email));

        return Ok(new
        {
            message =
                "Booking cancelled successfully",

            bookingNumber =
                booking.BookingNumber,

            bookingStatus =
                booking.BookingStatus
        });
    }

    private async Task<string>
        GenerateBookingNumberAsync()
    {
        for (var attempt = 0;
             attempt < 10;
             attempt++)
        {
            var number =
                $"ASK{DateTime.UtcNow:yyyyMMddHHmmssfff}{Random.Shared.Next(100, 1000)}";

            var exists =
                await _db.Bookings
                    .AnyAsync(x =>
                        x.BookingNumber ==
                        number);

            if (!exists)
            {
                return number;
            }
        }

        return $"ASK{Guid.NewGuid():N}"
            .ToUpperInvariant();
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
