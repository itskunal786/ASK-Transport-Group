using ASK.Group.Api.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/ais140-safety")]
[Authorize]
public class Ais140SafetyController : ControllerBase
{
    private readonly IAis140SafetyService _safetyService;

    public Ais140SafetyController(IAis140SafetyService safetyService)
    {
        _safetyService = safetyService;
    }

    [HttpGet("telemetry")]
    public async Task<IActionResult> GetLiveTelemetry()
    {
        var data = await _safetyService.GetLiveFleetTelemetryAsync();
        return Ok(new { success = true, data });
    }

    [HttpGet("telemetry/{vehicleNumber}")]
    public async Task<IActionResult> GetVehicleTelemetry(string vehicleNumber)
    {
        var item = await _safetyService.GetVehicleTelemetryAsync(vehicleNumber);
        if (item == null) return NotFound(new { success = false, message = "Vehicle telemetry not found" });
        return Ok(new { success = true, data = item });
    }

    [HttpPost("panic/{vehicleNumber}")]
    public async Task<IActionResult> TriggerPanic(string vehicleNumber)
    {
        var triggered = await _safetyService.TriggerSosEmergencyAsync(vehicleNumber);
        if (triggered == null) return NotFound(new { success = false, message = "Vehicle not found" });
        return Ok(new { success = true, message = "🚨 SOS PANIC ALERT TRIGGERED!", data = triggered });
    }

    [HttpPost("acknowledge/{vehicleNumber}")]
    public async Task<IActionResult> AcknowledgeEmergency(string vehicleNumber)
    {
        var ack = await _safetyService.AcknowledgeEmergencyAsync(vehicleNumber);
        if (ack == null) return NotFound(new { success = false, message = "Vehicle not found" });
        return Ok(new { success = true, message = "Emergency acknowledged and reset", data = ack });
    }
}
