using ASK.Group.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class ShipmentStatusService
{
    private readonly AskTransportDbContext _db;

    private static readonly Dictionary<string, string[]>
        AllowedTransitions =
            new(StringComparer.OrdinalIgnoreCase)
            {
                ["Created"] =
                    ["Picked Up", "Cancelled"],

                ["Picked Up"] =
                    ["At Hub", "In Transit"],

                ["At Hub"] =
                    ["In Transit"],

                ["In Transit"] =
                    ["At Hub", "Out for Delivery"],

                ["Out for Delivery"] =
                    ["Delivered", "Delivery Failed"],

                ["Delivery Failed"] =
                    ["Out for Delivery"],

                ["Delivered"] = [],

                ["Cancelled"] = []
            };

    public ShipmentStatusService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<ShipmentStatusResult>
        ChangeStatusAsync(
            int shipmentId,
            string newStatus,
            int? hubId,
            string? remarks)
    {
        if (shipmentId <= 0)
        {
            return Fail(
                "Invalid shipment");
        }

        if (string.IsNullOrWhiteSpace(newStatus))
        {
            return Fail(
                "Shipment status is required");
        }

        if (hubId.HasValue &&
            hubId.Value <= 0)
        {
            return Fail(
                "Invalid hub");
        }

        newStatus = newStatus.Trim();

        if (!AllowedTransitions.ContainsKey(
                newStatus))
        {
            return Fail(
                "Invalid shipment status");
        }

        if (!string.IsNullOrWhiteSpace(remarks) &&
            remarks.Trim().Length > 500)
        {
            return Fail(
                "Remarks cannot exceed 500 characters");
        }

        var shipment =
            await _db.Shipments
                .FirstOrDefaultAsync(x =>
                    x.Id == shipmentId);

        if (shipment == null)
        {
            return Fail(
                "Shipment not found");
        }

        var currentStatus =
            shipment.Status;

        if (string.Equals(
                currentStatus,
                newStatus,
                StringComparison.OrdinalIgnoreCase))
        {
            return new ShipmentStatusResult
            {
                Success = true,
                ShipmentId = shipment.Id,
                Status = shipment.Status,
                Message =
                    "Shipment already has this status"
            };
        }

        if (!AllowedTransitions.TryGetValue(
                currentStatus,
                out var allowedStatuses))
        {
            return Fail(
                $"Unknown current shipment status: {currentStatus}");
        }

        if (!allowedStatuses.Contains(
                newStatus,
                StringComparer.OrdinalIgnoreCase))
        {
            return Fail(
                $"Shipment cannot move from {currentStatus} to {newStatus}");
        }

        if (hubId.HasValue)
        {
            var hubExists =
                await _db.Hubs
                    .AnyAsync(x =>
                        x.Id == hubId.Value);

            if (!hubExists)
            {
                return Fail(
                    "Hub not found");
            }

            shipment.CurrentHubId =
                hubId.Value;
        }

        shipment.Status =
            newStatus;

        shipment.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new ShipmentStatusResult
        {
            Success = true,
            ShipmentId = shipment.Id,
            Status = shipment.Status,
            Message =
                "Shipment status updated successfully"
        };
    }

    private static ShipmentStatusResult Fail(
        string message)
    {
        return new ShipmentStatusResult
        {
            Success = false,
            Message = message
        };
    }
}

public class ShipmentStatusResult
{
    public bool Success { get; set; }

    public int ShipmentId { get; set; }

    public string? Status { get; set; }

    public string Message { get; set; }
        = string.Empty;
}