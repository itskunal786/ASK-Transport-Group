using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class SendInvoiceEmailRequest
{
    [Required]
    public string InvoiceNumber { get; set; } = string.Empty;
}