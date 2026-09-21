using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/delivery-finalization")]
[Authorize]
public class DeliveryFinalizationController
    : ControllerBase
{
    private readonly DeliveryFinalizationService
        _deliveryService;

    private readonly AuditService
        _auditService;

    public DeliveryFinalizationController(
        DeliveryFinalizationService deliveryService,
        AuditService auditService)
    {
        _deliveryService = deliveryService;
        _auditService = auditService;
    }

    [HttpPost("{shipmentId:int}/complete")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<IActionResult> Complete(
        int shipmentId,
        FinalizeDeliveryRequest request)
    {
        if (string.IsNullOrWhiteSpace(
                request.Otp))
        {
            return BadRequest(new
            {
                message = "Delivery OTP is required"
            });
        }

        var result =
            await _deliveryService
                .FinalizeAsync(
                    shipmentId,
                    request);

        if (!result.Success)
        {
            if (result.Message ==
                "Shipment not found")
            {
                return NotFound(new
                {
                    message = result.Message
                });
            }

            return BadRequest(new
            {
                message = result.Message
            });
        }

        await _auditService.LogAsync(
            "DELIVERY_COMPLETED",
            $"Shipment {shipmentId} delivered for booking {result.BookingNumber}",
            null,
            User.Identity?.Name);

        return Ok(result);
    }
}