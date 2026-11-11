using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/razorpay-webhook")]
[AllowAnonymous]
public class RazorpayWebhookController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly RazorpayWebhookService _webhookService;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;
    private readonly ILogger<RazorpayWebhookController> _logger;

    public RazorpayWebhookController(
        AskTransportDbContext db,
        RazorpayWebhookService webhookService,
        NotificationService notificationService,
        AuditService auditService,
        ILogger<RazorpayWebhookController> logger)
    {
        _db = db;
        _webhookService = webhookService;
        _notificationService = notificationService;
        _auditService = auditService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Receive(
        CancellationToken cancellationToken)
    {
        const long maxWebhookSize = 1024 * 1024;

        if (Request.ContentLength.HasValue &&
            Request.ContentLength.Value > maxWebhookSize)
        {
            return BadRequest(new
            {
                message = "Webhook payload is too large"
            });
        }

        Request.EnableBuffering();

        using var reader = new StreamReader(
            Request.Body,
            leaveOpen: true);

        var body = await reader.ReadToEndAsync(
            cancellationToken);

        Request.Body.Position = 0;

        if (string.IsNullOrWhiteSpace(body))
        {
            return BadRequest(new
            {
                message = "Webhook payload is empty"
            });
        }

        var signature =
            Request.Headers["X-Razorpay-Signature"]
                .FirstOrDefault();

        if (string.IsNullOrWhiteSpace(signature))
        {
            return BadRequest(new
            {
                message = "Razorpay signature is missing"
            });
        }

        if (!_webhookService.VerifySignature(
                body,
                signature))
        {
            _logger.LogWarning(
                "Invalid Razorpay webhook signature");

            return Unauthorized(new
            {
                message = "Invalid webhook signature"
            });
        }

        RazorpayWebhookDto? webhook;

        try
        {
            webhook =
                JsonSerializer.Deserialize<RazorpayWebhookDto>(
                    body);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(
                ex,
                "Invalid Razorpay webhook JSON");

            return BadRequest(new
            {
                message = "Invalid webhook payload"
            });
        }

        if (webhook == null)
        {
            return BadRequest(new
            {
                message = "Webhook payload is invalid"
            });
        }

        var payment =
            webhook.Payload?
                .Payment?
                .Entity;

        if (payment == null)
        {
            return Ok(new
            {
                message = "Webhook received"
            });
        }

        switch (webhook.Event)
        {
            case "payment.captured":

                await HandlePaymentCaptured(
                    payment,
                    cancellationToken);

                break;

            case "payment.failed":

                await HandlePaymentFailed(
                    payment,
                    cancellationToken);

                break;

            default:

                _logger.LogInformation(
                    "Razorpay event {Event} ignored",
                    webhook.Event);

                break;
        }

        return Ok(new
        {
            message = "Webhook processed successfully"
        });
    }

    private async Task HandlePaymentCaptured(
        RazorpayPaymentEntity payment,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(
                payment.OrderId))
        {
            return;
        }

        var transaction =
            await _db.PaymentTransactions
                .FirstOrDefaultAsync(
                    x => x.RazorpayOrderId ==
                         payment.OrderId,
                    cancellationToken);

        if (transaction == null)
        {
            _logger.LogWarning(
                "Transaction not found for Razorpay order {OrderId}",
                payment.OrderId);

            return;
        }

        if (transaction.PaymentStatus == "Success")
        {
            return;
        }

        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(
                    x => x.Id ==
                         transaction.BookingId,
                    cancellationToken);

        if (booking == null)
        {
            return;
        }

        transaction.RazorpayPaymentId =
            payment.Id;

        transaction.PaymentStatus =
            "Success";

        transaction.PaymentMessage =
            "Payment captured by Razorpay webhook";

        transaction.PaidAt =
            DateTime.UtcNow;

        booking.PaymentStatus =
            "Paid";

        booking.UpdatedAt =
            DateTime.UtcNow;

        var invoice =
            await _db.Invoices
                .FirstOrDefaultAsync(
                    x => x.BookingId ==
                         booking.Id,
                    cancellationToken);

        if (invoice != null)
        {
            invoice.PaymentStatus = "Paid";
        }

        await _db.SaveChangesAsync(
            cancellationToken);

        await _notificationService
            .CreatePaymentAsync(booking);

        await _auditService.LogAsync(
            "RAZORPAY_WEBHOOK_PAYMENT_SUCCESS",
            $"Payment captured for booking {booking.BookingNumber}",
            booking.UserId,
            null);

        _logger.LogInformation(
            "Razorpay payment {PaymentId} captured for booking {BookingNumber}",
            payment.Id,
            booking.BookingNumber);
    }

    private async Task HandlePaymentFailed(
        RazorpayPaymentEntity payment,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(
                payment.OrderId))
        {
            return;
        }

        var transaction =
            await _db.PaymentTransactions
                .FirstOrDefaultAsync(
                    x => x.RazorpayOrderId ==
                         payment.OrderId,
                    cancellationToken);

        if (transaction == null)
        {
            return;
        }

        // Successful payment ko late failed webhook
        // overwrite nahi karega.
        if (transaction.PaymentStatus == "Success")
        {
            return;
        }

        transaction.RazorpayPaymentId =
            payment.Id;

        transaction.PaymentStatus =
            "Failed";

        transaction.PaymentMessage =
            "Payment failed according to Razorpay webhook";

        await _db.SaveChangesAsync(
            cancellationToken);

        _logger.LogWarning(
            "Razorpay payment {PaymentId} failed for transaction {TransactionId}",
            payment.Id,
            transaction.TransactionId);
    }
}