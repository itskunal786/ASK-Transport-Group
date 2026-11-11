using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASK.Group.Api.Models;

public class BookingItem
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    [Required]
    [MaxLength(150)]
    public string ItemName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string GoodsType { get; set; } = string.Empty;

    public int Quantity { get; set; } = 1;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Weight { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Length { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Width { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Height { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DeclaredValue { get; set; }

    public bool IsFragile { get; set; }

    [MaxLength(500)]
    public string? SpecialInstructions { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}