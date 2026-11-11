using ASK.Group.Api.Domain.Entities;

namespace ASK.Group.Api.Application.Common.Interfaces;

public interface ITyreManagementService
{
    Task<List<TruckTyreFleet>> GetFleetTyresAsync();
    Task<TruckTyreFleet?> GetTruckTyresAsync(string plateNo);
    Task<TyreRecord?> InflateAndCalibrateTyreAsync(string plateNo, string tyreId, double targetPsi = 118);
    Task<TyreRecord?> DispatchTyreForColdRetreadAsync(string plateNo, string tyreId);
}
