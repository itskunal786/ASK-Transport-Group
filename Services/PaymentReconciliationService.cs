using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class PaymentReconciliationService
{
    private readonly AskTransportDbContext _db;

    public PaymentReconciliationService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<List<PaymentReconciliationDto>>
        GetMismatchesAsync()
    {
        var transactions =
            await _db.PaymentTransactions
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

        var result =
            new List<PaymentReconciliationDto>();

        foreach (var transaction in transactions)
        {
            var booking =
                await _db.Bookings
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.Id == transaction.BookingId);

            if (booking == null)
            {
                continue;
            }

            var invoice =
                await _db.Invoices
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.BookingId == booking.Id);

            var transactionPaid =
                transaction.PaymentStatus == "Success";

            var bookingPaid =
                booking.PaymentStatus == "Paid";

            var invoicePaid =
                invoice == null ||
                invoice.PaymentStatus == "Paid";

            var mismatch =
                transactionPaid != bookingPaid ||
                (transactionPaid && !invoicePaid);

            if (!mismatch)
            {
                continue;
            }

            result.Add(
                new PaymentReconciliationDto
                {
                    TransactionId =
                        transaction.Id,

                    TransactionNumber =
                        transaction.TransactionId,

                    BookingNumber =
                        booking.BookingNumber,

                    TransactionStatus =
                        transaction.PaymentStatus,

                    BookingPaymentStatus =
                        booking.PaymentStatus,

                    InvoicePaymentStatus =
                        invoice?.PaymentStatus,

                    Amount =
                        transaction.Amount,

                    HasMismatch =
                        true,

                    Message =
                        "Payment status mismatch detected"
                });
        }

        return result;
    }

    public async Task<PaymentReconciliationDto?>
        ReconcileAsync(
            int transactionId)
    {
        var transaction =
            await _db.PaymentTransactions
                .FirstOrDefaultAsync(x =>
                    x.Id == transactionId);

        if (transaction == null)
        {
            return null;
        }

        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(x =>
                    x.Id == transaction.BookingId);

        if (booking == null)
        {
            return null;
        }

        var invoice =
            await _db.Invoices
                .FirstOrDefaultAsync(x =>
                    x.BookingId == booking.Id);

        if (transaction.PaymentStatus == "Success")
        {
            booking.PaymentStatus = "Paid";
            booking.UpdatedAt = DateTime.UtcNow;

            if (invoice != null)
            {
                invoice.PaymentStatus = "Paid";
               
            }
        }

        await _db.SaveChangesAsync();

        return new PaymentReconciliationDto
        {
            TransactionId =
                transaction.Id,

            TransactionNumber =
                transaction.TransactionId,

            BookingNumber =
                booking.BookingNumber,

            TransactionStatus =
                transaction.PaymentStatus,

            BookingPaymentStatus =
                booking.PaymentStatus,

            InvoicePaymentStatus =
                invoice?.PaymentStatus,

            Amount =
                transaction.Amount,

            HasMismatch =
                false,

            Message =
                "Payment reconciled successfully"
        };
    }
}