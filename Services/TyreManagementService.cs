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
                },
                new TyreRecord
                {
                    Id = "TYRE-105",
                    SerialNumber = "MRF-77212-MUSC",
                    Brand = "MRF Steel Muscle",
                    Position = TyreWheelPosition.R1_RI,
                    PositionName = "Axle 1 Right Inner (Drive)",
                    PressurePsi = 114,
                    TemperatureC = 56,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 8.2,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 25000m,
                    TotalKmRun = 42100
                },
                new TyreRecord
                {
                    Id = "TYRE-106",
                    SerialNumber = "MRF-77213-MUSC",
                    Brand = "MRF Steel Muscle",
                    Position = TyreWheelPosition.R1_RO,
                    PositionName = "Axle 1 Right Outer (Drive)",
                    PressurePsi = 115,
                    TemperatureC = 55,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 8.0,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 25000m,
                    TotalKmRun = 42100
                },
                new TyreRecord
                {
                    Id = "TYRE-107",
                    SerialNumber = "JK-44101-JET",
                    Brand = "JK Tyre Jetsteel",
                    Position = TyreWheelPosition.R2_LO,
                    PositionName = "Axle 2 Left Outer (Drive)",
                    PressurePsi = 110,
                    TemperatureC = 54,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 6.4,
                    Stage = TyreLifecycleStage.FirstRetread,
                    PurchaseCostInr = 24000m,
                    RetreadingCostsInr = 4500m,
                    TotalKmRun = 54000
                },
                new TyreRecord
                {
                    Id = "TYRE-108",
                    SerialNumber = "JK-44102-JET",
                    Brand = "JK Tyre Jetsteel",
                    Position = TyreWheelPosition.R2_LI,
                    PositionName = "Axle 2 Left Inner (Drive)",
                    PressurePsi = 112,
                    TemperatureC = 53,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 6.8,
                    Stage = TyreLifecycleStage.FirstRetread,
                    PurchaseCostInr = 24000m,
                    RetreadingCostsInr = 4500m,
                    TotalKmRun = 54000
                },
                new TyreRecord
                {
                    Id = "TYRE-109",
                    SerialNumber = "JK-44103-JET",
                    Brand = "JK Tyre Jetsteel",
                    Position = TyreWheelPosition.R2_RI,
                    PositionName = "Axle 2 Right Inner (Drive)",
                    PressurePsi = 116,
                    TemperatureC = 52,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 7.1,
                    Stage = TyreLifecycleStage.FirstRetread,
                    PurchaseCostInr = 24000m,
                    RetreadingCostsInr = 4500m,
                    TotalKmRun = 54000
                },
                new TyreRecord
                {
                    Id = "TYRE-110",
                    SerialNumber = "JK-44104-JET",
                    Brand = "JK Tyre Jetsteel",
                    Position = TyreWheelPosition.R2_RO,
                    PositionName = "Axle 2 Right Outer (Drive)",
                    PressurePsi = 115,
                    TemperatureC = 53,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 6.9,
                    Stage = TyreLifecycleStage.FirstRetread,
                    PurchaseCostInr = 24000m,
                    RetreadingCostsInr = 4500m,
                    TotalKmRun = 54000
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
                },
                new TyreRecord
                {
                    Id = "TYRE-202",
                    SerialNumber = "CEAT-8813-WINM",
                    Brand = "CEAT Winmile",
                    Position = TyreWheelPosition.FR,
                    PositionName = "Front Right (Steer 1)",
                    PressurePsi = 119,
                    TemperatureC = 49,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 14.8,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 27000m,
                    TotalKmRun = 12400
                },
                new TyreRecord
                {
                    Id = "TYRE-203",
                    SerialNumber = "CEAT-8814-WINM",
                    Brand = "CEAT Winmile",
                    Position = TyreWheelPosition.LIFT_L,
                    PositionName = "Lift Axle Left (Steer 2)",
                    PressurePsi = 115,
                    TemperatureC = 46,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 13.5,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 26500m,
                    TotalKmRun = 18200
                },
                new TyreRecord
                {
                    Id = "TYRE-204",
                    SerialNumber = "CEAT-8815-WINM",
                    Brand = "CEAT Winmile",
                    Position = TyreWheelPosition.LIFT_R,
                    PositionName = "Lift Axle Right (Steer 2)",
                    PressurePsi = 116,
                    TemperatureC = 47,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 13.2,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 26500m,
                    TotalKmRun = 18200
                },
                new TyreRecord
                {
                    Id = "TYRE-205",
                    SerialNumber = "AP-66101-ENDU",
                    Brand = "Apollo EnduRace",
                    Position = TyreWheelPosition.R1_LO,
                    PositionName = "Axle 1 Left Outer (Drive)",
                    PressurePsi = 114,
                    TemperatureC = 50,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 10.2,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 26000m,
                    TotalKmRun = 25000
                },
                new TyreRecord
                {
                    Id = "TYRE-206",
                    SerialNumber = "AP-66102-ENDU",
                    Brand = "Apollo EnduRace",
                    Position = TyreWheelPosition.R1_LI,
                    PositionName = "Axle 1 Left Inner (Drive)",
                    PressurePsi = 112,
                    TemperatureC = 51,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 10.0,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 26000m,
                    TotalKmRun = 25000
                },
                new TyreRecord
                {
                    Id = "TYRE-207",
                    SerialNumber = "AP-66103-ENDU",
                    Brand = "Apollo EnduRace",
                    Position = TyreWheelPosition.R1_RI,
                    PositionName = "Axle 1 Right Inner (Drive)",
                    PressurePsi = 115,
                    TemperatureC = 49,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 10.5,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 26000m,
                    TotalKmRun = 25000
                },
                new TyreRecord
                {
                    Id = "TYRE-208",
                    SerialNumber = "AP-66104-ENDU",
                    Brand = "Apollo EnduRace",
                    Position = TyreWheelPosition.R1_RO,
                    PositionName = "Axle 1 Right Outer (Drive)",
                    PressurePsi = 113,
                    TemperatureC = 50,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 10.1,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 26000m,
                    TotalKmRun = 25000
                },
                new TyreRecord
                {
                    Id = "TYRE-209",
                    SerialNumber = "MRF-5501-MUSC",
                    Brand = "MRF Steel Muscle",
                    Position = TyreWheelPosition.R2_LO,
                    PositionName = "Axle 2 Left Outer (Drive)",
                    PressurePsi = 111,
                    TemperatureC = 52,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 8.5,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 25500m,
                    TotalKmRun = 31000
                },
                new TyreRecord
                {
                    Id = "TYRE-210",
                    SerialNumber = "MRF-5502-MUSC",
                    Brand = "MRF Steel Muscle",
                    Position = TyreWheelPosition.R2_LI,
                    PositionName = "Axle 2 Left Inner (Drive)",
                    PressurePsi = 112,
                    TemperatureC = 53,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 8.7,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 25500m,
                    TotalKmRun = 31000
                },
                new TyreRecord
                {
                    Id = "TYRE-211",
                    SerialNumber = "MRF-5503-MUSC",
                    Brand = "MRF Steel Muscle",
                    Position = TyreWheelPosition.R2_RI,
                    PositionName = "Axle 2 Right Inner (Drive)",
                    PressurePsi = 114,
                    TemperatureC = 51,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 8.9,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 25500m,
                    TotalKmRun = 31000
                },
                new TyreRecord
                {
                    Id = "TYRE-212",
                    SerialNumber = "MRF-5504-MUSC",
                    Brand = "MRF Steel Muscle",
                    Position = TyreWheelPosition.R2_RO,
                    PositionName = "Axle 2 Right Outer (Drive)",
                    PressurePsi = 115,
                    TemperatureC = 50,
                    Status = TyreConditionStatus.Optimal,
                    TreadDepthMm = 8.6,
                    Stage = TyreLifecycleStage.Virgin,
                    PurchaseCostInr = 25500m,
                    TotalKmRun = 31000
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
