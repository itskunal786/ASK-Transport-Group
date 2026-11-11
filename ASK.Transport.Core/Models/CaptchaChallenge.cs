using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class CaptchaChallenge
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
}