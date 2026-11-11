using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class FreightQuoteRequest
{
    [Range(1, int.MaxValue)]
    public int FromHubId { get; set; }

    [Range(1, int.MaxValue)]
    public int ToHubId { get; set; }

    [Required]
    public string ServiceType { get; set; } = "Standard";

    [Range(0.01, double.MaxValue)]
    public decimal ActualWeightKg { get; set; }

    public decimal? LengthCm { get; set; }

    public decimal? WidthCm { get; set; }

    public decimal? HeightCm { get; set; }

    public int Quantity { get; set; } = 1;

    [Required]
    public string SenderStateCode { get; set; } = string.Empty;

    [Required]
    public string ReceiverStateCode { get; set; } = string.Empty;
}