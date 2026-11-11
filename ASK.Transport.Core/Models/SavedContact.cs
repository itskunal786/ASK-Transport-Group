using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public sealed class SavedContact
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [MaxLength(20)]
    public string ContactType { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(180)]
    public string? Email { get; set; }

    [MaxLength(300)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [MaxLength(100)]
    public string State { get; set; } = string.Empty;

    [MaxLength(10)]
    public string PinCode { get; set; } = string.Empty;

    public bool IsDefault { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}