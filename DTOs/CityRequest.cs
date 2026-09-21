using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CityRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int StateId { get; set; }

    public bool IsActive { get; set; } = true;
}