using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RefundController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly RefundService _refundService;

    public RefundController(
        AskTransportDbContext db,
        RefundService refundService)
    {
        _db = db;
        _refundService = refundService;
    }

    [HttpPost]
    [HasPermission(Permissions.Payments.Refund)]
    public async Task<IActionResult> Create(
        CreateRefundRequest request)
    {
        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                    request.BookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        if (booking.PaymentStatus != "Paid" &&
            booking.PaymentStatus !=
                "Partially Refunded")
        {
            return BadRequest(new
            {
                message =
                    "Booking is not eligible for refund"
            });
        }

        try
        {
            var refund =
                await _refundService
                    .RefundAsync(
                        booking,
                        request.Amount,
                        request.Reason);

            return Ok(new
            {
                message =
                    "Refund processed successfully",

                refund
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet]
    [HasPermission(Permissions.Payments.ViewRefunds)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        page = page < 1 ? 1 : page;
        pageSize =
            pageSize < 1 ? 25 : pageSize;
        pageSize =
            pageSize > 100 ? 100 : pageSize;

        var query =
            _db.PaymentRefunds
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();

            query = query.Where(x =>
                x.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.RefundNumber.Contains(search) ||
                (x.Booking != null &&
                 x.Booking.BookingNumber.Contains(search)));
        }

        var totalRecords =
            await query.CountAsync();

        var data =
            await query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.RefundNumber,
                    x.RazorpayRefundId,

                    BookingNumber =
                        x.Booking != null
                            ? x.Booking.BookingNumber
                            : "",

                    x.Amount,
                    x.Status,
                    x.Reason,
                    x.GatewayMessage,
                    x.RefundedAt,
                    x.CreatedAt
                })
                .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            totalRecords,

            totalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize),

            data
        });
    }
}