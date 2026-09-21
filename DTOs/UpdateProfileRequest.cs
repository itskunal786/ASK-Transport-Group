using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class UpdateProfileRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;
}