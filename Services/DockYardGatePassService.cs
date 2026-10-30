using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

namespace ASK.Group.Api.Services;

public class DockYardGatePassService : IDockYardGatePassService
{
    private static readonly List<DockBay> _bays =
    [
        new DockBay
        {
            BayId = "BAY-01",
            BayName = "Bay 1 - Heavy Cargo Unloading",
            Type = DockBayType.Unloading,
            Status = DockBayStatus.Occupied,
            ActivePassNumber = "GP-2026-9041",
            ActiveVehicle = "MH-12-RN-4421",
            Material = "Auto Engine Parts (24.5 Ton)",
            ProgressPercent = 70,
            ElapsedMinutes = 48,
            TargetMinutes = 75
        },
        new DockBay
        {
            BayId = "BAY-02",
            BayName = "Bay 2 - Fast Express Cross-Dock",
            Type = DockBayType.Loading,
            Status = DockBayStatus.Occupied,
            ActivePassNumber = "GP-2026-9042",
            ActiveVehicle = "DL-01-AJ-8829",
            Material = "E-Commerce Parcels (14.2 Ton)",
            ProgressPercent = 92,
            ElapsedMinutes = 84,
            TargetMinutes = 90
        },
        new DockBay
        {
            BayId = "BAY-03",
            BayName = "Bay 3 - FMCG High Throughput",
            Type = DockBayType.Loading,
            Status = DockBayStatus.Occupied,
            ActivePassNumber = "GP-2026-9043",
            ActiveVehicle = "HR-55-XY-1011",
            Material = "Packaged Foods & Beverages",
            ProgressPercent = 45,
            ElapsedMinutes = 115,
            TargetMinutes = 90
        },
        new DockBay
        {
            BayId = "BAY-04",
            BayName = "Bay 4 - General Cargo Inbound",
            Type = DockBayType.Unloading,
            Status = DockBayStatus.Available,
            TargetMinutes = 60
        },
        new DockBay
        {
            BayId = "BAY-05",
            BayName = "Bay 5 - Reefer Cold-Chain Terminal",
            Type = DockBayType.ReeferColdBay,
            Status = DockBayStatus.Occupied,
            ActivePassNumber = "GP-2026-9044",
            ActiveVehicle = "GJ-03-BW-7744",
            Material = "Pharma Vaccines & APIs (-18°C)",
            ProgressPercent = 30,
            ElapsedMinutes = 28,
            TargetMinutes = 60
        },
        new DockBay
        {
            BayId = "BAY-06",
            BayName = "Bay 6 - Staging & Pre-Dispatch",
            Type = DockBayType.Staging,
            Status = DockBayStatus.Available,
            TargetMinutes = 45
        }
    ];

    private static readonly List<GatePassRecord> _gatePasses =
    [
        new GatePassRecord
        {
            Id = "GP-REC-01",
            PassNumber = "GP-2026-9041",
            Type = GatePassType.InboundUnload,
            VehicleNumber = "MH-12-RN-4421",
            DriverName = "Ramesh Singh Yadav",
            DriverPhone = "+91 98220 11445",
            ConsignmentNo = "ASK-LR-9921",
            MaterialType = "Automobile Axles & Steel Bars",
            CargoWeightTon = 24.5,
            AssignedBay = "BAY-01",
            SealNumber = "SEAL-ASK-99881",
            SealStatus = SealStatus.IntactVerified,
            Status = GatePassStatus.LoadingUnloading,
            ElapsedMinutes = 48,
            TargetTatMinutes = 75,
            OdometerReadingKm = 142850
        },
        new GatePassRecord
        {
            Id = "GP-REC-02",
            PassNumber = "GP-2026-9042",
            Type = GatePassType.OutboundDispatch,
            VehicleNumber = "DL-01-AJ-8829",
            DriverName = "Sardar Baldev Singh",
            DriverPhone = "+91 97110 33882",
            ConsignmentNo = "ASK-LR-9925",
            MaterialType = "Retail Footwear & Apparel",
            CargoWeightTon = 14.2,
            AssignedBay = "BAY-02",
            SealNumber = "SEAL-ASK-99885",
            SealStatus = SealStatus.IntactVerified,
            Status = GatePassStatus.InspectionPending,
            ElapsedMinutes = 84,
            TargetTatMinutes = 90,
            OdometerReadingKm = 98420
        },
        new GatePassRecord
        {
            Id = "GP-REC-03",
            PassNumber = "GP-2026-9043",
            Type = GatePassType.OutboundDispatch,
            VehicleNumber = "HR-55-XY-1011",
            DriverName = "Mohd. Imran Khan",
            DriverPhone = "+91 98960 77123",
            ConsignmentNo = "ASK-LR-9930",
            MaterialType = "Packaged FMCG Goods",
            CargoWeightTon = 21.0,
            AssignedBay = "BAY-03",
            SealNumber = "SEAL-ASK-99890",
            SealStatus = SealStatus.IntactVerified,
            Status = GatePassStatus.DetentionWarning,
            ElapsedMinutes = 115,
            TargetTatMinutes = 90,
            DemurrageChargesInr = 1800m,
            OdometerReadingKm = 218900
        }
    ];

    public Task<List<DockBay>> GetDockBaysAsync()
    {
        return Task.FromResult(_bays);
    }

    public Task<List<GatePassRecord>> GetGatePassesAsync()
    {
        return Task.FromResult(_gatePasses);
    }

    public Task<GatePassRecord> GenerateGateInPassAsync(GatePassRecord newPass)
    {
        newPass.Id = $"GP-REC-{DateTime.UtcNow.Ticks}";
        newPass.PassNumber = $"GP-2026-{Random.Shared.Next(9050, 9999)}";
        newPass.GateInTime = DateTime.UtcNow;
        newPass.Status = GatePassStatus.Docked;
        
        _gatePasses.Insert(0, newPass);

        // Update target bay
        var targetBay = _bays.FirstOrDefault(b => b.BayId == newPass.AssignedBay);
        if (targetBay != null)
        {
            targetBay.Status = DockBayStatus.Occupied;
            targetBay.ActivePassNumber = newPass.PassNumber;
            targetBay.ActiveVehicle = newPass.VehicleNumber;
            targetBay.Material = newPass.MaterialType;
            targetBay.ProgressPercent = 5;
            targetBay.ElapsedMinutes = 0;
        }

        return Task.FromResult(newPass);
    }

    public Task<GatePassRecord?> ExpediteDockLoadingAsync(string passId)
    {
        var pass = _gatePasses.FirstOrDefault(p => p.Id == passId);
        if (pass != null)
        {
            pass.Status = GatePassStatus.LoadingUnloading;
            pass.DemurrageChargesInr = 0m;
        }
        return Task.FromResult(pass);
    }

    public Task<GatePassRecord?> AuthorizeGateOutAsync(string passId)
    {
        var pass = _gatePasses.FirstOrDefault(p => p.Id == passId);
        if (pass != null)
        {
            pass.Status = GatePassStatus.GateOutCleared;
            pass.GateOutTime = DateTime.UtcNow;

            var bay = _bays.FirstOrDefault(b => b.BayId == pass.AssignedBay);
            if (bay != null)
            {
                bay.Status = DockBayStatus.Available;
                bay.ActivePassNumber = null;
                bay.ActiveVehicle = null;
                bay.Material = null;
                bay.ProgressPercent = 0;
            }
        }
        return Task.FromResult(pass);
    }
}
