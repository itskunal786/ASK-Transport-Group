using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportServiceController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public TransportServiceController(AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var services = await _db.TransportServices
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync();

        return Ok(services);
    }
}