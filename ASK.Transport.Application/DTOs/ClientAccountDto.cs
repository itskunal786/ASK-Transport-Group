using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public sealed class DeactivateAccountRequest
{
    [Required]
    public string Password { get; set; } = string.Empty;
}

public sealed class RevokeSessionsRequest
{
    [Required]
    public string Password { get; set; } = string.Empty;
}