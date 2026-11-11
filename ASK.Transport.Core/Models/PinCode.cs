using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class PinCode
{
    public int Id { get; set; }

    [Required]
    [MaxLength(6)]
    public string Pin { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    public string District { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public int DeliveryDays { get; set; }

    public bool Serviceable { get; set; } = true;
}