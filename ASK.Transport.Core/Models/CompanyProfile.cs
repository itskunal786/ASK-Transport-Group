using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class CompanyProfile
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string CompanyName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? LegalName { get; set; }

    [MaxLength(30)]
    public string? Gstin { get; set; }

    [MaxLength(30)]
    public string? Pan { get; set; }

    [MaxLength(30)]
    public string? Cin { get; set; }

    [MaxLength(180)]
    public string? Email { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string? SupportPhone { get; set; }

    [MaxLength(180)]
    public string? SupportEmail { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? State { get; set; }

    [MaxLength(10)]
    public string? StateCode { get; set; }

    [MaxLength(10)]
    public string? PinCode { get; set; }

    [MaxLength(200)]
    public string? Website { get; set; }

    [MaxLength(500)]
    public string? LogoPath { get; set; }

    [MaxLength(100)]
    public string? BankName { get; set; }

    [MaxLength(100)]
    public string? BankAccountName { get; set; }

    [MaxLength(50)]
    public string? BankAccountNumber { get; set; }

    [MaxLength(20)]
    public string? IfscCode { get; set; }

    [MaxLength(100)]
    public string? BranchName { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}