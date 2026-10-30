using ASK.Group.Api.Domain.Entities;

namespace ASK.Group.Api.Application.Common.Interfaces;

public interface IDockYardGatePassService
{
    Task<List<DockBay>> GetDockBaysAsync();
    Task<List<GatePassRecord>> GetGatePassesAsync();
    Task<GatePassRecord> GenerateGateInPassAsync(GatePassRecord newPass);
    Task<GatePassRecord?> ExpediteDockLoadingAsync(string passId);
    Task<GatePassRecord?> AuthorizeGateOutAsync(string passId);
}
