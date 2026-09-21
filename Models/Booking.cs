using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASK.Group.Api.Models;

public class Booking : BaseEntity
{
    [Required]
    [MaxLength(30)]
    public string BookingNumber { get; set; } = string.Empty;

    // User
    public int UserId { get; set; }

    public AppUser? User { get; set; }

    // Order
    [Required]
    [MaxLength(50)]
    public string OrderType { get; set; } = "Single";

    // Sender
    [Required]
    [MaxLength(120)]
    public string SenderName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string SenderPhone { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string FromAddress { get; set; } = string.Empty;

    [Required]
    [MaxLength(6)]
    public string FromPinCode { get; set; } = string.Empty;

    [MaxLength(100)]
    public string FromCity { get; set; } = string.Empty;

    [MaxLength(100)]
    public string FromState { get; set; } = string.Empty;

    // Receiver
    [Required]
    [MaxLength(120)]
    public string ReceiverName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string ReceiverPhone { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string ToAddress { get; set; } = string.Empty;

    [Required]
    [MaxLength(6)]
    public string ToPinCode { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ToCity { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ToState { get; set; } = string.Empty;

    // Goods
    [Required]
    [MaxLength(100)]
    public string GoodsType { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Weight { get; set; }

    public int Quantity { get; set; } = 1;

    [MaxLength(500)]
    public string? GoodsDescription { get; set; }

    // Service
    public int TransportServiceId { get; set; }

    public TransportService? TransportService { get; set; }

    // Dates
    public DateTime PickupDate { get; set; }

    public DateTime? ExpectedDeliveryDate { get; set; }

    public DateTime? DeliveredDate { get; set; }

    // Amount
    [Column(TypeName = "decimal(18,2)")]
    public decimal FreightAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal GstPercentage { get; set; } = 18;

    [Column(TypeName = "decimal(18,2)")]
    public decimal GstAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    // Status
    [MaxLength(50)]
    public string BookingStatus { get; set; } = "Booked";

    [MaxLength(50)]
    public string PaymentStatus { get; set; } = "Pending";

    [MaxLength(1000)]
    public string? Notes { get; set; }

    // Relations
    public ICollection<BookingItem> BookingItems { get; set; }
        = new List<BookingItem>();

    public ICollection<ShipmentTracking> ShipmentTrackings { get; set; }
        = new List<ShipmentTracking>();

    public Invoice? Invoice { get; set; }

    public ICollection<PaymentTransaction> PaymentTransactions { get; set; }
        = new List<PaymentTransaction>();
}
