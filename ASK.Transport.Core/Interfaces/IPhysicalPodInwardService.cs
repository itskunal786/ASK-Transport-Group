namespace ASK.Group.Api.Application.Common.Interfaces;

using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

public interface IPhysicalPodInwardService
{
    Task<List<PhysicalPodInwardReceipt>> GetPendingPodReceiptsAsync();
    Task<PhysicalPodInwardReceipt?> ScanAndVerifyBarcodeAsync(string barcodeOrBiltyNo, string operatorName);
    Task<PhysicalPodInwardReceipt?> ReleaseTransporterPaymentAsync(string id, string transactionRef);
    Task<List<EmergencyTransshipmentRescue>> GetActiveTransshipmentsAsync();
    Task<EmergencyTransshipmentRescue> CreateTransshipmentRescueAsync(EmergencyTransshipmentRescue rescue);
}
