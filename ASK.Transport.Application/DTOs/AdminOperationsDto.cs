namespace ASK.Group.Api.DTOs;

public class AdminOperationsSummaryDto
{
    public int TotalBookings { get; set; }
    public int PendingBookings { get; set; }
    public int ActiveBookings { get; set; }
    public int DeliveredBookings { get; set; }
    public int CancelledBookings { get; set; }

    public int TotalShipments { get; set; }
    public int InTransitShipments { get; set; }
    public int OutForDeliveryShipments { get; set; }
    public int DeliveredShipments { get; set; }
    public int FailedDeliveries { get; set; }

    public int TotalTrips { get; set; }
    public int ActiveTrips { get; set; }
    public int CompletedTrips { get; set; }

    public int AvailableDrivers { get; set; }
    public int AvailableVehicles { get; set; }

    public int PendingPayments { get; set; }
    public int SuccessfulPayments { get; set; }
    public int FailedPayments { get; set; }

    public decimal SuccessfulPaymentAmount { get; set; }
}