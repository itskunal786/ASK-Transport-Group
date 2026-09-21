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
public class RazorpayController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly RazorpayService _razorpayService;
    private readonly InvoiceService _invoiceService;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;
    private readonly WebhookService _webhookService;


    public RazorpayController(
    AskTransportDbContext db,
    RazorpayService razorpayService,
    InvoiceService invoiceService,
    NotificationService notificationService,
    AuditService auditService,
    WebhookService webhookService)
    {
        _db = db;
        _razorpayService = razorpayService;
        _invoiceService = invoiceService;
        _notificationService = notificationService;
        _auditService = auditService;
        _webhookService = webhookService;
    }

    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder(
        CreateRazorpayOrderRequest request)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        if (!_razorpayService
            .IsConfigured())
        {
            return BadRequest(new
            {
                message =
                    "Razorpay is not configured"
            });
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
            booking.UserId !=
            userId.Value)
        {
            return Forbid();
        }

        if (booking.BookingStatus ==
            "Cancelled")
        {
            return BadRequest(new
            {
                message =
                    "Payment cannot be made for cancelled booking"
            });
        }

        if (booking.PaymentStatus ==
            "Paid")
        {
            return BadRequest(new
            {
                message =
                    "Booking is already paid"
            });
        }

        var existingCreated =
            await _db.PaymentTransactions
                .Where(x =>
                    x.BookingId ==
                        booking.Id &&
                    x.PaymentMethod ==
                        "Razorpay" &&
                    x.PaymentStatus ==
                        "Created")
                .OrderByDescending(x =>
                    x.CreatedAt)
                .FirstOrDefaultAsync();

        if (existingCreated != null &&
            existingCreated.CreatedAt >
            DateTime.UtcNow.AddMinutes(-15))
        {
            return Ok(new
            {
                message =
                    "Existing Razorpay order returned",

                keyId =
                    _razorpayService
                        .GetKeyId(),

                orderId =
                    existingCreated
                        .RazorpayOrderId,

                amount =
                    Convert.ToInt32(
                        existingCreated.Amount *
                        100),

                currency =
                    "INR",

                bookingNumber =
                    booking.BookingNumber
            });
        }

        var invoice =
            await _invoiceService
                .CreateInvoiceAsync(
                    booking);

        var receipt =
            $"ASK-{booking.Id}-{DateTime.UtcNow:yyyyMMddHHmmss}";

        var razorpayOrder =
            _razorpayService
                .CreateOrder(
                    booking.TotalAmount,
                    receipt);

        var razorpayOrderId =
            razorpayOrder["id"]
                .ToString();

        if (string.IsNullOrWhiteSpace(
            razorpayOrderId))
        {
            return StatusCode(
                StatusCodes.Status502BadGateway,
                new
                {
                    message =
                        "Invalid response from payment gateway"
                });
        }

        var transaction =
            new PaymentTransaction
            {
                BookingId =
                    booking.Id,

                TransactionId =
                    $"TXN{DateTime.UtcNow:yyyyMMddHHmmssfff}{Random.Shared.Next(100, 1000)}",

                RazorpayOrderId =
                    razorpayOrderId,

                Amount =
                    booking.TotalAmount,

                PaymentMethod =
                    "Razorpay",

                PaymentStatus =
                    "Created",

                PaymentMessage =
                    "Razorpay order created",

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.PaymentTransactions.Add(
            transaction);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "RAZORPAY_ORDER_CREATED",
            $"Razorpay order {razorpayOrderId} created for booking {booking.BookingNumber}",
            booking.UserId,
            User.FindFirstValue(
                ClaimTypes.Email));

        return Ok(new
        {
            message =
                "Razorpay order created successfully",

            keyId =
                _razorpayService
                    .GetKeyId(),

            orderId =
                razorpayOrderId,

            amount =
                Convert.ToInt32(
                    booking.TotalAmount *
                    100),

            currency =
                "INR",

            bookingNumber =
                booking.BookingNumber,

            invoiceNumber =
                invoice.InvoiceNumber
        });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyPayment(
        VerifyRazorpayPaymentRequest request)
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
            booking.UserId !=
            userId.Value)
        {
            return Forbid();
        }

        var transaction =
            await _db.PaymentTransactions
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                        booking.Id &&
                    x.RazorpayOrderId ==
                        request.RazorpayOrderId);

        if (transaction == null)
        {
            return BadRequest(new
            {
                message =
                    "Payment transaction not found"
            });
        }

        if (transaction.PaymentStatus ==
            "Success")
        {
            return Ok(new
            {
                message =
                    "Payment already verified",

                transactionId =
                    transaction.TransactionId
            });
        }

        var valid =
            _razorpayService
                .VerifySignature(
                    request.RazorpayOrderId,
                    request.RazorpayPaymentId,
                    request.RazorpaySignature);

        if (!valid)
        {
            transaction.PaymentStatus =
                "Failed";

            transaction.PaymentMessage =
                "Invalid Razorpay signature";

            await _db.SaveChangesAsync();

            await _auditService.LogAsync(
                "RAZORPAY_PAYMENT_FAILED",
                $"Payment verification failed for booking {booking.BookingNumber}",
                booking.UserId,
                User.FindFirstValue(
                    ClaimTypes.Email));

            await _webhookService.PaymentUpdatedAsync(
    transaction.Id,
    transaction.TransactionId,
    booking.BookingNumber,
    transaction.PaymentStatus,
    transaction.Amount);

            return BadRequest(new
            {
                message =
                    "Payment verification failed"
            });
        }

        transaction.RazorpayPaymentId =
            request.RazorpayPaymentId;

        transaction.PaymentStatus =
            "Success";

        transaction.PaymentMessage =
            "Razorpay payment verified successfully";

        transaction.PaidAt =
            DateTime.UtcNow;

        booking.PaymentStatus =
            "Paid";

        booking.UpdatedAt =
            DateTime.UtcNow;

        var invoice =
            await _db.Invoices
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                    booking.Id);

        if (invoice != null)
        {
            invoice.PaymentStatus =
                "Paid";
        }

        await _db.SaveChangesAsync();

        await _notificationService
            .CreatePaymentAsync(
                booking);

        await _auditService.LogAsync(
            "RAZORPAY_PAYMENT_SUCCESS",
            $"Razorpay payment completed for booking {booking.BookingNumber}",
            booking.UserId,
            User.FindFirstValue(
                ClaimTypes.Email));

        await _webhookService.PaymentUpdatedAsync(
    transaction.Id,
    transaction.TransactionId,
    booking.BookingNumber,
    transaction.PaymentStatus,
    transaction.Amount);

        return Ok(new
        {
            message =
                "Payment verified successfully",

            bookingNumber =
                booking.BookingNumber,

            transactionId =
                transaction.TransactionId,

            razorpayOrderId =
                transaction.RazorpayOrderId,

            razorpayPaymentId =
                transaction.RazorpayPaymentId,

            amount =
                transaction.Amount,

            paymentStatus =
                booking.PaymentStatus
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