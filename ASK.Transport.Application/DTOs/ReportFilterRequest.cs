namespace ASK.Group.Api.DTOs;

public class ReportFilterRequest
{
    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public int? BranchId { get; set; }

    public int? HubId { get; set; }

    public string? BookingStatus { get; set; }

    public string? PaymentStatus { get; set; }

    public string? ServiceType { get; set; }
}