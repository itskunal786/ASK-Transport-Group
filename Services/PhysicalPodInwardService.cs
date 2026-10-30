namespace ASK.Group.Api.Services;

using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

public class PhysicalPodInwardService : IPhysicalPodInwardService
{
    private static readonly List<PhysicalPodInwardReceipt> _podReceipts =
    [
        new()
        {
            Id = "pod-1",
            BiltyLrNumber = "LR-2026-DEL-BOM-8841",
            BarcodeToken = "POD-BC-8841-BOM",
            ConsignmentNo = "CN-99124-DEL",
            ConsignorName = "Samsung Electronics India",
            ConsigneeName = "Reliance Digital Warehouse Bhiwandi",
            DestinationCity = "Mumbai",
            TransporterBrokerName = "Bajrang Lorry Supply",
            VehicleNumber = "RJ-14-GH-4921",
            DriverName = "Suresh Gurjar",
            TotalFreightInr = 68000m,
            Advance70PercentPaidInr = 47600m,
            Balance30PercentDueInr = 20400m,
            PhysicalSignedCopyReceived = false,
            ConsigneeStampVerified = false,
            OpticalBarcodeScannedAt = null,
            ScannedByOperator = string.Empty,
            VerificationStatus = PhysicalPodVerificationStatus.PendingInward
        },
        new()
        {
            Id = "pod-2",
            BiltyLrNumber = "LR-2026-JAI-AHM-4402",
            BarcodeToken = "POD-BC-4402-AHM",
            ConsignmentNo = "CN-77140-JAI",
            ConsignorName = "Havells India Ltd",
            ConsigneeName = "Gujarat Electrical Traders Aslali",
            DestinationCity = "Ahmedabad",
            TransporterBrokerName = "Maruti Roadlines",
            VehicleNumber = "HR-55-AN-8102",
            DriverName = "Manjeet Singh",
            TotalFreightInr = 42000m,
            Advance70PercentPaidInr = 29400m,
            Balance30PercentDueInr = 12600m,
            PhysicalSignedCopyReceived = true,
            ConsigneeStampVerified = true,
            OpticalBarcodeScannedAt = DateTime.UtcNow.AddHours(-3),
            ScannedByOperator = "Ramesh Verma (Hub Desk)",
            VerificationStatus = PhysicalPodVerificationStatus.ScannedVerified
        }
    ];

    private static readonly List<EmergencyTransshipmentRescue> _rescues =
    [
        new()
        {
            Id = "rescue-1",
            BreakdownIncidentNo = "INC-2026-BRK-991",
            OriginalVehiclePlate = "MH-12-PQ-9024",
            BreakdownLocation = "NH-48 near Vadodara Toll Plaza (KM 210)",
            BreakdownReason = TransshipmentReason.EngineBreakdown,
            AssignedRescueVehiclePlate = "GJ-06-ZZ-4109",
            RescueDriverName = "Dinesh Patel",
            RescueDriverPhone = "+91 98250 88123",
            CraneMechanicDispatched = true,
            TransshipmentCargoStatus = "CARGO_TRANSSHIPPED_OK",
            IncidentReportedAt = DateTime.UtcNow.AddHours(-6),
            ResolvedAt = DateTime.UtcNow.AddHours(-1)
        }
    ];

    public Task<List<PhysicalPodInwardReceipt>> GetPendingPodReceiptsAsync()
    {
        return Task.FromResult(_podReceipts);
    }

    public Task<PhysicalPodInwardReceipt?> ScanAndVerifyBarcodeAsync(string barcodeOrBiltyNo, string operatorName)
    {
        var item = _podReceipts.FirstOrDefault(p =>
            p.BarcodeToken.Equals(barcodeOrBiltyNo, StringComparison.OrdinalIgnoreCase) ||
            p.BiltyLrNumber.Equals(barcodeOrBiltyNo, StringComparison.OrdinalIgnoreCase));

        if (item != null)
        {
            item.PhysicalSignedCopyReceived = true;
            item.ConsigneeStampVerified = true;
            item.OpticalBarcodeScannedAt = DateTime.UtcNow;
            item.ScannedByOperator = operatorName;
            item.VerificationStatus = PhysicalPodVerificationStatus.ScannedVerified;
        }

        return Task.FromResult(item);
    }

    public Task<PhysicalPodInwardReceipt?> ReleaseTransporterPaymentAsync(string id, string transactionRef)
    {
        var item = _podReceipts.FirstOrDefault(p => p.Id == id);
        if (item != null)
        {
            item.VerificationStatus = PhysicalPodVerificationStatus.PaymentReleased;
            item.PayoutReleaseTransactionRef = transactionRef;
        }
        return Task.FromResult(item);
    }

    public Task<List<EmergencyTransshipmentRescue>> GetActiveTransshipmentsAsync()
    {
        return Task.FromResult(_rescues);
    }

    public Task<EmergencyTransshipmentRescue> CreateTransshipmentRescueAsync(EmergencyTransshipmentRescue rescue)
    {
        _rescues.Insert(0, rescue);
        return Task.FromResult(rescue);
    }
}
