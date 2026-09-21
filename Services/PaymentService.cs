using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class PaymentService
{
    private readonly AskTransportDbContext _db;

    public PaymentService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<PaymentTransaction>
        CreatePaymentAsync(
            Booking booking,
            string paymentMethod,
            string? paymentReference)
    {
        var existingSuccess =
            await _db.PaymentTransactions
                .FirstOrDefaultAsync(x =>
                    x.BookingId == booking.Id &&
                    x.PaymentStatus == "Success");

        if (existingSuccess != null)
        {
            return existingSuccess;
        }

        var transaction =
            new PaymentTransaction
            {
                BookingId = booking.Id,

                TransactionId =
                    $"TXN{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(100, 999)}",

                Amount = booking.TotalAmount,

                PaymentMethod =
                    paymentMethod.Trim(),

                PaymentStatus = "Success",

                PaymentMessage =
                    string.IsNullOrWhiteSpace(
                        paymentReference)
                        ? "Payment completed successfully"
                        : $"Payment completed. Reference: {paymentReference.Trim()}",

                PaidAt = DateTime.UtcNow,

                CreatedAt = DateTime.UtcNow
            };

        _db.PaymentTransactions.Add(
            transaction);

        booking.PaymentStatus = "Paid";

        booking.UpdatedAt =
            DateTime.UtcNow;

        var invoice =
            await _db.Invoices
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                    booking.Id);

        if (invoice != null)
        {
            invoice.PaymentStatus = "Paid";
        }

        await _db.SaveChangesAsync();

        return transaction;
    }
}