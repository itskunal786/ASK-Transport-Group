using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class PaymentController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public PaymentController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    // Customer online payments must use:
    // POST /api/Razorpay/create-order
    // POST /api/Razorpay/verify
    //
    // Direct payment creation is intentionally blocked
    // so payment status cannot bypass Razorpay verification.
    [HttpPost]
    public IActionResult Pay()
    {
        return BadRequest(new
        {
            message =
                "Direct payment is disabled. Please use Razorpay checkout."
        });
    }


    [HttpGet("my")]
    public async Task<IActionResult> GetMyPayments()
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var payments =
            await _db.PaymentTransactions
                .Where(x =>
                    x.Booking.UserId == userId.Value)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x => new
                {
                    x.Id,
                    x.Booking.BookingNumber,
                    x.TransactionId,
                    x.Amount,
                    x.PaymentMethod,
                    x.PaymentStatus,
                    x.RazorpayOrderId,
                    x.RazorpayPaymentId,
                    x.PaidAt,
                    x.CreatedAt
                })
                .ToListAsync();

        return Ok(payments);
    }
    [HttpGet("booking/{bookingNumber}")]
    public async Task<IActionResult> GetPayments(
        string bookingNumber)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                    bookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        if (!User.IsInRole("Admin") &&
            booking.UserId != userId.Value)
        {
            return Forbid();
        }

        var payments =
            await _db.PaymentTransactions
                .Where(x =>
                    x.BookingId ==
                    booking.Id)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x => new
                {
                    x.Id,
                    x.TransactionId,
                    x.Amount,
                    x.PaymentMethod,
                    x.PaymentStatus,
                    x.PaymentMessage,
                    x.RazorpayOrderId,
                    x.RazorpayPaymentId,
                    x.PaidAt,
                    x.CreatedAt
                })
                .ToListAsync();

        return Ok(payments);
    }

    private int? GetUserId()
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

