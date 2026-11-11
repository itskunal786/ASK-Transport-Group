using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientPaymentService
{
    private readonly AskTransportDbContext _db;
    private readonly RazorpayService _razorpayService;

    public ClientPaymentService(
        AskTransportDbContext db,
        RazorpayService razorpayService)
    {
        _db = db;
        _razorpayService = razorpayService;
    }


    public async Task<ClientPaymentListDto> GetMyPaymentsAsync(
        int userId,
        int page,
        int pageSize,
        string? status,
        CancellationToken cancellationToken = default)
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 10;
        }

        if (pageSize > 100)
        {
            pageSize = 100;
        }


        var query =
            _db.PaymentTransactions
                .AsNoTracking()
                .Where(x =>
                    x.Booking != null &&
                    x.Booking.UserId == userId);


        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();

            query =
                query.Where(x =>
                    x.PaymentStatus == status);
        }


        var totalRecords =
            await query.CountAsync(
                cancellationToken);


        var data =
            await query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Skip(
                    (page - 1) * pageSize)
                .Take(pageSize)
                .Select(x =>
                    new ClientPaymentDto
                    {
                        Id =
                            x.Id,

                        BookingNumber =
                            x.Booking!.BookingNumber,

                        TransactionId =
                            x.TransactionId,

                        RazorpayOrderId =
                            x.RazorpayOrderId,

                        RazorpayPaymentId =
                            x.RazorpayPaymentId,

                        Amount =
                            x.Amount,

                        PaymentMethod =
                            x.PaymentMethod,

                        PaymentStatus =
                            x.PaymentStatus,

                        PaymentMessage =
                            x.PaymentMessage,

                        PaidAt =
                            x.PaidAt,

                        CreatedAt =
                            x.CreatedAt
                    })
                .ToListAsync(
                    cancellationToken);


        return new ClientPaymentListDto
        {
            Page =
                page,

            PageSize =
                pageSize,

            TotalRecords =
                totalRecords,

            TotalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize),

            Data =
                data
        };
    }


    public async Task<ClientPaymentDto?> GetPaymentAsync(
        int userId,
        int paymentId,
        CancellationToken cancellationToken = default)
    {
        if (paymentId <= 0)
        {
            return null;
        }


        return await _db.PaymentTransactions
            .AsNoTracking()
            .Where(x =>
                x.Id == paymentId &&
                x.Booking != null &&
                x.Booking.UserId == userId)
            .Select(x =>
                new ClientPaymentDto
                {
                    Id =
                        x.Id,

                    BookingNumber =
                        x.Booking!.BookingNumber,

                    TransactionId =
                        x.TransactionId,

                    RazorpayOrderId =
                        x.RazorpayOrderId,

                    RazorpayPaymentId =
                        x.RazorpayPaymentId,

                    Amount =
                        x.Amount,

                    PaymentMethod =
                        x.PaymentMethod,

                    PaymentStatus =
                        x.PaymentStatus,

                    PaymentMessage =
                        x.PaymentMessage,

                    PaidAt =
                        x.PaidAt,

                    CreatedAt =
                        x.CreatedAt
                })
            .FirstOrDefaultAsync(
                cancellationToken);
    }


    public async Task<object?> RetryPaymentAsync(
        int userId,
        int paymentId,
        CancellationToken cancellationToken = default)
    {
        if (paymentId <= 0)
        {
            return null;
        }


        var payment =
            await _db.PaymentTransactions
                .Include(x =>
                    x.Booking)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == paymentId &&
                        x.Booking != null &&
                        x.Booking.UserId == userId,
                    cancellationToken);


        if (payment == null)
        {
            return null;
        }


        var booking =
            payment.Booking!;


        if (booking.BookingStatus ==
            "Cancelled")
        {
            return new
            {
                success = false,

                message =
                    "Payment cannot be retried for a cancelled booking."
            };
        }


        if (booking.PaymentStatus == "Paid" ||
            payment.PaymentStatus == "Success")
        {
            return new
            {
                success = false,

                message =
                    "Payment is already completed."
            };
        }


        if (!_razorpayService.IsConfigured())
        {
            return new
            {
                success = false,

                message =
                    "Razorpay is not configured."
            };
        }


        var receipt =
            $"retry_{booking.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}";


        var order =
            _razorpayService.CreateOrder(
                payment.Amount,
                receipt);


        var razorpayOrderId =
            order["id"]?.ToString();


        if (string.IsNullOrWhiteSpace(
            razorpayOrderId))
        {
            return new
            {
                success = false,

                message =
                    "Unable to create Razorpay order."
            };
        }


        payment.RazorpayOrderId =
            razorpayOrderId;

        payment.RazorpayPaymentId =
            null;

        payment.PaymentStatus =
            "Pending";

        payment.PaymentMessage =
            "Payment retry initiated.";


        await _db.SaveChangesAsync(
            cancellationToken);


        return new
        {
            success = true,

            message =
                "Payment retry order created successfully.",

            paymentId =
                payment.Id,

            bookingNumber =
                booking.BookingNumber,

            transactionId =
                payment.TransactionId,

            razorpayOrderId =
                payment.RazorpayOrderId,

            razorpayKeyId =
                _razorpayService.GetKeyId(),

            amount =
                payment.Amount,

            currency =
                "INR"
        };
    }


    public async Task<object?> GetReceiptAsync(
        int userId,
        int paymentId,
        CancellationToken cancellationToken = default)
    {
        if (paymentId <= 0)
        {
            return null;
        }


        var payment =
            await _db.PaymentTransactions
                .AsNoTracking()
                .Where(x =>
                    x.Id == paymentId &&
                    x.Booking != null &&
                    x.Booking.UserId == userId)
                .Select(x => new
                {
                    x.Id,

                    x.TransactionId,

                    x.RazorpayOrderId,

                    x.RazorpayPaymentId,

                    x.Amount,

                    x.PaymentMethod,

                    x.PaymentStatus,

                    x.PaymentMessage,

                    x.PaidAt,

                    x.CreatedAt,

                    BookingNumber =
                        x.Booking!.BookingNumber,

                    CustomerName =
                        x.Booking.SenderName,

                    CustomerPhone =
                        x.Booking.SenderPhone,

                    FromCity =
                        x.Booking.FromCity,

                    FromState =
                        x.Booking.FromState,

                    ToCity =
                        x.Booking.ToCity,

                    ToState =
                        x.Booking.ToState
                })
                .FirstOrDefaultAsync(
                    cancellationToken);


        if (payment == null)
        {
            return null;
        }


        return new
        {
            receiptNumber =
                $"RCPT-{payment.TransactionId}",

            paymentId =
                payment.Id,

            transactionId =
                payment.TransactionId,

            bookingNumber =
                payment.BookingNumber,

            customer = new
            {
                name =
                    payment.CustomerName,

                phone =
                    payment.CustomerPhone
            },

            route = new
            {
                from =
                    $"{payment.FromCity}, {payment.FromState}",

                to =
                    $"{payment.ToCity}, {payment.ToState}"
            },

            razorpayOrderId =
                payment.RazorpayOrderId,

            razorpayPaymentId =
                payment.RazorpayPaymentId,

            amount =
                payment.Amount,

            currency =
                "INR",

            paymentMethod =
                payment.PaymentMethod,

            paymentStatus =
                payment.PaymentStatus,

            paymentMessage =
                payment.PaymentMessage,

            paidAt =
                payment.PaidAt,

            createdAt =
                payment.CreatedAt
        };
    }
}