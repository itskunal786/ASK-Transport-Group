using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PricingController : ControllerBase
{
    private readonly PricingService _pricingService;

    public PricingController(
        PricingService pricingService)
    {
        _pricingService = pricingService;
    }

    [HttpPost("quote")]
    [Authorize]
    public async Task<IActionResult> GetQuote(
        FreightQuoteRequest request)
    {
        try
        {
            var result =
                await _pricingService
                    .CalculateAsync(request);

            return Ok(new
            {
                message =
                    "Freight calculated successfully",

                data = result
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
}