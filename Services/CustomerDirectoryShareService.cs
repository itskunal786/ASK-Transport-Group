namespace ASK.Group.Api.Services;

using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;

public class CustomerDirectoryShareService : ICustomerDirectoryShareService
{
    private static readonly List<CustomerConsigneeDirectory> _directories =
    [
        new()
        {
            Id = "dir-1",
            CustomerId = "cust-default",
            ConsigneeLegalTitle = "Reliance Retail Ventures Limited",
            TradeBrandName = "Smart Bazaar CDC Bhiwandi",
            GstinNumber = "27AAACR4412K1ZX",
            CompleteAddress = "Shed #14-B, Renaissance Industrial Smart City, Vashere, Bhiwandi",
            DestinationCity = "Mumbai",
            Pincode = "421302",
            StateCode = "27",
            ContactPerson = "Anil Parab (Depot Incharge)",
            ContactPhone = "+91 98200 44102",
            ContactEmail = "bhiwandi.cdc@relianceretail.com",
            DockUnloadingInstructions = "Strict dock reporting between 08:00 AM - 02:00 PM. Palletized cargo only.",
            IsFavorite = true
        },
        new()
        {
            Id = "dir-2",
            CustomerId = "cust-default",
            ConsigneeLegalTitle = "Tata Consumer Products Regional Depot",
            TradeBrandName = "Tata Tea & Salt Aslali Logistics Hub",
            GstinNumber = "24AABCT9901M1ZQ",
            CompleteAddress = "Plot 88-92, National Highway 8, Aslali Circle",
            DestinationCity = "Ahmedabad",
            Pincode = "382427",
            StateCode = "24",
            ContactPerson = "Ketan Shah",
            ContactPhone = "+91 98980 11203",
            ContactEmail = "gujarat.logistics@tataconsumer.com",
            DockUnloadingInstructions = "Weighbridge gross tare verification mandatory at entry gate.",
            IsFavorite = true
        }
    ];

    private static readonly List<ShareableTrackingSession> _sessions =
    [
        new()
        {
            Id = "share-1",
            ConsignmentNo = "CN-99124-DEL",
            SecureAccessPin = "4812",
            ShareToken = "TRACK-WHT-99124-TOKEN",
            PublicUrlSlug = "ask-live-track-99124",
            ReceiverPartyName = "Reliance Retail Ventures Ltd",
            ReceiverPhone = "+91 98200 44102",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsActive = true
        }
    ];

    public Task<List<CustomerConsigneeDirectory>> GetConsigneeDirectoryAsync(string customerId)
    {
        return Task.FromResult(_directories);
    }

    public Task<CustomerConsigneeDirectory> AddConsigneeAsync(CustomerConsigneeDirectory entry)
    {
        _directories.Insert(0, entry);
        return Task.FromResult(entry);
    }

    public Task<CustomerConsigneeDirectory?> ToggleFavoriteAsync(string id)
    {
        var item = _directories.FirstOrDefault(d => d.Id == id);
        if (item != null)
        {
            item.IsFavorite = !item.IsFavorite;
        }
        return Task.FromResult(item);
    }

    public Task<ShareableTrackingSession> GenerateWhatsAppTrackSessionAsync(string consignmentNo, string receiverPhone, string receiverName)
    {
        var randomPin = Random.Shared.Next(1000, 9999).ToString();
        var token = $"TRACK-WHT-{consignmentNo.Replace("-", "")}-{Guid.NewGuid():N}"[..24];
        var session = new ShareableTrackingSession
        {
            ConsignmentNo = consignmentNo,
            ReceiverPhone = receiverPhone,
            ReceiverPartyName = receiverName,
            SecureAccessPin = randomPin,
            ShareToken = token,
            PublicUrlSlug = $"live-track-{token[..12]}",
            ExpiresAt = DateTime.UtcNow.AddDays(5),
            IsActive = true
        };
        _sessions.Insert(0, session);
        return Task.FromResult(session);
    }

    public Task<ShareableTrackingSession?> GetSessionByTokenAsync(string token, string? pin)
    {
        var item = _sessions.FirstOrDefault(s => s.ShareToken == token || s.PublicUrlSlug == token);
        if (item != null && !string.IsNullOrEmpty(pin) && item.SecureAccessPin != pin)
        {
            return Task.FromResult<ShareableTrackingSession?>(null);
        }
        return Task.FromResult(item);
    }
}
