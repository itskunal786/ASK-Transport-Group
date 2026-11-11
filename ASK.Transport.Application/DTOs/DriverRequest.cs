using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class DriverRequest
{
    public int? UserId { get; set; }

    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression(
        @"^[6-9][0-9]{9}$",
        ErrorMessage =
            "Enter a valid 10 digit Indian mobile number")]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress]
    [StringLength(180)]
    public string? Email { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }

    [Required]
    [StringLength(50)]
    public string DrivingLicenseNumber { get; set; } =
        string.Empty;

    public DateTime LicenseExpiryDate { get; set; }

    [StringLength(50)]
    public string? LicenseType { get; set; }

    [StringLength(150)]
    public string? EmergencyContactName { get; set; }

    [StringLength(20)]
    public string? EmergencyContactPhone { get; set; }

    [StringLength(20)]
    public string? BloodGroup { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public DateTime? JoiningDate { get; set; }

    public int? HubId { get; set; }

    public bool IsVerified { get; set; }

    public bool IsAvailable { get; set; } = true;

    public bool IsActive { get; set; } = true;

    [StringLength(50)]
    public string Status { get; set; } = "Available";

    [StringLength(500)]
    public string? Notes { get; set; }
}