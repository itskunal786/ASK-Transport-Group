namespace ASK.Group.Api.Controllers;

using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/tax-audit-vault")]
[Authorize]
public class TaxAuditVaultController(ITaxAuditVaultService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEntries([FromQuery] string? quarter, [FromQuery] GstTaxFilingType? filingType)
    {
        var data = await service.GetTaxAuditEntriesAsync(quarter, filingType);
        return Ok(new { success = true, data });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaxAuditVaultEntry entry)
    {
        var data = await service.GenerateTaxAuditEntryAsync(entry);
        return Ok(new { success = true, data });
    }

    [HttpPost("{id}/mark-filed")]
    public async Task<IActionResult> MarkFiled(string id, [FromQuery] string acknowledgmentRef)
    {
        var data = await service.MarkEntryFiledAsync(id, acknowledgmentRef);
        if (data == null) return NotFound(new { success = false, message = "Tax entry not found" });
        return Ok(new { success = true, data });
    }
}
