using ASK.Group.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace ASK.Group.Api.Services;

public class RealtimeOperationsService
{
    private readonly IHubContext<OperationsHub> _hubContext;
    private readonly ILogger<RealtimeOperationsService> _logger;

    public RealtimeOperationsService(
        IHubContext<OperationsHub> hubContext,
        ILogger<RealtimeOperationsService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task BookingUpdatedAsync(
        string bookingNumber,
        object data,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(bookingNumber))
        {
            return;
        }

        var normalizedBookingNumber =
            NormalizeBookingNumber(bookingNumber);

        await _hubContext.Clients
            .Group(BookingGroup(normalizedBookingNumber))
            .SendAsync(
                "BookingUpdated",
                data,
                cancellationToken);

        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "BookingUpdated",
                data,
                cancellationToken);
    }

    public async Task BookingUpdatedAsync(
        int bookingId,
        string bookingNumber,
        string status,
        CancellationToken cancellationToken = default)
    {
        await BookingUpdatedAsync(
            bookingNumber,
            new
            {
                bookingId,
                bookingNumber,
                status,
                timestamp = DateTime.UtcNow
            },
            cancellationToken);
    }

    public async Task BookingStatusChangedAsync(
        int bookingId,
        string bookingNumber,
        string status,
        string? location = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(bookingNumber))
        {
            return;
        }

        var normalizedBookingNumber =
            NormalizeBookingNumber(bookingNumber);

        var data = new
        {
            bookingId,
            bookingNumber = normalizedBookingNumber,
            status,
            location,
            timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients
            .Group(BookingGroup(normalizedBookingNumber))
            .SendAsync(
                "BookingStatusChanged",
                data,
                cancellationToken);

        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "BookingStatusChanged",
                data,
                cancellationToken);
    }


    public async Task BookingStatusChangedAsync(
        string bookingNumber,
        string status,
        int bookingId,
        CancellationToken cancellationToken = default)
    {
        await BookingStatusChangedAsync(
            bookingId,
            bookingNumber,
            status,
            null,
            cancellationToken);
    }

    public async Task BookingStatusChangedAsync(
        string bookingNumber,
        string status,
        string? location = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(bookingNumber))
        {
            return;
        }

        var normalizedBookingNumber =
            NormalizeBookingNumber(bookingNumber);

        var data = new
        {
            bookingNumber = normalizedBookingNumber,
            status,
            location,
            timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients
            .Group(BookingGroup(normalizedBookingNumber))
            .SendAsync(
                "BookingStatusChanged",
                data,
                cancellationToken);

        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "BookingStatusChanged",
                data,
                cancellationToken);
    }

    public async Task BookingStatusChangedAsync(
        string bookingNumber,
        object data,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(bookingNumber))
        {
            return;
        }

        var normalizedBookingNumber =
            NormalizeBookingNumber(bookingNumber);

        await _hubContext.Clients
            .Group(BookingGroup(normalizedBookingNumber))
            .SendAsync(
                "BookingStatusChanged",
                data,
                cancellationToken);

        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "BookingStatusChanged",
                data,
                cancellationToken);
    }

    public async Task TrackingUpdatedAsync(
        int bookingId,
        string bookingNumber,
        string status,
        string? location = null,
        string? description = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(bookingNumber))
        {
            return;
        }

        var normalizedBookingNumber =
            NormalizeBookingNumber(bookingNumber);

        var data = new
        {
            bookingId,
            bookingNumber = normalizedBookingNumber,
            status,
            location,
            description,
            timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients
            .Group(BookingGroup(normalizedBookingNumber))
            .SendAsync(
                "TrackingUpdated",
                data,
                cancellationToken);

        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "TrackingUpdated",
                data,
                cancellationToken);
    }


    public async Task TrackingUpdatedAsync(
        string bookingNumber,
        string status,
        string? location,
        int bookingId,
        CancellationToken cancellationToken = default)
    {
        await TrackingUpdatedAsync(
            bookingId,
            bookingNumber,
            status,
            location,
            null,
            cancellationToken);
    }

    public async Task TrackingUpdatedAsync(
        string bookingNumber,
        string status,
        string? location = null,
        string? description = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(bookingNumber))
        {
            return;
        }

        var normalizedBookingNumber =
            NormalizeBookingNumber(bookingNumber);

        var data = new
        {
            bookingNumber = normalizedBookingNumber,
            status,
            location,
            description,
            timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients
            .Group(BookingGroup(normalizedBookingNumber))
            .SendAsync(
                "TrackingUpdated",
                data,
                cancellationToken);

        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "TrackingUpdated",
                data,
                cancellationToken);
    }

    public async Task TrackingUpdatedAsync(
        string bookingNumber,
        object data,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(bookingNumber))
        {
            return;
        }

        var normalizedBookingNumber =
            NormalizeBookingNumber(bookingNumber);

        await _hubContext.Clients
            .Group(BookingGroup(normalizedBookingNumber))
            .SendAsync(
                "TrackingUpdated",
                data,
                cancellationToken);

        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "TrackingUpdated",
                data,
                cancellationToken);
    }

    public async Task ShipmentUpdatedAsync(
        int shipmentId,
        string shipmentNumber,
        string status,
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "ShipmentUpdated",
                new
                {
                    shipmentId,
                    shipmentNumber,
                    status,
                    timestamp = DateTime.UtcNow
                },
                cancellationToken);
    }

    public async Task TripUpdatedAsync(
        int tripId,
        string tripNumber,
        string status,
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "TripUpdated",
                new
                {
                    tripId,
                    tripNumber,
                    status,
                    timestamp = DateTime.UtcNow
                },
                cancellationToken);
    }

    public async Task ShipmentScanRecordedAsync(
        int shipmentId,
        string shipmentNumber,
        string scanType,
        string? location,
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "ShipmentScanRecorded",
                new
                {
                    shipmentId,
                    shipmentNumber,
                    scanType,
                    location,
                    timestamp = DateTime.UtcNow
                },
                cancellationToken);
    }

    public async Task ExceptionUpdatedAsync(
        int exceptionId,
        string exceptionNumber,
        string status,
        string severity,
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "OperationsExceptionUpdated",
                new
                {
                    exceptionId,
                    exceptionNumber,
                    status,
                    severity,
                    timestamp = DateTime.UtcNow
                },
                cancellationToken);
    }

    public async Task SystemAlertAsync(
        string title,
        string message,
        string severity = "High")
    {
        severity =
            string.IsNullOrWhiteSpace(severity)
                ? "High"
                : severity.Trim();

        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                "SystemAlert",
                new
                {
                    title,
                    message,
                    severity,
                    timestamp = DateTime.UtcNow
                });

        _logger.LogInformation(
            "Realtime system alert sent. Title: {Title}, Severity: {Severity}",
            title,
            severity);
    }

    public async Task UserNotificationAsync(
        int userId,
        string eventName,
        object data,
        CancellationToken cancellationToken = default)
    {
        if (userId <= 0 ||
            string.IsNullOrWhiteSpace(eventName))
        {
            return;
        }

        await _hubContext.Clients
            .Group(UserGroup(userId))
            .SendAsync(
                eventName,
                data,
                cancellationToken);
    }

    public async Task OperationsEventAsync(
        string eventName,
        object data,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(eventName))
        {
            return;
        }

        await _hubContext.Clients
            .Group("operations")
            .SendAsync(
                eventName,
                data,
                cancellationToken);
    }

    private static string NormalizeBookingNumber(
        string bookingNumber)
    {
        return bookingNumber
            .Trim()
            .ToUpperInvariant();
    }

    private static string BookingGroup(
        string bookingNumber)
    {
        return $"booking:{bookingNumber}";
    }

    private static string UserGroup(
        int userId)
    {
        return $"user:{userId}";
    }
}
