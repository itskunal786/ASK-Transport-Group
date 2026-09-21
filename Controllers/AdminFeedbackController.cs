using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/admin/feedback")]
[Authorize(Roles = "Admin")]
public sealed class AdminFeedbackController : ControllerBase
{
    private readonly AdminFeedbackService _service;

    public AdminFeedbackController(
        AdminFeedbackService service)
    {
        _service = service;
    }


    [HttpGet]
    public async Task<IActionResult> GetAll(
        int page = 1,
        int pageSize = 10,
        int? rating = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        if (rating.HasValue &&
            (rating.Value < 1 ||
             rating.Value > 5))
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Rating must be between 1 and 5."
            });
        }

        var data =
            await _service.GetAllAsync(
                page,
                pageSize,
                rating,
                search,
                cancellationToken);

        return Ok(new
        {
            success = true,
            data
        });
    }


    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        CancellationToken cancellationToken)
    {
        var data =
            await _service.GetSummaryAsync(
                cancellationToken);

        return Ok(new
        {
            success = true,
            data
        });
    }
}
