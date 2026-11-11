using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/my/payments")]
public class MyPaymentsController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly OwnershipService _ownershipService;

    public MyPaymentsController(
        AskTransportDbContext db,
        OwnershipService ownershipService)
    {
        _db = db;
        _ownershipService =
            ownershipService;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Payments.View)]
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
                from payment in
                    _db.PaymentTransactions
                        .AsNoTracking()

                join booking in
                    _db.Bookings
                        .AsNoTracking()

                    on payment.BookingId
                    equals booking.Id

                where
                    booking.UserId ==
                    userId.Value

                orderby
                    payment.CreatedAt
                    descending

                select new
                {
                    payment.Id,
                    payment.TransactionId,
                    payment.BookingId,
                    booking.BookingNumber,
                    payment.Amount,
                    payment.PaymentStatus,
                    payment.PaymentMethod,
                    payment.CreatedAt,
                    payment.PaidAt
                }
            )
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("{id:int}")]
    [HasPermission(
        Permissions.Payments.View)]
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
                .CanAccessPaymentAsync(
                    userId.Value,
                    id);

        if (!allowed)
        {
            return Forbid();
        }

        var payment =
            await _db.PaymentTransactions
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (payment == null)
        {
            return NotFound(new
            {
                message =
                    "Payment not found"
            });
        }

        return Ok(payment);
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