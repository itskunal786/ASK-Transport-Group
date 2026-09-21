using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public ProfileController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userIdValue =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            userIdValue,
            out var userId))
        {
            return Unauthorized();
        }

        var user = await _db.Users
            .Where(x => x.Id == userId)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Email,
                x.Phone,
                Role = x.Role.ToString(),
                x.IsVerified,
                x.IsActive,
                x.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found"
            });
        }

        return Ok(user);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        UpdateProfileRequest request)
    {
        var userIdValue =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            userIdValue,
            out var userId))
        {
            return Unauthorized();
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found"
            });
        }

        user.Name = request.Name.Trim();
        user.Phone = request.Phone.Trim();

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Profile updated successfully",
            user = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Phone,
                role = user.Role.ToString()
            }
        });
    }
}