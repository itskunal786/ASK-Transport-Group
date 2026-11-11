namespace ASK.Group.Api.Controllers;

using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/customer-directory")]
public class CustomerDirectoryShareController(ICustomerDirectoryShareService service) : ControllerBase
{
    [HttpGet("consignees")]
    [Authorize]
    public async Task<IActionResult> GetConsignees([FromQuery] string customerId = "cust-default")
    {
        var data = await service.GetConsigneeDirectoryAsync(customerId);
        return Ok(new { success = true, data });
    }

    [HttpPost("consignees")]
    [Authorize]
    public async Task<IActionResult> AddConsignee([FromBody] CustomerConsigneeDirectory entry)
    {
        var data = await service.AddConsigneeAsync(entry);
        return Ok(new { success = true, data });
    }

    [HttpPost("consignees/{id}/toggle-favorite")]
    [Authorize]
    public async Task<IActionResult> ToggleFavorite(string id)
    {
        var data = await service.ToggleFavoriteAsync(id);
        if (data == null) return NotFound(new { success = false, message = "Consignee not found" });
        return Ok(new { success = true, data });
    }

    [HttpPost("generate-whatsapp-session")]
    [Authorize]
    public async Task<IActionResult> GenerateSession([FromQuery] string consignmentNo, [FromQuery] string receiverPhone, [FromQuery] string receiverName)
    {
        var data = await service.GenerateWhatsAppTrackSessionAsync(consignmentNo, receiverPhone, receiverName);
        return Ok(new { success = true, data });
    }

    [HttpGet("public-track/{token}")]
    [AllowAnonymous]
    public async Task<IActionResult> PublicTrack(string token, [FromQuery] string? pin)
    {
        var data = await service.GetSessionByTokenAsync(token, pin);
        if (data == null) return Unauthorized(new { success = false, message = "Invalid tracking token or incorrect PIN." });
        return Ok(new { success = true, data });
    }
}
