namespace ASK.Group.Api.Models;

public class TripShipment
{
    public int Id { get; set; }

    public int TripId { get; set; }

    public TransportTrip? Trip { get; set; }

    public int ShipmentId { get; set; }

    public Shipment? Shipment { get; set; }

    public DateTime AssignedAt { get; set; } =
        DateTime.UtcNow;
}