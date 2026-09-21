using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly PaymentService _paymentService;
    private readonly InvoiceService _invoiceService;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;

    public PaymentController(
        AskTransportDbContext db,
        PaymentService paymentService,
        InvoiceService invoiceService,
        NotificationService notificationService,
        AuditService auditService)
    {
        _db = db;
        _paymentService =
            paymentService;

        _invoiceService =
            invoiceService;

        _notificationService =
            notificationService;

        _auditService =
            auditService;
    }

    [HttpPost]
    public async Task<IActionResult> Pay(
        CreatePaymentRequest request)
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
                    request.BookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        if (!User.IsInRole("Admin") &&
            booking.UserId != userId.Value)
        {
            return Forbid();
        }

        if (booking.BookingStatus ==
            "Cancelled")
        {
            return BadRequest(new
            {
                message =
                    "Payment cannot be made for a cancelled booking"
            });
        }

        if (booking.PaymentStatus ==
            "Paid")
        {
            var previous =
                await _db.PaymentTransactions
                    .Where(x =>
                        x.BookingId ==
                        booking.Id &&
                        x.PaymentStatus ==
                        "Success")
                    .OrderByDescending(x =>
                        x.CreatedAt)
                    .FirstOrDefaultAsync();

            return Ok(new
            {
                message =
                    "Booking is already paid",

                transaction =
                    previous
            });
        }

        var allowedMethods =
            new[]
            {
                "UPI",
                "Card",
                "Net Banking",
                "Cash",
                "Demo"
            };

        var paymentMethod =
            allowedMethods
                .FirstOrDefault(x =>
                    x.Equals(
                        request.PaymentMethod.Trim(),
                        StringComparison.OrdinalIgnoreCase));

        if (paymentMethod == null)
        {
            return BadRequest(new
            {
                message =
                    "Invalid payment method",

                allowedMethods
            });
        }

        var invoice =
            await _invoiceService
                .CreateInvoiceAsync(
                    booking);

        var transaction =
            await _paymentService
                .CreatePaymentAsync(
                    booking,
                    paymentMethod,
                    request.PaymentReference);

        await _notificationService
            .CreatePaymentAsync(
                booking);

        await _auditService.LogAsync(
            "PAYMENT_SUCCESS",
            $"Payment completed for booking {booking.BookingNumber}",
            booking.UserId);

        return Ok(new
        {
            message =
                "Payment successful",

            bookingNumber =
                booking.BookingNumber,

            invoiceNumber =
                invoice.InvoiceNumber,

            transaction = new
            {
                transaction.Id,
                transaction.TransactionId,
                transaction.Amount,
                transaction.PaymentMethod,
                transaction.PaymentStatus,
                transaction.PaymentMessage,
                transaction.PaidAt
            }
        });
    }

    [HttpGet("booking/{bookingNumber}")]
    public async Task<IActionResult> GetPayments(
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

        if (!User.IsInRole("Admin") &&
            booking.UserId != userId.Value)
        {
            return Forbid();
        }

        var payments =
            await _db.PaymentTransactions
                .Where(x =>
                    x.BookingId ==
                    booking.Id)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x => new
                {
                    x.Id,
                    x.TransactionId,
                    x.Amount,
                    x.PaymentMethod,
                    x.PaymentStatus,
                    x.PaymentMessage,
                    x.RazorpayOrderId,
                    x.RazorpayPaymentId,
                    x.PaidAt,
                    x.CreatedAt
                })
                .ToListAsync();

        return Ok(payments);
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