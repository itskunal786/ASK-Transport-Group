using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class Driver : BaseEntity
{
    public int? UserId { get; set; }

    public AppUser? User { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(180)]
    public string? Email { get; set; }

    [MaxLength(300)]
    public string? Address { get; set; }

    [Required]
    [MaxLength(50)]
    public string DrivingLicenseNumber { get; set; } = string.Empty;

    public DateTime LicenseExpiryDate { get; set; }

    [MaxLength(50)]
    public string? LicenseType { get; set; }

    [MaxLength(150)]
    public string? EmergencyContactName { get; set; }

    [MaxLength(20)]
    public string? EmergencyContactPhone { get; set; }

    [MaxLength(20)]
    public string? BloodGroup { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public DateTime? JoiningDate { get; set; }

    public int? HubId { get; set; }

    public Hub? Hub { get; set; }

    public bool IsVerified { get; set; }

    public bool IsAvailable { get; set; } = true;

    public bool IsActive { get; set; } = true;

    [MaxLength(50)]
    public string Status { get; set; } = "Available";

    [MaxLength(500)]
    public string? Notes { get; set; }
}