using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public ReportsController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet("summary")]
    [HasPermission(Permissions.Reports.View)]
    public async Task<IActionResult> Summary(
        CancellationToken cancellationToken)
    {
        var totalBookings =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    cancellationToken);

        var deliveredBookings =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.BookingStatus ==
                        "Delivered",
                    cancellationToken);

        var cancelledBookings =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.BookingStatus ==
                        "Cancelled",
                    cancellationToken);

        var totalRevenue =
            await _db.PaymentTransactions
                .AsNoTracking()
                .Where(x =>
                    x.PaymentStatus ==
                    "Success")
                .SumAsync(
                    x =>
                        (decimal?)x.Amount,
                    cancellationToken)
            ?? 0;

        var pendingPayments =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.PaymentStatus !=
                        "Paid",
                    cancellationToken);

        return Ok(new
        {
            totalBookings,
            deliveredBookings,
            cancelledBookings,
            pendingPayments,
            totalRevenue,
            generatedAt =
                DateTime.UtcNow
        });
    }

    [HttpGet("bookings")]
    [HasPermission(Permissions.Reports.View)]
    public async Task<IActionResult> BookingReport(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var query =
            _db.Bookings
                .AsNoTracking()
                .AsQueryable();

        if (fromDate.HasValue)
        {
            query =
                query.Where(x =>
                    x.CreatedAt >=
                    fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query =
                query.Where(x =>
                    x.CreatedAt <=
                    toDate.Value);
        }

        var data =
            await query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x => new
                {
                    x.BookingNumber,
                    x.FromCity,
                    x.ToCity,
                    x.BookingStatus,
                    x.PaymentStatus,
                    x.TotalAmount,
                    x.CreatedAt
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(data);
    }

    [HttpGet("bookings/export")]
    [HasPermission(Permissions.Reports.Export)]
    public async Task<IActionResult> ExportBookings(
        CancellationToken cancellationToken)
    {
        var bookings =
            await _db.Bookings
                .AsNoTracking()
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x => new
                {
                    x.BookingNumber,
                    x.FromCity,
                    x.ToCity,
                    x.BookingStatus,
                    x.PaymentStatus,
                    x.TotalAmount,
                    x.CreatedAt
                })
                .ToListAsync(
                    cancellationToken);

        var csv =
            new StringBuilder();

        csv.AppendLine(
            "BookingNumber,FromCity,ToCity,BookingStatus,PaymentStatus,TotalAmount,CreatedAt");

        foreach (var item in bookings)
        {
            csv.AppendLine(
                $"{Escape(item.BookingNumber)}," +
                $"{Escape(item.FromCity)}," +
                $"{Escape(item.ToCity)}," +
                $"{Escape(item.BookingStatus)}," +
                $"{Escape(item.PaymentStatus)}," +
                $"{item.TotalAmount}," +
                $"{item.CreatedAt:O}");
        }

        var bytes =
            Encoding.UTF8.GetBytes(
                csv.ToString());

        return File(
            bytes,
            "text/csv",
            $"booking-report-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    private static string Escape(
        string? value)
    {
        value ??= "";

        if (value.Contains(',') ||
            value.Contains('"') ||
            value.Contains('\n'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }
}