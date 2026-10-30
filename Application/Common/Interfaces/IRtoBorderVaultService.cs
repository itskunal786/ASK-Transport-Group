using ASK.Group.Api.Domain.Entities;

namespace ASK.Group.Api.Application.Common.Interfaces;

public interface IRtoBorderVaultService
{
    Task<List<RtoBorderInspectionDossier>> GetDossiersAsync();
    Task<RtoBorderInspectionDossier?> GetDossierByVehicleAsync(string vehicleNumber);
    Task<RtoBorderInspectionDossier?> VerifyDossierByTokenAsync(string token);
}
