using ASK.Group.Api.Domain.Entities;

namespace ASK.Group.Api.Application.Common.Interfaces;

public interface ICorporateCargoClaimsService
{
    Task<List<CorporateCargoClaim>> GetClaimsAsync();
    Task<CorporateCargoClaim?> GetClaimByIdAsync(string id);
    Task<CorporateCargoClaim> FileClaimAsync(CorporateCargoClaim claim);
    Task<CorporateCargoClaim?> SubmitSurveyorAssessmentAsync(string id, decimal approvedAmount, string surveyorReport);
    Task<CorporateCargoClaim?> SettleClaimAsync(string id, decimal debitNoteAmount);
}
