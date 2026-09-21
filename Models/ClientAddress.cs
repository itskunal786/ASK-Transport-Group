namespace ASK.Group.Api.Models;

public sealed class ClientAddress : BaseEntity
{
    public int UserId { get; set; }

    public string AddressType { get; set; } = "Delivery";

    public string ContactName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string AddressLine1 { get; set; } = string.Empty;

    public string? AddressLine2 { get; set; }

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string PostalCode { get; set; } = string.Empty;

    public string Country { get; set; } = "India";

    public bool IsDefault { get; set; }
}