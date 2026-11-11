using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/payments")]
[Authorize]
public sealed class ClientPaymentController
    : ControllerBase
{
    private readonly ClientPaymentService
        _paymentService;


    public ClientPaymentController(
        ClientPaymentService paymentService)
    {
        _paymentService =
            paymentService;
    }


    [HttpGet]
    public async Task<IActionResult> GetMyPayments(
        int page = 1,
        int pageSize = 10,
        string? status = null,
        CancellationToken cancellationToken = default)
    {
        var userId =
            GetUserId();


        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }


        var result =
            await _paymentService
                .GetMyPaymentsAsync(
                    userId.Value,
                    page,
                    pageSize,
                    status,
                    cancellationToken);


        return Ok(new
        {
            success = true,

            message =
                "Payments loaded successfully.",

            data =
                result
        });
    }


    [HttpGet("{paymentId:int}")]
    public async Task<IActionResult> GetPayment(
        int paymentId,
        CancellationToken cancellationToken)
    {
        var userId =
            GetUserId();


        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }


        var payment =
            await _paymentService
                .GetPaymentAsync(
                    userId.Value,
                    paymentId,
                    cancellationToken);


        if (payment == null)
        {
            return NotFound(new
            {
                success = false,

                message =
                    "Payment not found."
            });
        }


        return Ok(new
        {
            success = true,

            message =
                "Payment loaded successfully.",

            data =
                payment
        });
    }


    [HttpPost("{paymentId:int}/retry")]
    public async Task<IActionResult> RetryPayment(
        int paymentId,
        CancellationToken cancellationToken)
    {
        var userId =
            GetUserId();


        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }


        var result =
            await _paymentService
                .RetryPaymentAsync(
                    userId.Value,
                    paymentId,
                    cancellationToken);


        if (result == null)
        {
            return NotFound(new
            {
                success = false,

                message =
                    "Payment not found."
            });
        }


        return Ok(result);
    }


    [HttpGet("{paymentId:int}/receipt")]
    public async Task<IActionResult> GetReceipt(
        int paymentId,
        CancellationToken cancellationToken)
    {
        var userId =
            GetUserId();


        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }


        var receipt =
            await _paymentService
                .GetReceiptAsync(
                    userId.Value,
                    paymentId,
                    cancellationToken);


        if (receipt == null)
        {
            return NotFound(new
            {
                success = false,

                message =
                    "Payment receipt not found."
            });
        }


        return Ok(new
        {
            success = true,

            message =
                "Payment receipt loaded successfully.",

            data =
                receipt
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