using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

namespace ASK.Group.Api.Services;

public class TyreManagementService : ITyreManagementService
{
    private static readonly List<TruckTyreFleet> _fleetTyres =
    [
        new TruckTyreFleet
        {
            PlateNo = "MH-12-PQ-9081",
            TruckModel = "Tata Prima 2830.K (10-Wheeler)",
            Configuration = "10-Wheeler (6x4)",
            DriverName = "Suraj Bhardwaj",
            DriverPhone = "+91 98221 44550",
            CurrentLocation = "Pune ➔ Surat Highway (NH-48)",
            Tyres =
            [
                new TyreRecord
                {
                    Id = "TYRE-101",
                    SerialNumber = "AP-990184-ENDU",
                    Brand = "Apollo EnduRace",
                    Position = TyreWheelPosition.FL,
                    PositionName = "Front Left (Steer)",
                    PressurePsi = 118,
                    TemperatureC = 52,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 12.5,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 26000m,
                    TotalKmRun = 34500
                },
                new TyreRecord
                {
                    Id = "TYRE-102",
                    SerialNumber = "AP-990185-ENDU",
                    Brand = "Apollo EnduRace",
                    Position = TyreWheelPosition.FR,
                    PositionName = "Front Right (Steer)",
                    PressurePsi = 116,
                    TemperatureC = 54,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 12.0,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 26000m,
                    TotalKmRun = 34500
                },
                new TyreRecord
                {
                    Id = "TYRE-103",
                    SerialNumber = "MRF-77210-MUSC",
                    Brand = "MRF Steel Muscle",
                    Position = TyreWheelPosition.R1_LO,
                    PositionName = "Axle 1 Left Outer (Drive)",
                    PressurePsi = 78,
                    TemperatureC = 68,
                    Status = TyreConditionStatus.CriticalPuncture,
                    TreadDepthMm = 3.2,
                    Stage = TyreLifecycleStage.FirstRetread,
                    PurchaseCostInr = 25000m,
                    RetreadingCostsInr = 4800m,
                    TotalKmRun = 68200,
                    RecommendedAction = "🚨 Critical Pressure Loss: Puncture detected. Retreading threshold (3.2mm) reached."
                },
                new TyreRecord
                {
                    Id = "TYRE-104",
                    SerialNumber = "MRF-77211-MUSC",
                    Brand = "MRF Steel Muscle",
                    Position = TyreWheelPosition.R1_LI,
                    PositionName = "Axle 1 Left Inner (Drive)",
                    PressurePsi = 112,
                    TemperatureC = 58,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 7.8,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 25000m,
                    TotalKmRun = 42100
                }
            ]
        },
        new TruckTyreFleet
        {
            PlateNo = "DL-01-AK-2918",
            TruckModel = "Ashok Leyland 4220 (16-Wheeler Multi-Axle)",
            Configuration = "16-Wheeler Multi-Axle (8x2)",
            DriverName = "Harpreet Singh",
            DriverPhone = "+91 98110 33221",
            CurrentLocation = "Kundli Hub, Delhi NCR",
            Tyres =
            [
                new TyreRecord
                {
                    Id = "TYRE-201",
                    SerialNumber = "CEAT-8812-WINM",
                    Brand = "CEAT Winmile",
                    Position = TyreWheelPosition.FL,
                    PositionName = "Front Left (Steer 1)",
                    PressurePsi = 120,
                    TemperatureC = 48,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 15.0,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 27000m,
                    TotalKmRun = 12400
                }
            ]
        }
    ];

    public Task<List<TruckTyreFleet>> GetFleetTyresAsync()
    {
        return Task.FromResult(_fleetTyres);
    }

    public Task<TruckTyreFleet?> GetTruckTyresAsync(string plateNo)
    {
        var truck = _fleetTyres.FirstOrDefault(t => t.PlateNo.Equals(plateNo, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(truck);
    }

    public Task<TyreRecord?> InflateAndCalibrateTyreAsync(string plateNo, string tyreId, double targetPsi = 118)
    {
        var truck = _fleetTyres.FirstOrDefault(t => t.PlateNo.Equals(plateNo, StringComparison.OrdinalIgnoreCase));
        var tyre = truck?.Tyres.FirstOrDefault(t => t.Id == tyreId);
        if (tyre != null)
        {
            tyre.PressurePsi = targetPsi;
            tyre.Status = TyreConditionStatus.Optimal;
            tyre.RecommendedAction = "Pressure restored and calibrated.";
        }
        return Task.FromResult(tyre);
    }

    public Task<TyreRecord?> DispatchTyreForColdRetreadAsync(string plateNo, string tyreId)
    {
        var truck = _fleetTyres.FirstOrDefault(t => t.PlateNo.Equals(plateNo, StringComparison.OrdinalIgnoreCase));
        var tyre = truck?.Tyres.FirstOrDefault(t => t.Id == tyreId);
        if (tyre != null)
        {
            tyre.Stage = tyre.Stage == TyreLifecycleStage.Virgin ? TyreLifecycleStage.FirstRetread : TyreLifecycleStage.SecondRetread;
            tyre.RetreadingCostsInr += 4800m;
            tyre.TreadDepthMm = 14.0; // Restored with new rubber tread
            tyre.RecommendedAction = "Cold retread applied (+₹4,800). Tread depth restored to 14.0mm.";
        }
        return Task.FromResult(tyre);
    }
}
