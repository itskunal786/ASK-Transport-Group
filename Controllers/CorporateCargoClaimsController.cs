using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/cargo-claims")]
[Authorize]
public class CorporateCargoClaimsController : ControllerBase
{
    private readonly ICorporateCargoClaimsService _claimsService;

    public CorporateCargoClaimsController(ICorporateCargoClaimsService claimsService)
    {
        _claimsService = claimsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetClaims()
    {
        var data = await _claimsService.GetClaimsAsync();
        return Ok(new { success = true, data });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetClaim(string id)
    {
        var item = await _claimsService.GetClaimByIdAsync(id);
        if (item == null) return NotFound(new { success = false, message = "Claim not found" });
        return Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> FileClaim([FromBody] CorporateCargoClaim request)
    {
        var created = await _claimsService.FileClaimAsync(request);
        return Ok(new { success = true, message = "Cargo dispute claim logged successfully", data = created });
    }

    [HttpPost("{id}/surveyor")]
    public async Task<IActionResult> SubmitSurveyorReport(string id, [FromQuery] decimal approvedAmount, [FromQuery] string surveyorReport = "Surveyor verified damage")
    {
        var updated = await _claimsService.SubmitSurveyorAssessmentAsync(id, approvedAmount, surveyorReport);
        if (updated == null) return NotFound(new { success = false, message = "Claim not found" });
        return Ok(new { success = true, message = "Surveyor assessment approved", data = updated });
    }

    [HttpPost("{id}/settle")]
    public async Task<IActionResult> SettleClaim(string id, [FromQuery] decimal debitNoteAmount)
    {
        var settled = await _claimsService.SettleClaimAsync(id, debitNoteAmount);
        if (settled == null) return NotFound(new { success = false, message = "Claim not found" });
        return Ok(new { success = true, message = "Claim settled with debit note", data = settled });
    }

    [HttpPost("{id}/issue-debit-note")]
    public async Task<IActionResult> IssueDebitNote(string id, [FromQuery] string? debitRef = null, [FromQuery] decimal agreedAmount = 0)
    {
        var settled = await _claimsService.SettleClaimAsync(id, agreedAmount);
        if (settled == null) return NotFound(new { success = false, message = "Claim not found" });
        if (!string.IsNullOrWhiteSpace(debitRef))
        {
            settled.DebitNoteRefNo = debitRef;
        }
        return Ok(new { success = true, message = "Debit note issued successfully", data = settled });
    }
}
