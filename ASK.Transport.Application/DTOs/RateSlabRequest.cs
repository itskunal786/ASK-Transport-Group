using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class RateSlabRequest
{
    [Range(0, double.MaxValue)]
    public decimal MinWeightKg { get; set; }

    public decimal? MaxWeightKg { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal RatePerKg { get; set; }
}