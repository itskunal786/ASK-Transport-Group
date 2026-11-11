using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

namespace ASK.Group.Api.Services;

public class Ais140SafetyService : IAis140SafetyService
{
    private static readonly List<Ais140SafetyTelemetry> _fleetTelemetry =
    [
        new Ais140SafetyTelemetry
        {
            Id = "AIS-001",
            VehicleNumber = "MH-12-RN-4421",
            DriverName = "Ramesh Singh Yadav",
            GpsLatitude = 20.8921,
            GpsLongitude = 72.9341,
            CurrentSpeedKmh = 92.5, // Over speed!
            SpeedLimitKmh = 80.0,
            SosEmergencyTriggered = false,
            ContinuousNightDrivingHours = 4.2,
            HarshBrakingCount = 2,
            HarshAccelerationCount = 1,
            IgnitionOn = true,
            BatteryVoltage = 24.6,
            LocationAddress = "NH-48 Near Navsari Gujarat Toll Plaza",
            Severity = Ais140AlertSeverity.OverSpeeding
        },
        new Ais140SafetyTelemetry
        {
            Id = "AIS-002",
            VehicleNumber = "RJ-14-TG-9901",
            DriverName = "Mukesh Choudhary",
            GpsLatitude = 26.9124,
            GpsLongitude = 75.7873,
            CurrentSpeedKmh = 0.0,
            SpeedLimitKmh = 80.0,
            SosEmergencyTriggered = true, // SOS Panic Triggered!
            SosTriggeredAt = DateTime.UtcNow.AddMinutes(-8),
            ContinuousNightDrivingHours = 2.0,
            HarshBrakingCount = 4,
            HarshAccelerationCount = 0,
            IgnitionOn = false,
            BatteryVoltage = 23.8,
            LocationAddress = "Jaipur Bypass Highway dhaba lay-by (Emergency Panic)",
            Severity = Ais140AlertSeverity.CriticalSosPanic
        },
        new Ais140SafetyTelemetry
        {
            Id = "AIS-003",
            VehicleNumber = "DL-01-AJ-8829",
            DriverName = "Sardar Baldev Singh",
            GpsLatitude = 19.0760,
            GpsLongitude = 72.8777,
            CurrentSpeedKmh = 64.0,
            SpeedLimitKmh = 80.0,
            SosEmergencyTriggered = false,
            ContinuousNightDrivingHours = 8.5, // Night driving fatigue warning!
            HarshBrakingCount = 1,
            HarshAccelerationCount = 0,
            IgnitionOn = true,
            BatteryVoltage = 25.1,
            LocationAddress = "Thane - Bhiwandi Express Corridor",
            Severity = Ais140AlertSeverity.NightDrivingFatigue
        }
    ];

    public Task<List<Ais140SafetyTelemetry>> GetLiveFleetTelemetryAsync()
    {
        return Task.FromResult(_fleetTelemetry);
    }

    public Task<Ais140SafetyTelemetry?> GetVehicleTelemetryAsync(string vehicleNumber)
    {
        var match = _fleetTelemetry.FirstOrDefault(t => t.VehicleNumber.Equals(vehicleNumber, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(match);
    }

    public Task<Ais140SafetyTelemetry?> TriggerSosEmergencyAsync(string vehicleNumber)
    {
        var match = _fleetTelemetry.FirstOrDefault(t => t.VehicleNumber.Equals(vehicleNumber, StringComparison.OrdinalIgnoreCase));
        if (match != null)
        {
            match.SosEmergencyTriggered = true;
            match.SosTriggeredAt = DateTime.UtcNow;
            match.Severity = Ais140AlertSeverity.CriticalSosPanic;
        }
        return Task.FromResult(match);
    }

    public Task<Ais140SafetyTelemetry?> AcknowledgeEmergencyAsync(string vehicleNumber)
    {
        var match = _fleetTelemetry.FirstOrDefault(t => t.VehicleNumber.Equals(vehicleNumber, StringComparison.OrdinalIgnoreCase));
        if (match != null)
        {
            match.SosEmergencyTriggered = false;
            match.Severity = match.CurrentSpeedKmh > match.SpeedLimitKmh ? Ais140AlertSeverity.OverSpeeding : Ais140AlertSeverity.Normal;
        }
        return Task.FromResult(match);
    }
}
