using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;

namespace ASK.Group.Api.Services;

public class RtoBorderVaultService : IRtoBorderVaultService
{
    private static readonly List<RtoBorderInspectionDossier> _dossiers =
    [
        new RtoBorderInspectionDossier
        {
            Id = "VAULT-001",
            VehicleNumber = "MH-12-RN-4421",
            TripNumber = "TRIP-2026-9041",
            DriverName = "Ramesh Singh Yadav",
            DriverPhone = "+91 98220 11445",
            TransporterName = "ASK Dedicated Fleet Ltd",
            EwayBillNo = "2410-9876-5432-1109",
            EwayBillValidTill = DateTime.UtcNow.AddDays(2),
            BiltyNo = "ASK-LR-9921",
            ConsignorName = "Tata Motors Ltd (Pune Plant)",
            ConsigneeName = "Larsen & Toubro Heavy Fab (Surat)",
            RcNumber = "MH12RN4421",
            FitnessValidTill = DateTime.UtcNow.AddMonths(10),
            NationalPermitNo = "NP-MH-2026-88192",
            NationalPermitValidTill = DateTime.UtcNow.AddMonths(9),
            InsurancePolicyNo = "ICICI-LOMB-COMM-99218",
            InsuranceValidTill = DateTime.UtcNow.AddMonths(7),
            PucValidTill = DateTime.UtcNow.AddMonths(5),
            QrVerificationToken = "RTO-TOKEN-MH12-9921"
        },
        new RtoBorderInspectionDossier
        {
            Id = "VAULT-002",
            VehicleNumber = "RJ-14-TG-9901",
            TripNumber = "TRIP-2026-9045",
            DriverName = "Mukesh Choudhary",
            DriverPhone = "+91 94140 88203",
            TransporterName = "Rajputana Roadways",
            EwayBillNo = "2810-7712-4491-0021",
            EwayBillValidTill = DateTime.UtcNow.AddDays(1),
            BiltyNo = "ASK-LR-9928",
            ConsignorName = "Kishangarh Marble Consortium",
            ConsigneeName = "Lodha Luxury Estates (Mumbai)",
            RcNumber = "RJ14TG9901",
            FitnessValidTill = DateTime.UtcNow.AddMonths(6),
            NationalPermitNo = "NP-RJ-2026-44021",
            NationalPermitValidTill = DateTime.UtcNow.AddMonths(8),
            InsurancePolicyNo = "NEW-INDIA-COMM-88123",
            InsuranceValidTill = DateTime.UtcNow.AddMonths(4),
            PucValidTill = DateTime.UtcNow.AddMonths(3),
            QrVerificationToken = "RTO-TOKEN-RJ14-9901"
        }
    ];

    public Task<List<RtoBorderInspectionDossier>> GetDossiersAsync()
    {
        return Task.FromResult(_dossiers);
    }

    public Task<RtoBorderInspectionDossier?> GetDossierByVehicleAsync(string vehicleNumber)
    {
        var match = _dossiers.FirstOrDefault(d => d.VehicleNumber.Equals(vehicleNumber, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(match);
    }

    public Task<RtoBorderInspectionDossier?> VerifyDossierByTokenAsync(string token)
    {
        var match = _dossiers.FirstOrDefault(d => d.QrVerificationToken == token);
        return Task.FromResult(match);
    }
}
