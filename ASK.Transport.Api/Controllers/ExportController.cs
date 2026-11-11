using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly CsvExportService _csvExportService;
    private readonly AuditService _auditService;

    public ExportController(
        AskTransportDbContext db,
        CsvExportService csvExportService,
        AuditService auditService)
    {
        _db = db;
        _csvExportService =
            csvExportService;
        _auditService =
            auditService;
    }

    [HttpGet("bookings.csv")]
    [HasPermission(
        Permissions.Reports.Export)]
    public async Task<IActionResult>
        ExportBookings(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
    {
        var query =
            _db.Bookings
                .AsNoTracking()
                .AsQueryable();

        if (fromDate.HasValue)
        {
            query = query.Where(x =>
                x.CreatedAt >=
                fromDate.Value);
        }

        if (toDate.HasValue)
        {
            var endDate =
                toDate.Value.Date
                    .AddDays(1);

            query = query.Where(x =>
                x.CreatedAt <
                endDate);
        }

        var rows =
            await query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x =>
                    new BookingExportRow
                    {
                        BookingNumber =
                            x.BookingNumber,

                        SenderName =
                            x.SenderName,

                        ReceiverName =
                            x.ReceiverName,

                        FromCity =
                            x.FromCity,

                        ToCity =
                            x.ToCity,

                        Weight =
                            x.Weight,

                        TotalAmount =
                            x.TotalAmount,

                        BookingStatus =
                            x.BookingStatus,

                        PaymentStatus =
                            x.PaymentStatus,

                        CreatedAt =
                            x.CreatedAt
                    })
                .ToListAsync();

        var bytes =
            _csvExportService
                .Generate(rows);

        await _auditService.LogAsync(
            "BOOKING_REPORT_EXPORTED",
            $"{rows.Count} booking records exported");

        return File(
            bytes,
            "text/csv",
            $"bookings-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }
}