using ASK.Group.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class SmartEtaService
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    public SmartEtaService(
        AskTransportDbContext db,
        AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    public async Task<SmartEtaResult> CalculateTripEtaAsync(
        int tripId,
        CancellationToken cancellationToken = default)
    {
        var trip = await _db.TransportTrips
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == tripId,
                cancellationToken);

        if (trip == null)
        {
            return SmartEtaResult.Fail(
                "Trip not found");
        }

        if (string.Equals(
            trip.Status,
            "Completed",
            StringComparison.OrdinalIgnoreCase))
        {
            if (trip.ActualArrivalAt.HasValue)
            {
                return new SmartEtaResult
                {
                    Success = true,
                    Message = "Trip already completed",
                    TripId = trip.Id,
                    TripNumber = trip.TripNumber,
                    EstimatedArrivalAt =
                        trip.ActualArrivalAt.Value,
                    ConfidenceScore = 100,
                    CalculationMethod =
                        "Actual arrival time",
                    HistoricalTripsUsed = 0
                };
            }

            return SmartEtaResult.Fail(
                "Trip is completed but actual arrival time is unavailable");
        }

        if (string.Equals(
            trip.Status,
            "Cancelled",
            StringComparison.OrdinalIgnoreCase))
        {
            return SmartEtaResult.Fail(
                "Cancelled trip does not require ETA calculation");
        }

        var historicalTrips =
            await _db.TransportTrips
                .AsNoTracking()
                .Where(x =>
                    x.Id != trip.Id &&
                    x.FromHubId == trip.FromHubId &&
                    x.ToHubId == trip.ToHubId &&
                    x.ActualDepartureAt.HasValue &&
                    x.ActualArrivalAt.HasValue &&
                    x.Status == "Completed")
                .OrderByDescending(x =>
                    x.ActualArrivalAt)
                .Take(20)
                .Select(x => new
                {
                    Departure =
                        x.ActualDepartureAt!.Value,

                    Arrival =
                        x.ActualArrivalAt!.Value
                })
                .ToListAsync(
                    cancellationToken);

        var validHistoricalTrips =
            historicalTrips
                .Where(x =>
                    x.Arrival > x.Departure)
                .ToList();

        double estimatedHours;
        string calculationMethod;
        int confidenceScore;

        if (validHistoricalTrips.Count >= 3)
        {
            var durations =
                validHistoricalTrips
                    .Select(x =>
                        (x.Arrival - x.Departure)
                            .TotalHours)
                    .OrderBy(x => x)
                    .ToList();

            estimatedHours =
                CalculateWeightedAverage(
                    durations);

            calculationMethod =
                "Historical route intelligence";

            confidenceScore =
                CalculateConfidence(
                    validHistoricalTrips.Count);
        }
        else if (
            trip.ExpectedArrivalAt.HasValue &&
            trip.ExpectedArrivalAt.Value >
            trip.PlannedDepartureAt)
        {
            estimatedHours =
                (trip.ExpectedArrivalAt.Value -
                 trip.PlannedDepartureAt)
                .TotalHours;

            calculationMethod =
                "Existing trip schedule";

            confidenceScore =
                60;
        }
        else
        {
            estimatedHours =
                6;

            calculationMethod =
                "System fallback estimate";

            confidenceScore =
                35;
        }

        estimatedHours =
            ApplyOperationalAdjustment(
                estimatedHours,
                trip.TotalWeight,
                trip.TotalShipments);

        var departureTime =
            ResolveDepartureTime(
                trip.ActualDepartureAt,
                trip.PlannedDepartureAt);

        var estimatedArrival =
            departureTime.AddHours(
                estimatedHours);

        var delayMinutes =
            CalculateDelayMinutes(
                trip.ExpectedArrivalAt,
                estimatedArrival);

        var delayStatus =
            GetDelayStatus(
                delayMinutes);

        return new SmartEtaResult
        {
            Success = true,

            Message =
                "Smart ETA calculated successfully",

            TripId =
                trip.Id,

            TripNumber =
                trip.TripNumber,

            FromHubId =
                trip.FromHubId,

            ToHubId =
                trip.ToHubId,

            Status =
                trip.Status,

            DepartureTime =
                departureTime,

            EstimatedArrivalAt =
                estimatedArrival,

            ExistingExpectedArrivalAt =
                trip.ExpectedArrivalAt,

            EstimatedTravelHours =
                Math.Round(
                    estimatedHours,
                    2),

            DelayMinutes =
                delayMinutes,

            DelayStatus =
                delayStatus,

            ConfidenceScore =
                confidenceScore,

            CalculationMethod =
                calculationMethod,

            HistoricalTripsUsed =
                validHistoricalTrips.Count
        };
    }

    public async Task<SmartEtaResult> CalculateAndUpdateTripEtaAsync(
        int tripId,
        int? performedByUserId = null,
        CancellationToken cancellationToken = default)
    {
        var result =
            await CalculateTripEtaAsync(
                tripId,
                cancellationToken);

        if (!result.Success ||
            !result.EstimatedArrivalAt.HasValue)
        {
            return result;
        }

        var trip =
            await _db.TransportTrips
                .FirstOrDefaultAsync(
                    x => x.Id == tripId,
                    cancellationToken);

        if (trip == null)
        {
            return SmartEtaResult.Fail(
                "Trip not found");
        }

        trip.ExpectedArrivalAt =
            result.EstimatedArrivalAt.Value;

        trip.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync(
            cancellationToken);

        await _auditService.LogAsync(
            "SMART_ETA_UPDATED",
            $"Smart ETA updated for trip {trip.TripNumber} to {result.EstimatedArrivalAt:O}",
            performedByUserId);

        result.Message =
            "Smart ETA calculated and saved successfully";

        result.Saved =
            true;

        return result;
    }

    public async Task<List<SmartEtaResult>>
        GetActiveTripEtasAsync(
            CancellationToken cancellationToken = default)
    {
        var tripIds =
            await _db.TransportTrips
                .AsNoTracking()
                .Where(x =>
                    x.Status != "Completed" &&
                    x.Status != "Cancelled")
                .OrderBy(x =>
                    x.PlannedDepartureAt)
                .Select(x =>
                    x.Id)
                .Take(100)
                .ToListAsync(
                    cancellationToken);

        var results =
            new List<SmartEtaResult>();

        foreach (var tripId in tripIds)
        {
            var eta =
                await CalculateTripEtaAsync(
                    tripId,
                    cancellationToken);

            if (eta.Success)
            {
                results.Add(
                    eta);
            }
        }

        return results;
    }

    private static DateTime ResolveDepartureTime(
        DateTime? actualDepartureAt,
        DateTime plannedDepartureAt)
    {
        if (actualDepartureAt.HasValue)
        {
            return actualDepartureAt.Value;
        }

        if (plannedDepartureAt <
            DateTime.UtcNow)
        {
            return DateTime.UtcNow;
        }

        return plannedDepartureAt;
    }

    private static double CalculateWeightedAverage(
        List<double> durations)
    {
        if (durations.Count == 0)
        {
            return 6;
        }

        if (durations.Count <= 2)
        {
            return durations.Average();
        }

        var trimmed =
            durations
                .Skip(1)
                .Take(
                    durations.Count - 2)
                .ToList();

        if (trimmed.Count == 0)
        {
            return durations.Average();
        }

        return trimmed.Average();
    }

    private static int CalculateConfidence(
        int historicalTrips)
    {
        if (historicalTrips >= 15)
        {
            return 95;
        }

        if (historicalTrips >= 10)
        {
            return 90;
        }

        if (historicalTrips >= 7)
        {
            return 85;
        }

        if (historicalTrips >= 5)
        {
            return 80;
        }

        if (historicalTrips >= 3)
        {
            return 70;
        }

        return 50;
    }

    private static double ApplyOperationalAdjustment(
        double hours,
        decimal totalWeight,
        int totalShipments)
    {
        var adjustedHours =
            hours;

        if (totalWeight >= 10000)
        {
            adjustedHours *=
                1.10;
        }
        else if (totalWeight >= 5000)
        {
            adjustedHours *=
                1.05;
        }

        if (totalShipments >= 100)
        {
            adjustedHours *=
                1.08;
        }
        else if (totalShipments >= 50)
        {
            adjustedHours *=
                1.04;
        }

        if (adjustedHours < 0.5)
        {
            adjustedHours =
                0.5;
        }

        return adjustedHours;
    }

    private static int CalculateDelayMinutes(
        DateTime? existingExpectedArrival,
        DateTime smartEta)
    {
        if (!existingExpectedArrival.HasValue)
        {
            return 0;
        }

        var difference =
            smartEta -
            existingExpectedArrival.Value;

        return (int)Math.Round(
            difference.TotalMinutes);
    }

    private static string GetDelayStatus(
        int delayMinutes)
    {
        if (delayMinutes <= 15)
        {
            return "On Time";
        }

        if (delayMinutes <= 60)
        {
            return "Minor Delay";
        }

        if (delayMinutes <= 180)
        {
            return "Delayed";
        }

        return "Critical Delay";
    }
}

public class SmartEtaResult
{
    public bool Success { get; set; }

    public string Message { get; set; } =
        string.Empty;

    public bool Saved { get; set; }

    public int? TripId { get; set; }

    public string? TripNumber { get; set; }

    public int? FromHubId { get; set; }

    public int? ToHubId { get; set; }

    public string? Status { get; set; }

    public DateTime? DepartureTime { get; set; }

    public DateTime? EstimatedArrivalAt { get; set; }

    public DateTime? ExistingExpectedArrivalAt { get; set; }

    public double? EstimatedTravelHours { get; set; }

    public int DelayMinutes { get; set; }

    public string DelayStatus { get; set; } =
        "On Time";

    public int ConfidenceScore { get; set; }

    public string CalculationMethod { get; set; } =
        string.Empty;

    public int HistoricalTripsUsed { get; set; }

    public static SmartEtaResult Fail(
        string message)
    {
        return new SmartEtaResult
        {
            Success = false,
            Message = message
        };
    }
}