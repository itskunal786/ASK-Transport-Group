using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/location")]
public class LocationController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public LocationController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet("states")]
    public async Task<IActionResult> GetStates(
        CancellationToken cancellationToken)
    {
        var states =
            await _db.States
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.Code
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(states);
    }

    [HttpGet("states/{stateId:int}/cities")]
    public async Task<IActionResult> GetCities(
        int stateId,
        CancellationToken cancellationToken)
    {
        var stateExists =
            await _db.States
                .AsNoTracking()
                .AnyAsync(
                    x => x.Id == stateId,
                    cancellationToken);

        if (!stateExists)
        {
            return NotFound(new
            {
                message =
                    "State not found"
            });
        }

        var cities =
            await _db.Cities
                .AsNoTracking()
                .Where(x =>
                    x.StateId == stateId)
                .OrderBy(x =>
                    x.Name)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.StateId
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(cities);
    }

    [HttpGet("pincodes/{pin}")]
    public async Task<IActionResult> GetPinCode(
        string pin,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(
            pin))
        {
            return BadRequest(new
            {
                message =
                    "PIN code is required"
            });
        }

        pin =
            pin.Trim();

        var pinCode =
            await _db.PinCodes
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Pin == pin,
                    cancellationToken);

        if (pinCode == null)
        {
            return NotFound(new
            {
                message =
                    "PIN code not found"
            });
        }

        return Ok(new
        {
            pinCode.Id,
            pinCode.Pin,
            pinCode.City,
            pinCode.District,
            pinCode.State,
            pinCode.DeliveryDays,
            pinCode.Serviceable
        });
    }

    [HttpGet("pincodes")]
    [HasPermission(
        Permissions.Settings.View)]
    public async Task<IActionResult> GetPinCodes(
        [FromQuery] string? search,
        [FromQuery] bool? serviceable,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        page =
            Math.Max(
                page,
                1);

        pageSize =
            Math.Clamp(
                pageSize,
                1,
                200);

        var query =
            _db.PinCodes
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(
            search))
        {
            search =
                search.Trim();

            query =
                query.Where(x =>
                    x.Pin.Contains(search) ||
                    x.City.Contains(search) ||
                    x.District.Contains(search) ||
                    x.State.Contains(search));
        }

        if (serviceable.HasValue)
        {
            query =
                query.Where(x =>
                    x.Serviceable ==
                    serviceable.Value);
        }

        var totalRecords =
            await query.CountAsync(
                cancellationToken);

        var data =
            await query
                .OrderBy(x =>
                    x.State)
                .ThenBy(x =>
                    x.City)
                .ThenBy(x =>
                    x.Pin)
                .Skip(
                    (page - 1) *
                    pageSize)
                .Take(
                    pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.Pin,
                    x.City,
                    x.District,
                    x.State,
                    x.DeliveryDays,
                    x.Serviceable
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(new
        {
            page,
            pageSize,
            totalRecords,

            totalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize),

            data
        });
    }

    [HttpPost("states")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> CreateState(
        State request,
        CancellationToken cancellationToken)
    {
        var name =
            request.Name.Trim();

        var code =
            request.Code.Trim()
                .ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(
                name) ||
            string.IsNullOrWhiteSpace(
                code))
        {
            return BadRequest(new
            {
                message =
                    "State name and code are required"
            });
        }

        var exists =
            await _db.States
                .AnyAsync(
                    x =>
                        x.Name == name ||
                        x.Code == code,
                    cancellationToken);

        if (exists)
        {
            return BadRequest(new
            {
                message =
                    "State name or code already exists"
            });
        }

        var state =
            new State
            {
                Name =
                    name,

                Code =
                    code
            };

        _db.States.Add(
            state);

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "State created successfully",

            state
        });
    }

    [HttpPut("states/{id:int}")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> UpdateState(
        int id,
        State request,
        CancellationToken cancellationToken)
    {
        var state =
            await _db.States
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (state == null)
        {
            return NotFound(new
            {
                message =
                    "State not found"
            });
        }

        var name =
            request.Name.Trim();

        var code =
            request.Code.Trim()
                .ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(
                name) ||
            string.IsNullOrWhiteSpace(
                code))
        {
            return BadRequest(new
            {
                message =
                    "State name and code are required"
            });
        }

        var duplicate =
            await _db.States
                .AnyAsync(
                    x =>
                        x.Id != id &&
                        (x.Name == name ||
                         x.Code == code),
                    cancellationToken);

        if (duplicate)
        {
            return BadRequest(new
            {
                message =
                    "State name or code already exists"
            });
        }

        state.Name =
            name;

        state.Code =
            code;

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "State updated successfully",

            state
        });
    }

    [HttpDelete("states/{id:int}")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> DeleteState(
        int id,
        CancellationToken cancellationToken)
    {
        var state =
            await _db.States
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (state == null)
        {
            return NotFound(new
            {
                message =
                    "State not found"
            });
        }

        var hasCities =
            await _db.Cities
                .AnyAsync(
                    x => x.StateId == id,
                    cancellationToken);

        if (hasCities)
        {
            return BadRequest(new
            {
                message =
                    "State cannot be deleted because cities are linked to it"
            });
        }

        _db.States.Remove(
            state);

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "State deleted successfully"
        });
    }

    [HttpPost("cities")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> CreateCity(
        City request,
        CancellationToken cancellationToken)
    {
        var name =
            request.Name.Trim();

        if (string.IsNullOrWhiteSpace(
            name))
        {
            return BadRequest(new
            {
                message =
                    "City name is required"
            });
        }

        var stateExists =
            await _db.States
                .AnyAsync(
                    x =>
                        x.Id ==
                        request.StateId,
                    cancellationToken);

        if (!stateExists)
        {
            return BadRequest(new
            {
                message =
                    "Invalid state"
            });
        }

        var duplicate =
            await _db.Cities
                .AnyAsync(
                    x =>
                        x.StateId ==
                            request.StateId &&
                        x.Name == name,
                    cancellationToken);

        if (duplicate)
        {
            return BadRequest(new
            {
                message =
                    "City already exists in this state"
            });
        }

        var city =
            new City
            {
                Name =
                    name,

                StateId =
                    request.StateId
            };

        _db.Cities.Add(
            city);

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "City created successfully",

            city
        });
    }

    [HttpPut("cities/{id:int}")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> UpdateCity(
        int id,
        City request,
        CancellationToken cancellationToken)
    {
        var city =
            await _db.Cities
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (city == null)
        {
            return NotFound(new
            {
                message =
                    "City not found"
            });
        }

        var stateExists =
            await _db.States
                .AnyAsync(
                    x =>
                        x.Id ==
                        request.StateId,
                    cancellationToken);

        if (!stateExists)
        {
            return BadRequest(new
            {
                message =
                    "Invalid state"
            });
        }

        var name =
            request.Name.Trim();

        var duplicate =
            await _db.Cities
                .AnyAsync(
                    x =>
                        x.Id != id &&
                        x.StateId ==
                            request.StateId &&
                        x.Name == name,
                    cancellationToken);

        if (duplicate)
        {
            return BadRequest(new
            {
                message =
                    "City already exists in this state"
            });
        }

        city.Name =
            name;

        city.StateId =
            request.StateId;

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "City updated successfully",

            city
        });
    }

    [HttpDelete("cities/{id:int}")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> DeleteCity(
        int id,
        CancellationToken cancellationToken)
    {
        var city =
            await _db.Cities
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (city == null)
        {
            return NotFound(new
            {
                message =
                    "City not found"
            });
        }

        _db.Cities.Remove(
            city);

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "City deleted successfully"
        });
    }

    [HttpPost("pincodes")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> CreatePinCode(
        PinCode request,
        CancellationToken cancellationToken)
    {
        var pin =
            request.Pin.Trim();

        if (string.IsNullOrWhiteSpace(
            pin))
        {
            return BadRequest(new
            {
                message =
                    "PIN code is required"
            });
        }

        if (pin.Length != 6 ||
            !pin.All(char.IsDigit))
        {
            return BadRequest(new
            {
                message =
                    "PIN code must contain exactly 6 digits"
            });
        }

        if (request.DeliveryDays < 0)
        {
            return BadRequest(new
            {
                message =
                    "Delivery days cannot be negative"
            });
        }

        var exists =
            await _db.PinCodes
                .AnyAsync(
                    x =>
                        x.Pin == pin,
                    cancellationToken);

        if (exists)
        {
            return BadRequest(new
            {
                message =
                    "PIN code already exists"
            });
        }

        var pinCode =
            new PinCode
            {
                Pin =
                    pin,

                City =
                    request.City.Trim(),

                District =
                    request.District.Trim(),

                State =
                    request.State.Trim(),

                DeliveryDays =
                    request.DeliveryDays,

                Serviceable =
                    request.Serviceable
            };

        _db.PinCodes.Add(
            pinCode);

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "PIN code created successfully",

            pinCode
        });
    }

    [HttpPut("pincodes/{id:int}")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> UpdatePinCode(
        int id,
        PinCode request,
        CancellationToken cancellationToken)
    {
        var pinCode =
            await _db.PinCodes
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (pinCode == null)
        {
            return NotFound(new
            {
                message =
                    "PIN code not found"
            });
        }

        var pin =
            request.Pin.Trim();

        if (pin.Length != 6 ||
            !pin.All(char.IsDigit))
        {
            return BadRequest(new
            {
                message =
                    "PIN code must contain exactly 6 digits"
            });
        }

        var duplicate =
            await _db.PinCodes
                .AnyAsync(
                    x =>
                        x.Id != id &&
                        x.Pin == pin,
                    cancellationToken);

        if (duplicate)
        {
            return BadRequest(new
            {
                message =
                    "PIN code already exists"
            });
        }

        if (request.DeliveryDays < 0)
        {
            return BadRequest(new
            {
                message =
                    "Delivery days cannot be negative"
            });
        }

        pinCode.Pin =
            pin;

        pinCode.City =
            request.City.Trim();

        pinCode.District =
            request.District.Trim();

        pinCode.State =
            request.State.Trim();

        pinCode.DeliveryDays =
            request.DeliveryDays;

        pinCode.Serviceable =
            request.Serviceable;

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "PIN code updated successfully",

            pinCode
        });
    }

    [HttpDelete("pincodes/{id:int}")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> DeletePinCode(
        int id,
        CancellationToken cancellationToken)
    {
        var pinCode =
            await _db.PinCodes
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (pinCode == null)
        {
            return NotFound(new
            {
                message =
                    "PIN code not found"
            });
        }

        _db.PinCodes.Remove(
            pinCode);

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "PIN code deleted successfully"
        });
    }
}