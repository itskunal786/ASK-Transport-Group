using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class StateRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string Code { get; set; } = string.Empty;

    public bool IsUnionTerritory { get; set; }
}