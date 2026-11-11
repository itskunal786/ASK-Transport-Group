using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class LoginAttempt
{
    public int Id { get; set; }

    [Required]
    [MaxLength(180)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? IpAddress { get; set; }

    public bool Success { get; set; }

    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
}