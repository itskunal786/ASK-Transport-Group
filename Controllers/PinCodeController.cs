using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PinCodeController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public PinCodeController(AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet("{pin}")]
    public async Task<IActionResult> GetByPin(string pin)
    {
        var result = await _db.PinCodes
            .FirstOrDefaultAsync(x => x.Pin == pin);

        if (result == null)
        {
            return NotFound(new
            {
                message = "PIN code not found"
            });
        }

        return Ok(new
        {
            result.Pin,
            result.City,
            result.District,
            result.State,
            result.DeliveryDays,
            result.Serviceable
        });
    }
}