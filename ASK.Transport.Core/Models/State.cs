using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class State
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;

    public bool IsUnionTerritory { get; set; }
}