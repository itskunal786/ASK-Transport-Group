using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/company-profile")]
public class CompanyProfileController : ControllerBase
{
	private readonly AskTransportDbContext _db;
	private readonly AuditService _auditService;

	public CompanyProfileController(
		AskTransportDbContext db,
		AuditService auditService)
	{
		_db = db;
		_auditService = auditService;
	}

	[HttpGet("public")]
	[AllowAnonymous]
	public async Task<IActionResult> GetPublic()
	{
		var company = await _db.CompanyProfiles
			.AsNoTracking()
			.Where(x => x.IsActive)
			.Select(x => new
			{
				x.CompanyName,
				x.LegalName,
				x.Gstin,
				x.Email,
				x.Phone,
				x.SupportPhone,
				x.SupportEmail,
				x.Address,
				x.City,
				x.State,
				x.PinCode,
				x.Website,
				x.LogoPath
			})
			.FirstOrDefaultAsync();

		return Ok(company);
	}

	[HttpGet]
	[HasPermission(
		Permissions.Settings.CompanyProfile)]
	public async Task<IActionResult> Get()
	{
		var company = await _db.CompanyProfiles
			.AsNoTracking()
			.FirstOrDefaultAsync(x =>
				x.IsActive);

		return Ok(company);
	}

	[HttpPut]
	[HasPermission(
		Permissions.Settings.CompanyProfile)]
	public async Task<IActionResult> Update(
		CompanyProfileRequest request)
	{
		var company = await _db.CompanyProfiles
			.FirstOrDefaultAsync(x =>
				x.IsActive);

		if (company == null)
		{
			company = new CompanyProfile
			{
				IsActive = true,
				CreatedAt = DateTime.UtcNow
			};

			_db.CompanyProfiles.Add(company);
		}

		company.CompanyName =
			request.CompanyName.Trim();

		company.LegalName =
			request.LegalName?.Trim();

		company.Gstin =
			request.Gstin?.Trim()
				.ToUpperInvariant();

		company.Pan =
			request.Pan?.Trim()
				.ToUpperInvariant();

		company.Cin =
			request.Cin?.Trim()
				.ToUpperInvariant();

		company.Email =
			request.Email?.Trim();

		company.Phone =
			request.Phone?.Trim();

		company.SupportPhone =
			request.SupportPhone?.Trim();

		company.SupportEmail =
			request.SupportEmail?.Trim();

		company.Address =
			request.Address?.Trim();

		company.City =
			request.City?.Trim();

		company.State =
			request.State?.Trim();

		company.StateCode =
			request.StateCode?.Trim();

		company.PinCode =
			request.PinCode?.Trim();

		company.Website =
			request.Website?.Trim();

		company.LogoPath =
			request.LogoPath?.Trim();

		company.BankName =
			request.BankName?.Trim();

		company.BankAccountName =
			request.BankAccountName?.Trim();

		company.BankAccountNumber =
			request.BankAccountNumber?.Trim();

		company.IfscCode =
			request.IfscCode?.Trim()
				.ToUpperInvariant();

		company.BranchName =
			request.BranchName?.Trim();

		company.UpdatedAt =
			DateTime.UtcNow;

		await _db.SaveChangesAsync();

		await _auditService.LogAsync(
			"COMPANY_PROFILE_UPDATED",
			"Company profile updated");

		return Ok(new
		{
			message =
				"Company profile updated successfully",

			company
		});
	}
}