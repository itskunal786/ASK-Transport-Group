namespace ASK.Group.Api.Controllers;

using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/physical-pod")]
[Authorize]
public class PhysicalPodInwardController(IPhysicalPodInwardService service) : ControllerBase
{
    [HttpGet("receipts")]
    public async Task<IActionResult> GetReceipts()
    {
        var data = await service.GetPendingPodReceiptsAsync();
        return Ok(new { success = true, data });
    }

    [HttpPost("scan-barcode")]
    public async Task<IActionResult> ScanBarcode([FromQuery] string barcodeOrBiltyNo, [FromQuery] string operatorName)
    {
        var data = await service.ScanAndVerifyBarcodeAsync(barcodeOrBiltyNo, operatorName);
        if (data == null) return NotFound(new { success = false, message = "Barcode / Bilty not found in pending inward queue." });
        return Ok(new { success = true, data });
    }

    [HttpPost("receipts/{id}/release-payment")]
    public async Task<IActionResult> ReleasePayment(string id, [FromQuery] string transactionRef)
    {
        var data = await service.ReleaseTransporterPaymentAsync(id, transactionRef);
        if (data == null) return NotFound(new { success = false, message = "Receipt not found" });
        return Ok(new { success = true, data });
    }

    [HttpGet("transshipments")]
    public async Task<IActionResult> GetTransshipments()
    {
        var data = await service.GetActiveTransshipmentsAsync();
        return Ok(new { success = true, data });
    }

    [HttpPost("transshipments")]
    public async Task<IActionResult> CreateTransshipment([FromBody] EmergencyTransshipmentRescue rescue)
    {
        var data = await service.CreateTransshipmentRescueAsync(rescue);
        return Ok(new { success = true, data });
    }
}
