using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class RefundService
{
    private readonly AskTransportDbContext _db;
    private readonly RazorpayService _razorpayService;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;

    public RefundService(
        AskTransportDbContext db,
        RazorpayService razorpayService,
        NotificationService notificationService,
        AuditService auditService)
    {
        _db = db;
        _razorpayService =
            razorpayService;

        _notificationService =
            notificationService;

        _auditService =
            auditService;
    }

    public async Task<PaymentRefund> RefundAsync(
        Booking booking,
        decimal amount,
        string reason)
    {
        if (amount <= 0)
        {
            throw new InvalidOperationException(
                "Refund amount must be greater than zero.");
        }

        var transaction =
            await _db.PaymentTransactions
                .Where(x =>
                    x.BookingId == booking.Id &&
                    x.RazorpayPaymentId != null &&
                    (
                        x.PaymentStatus == "Success" ||
                        x.PaymentStatus ==
                            "Partially Refunded"
                    ))
                .OrderByDescending(x =>
                    x.PaidAt)
                .ThenByDescending(x =>
                    x.CreatedAt)
                .FirstOrDefaultAsync();

        if (transaction == null ||
            string.IsNullOrWhiteSpace(
                transaction.RazorpayPaymentId))
        {
            throw new InvalidOperationException(
                "Successful Razorpay payment not found.");
        }

        var alreadyRefunded =
            await _db.PaymentRefunds
                .Where(x =>
                    x.PaymentTransactionId ==
                        transaction.Id &&
                    (
                        x.Status == "Pending" ||
                        x.Status == "Processed"
                    ))
                .SumAsync(x =>
                    (decimal?)x.Amount)
            ?? 0m;

        var refundableAmount =
            transaction.Amount -
            alreadyRefunded;

        if (refundableAmount <= 0)
        {
            throw new InvalidOperationException(
                "Payment is already fully refunded.");
        }

        if (amount >
            refundableAmount)
        {
            throw new InvalidOperationException(
                $"Refund amount exceeds refundable balance. Remaining amount: {refundableAmount:N2}");
        }

        var refund =
            new PaymentRefund
            {
                PaymentTransactionId =
                    transaction.Id,

                BookingId =
                    booking.Id,

                RefundNumber =
                    GenerateRefundNumber(),

                Amount =
                    amount,

                Status =
                    "Pending",

                Reason =
                    reason.Trim(),

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.PaymentRefunds.Add(
            refund);

        await _db.SaveChangesAsync();

        try
        {
            var razorpayRefund =
                _razorpayService.CreateRefund(
                    transaction.RazorpayPaymentId,
                    amount,
                    reason);

            refund.RazorpayRefundId =
                razorpayRefund["id"]?
                    .ToString();

            refund.Status =
                "Processed";

            refund.GatewayMessage =
                "Refund request accepted by Razorpay.";

            refund.RefundedAt =
                DateTime.UtcNow;

            refund.UpdatedAt =
                DateTime.UtcNow;

            var previousProcessedAmount =
                await _db.PaymentRefunds
                    .Where(x =>
                        x.PaymentTransactionId ==
                            transaction.Id &&
                        x.Id != refund.Id &&
                        x.Status ==
                            "Processed")
                    .SumAsync(x =>
                        (decimal?)x.Amount)
                ?? 0m;

            var totalRefunded =
                previousProcessedAmount +
                refund.Amount;

            if (totalRefunded >=
                transaction.Amount)
            {
                transaction.PaymentStatus =
                    "Refunded";

                booking.PaymentStatus =
                    "Refunded";
            }
            else
            {
                transaction.PaymentStatus =
                    "Partially Refunded";

                booking.PaymentStatus =
                    "Partially Refunded";
            }

            transaction.PaymentMessage =
                booking.PaymentStatus;

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
                    booking.PaymentStatus;
            }

            await _db.SaveChangesAsync();

            await _notificationService
                .CreateAsync(
                    booking.UserId,
                    "Refund Processed",
                    $"Refund of ₹{amount:N2} has been processed for booking {booking.BookingNumber}.",
                    "Payment",
                    booking.Id);

            await _auditService.LogAsync(
                "PAYMENT_REFUND",
                $"Refund {refund.RefundNumber} processed for booking {booking.BookingNumber}",
                booking.UserId);

            return refund;
        }
        catch (Exception ex)
        {
            refund.Status =
                "Failed";

            refund.GatewayMessage =
                ex.Message;

            refund.UpdatedAt =
                DateTime.UtcNow;

            await _db.SaveChangesAsync();

            throw;
        }
    }

    private static string GenerateRefundNumber()
    {
        return
            $"REF{DateTime.UtcNow:yyyyMMddHHmmssfff}{Random.Shared.Next(100, 999)}";
    }
}