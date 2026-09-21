using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CreateBookingItemRequest
{
    [Required]
    public string ItemName { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public string GoodsType { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    [Range(0.01, double.MaxValue)]
    public decimal Weight { get; set; }

    public decimal? Length { get; set; }

    public decimal? Width { get; set; }

    public decimal? Height { get; set; }

    public decimal DeclaredValue { get; set; }

    public bool IsFragile { get; set; }

    public string? SpecialInstructions { get; set; }
}