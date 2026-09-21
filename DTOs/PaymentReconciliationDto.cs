namespace ASK.Group.Api.DTOs;

public class PaymentReconciliationDto
{
    public int TransactionId { get; set; }

    public string BookingNumber { get; set; }
        = string.Empty;

    public string TransactionNumber { get; set; }
        = string.Empty;

    public string TransactionStatus { get; set; }
        = string.Empty;

    public string BookingPaymentStatus { get; set; }
        = string.Empty;

    public string? InvoicePaymentStatus { get; set; }

    public decimal Amount { get; set; }

    public bool HasMismatch { get; set; }

    public string Message { get; set; }
        = string.Empty;
}