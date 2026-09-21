using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientShipmentService
{
    private readonly AskTransportDbContext _db;
    private readonly SmartEtaService _smartEtaService;

    public ClientShipmentService(
        AskTransportDbContext db,
        SmartEtaService smartEtaService)
    {
        _db = db;
        _smartEtaService = smartEtaService;
    }


    public async Task<ClientShipmentListDto> GetMyShipmentsAsync(
        int userId,
        int page,
        int pageSize,
        string? search,
        string? status,
        DateTime? fromDate,
        DateTime? toDate,
        string? sortBy,
        string? sortOrder,
        CancellationToken cancellationToken = default)
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 10;
        }

        if (pageSize > 100)
        {
            pageSize = 100;
        }


        var query = _db.Shipments
            .AsNoTracking()
            .Where(x =>
                x.Booking != null &&
                x.Booking.UserId == userId);


        // Search by shipment number or booking number
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.ShipmentNumber.Contains(search) ||
                x.Booking!.BookingNumber.Contains(search));
        }


        // Status filter
        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();

            query = query.Where(x =>
                x.Status == status);
        }


        // From date
        if (fromDate.HasValue)
        {
            var from =
                fromDate.Value.Date;

            query = query.Where(x =>
                x.CreatedAt >= from);
        }


        // To date
        if (toDate.HasValue)
        {
            var to =
                toDate.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.CreatedAt < to);
        }


        var totalRecords =
            await query.CountAsync(
                cancellationToken);


        // Default sorting = newest first
        var descending =
            !string.Equals(
                sortOrder,
                "asc",
                StringComparison.OrdinalIgnoreCase);


        if (string.Equals(
            sortBy,
            "trackingNumber",
            StringComparison.OrdinalIgnoreCase))
        {
            query = descending
                ? query.OrderByDescending(
                    x => x.ShipmentNumber)
                : query.OrderBy(
                    x => x.ShipmentNumber);
        }
        else if (string.Equals(
            sortBy,
            "bookingNumber",
            StringComparison.OrdinalIgnoreCase))
        {
            query = descending
                ? query.OrderByDescending(
                    x => x.Booking!.BookingNumber)
                : query.OrderBy(
                    x => x.Booking!.BookingNumber);
        }
        else if (string.Equals(
            sortBy,
            "status",
            StringComparison.OrdinalIgnoreCase))
        {
            query = descending
                ? query.OrderByDescending(
                    x => x.Status)
                : query.OrderBy(
                    x => x.Status);
        }
        else
        {
            query = descending
                ? query.OrderByDescending(
                    x => x.CreatedAt)
                : query.OrderBy(
                    x => x.CreatedAt);
        }


        var data =
            await query
                .Skip(
                    (page - 1) * pageSize)
                .Take(pageSize)
                .Select(x =>
                    new ClientShipmentDto
                    {
                        Id = x.Id,

                        TrackingNumber =
                            x.ShipmentNumber,

                        BookingNumber =
                            x.Booking!.BookingNumber,

                        Status =
                            x.Status,

                        CurrentHubId =
                            x.CurrentHubId,

                        CreatedAt =
                            x.CreatedAt,

                        UpdatedAt =
                            x.UpdatedAt
                    })
                .ToListAsync(
                    cancellationToken);


        return new ClientShipmentListDto
        {
            Page = page,

            PageSize = pageSize,

            TotalRecords =
                totalRecords,

            TotalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize),

            Data = data
        };
    }


    public async Task<ClientShipmentDto?> GetShipmentAsync(
        int userId,
        string trackingNumber,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(
            trackingNumber))
        {
            return null;
        }

        trackingNumber =
            trackingNumber.Trim();


        return await _db.Shipments
            .AsNoTracking()
            .Where(x =>
                x.Booking != null &&
                x.Booking.UserId == userId &&
                x.ShipmentNumber == trackingNumber)
            .Select(x =>
                new ClientShipmentDto
                {
                    Id = x.Id,

                    TrackingNumber =
                        x.ShipmentNumber,

                    BookingNumber =
                        x.Booking!.BookingNumber,

                    Status =
                        x.Status,

                    CurrentHubId =
                        x.CurrentHubId,

                    CreatedAt =
                        x.CreatedAt,

                    UpdatedAt =
                        x.UpdatedAt
                })
            .FirstOrDefaultAsync(
                cancellationToken);
    }


    public async Task<List<ClientShipmentTimelineDto>?>
        GetTimelineAsync(
            int userId,
            string trackingNumber,
            CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(
            trackingNumber))
        {
            return null;
        }

        trackingNumber =
            trackingNumber.Trim();


        var shipment =
            await _db.Shipments
                .AsNoTracking()
                .Where(x =>
                    x.Booking != null &&
                    x.Booking.UserId == userId &&
                    x.ShipmentNumber ==
                        trackingNumber)
                .Select(x => new
                {
                    x.Id
                })
                .FirstOrDefaultAsync(
                    cancellationToken);


        if (shipment == null)
        {
            return null;
        }


        var timeline =
            await _db.ShipmentMovements
                .AsNoTracking()
                .Where(x =>
                    x.ShipmentId ==
                    shipment.Id)
                .OrderByDescending(
                    x => x.MovementDate)
                .Select(x =>
                    new ClientShipmentTimelineDto
                    {
                        Id = x.Id,

                        Status =
                            x.Status,

                        Location =
                            x.Location,

                        Remarks =
                            x.Description,

                        Date =
                            x.MovementDate
                    })
                .ToListAsync(
                    cancellationToken);


        return timeline;
    }


    public async Task<SmartEtaResult?> GetEtaAsync(
        int userId,
        string trackingNumber,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(
            trackingNumber))
        {
            return null;
        }

        trackingNumber =
            trackingNumber.Trim();


        var shipment =
            await _db.Shipments
                .AsNoTracking()
                .Where(x =>
                    x.Booking != null &&
                    x.Booking.UserId == userId &&
                    x.ShipmentNumber ==
                        trackingNumber)
                .Select(x => new
                {
                    x.Id,
                    x.Status,
                    x.DeliveredAt
                })
                .FirstOrDefaultAsync(
                    cancellationToken);


        if (shipment == null)
        {
            return null;
        }


        if (string.Equals(
            shipment.Status,
            "Delivered",
            StringComparison.OrdinalIgnoreCase))
        {
            return new SmartEtaResult
            {
                Success = true,

                Message =
                    "Shipment already delivered",

                Status =
                    shipment.Status,

                EstimatedArrivalAt =
                    shipment.DeliveredAt,

                ConfidenceScore =
                    100,

                CalculationMethod =
                    "Actual delivery time"
            };
        }


        var tripId =
            await _db.ShipmentMovements
                .AsNoTracking()
                .Where(x =>
                    x.ShipmentId ==
                        shipment.Id &&
                    x.TripId.HasValue)
                .OrderByDescending(
                    x => x.MovementDate)
                .Select(x =>
                    x.TripId)
                .FirstOrDefaultAsync(
                    cancellationToken);


        if (!tripId.HasValue)
        {
            return SmartEtaResult.Fail(
                "No active trip found for this shipment");
        }


        return await _smartEtaService
            .CalculateTripEtaAsync(
                tripId.Value,
                cancellationToken);
    }
}