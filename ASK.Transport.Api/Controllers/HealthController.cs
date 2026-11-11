using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly IWebHostEnvironment _environment;

    public HealthController(
        AskTransportDbContext db,
        IWebHostEnvironment environment)
    {
        _db = db;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var databaseAvailable =
            await _db.Database.CanConnectAsync();

        if (!databaseAvailable)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new
                {
                    application =
                        "ASK GROUP Transport API",

                    status =
                        "Unhealthy",

                    database =
                        "Unavailable",

                    environment =
                        _environment.EnvironmentName,

                    time =
                        DateTime.UtcNow
                });
        }

        return Ok(new
        {
            application =
                "ASK GROUP Transport API",

            status =
                "Healthy",

            database =
                "Connected",

            environment =
                _environment.EnvironmentName,

            time =
                DateTime.UtcNow
        });
    }
}