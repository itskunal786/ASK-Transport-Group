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
public class RateCardController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    public RateCardController(
        AskTransportDbContext db,
        AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet]
    [HasPermission(Permissions.RateCards.View)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? serviceType,
        [FromQuery] int? routeId,
        [FromQuery] bool? active)
    {
        var query = _db.RateCards
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(serviceType))
        {
            serviceType = serviceType.Trim();

            query = query.Where(x =>
                x.ServiceType == serviceType);
        }

        if (routeId.HasValue)
        {
            query = query.Where(x =>
                x.RouteId == routeId.Value);
        }

        if (active.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == active.Value);
        }

        var data = await query
            .OrderByDescending(x => x.EffectiveFrom)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.RouteId,

                Route = x.Route != null
                    ? x.Route.Name
                    : "Default",

                x.ServiceType,
                x.MinimumCharge,
                x.RatePerKg,
                x.RatePerKm,
                x.FuelSurchargePercent,
                x.HandlingCharge,
                x.GstPercent,
                x.VolumetricDivisor,
                x.EffectiveFrom,
                x.EffectiveTo,
                x.IsActive,
                x.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.RateCards.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var rateCard = await _db.RateCards
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (rateCard == null)
        {
            return NotFound(new
            {
                message = "Rate card not found"
            });
        }

        var slabs = await _db.RateSlabs
            .AsNoTracking()
            .Where(x =>
                x.RateCardId == id)
            .OrderBy(x =>
                x.MinWeightKg)
            .ToListAsync();

        return Ok(new
        {
            rateCard,
            slabs
        });
    }

    [HttpPost]
    [HasPermission(Permissions.RateCards.Create)]
    public async Task<IActionResult> Create(
        RateCardRequest request)
    {
        var validation =
            await ValidateRequestAsync(request);

        if (validation != null)
            return validation;

        var rateCard = new RateCard
        {
            Name = request.Name.Trim(),
            RouteId = request.RouteId,
            ServiceType = request.ServiceType.Trim(),
            MinimumCharge = request.MinimumCharge,
            RatePerKg = request.RatePerKg,
            RatePerKm = request.RatePerKm,
            FuelSurchargePercent =
                request.FuelSurchargePercent,
            HandlingCharge = request.HandlingCharge,
            GstPercent = request.GstPercent,
            VolumetricDivisor =
                request.VolumetricDivisor,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.RateCards.Add(rateCard);

        await _db.SaveChangesAsync();

        foreach (var slab in request.Slabs)
        {
            _db.RateSlabs.Add(
                new RateSlab
                {
                    RateCardId = rateCard.Id,
                    MinWeightKg = slab.MinWeightKg,
                    MaxWeightKg = slab.MaxWeightKg,
                    RatePerKg = slab.RatePerKg,
                    CreatedAt = DateTime.UtcNow
                });
        }

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "RATE_CARD_CREATED",
            $"Rate card {rateCard.Name} created");

        return Ok(new
        {
            message = "Rate card created successfully",
            rateCard.Id
        });
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.RateCards.Edit)]
    public async Task<IActionResult> Update(
        int id,
        RateCardRequest request)
    {
        var rateCard = await _db.RateCards
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (rateCard == null)
        {
            return NotFound(new
            {
                message = "Rate card not found"
            });
        }

        var validation =
            await ValidateRequestAsync(request);

        if (validation != null)
            return validation;

        rateCard.Name = request.Name.Trim();
        rateCard.RouteId = request.RouteId;
        rateCard.ServiceType =
            request.ServiceType.Trim();
        rateCard.MinimumCharge =
            request.MinimumCharge;
        rateCard.RatePerKg =
            request.RatePerKg;
        rateCard.RatePerKm =
            request.RatePerKm;
        rateCard.FuelSurchargePercent =
            request.FuelSurchargePercent;
        rateCard.HandlingCharge =
            request.HandlingCharge;
        rateCard.GstPercent =
            request.GstPercent;
        rateCard.VolumetricDivisor =
            request.VolumetricDivisor;
        rateCard.EffectiveFrom =
            request.EffectiveFrom;
        rateCard.EffectiveTo =
            request.EffectiveTo;
        rateCard.IsActive =
            request.IsActive;
        rateCard.UpdatedAt =
            DateTime.UtcNow;

        var oldSlabs = await _db.RateSlabs
            .Where(x =>
                x.RateCardId == id)
            .ToListAsync();

        _db.RateSlabs.RemoveRange(oldSlabs);

        foreach (var slab in request.Slabs)
        {
            _db.RateSlabs.Add(
                new RateSlab
                {
                    RateCardId = id,
                    MinWeightKg = slab.MinWeightKg,
                    MaxWeightKg = slab.MaxWeightKg,
                    RatePerKg = slab.RatePerKg,
                    CreatedAt = DateTime.UtcNow
                });
        }

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "RATE_CARD_UPDATED",
            $"Rate card {rateCard.Name} updated");

        return Ok(new
        {
            message = "Rate card updated successfully"
        });
    }

    [HttpPut("{id:int}/status")]
    [HasPermission(Permissions.RateCards.Edit)]
    public async Task<IActionResult> ChangeStatus(
        int id,
        [FromQuery] bool active)
    {
        var rateCard = await _db.RateCards
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (rateCard == null)
        {
            return NotFound(new
            {
                message = "Rate card not found"
            });
        }

        rateCard.IsActive = active;
        rateCard.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = active
                ? "Rate card activated"
                : "Rate card deactivated"
        });
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.RateCards.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var rateCard = await _db.RateCards
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (rateCard == null)
        {
            return NotFound(new
            {
                message = "Rate card not found"
            });
        }

        var slabs = await _db.RateSlabs
            .Where(x =>
                x.RateCardId == id)
            .ToListAsync();

        _db.RateSlabs.RemoveRange(slabs);
        _db.RateCards.Remove(rateCard);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "RATE_CARD_DELETED",
            $"Rate card {rateCard.Name} deleted");

        return Ok(new
        {
            message = "Rate card deleted successfully"
        });
    }

    private async Task<IActionResult?>
        ValidateRequestAsync(
            RateCardRequest request)
    {
        if (request.RouteId.HasValue)
        {
            var routeExists =
                await _db.TransportRoutes
                    .AnyAsync(x =>
                        x.Id == request.RouteId.Value &&
                        x.IsActive);

            if (!routeExists)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid or inactive route"
                });
            }
        }

        if (request.EffectiveTo.HasValue &&
            request.EffectiveTo.Value <
            request.EffectiveFrom)
        {
            return BadRequest(new
            {
                message =
                    "EffectiveTo cannot be before EffectiveFrom"
            });
        }

        var ordered = request.Slabs
            .OrderBy(x => x.MinWeightKg)
            .ToList();

        for (var i = 0; i < ordered.Count; i++)
        {
            var slab = ordered[i];

            if (slab.MaxWeightKg.HasValue &&
                slab.MaxWeightKg <
                slab.MinWeightKg)
            {
                return BadRequest(new
                {
                    message =
                        "Rate slab maximum weight cannot be less than minimum weight"
                });
            }

            if (i > 0)
            {
                var previous = ordered[i - 1];

                if (!previous.MaxWeightKg.HasValue)
                {
                    return BadRequest(new
                    {
                        message =
                            "Open-ended slab must be the last slab"
                    });
                }

                if (slab.MinWeightKg <=
                    previous.MaxWeightKg.Value)
                {
                    return BadRequest(new
                    {
                        message =
                            "Rate slabs cannot overlap"
                    });
                }
            }
        }

        return null;
    }
}