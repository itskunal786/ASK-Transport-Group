namespace ASK.Group.Api.DTOs;

public sealed class ClientDashboardDto
{
    public int TotalBookings { get; set; }

    public int ActiveBookings { get; set; }

    public int DeliveredBookings { get; set; }

    public int CancelledBookings { get; set; }


    public int TotalShipments { get; set; }

    public int ActiveShipments { get; set; }

    public int DeliveredShipments { get; set; }


    public int PendingPayments { get; set; }

    public int SuccessfulPayments { get; set; }

    public decimal TotalAmountPaid { get; set; }


    public int UnreadNotifications { get; set; }


    public List<ClientRecentBookingDto> RecentBookings { get; set; }
        = new();

    public List<ClientRecentActivityDto> RecentActivity { get; set; }
        = new();
}


public sealed class ClientRecentBookingDto
{
    public int Id { get; set; }

    public string BookingNumber { get; set; }
        = string.Empty;

    public string Status { get; set; }
        = string.Empty;

    public string PaymentStatus { get; set; }
        = string.Empty;

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; }
}


public sealed class ClientRecentActivityDto
{
    public string Type { get; set; }
        = string.Empty;

    public string Reference { get; set; }
        = string.Empty;

    public string Status { get; set; }
        = string.Empty;

    public DateTime Date { get; set; }
}