namespace ASK.Group.Api.DTOs;

public sealed class ClientInvoiceDto
{
    public int Id { get; set; }

    public string BookingNumber { get; set; } = string.Empty;

    public string InvoiceNumber { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }

    public string PaymentStatus { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}


public sealed class ClientInvoiceListDto
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public int TotalPages { get; set; }

    public List<ClientInvoiceDto> Data { get; set; } = new();
}