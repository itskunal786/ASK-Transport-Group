using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class City
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int StateId { get; set; }

    public State? State { get; set; }

    public bool IsActive { get; set; } = true;
}