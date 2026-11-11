using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/my/invoices")]
public class MyInvoicesController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly OwnershipService _ownershipService;

    public MyInvoicesController(
        AskTransportDbContext db,
        OwnershipService ownershipService)
    {
        _db = db;
        _ownershipService =
            ownershipService;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Invoices.View)]
    public async Task<IActionResult> GetAll()
    {
        var userId =
            GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var data =
            await (
                from invoice in _db.Invoices.AsNoTracking()
                join booking in _db.Bookings.AsNoTracking()
                    on invoice.BookingId equals booking.Id
                where booking.UserId == userId.Value
                orderby invoice.CreatedAt descending
                select new
                {
                    invoice.Id,
                    invoice.InvoiceNumber,
                    invoice.BookingId,
                    booking.BookingNumber,
                    invoice.TotalAmount,
                    invoice.PaymentStatus,
                    invoice.CreatedAt
                }
            )
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("{id:int}")]
    [HasPermission(
        Permissions.Invoices.View)]
    public async Task<IActionResult> Get(
        int id)
    {
        var userId =
            GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var allowed =
            await _ownershipService
                .CanAccessInvoiceAsync(
                    userId.Value,
                    id);

        if (!allowed)
        {
            return Forbid();
        }

        var invoice =
            await _db.Invoices
                .AsNoTracking()
                .Include(x =>
                    x.InvoiceItems)
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (invoice == null)
        {
            return NotFound(new
            {
                message =
                    "Invoice not found"
            });
        }

        return Ok(invoice);
    }

    private int? GetCurrentUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(
            value,
            out var userId)
            ? userId
            : null;
    }
}