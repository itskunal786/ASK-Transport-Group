namespace ASK.Group.Api.DTOs;

public class DashboardKpiResponse
{
    public int TotalBookings { get; set; }

    public int ActiveShipments { get; set; }

    public int DeliveredBookings { get; set; }

    public int CancelledBookings { get; set; }

    public int PendingPayments { get; set; }

    public int AvailableDrivers { get; set; }

    public int AvailableVehicles { get; set; }

    public int ActiveTrips { get; set; }

    public decimal TotalRevenue { get; set; }

    public decimal TotalRefunds { get; set; }

    public decimal NetRevenue { get; set; }

    public decimal DeliverySuccessRate { get; set; }

    public decimal VehicleUtilizationRate { get; set; }

    public decimal DriverUtilizationRate { get; set; }
}