using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public sealed class SavedContactDto
{
    public int Id { get; set; }

    public string ContactType { get; set; } =
        string.Empty;

    public string Name { get; set; } =
        string.Empty;

    public string Phone { get; set; } =
        string.Empty;

    public string? Email { get; set; }

    public string Address { get; set; } =
        string.Empty;

    public string City { get; set; } =
        string.Empty;

    public string State { get; set; } =
        string.Empty;

    public string PinCode { get; set; } =
        string.Empty;

    public bool IsDefault { get; set; }

    public DateTime CreatedAt { get; set; }
}

public sealed class SaveContactRequest
{
    [Required]
    public string ContactType { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(20)]
    public string Phone { get; set; } =
        string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    [MaxLength(300)]
    public string Address { get; set; } =
        string.Empty;

    [Required]
    public string City { get; set; } =
        string.Empty;

    [Required]
    public string State { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(10)]
    public string PinCode { get; set; } =
        string.Empty;

    public bool IsDefault { get; set; }
}