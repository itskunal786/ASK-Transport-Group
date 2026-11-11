namespace ASK.Group.Api.DTOs;

public sealed class ClientPaymentDto
{
    public int Id { get; set; }

    public string BookingNumber { get; set; } = string.Empty;

    public string TransactionId { get; set; } = string.Empty;

    public string? RazorpayOrderId { get; set; }

    public string? RazorpayPaymentId { get; set; }

    public decimal Amount { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public string PaymentStatus { get; set; } = string.Empty;

    public string? PaymentMessage { get; set; }

    public DateTime? PaidAt { get; set; }

    public DateTime CreatedAt { get; set; }
}


public sealed class ClientPaymentListDto
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public int TotalPages { get; set; }

    public List<ClientPaymentDto> Data { get; set; } = new();
}