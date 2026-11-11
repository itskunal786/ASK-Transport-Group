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
public class DriverController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    public DriverController(
        AskTransportDbContext db,
        AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet]
    [HasPermission(Permissions.Drivers.View)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? hubId,
        [FromQuery] bool? available,
        [FromQuery] bool? active,
        [FromQuery] bool? verified,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        page = page < 1 ? 1 : page;

        pageSize =
            pageSize < 1 ? 25 : pageSize;

        pageSize =
            pageSize > 100 ? 100 : pageSize;

        var query =
            _db.Drivers
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                x.Phone.Contains(search) ||
                x.DrivingLicenseNumber.Contains(search));
        }

        if (hubId.HasValue)
        {
            query = query.Where(x =>
                x.HubId == hubId.Value);
        }

        if (available.HasValue)
        {
            query = query.Where(x =>
                x.IsAvailable == available.Value);
        }

        if (active.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == active.Value);
        }

        if (verified.HasValue)
        {
            query = query.Where(x =>
                x.IsVerified == verified.Value);
        }

        var totalRecords =
            await query.CountAsync();

        var data =
            await query
                .OrderBy(x => x.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.UserId,
                    x.Name,
                    x.Phone,
                    x.Email,
                    x.DrivingLicenseNumber,
                    x.LicenseType,
                    x.LicenseExpiryDate,

                    LicenseExpired =
                        x.LicenseExpiryDate <
                        DateTime.UtcNow,

                    x.HubId,

                    Hub =
                        x.Hub != null
                            ? x.Hub.Name
                            : null,

                    x.IsVerified,
                    x.IsAvailable,
                    x.IsActive,
                    x.Status,
                    x.JoiningDate,
                    x.CreatedAt
                })
                .ToListAsync();

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

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.Drivers.View)]
    public async Task<IActionResult> GetById(
        int id)
    {
        var driver =
            await _db.Drivers
                .AsNoTracking()
                .Where(x =>
                    x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.UserId,

                    UserEmail =
                        x.User != null
                            ? x.User.Email
                            : null,

                    x.Name,
                    x.Phone,
                    x.Email,
                    x.Address,
                    x.DrivingLicenseNumber,
                    x.LicenseExpiryDate,
                    x.LicenseType,
                    x.EmergencyContactName,
                    x.EmergencyContactPhone,
                    x.BloodGroup,
                    x.DateOfBirth,
                    x.JoiningDate,
                    x.HubId,

                    Hub =
                        x.Hub != null
                            ? x.Hub.Name
                            : null,

                    x.IsVerified,
                    x.IsAvailable,
                    x.IsActive,
                    x.Status,
                    x.Notes,
                    x.CreatedAt,
                    x.UpdatedAt
                })
                .FirstOrDefaultAsync();

        if (driver == null)
        {
            return NotFound(new
            {
                message =
                    "Driver not found"
            });
        }

        return Ok(driver);
    }

    [HttpPost]
    [HasPermission(Permissions.Drivers.Create)]
    public async Task<IActionResult> Create(
        DriverRequest request)
    {
        var validation =
            await ValidateRequestAsync(
                request);

        if (validation != null)
        {
            return validation;
        }

        var licenseNumber =
            request.DrivingLicenseNumber
                .Trim()
                .ToUpperInvariant();

        var duplicate =
            await _db.Drivers
                .AnyAsync(x =>
                    x.DrivingLicenseNumber ==
                    licenseNumber);

        if (duplicate)
        {
            return BadRequest(new
            {
                message =
                    "Driving license number already exists"
            });
        }

        if (request.UserId.HasValue)
        {
            var userAlreadyDriver =
                await _db.Drivers
                    .AnyAsync(x =>
                        x.UserId ==
                        request.UserId.Value);

            if (userAlreadyDriver)
            {
                return BadRequest(new
                {
                    message =
                        "This user is already linked to a driver"
                });
            }
        }

        var driver =
            new Driver
            {
                UserId =
                    request.UserId,

                Name =
                    request.Name.Trim(),

                Phone =
                    request.Phone.Trim(),

                Email =
                    request.Email?.Trim(),

                Address =
                    request.Address?.Trim(),

                DrivingLicenseNumber =
                    licenseNumber,

                LicenseExpiryDate =
                    request.LicenseExpiryDate,

                LicenseType =
                    request.LicenseType?.Trim(),

                EmergencyContactName =
                    request.EmergencyContactName?.Trim(),

                EmergencyContactPhone =
                    request.EmergencyContactPhone?.Trim(),

                BloodGroup =
                    request.BloodGroup?.Trim(),

                DateOfBirth =
                    request.DateOfBirth,

                JoiningDate =
                    request.JoiningDate
                    ?? DateTime.UtcNow,

                HubId =
                    request.HubId,

                IsVerified =
                    request.IsVerified,

                IsAvailable =
                    request.IsAvailable,

                IsActive =
                    request.IsActive,

                Status =
                    request.Status.Trim(),

                Notes =
                    request.Notes?.Trim(),

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.Drivers.Add(driver);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "DRIVER_CREATED",
            $"Driver {driver.Name} created");

        return Ok(new
        {
            message =
                "Driver created successfully",

            driver
        });
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.Drivers.Edit)]
    public async Task<IActionResult> Update(
        int id,
        DriverRequest request)
    {
        var driver =
            await _db.Drivers
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (driver == null)
        {
            return NotFound(new
            {
                message =
                    "Driver not found"
            });
        }

        var validation =
            await ValidateRequestAsync(
                request);

        if (validation != null)
        {
            return validation;
        }

        var licenseNumber =
            request.DrivingLicenseNumber
                .Trim()
                .ToUpperInvariant();

        var duplicateLicense =
            await _db.Drivers
                .AnyAsync(x =>
                    x.Id != id &&
                    x.DrivingLicenseNumber ==
                    licenseNumber);

        if (duplicateLicense)
        {
            return BadRequest(new
            {
                message =
                    "Driving license number already exists"
            });
        }

        if (request.UserId.HasValue)
        {
            var duplicateUser =
                await _db.Drivers
                    .AnyAsync(x =>
                        x.Id != id &&
                        x.UserId ==
                        request.UserId.Value);

            if (duplicateUser)
            {
                return BadRequest(new
                {
                    message =
                        "This user is already linked to another driver"
                });
            }
        }

        driver.UserId =
            request.UserId;

        driver.Name =
            request.Name.Trim();

        driver.Phone =
            request.Phone.Trim();

        driver.Email =
            request.Email?.Trim();

        driver.Address =
            request.Address?.Trim();

        driver.DrivingLicenseNumber =
            licenseNumber;

        driver.LicenseExpiryDate =
            request.LicenseExpiryDate;

        driver.LicenseType =
            request.LicenseType?.Trim();

        driver.EmergencyContactName =
            request.EmergencyContactName?.Trim();

        driver.EmergencyContactPhone =
            request.EmergencyContactPhone?.Trim();

        driver.BloodGroup =
            request.BloodGroup?.Trim();

        driver.DateOfBirth =
            request.DateOfBirth;

        driver.JoiningDate =
            request.JoiningDate;

        driver.HubId =
            request.HubId;

        driver.IsVerified =
            request.IsVerified;

        driver.IsAvailable =
            request.IsAvailable;

        driver.IsActive =
            request.IsActive;

        driver.Status =
            request.Status.Trim();

        driver.Notes =
            request.Notes?.Trim();

        driver.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "DRIVER_UPDATED",
            $"Driver {driver.Name} updated");

        return Ok(new
        {
            message =
                "Driver updated successfully",

            driver
        });
    }

    [HttpPut("{id:int}/availability")]
    [HasPermission(Permissions.Drivers.Edit)]
    public async Task<IActionResult> ChangeAvailability(
        int id,
        ChangeAvailabilityRequest request)
    {
        var driver =
            await _db.Drivers
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (driver == null)
        {
            return NotFound(new
            {
                message =
                    "Driver not found"
            });
        }

        if (!driver.IsActive)
        {
            return BadRequest(new
            {
                message =
                    "Inactive driver cannot be marked available"
            });
        }

        if (driver.LicenseExpiryDate <
            DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message =
                    "Driver license is expired"
            });
        }

        driver.IsAvailable =
            request.IsAvailable;

        driver.Status =
            request.IsAvailable
                ? "Available"
                : "Unavailable";

        driver.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Driver availability updated",

            driver.Id,
            driver.IsAvailable,
            driver.Status
        });
    }

    [HttpPut("{id:int}/verify")]
    [HasPermission(Permissions.Drivers.Edit)]
    public async Task<IActionResult> Verify(
        int id,
        [FromQuery] bool verified)
    {
        var driver =
            await _db.Drivers
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (driver == null)
        {
            return NotFound(new
            {
                message =
                    "Driver not found"
            });
        }

        driver.IsVerified =
            verified;

        driver.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            verified
                ? "DRIVER_VERIFIED"
                : "DRIVER_UNVERIFIED",
            $"Driver {driver.Name} verification changed");

        return Ok(new
        {
            message =
                verified
                    ? "Driver verified successfully"
                    : "Driver verification removed"
        });
    }

    [HttpPut("{id:int}/status")]
    [HasPermission(Permissions.Drivers.Edit)]
    public async Task<IActionResult> ChangeStatus(
        int id,
        [FromQuery] bool active)
    {
        var driver =
            await _db.Drivers
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (driver == null)
        {
            return NotFound(new
            {
                message =
                    "Driver not found"
            });
        }

        driver.IsActive =
            active;

        if (!active)
        {
            driver.IsAvailable =
                false;

            driver.Status =
                "Inactive";
        }
        else
        {
            driver.Status =
                "Available";

            driver.IsAvailable =
                driver.LicenseExpiryDate >
                DateTime.UtcNow;
        }

        driver.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                active
                    ? "Driver activated successfully"
                    : "Driver deactivated successfully"
        });
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.Drivers.Delete)]
    public async Task<IActionResult> Delete(
        int id)
    {
        var driver =
            await _db.Drivers
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (driver == null)
        {
            return NotFound(new
            {
                message =
                    "Driver not found"
            });
        }

        _db.Drivers.Remove(driver);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "DRIVER_DELETED",
            $"Driver {driver.Name} deleted");

        return Ok(new
        {
            message =
                "Driver deleted successfully"
        });
    }

    private async Task<IActionResult?>
        ValidateRequestAsync(
            DriverRequest request)
    {
        if (request.LicenseExpiryDate.Date <
            DateTime.UtcNow.Date)
        {
            return BadRequest(new
            {
                message =
                    "Driving license is expired"
            });
        }

        if (request.UserId.HasValue)
        {
            var userExists =
                await _db.Users.AnyAsync(x =>
                    x.Id ==
                        request.UserId.Value &&
                    x.IsActive);

            if (!userExists)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid or inactive user"
                });
            }
        }

        if (request.HubId.HasValue)
        {
            var hubExists =
                await _db.Hubs.AnyAsync(x =>
                    x.Id ==
                        request.HubId.Value &&
                    x.IsActive);

            if (!hubExists)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid or inactive hub"
                });
            }
        }

        return null;
    }
}