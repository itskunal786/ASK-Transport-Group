using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly InvoiceService _invoiceService;
    private readonly EmailService _emailService;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;
    private readonly IConfiguration _configuration;

    public InvoiceController(
        AskTransportDbContext db,
        InvoiceService invoiceService,
        EmailService emailService,
        NotificationService notificationService,
        AuditService auditService,
        IConfiguration configuration)
    {
        _db =
            db;

        _invoiceService =
            invoiceService;

        _emailService =
            emailService;

        _notificationService =
            notificationService;

        _auditService =
            auditService;

        _configuration =
            configuration;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateInvoiceRequest request)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var booking =
            await _db.Bookings
                .Include(x => x.User)
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

        if (!User.IsInRole("Admin") &&
            booking.UserId != userId.Value)
        {
            return Forbid();
        }

        var existingInvoice =
            await _db.Invoices
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                    booking.Id);

        var invoice =
            await _invoiceService
                .CreateInvoiceAsync(
                    booking);

        if (existingInvoice == null)
        {
            await _notificationService
                .CreateInvoiceAsync(
                    booking,
                    invoice.InvoiceNumber);

            await _auditService.LogAsync(
                "INVOICE_GENERATED",
                $"Invoice {invoice.InvoiceNumber} generated for booking {booking.BookingNumber}",
                booking.UserId,
                booking.User?.Email);
        }

        return Ok(new
        {
            message =
                existingInvoice == null
                    ? "Invoice generated successfully"
                    : "Invoice already exists",

            invoice = new
            {
                invoice.Id,
                invoice.InvoiceNumber,
                booking.BookingNumber,
                invoice.InvoiceDate,
                invoice.SubTotal,
                invoice.GstPercentage,
                invoice.GstAmount,
                invoice.DiscountAmount,
                invoice.TotalAmount,
                invoice.PaymentStatus,

                items =
                    invoice.InvoiceItems
            }
        });
    }

    [HttpGet("{invoiceNumber}")]
    public async Task<IActionResult> GetInvoice(
        string invoiceNumber)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var invoice =
            await _db.Invoices
                .Include(x =>
                    x.InvoiceItems)
                .Include(x =>
                    x.Booking)
                    .ThenInclude(x =>
                        x!.TransportService)
                .FirstOrDefaultAsync(x =>
                    x.InvoiceNumber ==
                    invoiceNumber);

        if (invoice == null)
        {
            return NotFound(new
            {
                message =
                    "Invoice not found"
            });
        }

        if (invoice.Booking == null)
        {
            return BadRequest(new
            {
                message =
                    "Booking information is missing"
            });
        }

        if (!User.IsInRole("Admin") &&
            invoice.Booking.UserId !=
            userId.Value)
        {
            return Forbid();
        }

        return Ok(new
        {
            invoice.Id,
            invoice.InvoiceNumber,
            invoice.InvoiceDate,

            booking = new
            {
                invoice.Booking.BookingNumber,
                invoice.Booking.SenderName,
                invoice.Booking.SenderPhone,
                invoice.Booking.ReceiverName,
                invoice.Booking.ReceiverPhone,
                invoice.Booking.FromCity,
                invoice.Booking.FromState,
                invoice.Booking.ToCity,
                invoice.Booking.ToState,
                invoice.Booking.GoodsType,
                invoice.Booking.Weight,

                Service =
                    invoice.Booking
                        .TransportService?
                        .Name
            },

            invoice.SubTotal,
            invoice.GstPercentage,
            invoice.GstAmount,
            invoice.DiscountAmount,
            invoice.TotalAmount,
            invoice.PaymentStatus,

            items =
                invoice.InvoiceItems
                    .Select(x => new
                    {
                        x.Id,
                        x.Description,
                        x.Quantity,
                        x.Rate,
                        x.Amount
                    })
        });
    }

    [HttpGet("booking/{bookingNumber}")]
    public async Task<IActionResult> GetByBooking(
        string bookingNumber)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var invoice =
            await _db.Invoices
                .Include(x =>
                    x.InvoiceItems)
                .Include(x =>
                    x.Booking)
                .FirstOrDefaultAsync(x =>
                    x.Booking != null &&
                    x.Booking.BookingNumber ==
                    bookingNumber);

        if (invoice == null ||
            invoice.Booking == null)
        {
            return NotFound(new
            {
                message =
                    "Invoice not found"
            });
        }

        if (!User.IsInRole("Admin") &&
            invoice.Booking.UserId !=
            userId.Value)
        {
            return Forbid();
        }

        return Ok(invoice);
    }

    [HttpGet("{invoiceNumber}/print")]
    public async Task<IActionResult> PrintInvoice(
        string invoiceNumber)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var invoice =
            await _db.Invoices
                .Include(x =>
                    x.InvoiceItems)
                .Include(x =>
                    x.Booking)
                .FirstOrDefaultAsync(x =>
                    x.InvoiceNumber ==
                    invoiceNumber);

        if (invoice == null ||
            invoice.Booking == null)
        {
            return NotFound(new
            {
                message =
                    "Invoice not found"
            });
        }

        if (!User.IsInRole("Admin") &&
            invoice.Booking.UserId !=
            userId.Value)
        {
            return Forbid();
        }

        var html =
            _invoiceService
                .GenerateInvoiceHtml(
                    invoice,
                    invoice.Booking);

        return Content(
            html,
            "text/html",
            Encoding.UTF8);
    }

    [HttpPost("send-email")]
    public async Task<IActionResult> SendInvoiceEmail(
        SendInvoiceEmailRequest request)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var invoice =
            await _db.Invoices
                .Include(x =>
                    x.Booking)
                    .ThenInclude(x =>
                        x!.User)
                .FirstOrDefaultAsync(x =>
                    x.InvoiceNumber ==
                    request.InvoiceNumber);

        if (invoice == null ||
            invoice.Booking == null)
        {
            return NotFound(new
            {
                message =
                    "Invoice not found"
            });
        }

        var booking =
            invoice.Booking;

        if (!User.IsInRole("Admin") &&
            booking.UserId != userId.Value)
        {
            return Forbid();
        }

        if (booking.User == null)
        {
            return BadRequest(new
            {
                message =
                    "Customer information not found"
            });
        }

        var smtpHost =
            _configuration[
                "Smtp:Host"];

        if (string.IsNullOrWhiteSpace(
            smtpHost))
        {
            return BadRequest(new
            {
                message =
                    "SMTP is not configured in this environment"
            });
        }

        await _emailService
            .SendInvoiceEmailAsync(
                booking.User.Email,
                booking.User.Name,
                invoice.InvoiceNumber,
                booking.BookingNumber,
                invoice.TotalAmount);

        await _auditService.LogAsync(
            "INVOICE_EMAIL_SENT",
            $"Invoice {invoice.InvoiceNumber} emailed",
            booking.UserId,
            booking.User.Email);

        return Ok(new
        {
            message =
                "Invoice email sent successfully",

            email =
                booking.User.Email
        });
    }

    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            value,
            out var userId))
        {
            return null;
        }

        return userId;
    }
}