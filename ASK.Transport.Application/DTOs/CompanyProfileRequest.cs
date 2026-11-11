using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CompanyProfileRequest
{
    [Required]
    [StringLength(200)]
    public string CompanyName { get; set; } = string.Empty;

    [StringLength(200)]
    public string? LegalName { get; set; }

    [StringLength(30)]
    public string? Gstin { get; set; }

    [StringLength(30)]
    public string? Pan { get; set; }

    [StringLength(30)]
    public string? Cin { get; set; }

    [EmailAddress]
    [StringLength(180)]
    public string? Email { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(20)]
    public string? SupportPhone { get; set; }

    [EmailAddress]
    [StringLength(180)]
    public string? SupportEmail { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? State { get; set; }

    [StringLength(10)]
    public string? StateCode { get; set; }

    [StringLength(10)]
    public string? PinCode { get; set; }

    [StringLength(200)]
    public string? Website { get; set; }

    [StringLength(500)]
    public string? LogoPath { get; set; }

    [StringLength(100)]
    public string? BankName { get; set; }

    [StringLength(100)]
    public string? BankAccountName { get; set; }

    [StringLength(50)]
    public string? BankAccountNumber { get; set; }

    [StringLength(20)]
    public string? IfscCode { get; set; }

    [StringLength(100)]
    public string? BranchName { get; set; }
}