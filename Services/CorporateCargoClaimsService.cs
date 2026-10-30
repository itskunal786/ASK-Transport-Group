using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

namespace ASK.Group.Api.Services;

public class CorporateCargoClaimsService : ICorporateCargoClaimsService
{
    private static readonly List<CorporateCargoClaim> _claims =
    [
        new CorporateCargoClaim
        {
            Id = "claim-1",
            ClaimTicketNo = "CLM-2026-FMCG-8102",
            ConsignmentNo = "CN-HUL-MUM-99124",
            ClientCorporateName = "Hindustan Unilever Ltd (Bhiwandi CDC)",
            ConsigneeName = "HUL Regional Distribution Centre (Pune)",
            InvoiceNo = "INV-HUL-2026-8812",
            DisputeReason = ClaimDisputeReason.WaterDamage,
            Status = CargoClaimStatus.SettledDebitNote,
            InvoiceDeclaredValueInr = 2450000m,
            ClaimAmountDemandedInr = 85000m,
            SurveyorApprovedAmountInr = 42000m,
            DebitNoteDeductionInr = 42000m,
            DebitNoteRefNo = "DN-HUL-2026-441",
            DamageDescription = "Joint survey conducted with National Insurance surveyor. 12 corrugated boxes damp on outer layer; inner contents 80% intact. Final loss settled at ₹42,000.",
            DamagePhotoUrls = ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400", "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400"],
            SurveyorName = "National Marine Insurance Surveyors",
            IncidentLocation = "Igatpuri Ghat / NH-160 Monsoon Ingress",
            DelayHours = 1.5,
            LoggedDate = DateTime.UtcNow.AddDays(-5)
        },
        new CorporateCargoClaim
        {
            Id = "claim-2",
            ClaimTicketNo = "CLM-2026-ELEC-4401",
            ConsignmentNo = "CN-SAM-DEL-55102",
            ClientCorporateName = "Samsung Electronics India Ltd (Noida Plant)",
            ConsigneeName = "Samsung Central Hub (Gurugram)",
            InvoiceNo = "INV-SAM-2026-1903",
            DisputeReason = ClaimDisputeReason.HandlingBreakage,
            Status = CargoClaimStatus.UnderSurveyorInspection,
            InvoiceDeclaredValueInr = 7800000m,
            ClaimAmountDemandedInr = 320000m,
            SurveyorApprovedAmountInr = 0m,
            DebitNoteDeductionInr = 0m,
            DamageDescription = "Third-party surveyor appointed (M/s Tata AIG General). Impact marks detected on outer wooden pallet straps. Awaiting final joint survey report.",
            DamagePhotoUrls = ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"],
            SurveyorName = "Tata AIG Marine Surveyors",
            IncidentLocation = "NH-44 Agra-Gwalior Stretch",
            DelayHours = 0,
            LoggedDate = DateTime.UtcNow.AddDays(-2)
        },
        new CorporateCargoClaim
        {
            Id = "claim-3",
            ClaimTicketNo = "CLM-2026-AUTO-9912",
            ConsignmentNo = "ASK-LR-9912",
            ClientCorporateName = "Tata Motors Commercial",
            ConsigneeName = "Auto Precision Components (Sanand)",
            InvoiceNo = "INV-TM-2026-4411",
            DisputeReason = ClaimDisputeReason.HandlingBreakage,
            Status = CargoClaimStatus.UnderSurveyorInspection,
            InvoiceDeclaredValueInr = 4500000m,
            ClaimAmountDemandedInr = 138500m,
            SurveyorApprovedAmountInr = 72000m,
            DebitNoteDeductionInr = 0m,
            DamageDescription = "2 Pallets of Engine castings damaged due to road impact near border bypass. Survey report submitted.",
            DamagePhotoUrls = ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"],
            SurveyorName = "National Marine Insurance Surveyors",
            IncidentLocation = "NH-48 Jaipur Bypass",
            DelayHours = 0.5,
            LoggedDate = DateTime.UtcNow.AddDays(-3)
        },
        new CorporateCargoClaim
        {
            Id = "claim-4",
            ClaimTicketNo = "CLM-2026-RETAIL-1192",
            ConsignmentNo = "CN-REL-BLR-3199",
            ClientCorporateName = "Reliance Retail Ventures Ltd",
            ConsigneeName = "Reliance Distribution Hub (Whitefield)",
            InvoiceNo = "INV-REL-2026-7731",
            DisputeReason = ClaimDisputeReason.AccidentImpact,
            Status = CargoClaimStatus.Rejected,
            InvoiceDeclaredValueInr = 1200000m,
            ClaimAmountDemandedInr = 45000m,
            SurveyorApprovedAmountInr = 0m,
            DebitNoteDeductionInr = 0m,
            DamageDescription = "Delay was caused by State Election Commission check-post enforcement and official highway barricades (Force Majeure clause 14.2 of Master Transport Agreement). Penalty repudiated.",
            DamagePhotoUrls = ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"],
            SurveyorName = "New India Assurance Surveyor",
            IncidentLocation = "Hosur Border Checkpoint",
            DelayHours = 8.5,
            LoggedDate = DateTime.UtcNow.AddDays(-4)
        }
    ];

    public Task<List<CorporateCargoClaim>> GetClaimsAsync()
    {
        return Task.FromResult(_claims);
    }

    public Task<CorporateCargoClaim?> GetClaimByIdAsync(string id)
    {
        var match = _claims.FirstOrDefault(c => c.Id == id || c.ClaimTicketNo == id);
        return Task.FromResult(match);
    }

    public Task<CorporateCargoClaim> FileClaimAsync(CorporateCargoClaim claim)
    {
        claim.Id = $"claim-{DateTime.UtcNow.Ticks}";
        claim.ClaimTicketNo = $"CLM-2026-{Random.Shared.Next(8820, 9999)}";
        claim.LoggedDate = DateTime.UtcNow;
        claim.Status = CargoClaimStatus.Logged;
        _claims.Insert(0, claim);
        return Task.FromResult(claim);
    }

    public Task<CorporateCargoClaim?> SubmitSurveyorAssessmentAsync(string id, decimal approvedAmount, string surveyorReport)
    {
        var match = _claims.FirstOrDefault(c => c.Id == id || c.ClaimTicketNo == id);
        if (match != null)
        {
            match.Status = CargoClaimStatus.InsuranceApproved;
            match.SurveyorApprovedAmountInr = approvedAmount;
            match.SurveyorReportUrl = surveyorReport;
        }
        return Task.FromResult(match);
    }

    public Task<CorporateCargoClaim?> SettleClaimAsync(string id, decimal debitNoteAmount)
    {
        var match = _claims.FirstOrDefault(c => c.Id == id || c.ClaimTicketNo == id);
        if (match != null)
        {
            match.Status = CargoClaimStatus.SettledDebitNote;
            match.DebitNoteDeductionInr = debitNoteAmount;
            if (string.IsNullOrWhiteSpace(match.DebitNoteRefNo))
            {
                match.DebitNoteRefNo = $"DN-ASK-{Random.Shared.Next(1000, 9999)}";
            }
        }
        return Task.FromResult(match);
    }
}
