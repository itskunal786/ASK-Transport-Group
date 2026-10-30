namespace ASK.Group.Api.Application.Common.Interfaces;

using ASK.Group.Api.Domain.Entities;

public interface ICustomerDirectoryShareService
{
    Task<List<CustomerConsigneeDirectory>> GetConsigneeDirectoryAsync(string customerId);
    Task<CustomerConsigneeDirectory> AddConsigneeAsync(CustomerConsigneeDirectory entry);
    Task<CustomerConsigneeDirectory?> ToggleFavoriteAsync(string id);
    Task<ShareableTrackingSession> GenerateWhatsAppTrackSessionAsync(string consignmentNo, string receiverPhone, string receiverName);
    Task<ShareableTrackingSession?> GetSessionByTokenAsync(string token, string? pin);
}
