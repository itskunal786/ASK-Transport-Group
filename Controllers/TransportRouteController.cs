using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportRouteController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    public TransportRouteController(
        AskTransportDbContext db,
        AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet]
    [HasPermission(Permissions.Routes.View)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? fromHubId,
        [FromQuery] int? toHubId,
        [FromQuery] bool? active)
    {
        var query = _db.TransportRoutes
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Code.Contains(search) ||
                x.Name.Contains(search));
        }

        if (fromHubId.HasValue)
        {
            query = query.Where(x =>
                x.FromHubId == fromHubId.Value);
        }

        if (toHubId.HasValue)
        {
            query = query.Where(x =>
                x.ToHubId == toHubId.Value);
        }

        if (active.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == active.Value);
        }

        var data = await query
            .OrderBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
                x.FromHubId,
                FromHub = x.FromHub != null
                    ? x.FromHub.Name
                    : null,
                x.ToHubId,
                ToHub = x.ToHub != null
                    ? x.ToHub.Name
                    : null,
                x.DistanceKm,
                x.EstimatedTransitHours,
                x.IsActive,
                x.CreatedAt,
                x.UpdatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.Routes.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var route = await _db.TransportRoutes
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
                x.FromHubId,
                FromHub = x.FromHub != null
                    ? x.FromHub.Name
                    : null,
                x.ToHubId,
                ToHub = x.ToHub != null
                    ? x.ToHub.Name
                    : null,
                x.DistanceKm,
                x.EstimatedTransitHours,
                x.IsActive,
                x.CreatedAt,
                x.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (route == null)
        {
            return NotFound(new
            {
                message = "Route not found"
            });
        }

        return Ok(route);
    }

    [HttpPost]
    [HasPermission(Permissions.Routes.Create)]
    public async Task<IActionResult> Create(
        TransportRouteRequest request)
    {
        if (request.FromHubId == request.ToHubId)
        {
            return BadRequest(new
            {
                message = "From hub and to hub cannot be same"
            });
        }

        var fromHub = await _db.Hubs
            .FirstOrDefaultAsync(x =>
                x.Id == request.FromHubId &&
                x.IsActive);

        var toHub = await _db.Hubs
            .FirstOrDefaultAsync(x =>
                x.Id == request.ToHubId &&
                x.IsActive);

        if (fromHub == null || toHub == null)
        {
            return BadRequest(new
            {
                message = "Invalid or inactive hub"
            });
        }

        var code = request.Code
            .Trim()
            .ToUpperInvariant();

        var duplicateCode = await _db.TransportRoutes
            .AnyAsync(x => x.Code == code);

        if (duplicateCode)
        {
            return BadRequest(new
            {
                message = "Route code already exists"
            });
        }

        var duplicateRoute = await _db.TransportRoutes
            .AnyAsync(x =>
                x.FromHubId == request.FromHubId &&
                x.ToHubId == request.ToHubId &&
                x.IsActive);

        if (duplicateRoute)
        {
            return BadRequest(new
            {
                message = "Active route already exists between these hubs"
            });
        }

        var route = new TransportRoute
        {
            Code = code,
            Name = request.Name.Trim(),
            FromHubId = request.FromHubId,
            ToHubId = request.ToHubId,
            DistanceKm = request.DistanceKm,
            EstimatedTransitHours = request.EstimatedTransitHours,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.TransportRoutes.Add(route);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "ROUTE_CREATED",
            $"Route {route.Code} created");

        return Ok(new
        {
            message = "Route created successfully",
            route
        });
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.Routes.Edit)]
    public async Task<IActionResult> Update(
        int id,
        TransportRouteRequest request)
    {
        var route = await _db.TransportRoutes
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (route == null)
        {
            return NotFound(new
            {
                message = "Route not found"
            });
        }

        if (request.FromHubId == request.ToHubId)
        {
            return BadRequest(new
            {
                message = "From hub and to hub cannot be same"
            });
        }

        var hubsValid =
            await _db.Hubs.CountAsync(x =>
                (x.Id == request.FromHubId ||
                 x.Id == request.ToHubId) &&
                x.IsActive);

        if (hubsValid != 2)
        {
            return BadRequest(new
            {
                message = "Invalid or inactive hub"
            });
        }

        var code = request.Code
            .Trim()
            .ToUpperInvariant();

        var duplicateCode = await _db.TransportRoutes
            .AnyAsync(x =>
                x.Id != id &&
                x.Code == code);

        if (duplicateCode)
        {
            return BadRequest(new
            {
                message = "Route code already exists"
            });
        }

        var duplicateRoute = await _db.TransportRoutes
            .AnyAsync(x =>
                x.Id != id &&
                x.FromHubId == request.FromHubId &&
                x.ToHubId == request.ToHubId &&
                x.IsActive);

        if (duplicateRoute)
        {
            return BadRequest(new
            {
                message = "Active route already exists"
            });
        }

        route.Code = code;
        route.Name = request.Name.Trim();
        route.FromHubId = request.FromHubId;
        route.ToHubId = request.ToHubId;
        route.DistanceKm = request.DistanceKm;
        route.EstimatedTransitHours =
            request.EstimatedTransitHours;
        route.IsActive = request.IsActive;
        route.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "ROUTE_UPDATED",
            $"Route {route.Code} updated");

        return Ok(new
        {
            message = "Route updated successfully",
            route
        });
    }

    [HttpPut("{id:int}/status")]
    [HasPermission(Permissions.Routes.Edit)]
    public async Task<IActionResult> ChangeStatus(
        int id,
        [FromQuery] bool active)
    {
        var route = await _db.TransportRoutes
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (route == null)
        {
            return NotFound(new
            {
                message = "Route not found"
            });
        }

        route.IsActive = active;
        route.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = active
                ? "Route activated successfully"
                : "Route deactivated successfully"
        });
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.Routes.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var route = await _db.TransportRoutes
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (route == null)
        {
            return NotFound(new
            {
                message = "Route not found"
            });
        }

        var usedByRateCards =
            await _db.RateCards.AnyAsync(x =>
                x.RouteId == id);

        if (usedByRateCards)
        {
            return BadRequest(new
            {
                message =
                    "Route is used by rate cards. Deactivate it instead."
            });
        }

        _db.TransportRoutes.Remove(route);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "ROUTE_DELETED",
            $"Route {route.Code} deleted");

        return Ok(new
        {
            message = "Route deleted successfully"
        });
    }
}