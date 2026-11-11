using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

namespace ASK.Group.Api.Services;

public class ElectronicWeighbridgeService : IElectronicWeighbridgeService
{
    private static readonly List<WeighbridgeSlip> _slips =
    [
        new WeighbridgeSlip
        {
            Id = "DK-REC-01",
            SlipNumber = "DK-2026-88291",
            VehicleNumber = "MH-14-GH-6021",
            TruckModel = "Tata Signa 3523.T (4-Axle Rigid)",
            AxleCategory = VehicleAxleCategory.FourAxle14Wheel,
            AxleLabel = "4-Axle (14-Wheeler)",
            DriverName = "Dilip Sawant",
            DriverPhone = "+91 98230 44912",
            ConsignmentNo = "ASK-LR-9921",
            MaterialName = "Automobile Axles & Steel Billets",
            TareWeightKg = 11200,
            GrossWeightKg = 34600,
            PermissibleGvwKg = 35000,
            Status = WeighbridgeComplianceStatus.LegalCompliant
        },
        new WeighbridgeSlip
        {
            Id = "DK-REC-02",
            SlipNumber = "DK-2026-88292",
            VehicleNumber = "RJ-14-TG-9901",
            TruckModel = "Ashok Leyland 4220 (5-Axle Rigid)",
            AxleCategory = VehicleAxleCategory.FiveAxle16Wheel,
            AxleLabel = "5-Axle (16-Wheeler)",
            DriverName = "Mukesh Choudhary",
            DriverPhone = "+91 94140 88203",
            TransporterName = "Rajputana Roadways",
            ConsignmentNo = "ASK-LR-9928",
            MaterialName = "Marble Slabs & Ceramic Tiles",
            TareWeightKg = 12400,
            GrossWeightKg = 46800,
            PermissibleGvwKg = 43500,
            Status = WeighbridgeComplianceStatus.OverloadCritical
        },
        new WeighbridgeSlip
        {
            Id = "DK-REC-03",
            SlipNumber = "DK-2026-88293",
            VehicleNumber = "KA-01-AJ-4102",
            TruckModel = "BharatBenz 2823R (3-Axle 10-Wheeler)",
            AxleCategory = VehicleAxleCategory.ThreeAxle10Wheel,
            AxleLabel = "3-Axle (10-Wheeler)",
            DriverName = "Manjunath Reddy",
            DriverPhone = "+91 98450 11980",
            TransporterName = "Deccan Cargo Movers",
            ConsignmentNo = "ASK-LR-9932",
            MaterialName = "Industrial Transformer Coils",
            TareWeightKg = 9800,
            GrossWeightKg = 27850,
            PermissibleGvwKg = 28000,
            Status = WeighbridgeComplianceStatus.LegalCompliant
        }
    ];

    public Task<List<WeighbridgeSlip>> GetWeighbridgeSlipsAsync()
    {
        return Task.FromResult(_slips);
    }

    public Task<WeighbridgeSlip?> GetSlipByNumberAsync(string slipNumber)
    {
        var match = _slips.FirstOrDefault(s => s.SlipNumber.Equals(slipNumber, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(match);
    }

    public Task<WeighbridgeSlip> RecordWeighmentAsync(WeighbridgeSlip slip)
    {
        slip.Id = $"DK-REC-{DateTime.UtcNow.Ticks}";
        slip.SlipNumber = $"DK-2026-{Random.Shared.Next(88300, 99999)}";
        slip.WeighedAt = DateTime.UtcNow;

        if (slip.GrossWeightKg > slip.PermissibleGvwKg)
        {
            slip.Status = WeighbridgeComplianceStatus.OverloadCritical;
        }
        else
        {
            slip.Status = WeighbridgeComplianceStatus.LegalCompliant;
        }

        _slips.Insert(0, slip);
        return Task.FromResult(slip);
    }

    public Task<WeighbridgeSlip?> AuthorizeCrossDockDeLoadAsync(string slipId)
    {
        var slip = _slips.FirstOrDefault(s => s.Id == slipId);
        if (slip != null)
        {
            // Reduce weight below permissible limit to clear overload
            slip.GrossWeightKg = slip.PermissibleGvwKg - 400;
            slip.Status = WeighbridgeComplianceStatus.LegalCompliant;
        }
        return Task.FromResult(slip);
    }
}
