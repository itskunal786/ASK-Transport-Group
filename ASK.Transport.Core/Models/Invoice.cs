using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASK.Group.Api.Models;

public class Invoice
{
    public int Id { get; set; }

    [Required]
    [MaxLength(30)]
    public string InvoiceNumber { get; set; } = string.Empty;

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal GstPercentage { get; set; } = 18;

    [Column(TypeName = "decimal(18,2)")]
    public decimal GstAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [MaxLength(50)]
    public string PaymentStatus { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InvoiceItem> InvoiceItems { get; set; }
        = new List<InvoiceItem>();
}