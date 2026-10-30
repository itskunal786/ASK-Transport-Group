using ASK.Group.Api.Domain.Entities;

namespace ASK.Group.Api.Application.Common.Interfaces;

public interface IAis140SafetyService
{
    Task<List<Ais140SafetyTelemetry>> GetLiveFleetTelemetryAsync();
    Task<Ais140SafetyTelemetry?> GetVehicleTelemetryAsync(string vehicleNumber);
    Task<Ais140SafetyTelemetry?> TriggerSosEmergencyAsync(string vehicleNumber);
    Task<Ais140SafetyTelemetry?> AcknowledgeEmergencyAsync(string vehicleNumber);
}
