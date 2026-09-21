using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/payment-reconciliation")]
[Authorize(Roles = "Admin")]
public class PaymentReconciliationController
    : ControllerBase
{
    private readonly PaymentReconciliationService
        _service;

    private readonly AuditService
        _auditService;

    public PaymentReconciliationController(
        PaymentReconciliationService service,
        AuditService auditService)
    {
        _service = service;
        _auditService = auditService;
    }

    [HttpGet("mismatches")]
    public async Task<IActionResult>
        GetMismatches()
    {
        var result =
            await _service
                .GetMismatchesAsync();

        return Ok(new
        {
            count = result.Count,
            data = result
        });
    }

    [HttpPost("{transactionId:int}/reconcile")]
    public async Task<IActionResult>
        Reconcile(
            int transactionId)
    {
        var result =
            await _service
                .ReconcileAsync(
                    transactionId);

        if (result == null)
        {
            return NotFound(new
            {
                message =
                    "Payment transaction not found"
            });
        }

        await _auditService.LogAsync(
            "PAYMENT_RECONCILED",
            $"Payment transaction {result.TransactionNumber} reconciled",
            null,
            User.Identity?.Name);

        return Ok(result);
    }
}