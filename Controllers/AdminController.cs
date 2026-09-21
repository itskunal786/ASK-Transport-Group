using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;
    private readonly WebhookService _webhookService;
    private readonly AdminSafetyService _adminSafetyService;

    public AdminController(
        AskTransportDbContext db,
        NotificationService notificationService,
        AuditService auditService,
        WebhookService webhookService,
        AdminSafetyService adminSafetyService)
    {
        _db = db;
        _notificationService = notificationService;
        _auditService = auditService;
        _webhookService = webhookService;
        _adminSafetyService = adminSafetyService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalUsers =
            await _db.Users.CountAsync();

        var totalBookings =
            await _db.Bookings.CountAsync();

        var activeShipments =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus != "Delivered" &&
                x.BookingStatus != "Cancelled");

        var deliveredBookings =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus == "Delivered");

        var cancelledBookings =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus == "Cancelled");

        var pendingPayments =
            await _db.Bookings.CountAsync(x =>
                x.PaymentStatus != "Paid");

        var totalRevenue =
            await _db.PaymentTransactions
                .Where(x =>
                    x.PaymentStatus == "Success")
                .SumAsync(x =>
                    (decimal?)x.Amount) ?? 0;

        var recentBookings =
            await _db.Bookings
                .Include(x => x.User)
                .Include(x => x.TransportService)
                .OrderByDescending(x => x.CreatedAt)
                .Take(10)
                .Select(x => new
                {
                    x.Id,
                    x.BookingNumber,

                    UserName =
                        x.User != null
                            ? x.User.Name
                            : "",

                    Service =
                        x.TransportService != null
                            ? x.TransportService.Name
                            : "",

                    x.FromCity,
                    x.ToCity,
                    x.TotalAmount,
                    x.BookingStatus,
                    x.PaymentStatus,
                    x.CreatedAt
                })
                .ToListAsync();

        return Ok(new
        {
            totalUsers,
            totalBookings,
            activeShipments,
            deliveredBookings,
            cancelledBookings,
            pendingPayments,
            totalRevenue,
            recentBookings
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] bool? active,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
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
            _db.Users
                .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(
            search))
        {
            search =
                search.Trim();

            query =
                query.Where(x =>
                    x.Name.Contains(search) ||
                    x.Email.Contains(search) ||
                    x.Phone.Contains(search));
        }

        if (active.HasValue)
        {
            query =
                query.Where(x =>
                    x.IsActive ==
                    active.Value);
        }

        var totalRecords =
            await query.CountAsync();

        var users =
            await query
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
                    x.Name,
                    x.Email,
                    x.Phone,

                    Role =
                        x.Role.ToString(),

                    x.IsVerified,
                    x.IsActive,
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

            data =
                users
        });
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> GetBookings(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? paymentStatus,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        page =
            page < 1
                ? 1
                : page;

        pageSize =
            pageSize < 1
                ? 20
                : pageSize;

        pageSize =
            pageSize > 100
                ? 100
                : pageSize;

        var query =
            _db.Bookings
                .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(
            search))
        {
            search =
                search.Trim();

            query =
                query.Where(x =>
                    x.BookingNumber
                        .Contains(search) ||
                    x.SenderName
                        .Contains(search) ||
                    x.ReceiverName
                        .Contains(search) ||
                    x.FromCity
                        .Contains(search) ||
                    x.ToCity
                        .Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(
            status))
        {
            status =
                status.Trim();

            query =
                query.Where(x =>
                    x.BookingStatus ==
                    status);
        }

        if (!string.IsNullOrWhiteSpace(
            paymentStatus))
        {
            paymentStatus =
                paymentStatus.Trim();

            query =
                query.Where(x =>
                    x.PaymentStatus ==
                    paymentStatus);
        }

        var totalRecords =
            await query.CountAsync();

        var bookings =
            await query
                .Include(x => x.User)
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

                    UserName =
                        x.User != null
                            ? x.User.Name
                            : "",

                    UserEmail =
                        x.User != null
                            ? x.User.Email
                            : "",

                    Service =
                        x.TransportService != null
                            ? x.TransportService.Name
                            : "",

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

            data =
                bookings
        });
    }

    [HttpGet(
        "bookings/{bookingNumber}")]
    public async Task<IActionResult> GetBooking(
        string bookingNumber)
    {
        var booking =
            await _db.Bookings
                .Include(x => x.User)
                .Include(x =>
                    x.TransportService)
                .Include(x =>
                    x.BookingItems)
                .Include(x =>
                    x.ShipmentTrackings)
                .Include(x =>
                    x.Invoice)
                    .ThenInclude(x =>
                        x!.InvoiceItems)
                .Include(x =>
                    x.PaymentTransactions)
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

        return Ok(
            booking);
    }

    [HttpPut(
        "bookings/{bookingNumber}/status")]
    public async Task<IActionResult>
        UpdateBookingStatus(
            string bookingNumber,
            UpdateBookingStatusRequest request)
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
                    "Booking status is required"
            });
        }

        bookingNumber =
            bookingNumber.Trim();

        var booking =
            await _db.Bookings
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

        if (string.Equals(
            booking.BookingStatus,
            "Delivered",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Delivered booking cannot be updated"
            });
        }

        if (string.Equals(
            booking.BookingStatus,
            "Cancelled",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Cancelled booking cannot be updated"
            });
        }

        var allowedStatuses =
            new[]
            {
                "Booked",
                "Picked Up",
                "In Transit",
                "Reached Hub",
                "Out For Delivery",
                "Delivered",
                "Cancelled"
            };

        var status =
            allowedStatuses
                .FirstOrDefault(x =>
                    x.Equals(
                        request.Status.Trim(),
                        StringComparison
                            .OrdinalIgnoreCase));

        if (status == null)
        {
            return BadRequest(new
            {
                message =
                    "Invalid booking status",

                allowedStatuses
            });
        }

        if (string.Equals(
            booking.BookingStatus,
            status,
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    $"Booking is already in {status} status"
            });
        }

        booking.BookingStatus =
            status;

        booking.UpdatedAt =
            DateTime.UtcNow;

        if (string.Equals(
            status,
            "Delivered",
            StringComparison.OrdinalIgnoreCase))
        {
            booking.DeliveredDate =
                DateTime.UtcNow;
        }

        var tracking =
            new ShipmentTracking
            {
                BookingId =
                    booking.Id,

                Status =
                    status,

                Location =
                    string.IsNullOrWhiteSpace(
                        request.Location)
                        ? booking.FromCity
                        : request.Location.Trim(),

                Description =
                    request.Description?
                        .Trim(),

                StatusDate =
                    DateTime.UtcNow,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.ShipmentTrackings.Add(
            tracking);

        await _db.SaveChangesAsync();

        await _notificationService
            .CreateBookingStatusAsync(
                booking,
                status);

        await _auditService.LogAsync(
            "BOOKING_STATUS_UPDATE",
            $"Booking {booking.BookingNumber} changed to {status}",
            booking.UserId);

        await _webhookService
            .BookingStatusChangedAsync(
                booking.Id,
                booking.BookingNumber,
                booking.BookingStatus,
                tracking.Location);

        return Ok(new
        {
            message =
                "Booking status updated successfully",

            booking.BookingNumber,
            booking.BookingStatus,
            booking.DeliveredDate
        });
    }

    [HttpPut(
        "users/{id:int}/status")]
    public async Task<IActionResult>
        ChangeUserStatus(
            int id,
            [FromQuery] bool active)
    {
        var user =
            await _db.Users
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        if (user.Role ==
            UserRole.Admin)
        {
            return BadRequest(new
            {
                message =
                    "Admin account cannot be disabled from this endpoint"
            });
        }

        if (user.IsActive ==
            active)
        {
            return Ok(new
            {
                message =
                    active
                        ? "User is already active"
                        : "User is already inactive",

                user.Id,
                user.Name,
                user.Email,
                user.IsActive
            });
        }

        user.IsActive =
            active;

        await _db.SaveChangesAsync();

        if (!active)
        {
            await _adminSafetyService
                .RevokeSessionsAsync(
                    user.Id);
        }

        await _auditService.LogAsync(
            active
                ? "USER_ACTIVATED"
                : "USER_DEACTIVATED",

            $"User {user.Email} status changed",

            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                active
                    ? "User activated successfully"
                    : "User deactivated successfully",

            user.Id,
            user.Name,
            user.Email,
            user.IsActive
        });
    }
}
