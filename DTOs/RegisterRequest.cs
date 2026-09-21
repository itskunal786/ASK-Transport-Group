using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class RegisterRequest
{
    [Required]
    [StringLength(120, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(180)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(
        @"^[6-9][0-9]{9}$",
        ErrorMessage =
            "Enter a valid 10 digit Indian mobile number")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string CaptchaId { get; set; } = string.Empty;

    [Required]
    public string CaptchaAnswer { get; set; } = string.Empty;
}