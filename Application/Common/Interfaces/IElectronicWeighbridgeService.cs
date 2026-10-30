using ASK.Group.Api.Domain.Entities;

namespace ASK.Group.Api.Application.Common.Interfaces;

public interface IElectronicWeighbridgeService
{
    Task<List<WeighbridgeSlip>> GetWeighbridgeSlipsAsync();
    Task<WeighbridgeSlip?> GetSlipByNumberAsync(string slipNumber);
    Task<WeighbridgeSlip> RecordWeighmentAsync(WeighbridgeSlip slip);
    Task<WeighbridgeSlip?> AuthorizeCrossDockDeLoadAsync(string slipId);
}
