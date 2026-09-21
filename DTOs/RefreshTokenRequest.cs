using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; }
        = string.Empty;
}