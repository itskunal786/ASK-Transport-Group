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
            Id = "CLAIM-001",
            ClaimTicketNo = "CLM-2026-8812",
            ConsignmentNo = "ASK-LR-9912",
            ClientCorporateName = "Tata Motors Commercial",
            ConsigneeName = "Auto Precision Components (Sanand)",
            DisputeReason = ClaimDisputeReason.HandlingBreakage,
            Status = CargoClaimStatus.UnderSurveyorInspection,
            InvoiceDeclaredValueInr = 450000m,
            ClaimAmountDemandedInr = 38500m,
            SurveyorApprovedAmountInr = 32000m,
            DebitNoteDeductionInr = 0m,
            DamageDescription = "2 Pallets of Engine castings damaged due to road impact near border bypass.",
            DamagePhotoUrls = ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"],
            SurveyorName = "National Marine Insurance Surveyors"
        },
        new CorporateCargoClaim
        {
            Id = "CLAIM-002",
            ClaimTicketNo = "CLM-2026-8809",
            ConsignmentNo = "ASK-LR-9890",
            ClientCorporateName = "Reliance Retail Logistics",
            ConsigneeName = "Reliance Hypermarket Distribution",
            DisputeReason = ClaimDisputeReason.ShortageCartons,
            Status = CargoClaimStatus.SettledDebitNote,
            InvoiceDeclaredValueInr = 1200000m,
            ClaimAmountDemandedInr = 14200m,
            SurveyorApprovedAmountInr = 14200m,
            DebitNoteDeductionInr = 14200m,
            DamageDescription = "3 Cartons of premium consumer goods missing upon unloading seal opening.",
            SurveyorName = "New India Assurance Surveyor"
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
        claim.Id = $"CLAIM-{DateTime.UtcNow.Ticks}";
        claim.ClaimTicketNo = $"CLM-2026-{Random.Shared.Next(8820, 9999)}";
        claim.LoggedDate = DateTime.UtcNow;
        claim.Status = CargoClaimStatus.Logged;
        _claims.Insert(0, claim);
        return Task.FromResult(claim);
    }

    public Task<CorporateCargoClaim?> SubmitSurveyorAssessmentAsync(string id, decimal approvedAmount, string surveyorReport)
    {
        var match = _claims.FirstOrDefault(c => c.Id == id);
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
        var match = _claims.FirstOrDefault(c => c.Id == id);
        if (match != null)
        {
            match.Status = CargoClaimStatus.SettledDebitNote;
            match.DebitNoteDeductionInr = debitNoteAmount;
        }
        return Task.FromResult(match);
    }
}
