using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class LogoutRequest
{
    [Required]
    public string RefreshToken { get; set; }
        = string.Empty;
}