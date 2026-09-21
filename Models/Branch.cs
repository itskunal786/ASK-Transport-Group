using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class Branch : BaseEntity
{
    [Required]
    [MaxLength(30)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(180)]
    public string? Email { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(300)]
    public string? Address { get; set; }

    public int StateId { get; set; }

    public State? State { get; set; }

    public int CityId { get; set; }

    public City? City { get; set; }

    [MaxLength(10)]
    public string? PinCode { get; set; }

    public int? ManagerUserId { get; set; }

    public AppUser? ManagerUser { get; set; }

    public bool IsActive { get; set; } = true;
}