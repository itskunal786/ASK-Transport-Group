using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public sealed class ClientAddressDto
{
    public int Id { get; set; }

    public string AddressType { get; set; } = string.Empty;

    public string ContactName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string AddressLine1 { get; set; } = string.Empty;

    public string? AddressLine2 { get; set; }

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string PostalCode { get; set; } = string.Empty;

    public string Country { get; set; } = string.Empty;

    public bool IsDefault { get; set; }
}


public sealed class SaveClientAddressRequest
{
    [Required]
    [MaxLength(20)]
    public string AddressType { get; set; } = "Delivery";

    [Required]
    [MaxLength(100)]
    public string ContactName { get; set; } = string.Empty;

    [Required]
    [RegularExpression(
        @"^[0-9]{10}$",
        ErrorMessage = "Enter valid 10 digit phone number.")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(250)]
    public string AddressLine1 { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? AddressLine2 { get; set; }

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string State { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string PostalCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Country { get; set; } = "India";

    public bool IsDefault { get; set; }
}