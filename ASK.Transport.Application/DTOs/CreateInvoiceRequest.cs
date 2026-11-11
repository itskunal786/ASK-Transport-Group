using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CreateInvoiceRequest
{
    [Required]
    public string BookingNumber { get; set; } = string.Empty;
}