namespace ASK.Group.Api.Models;

public class RateSlab
{
    public int Id { get; set; }

    public int RateCardId { get; set; }
    public RateCard? RateCard { get; set; }

    public decimal MinWeightKg { get; set; }

    public decimal? MaxWeightKg { get; set; }

    public decimal RatePerKg { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}