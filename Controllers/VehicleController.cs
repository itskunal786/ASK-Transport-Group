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
public class VehicleController : ControllerBase
{
	private readonly AskTransportDbContext _db;
	private readonly AuditService _auditService;

	public VehicleController(
		AskTransportDbContext db,
		AuditService auditService)
	{
		_db = db;
		_auditService = auditService;
	}

	[HttpGet]
	[HasPermission(Permissions.Vehicles.View)]
	public async Task<IActionResult> GetAll(
		[FromQuery] string? search,
		[FromQuery] int? hubId,
		[FromQuery] bool? available,
		[FromQuery] bool? active,
		[FromQuery] string? vehicleType,
		[FromQuery] int page = 1,
		[FromQuery] int pageSize = 25)
	{
		page =
			page < 1 ? 1 : page;

		pageSize =
			pageSize < 1 ? 25 : pageSize;

		pageSize =
			pageSize > 100
				? 100
				: pageSize;

		var query =
			_db.Vehicles
				.AsNoTracking()
				.AsQueryable();

		if (!string.IsNullOrWhiteSpace(search))
		{
			search =
				search.Trim();

			query = query.Where(x =>
				x.VehicleNumber.Contains(search) ||
				(x.Manufacturer != null &&
				 x.Manufacturer.Contains(search)) ||
				(x.Model != null &&
				 x.Model.Contains(search)));
		}

		if (hubId.HasValue)
		{
			query = query.Where(x =>
				x.HubId ==
				hubId.Value);
		}

		if (available.HasValue)
		{
			query = query.Where(x =>
				x.IsAvailable ==
				available.Value);
		}

		if (active.HasValue)
		{
			query = query.Where(x =>
				x.IsActive ==
				active.Value);
		}

		if (!string.IsNullOrWhiteSpace(
			vehicleType))
		{
			vehicleType =
				vehicleType.Trim();

			query = query.Where(x =>
				x.VehicleType ==
				vehicleType);
		}

		var totalRecords =
			await query.CountAsync();

		var data =
			await query
				.OrderBy(x =>
					x.VehicleNumber)
				.Skip(
					(page - 1) *
					pageSize)
				.Take(pageSize)
				.Select(x => new
				{
					x.Id,
					x.VehicleNumber,
					x.VehicleType,
					x.Manufacturer,
					x.Model,
					x.ManufacturingYear,
					x.FuelType,
					x.CapacityKg,
					x.CapacityCubicFeet,
					x.HubId,

					Hub =
						x.Hub != null
							? x.Hub.Name
							: null,

					x.IsAvailable,
					x.IsActive,
					x.Status,

					InsuranceExpired =
						x.InsuranceExpiryDate != null &&
						x.InsuranceExpiryDate <
						DateTime.UtcNow,

					FitnessExpired =
						x.FitnessExpiryDate != null &&
						x.FitnessExpiryDate <
						DateTime.UtcNow,

					PucExpired =
						x.PucExpiryDate != null &&
						x.PucExpiryDate <
						DateTime.UtcNow,

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
	[HasPermission(Permissions.Vehicles.View)]
	public async Task<IActionResult> GetById(
		int id)
	{
		var vehicle =
			await _db.Vehicles
				.AsNoTracking()
				.Where(x =>
					x.Id == id)
				.Select(x => new
				{
					x.Id,
					x.VehicleNumber,
					x.VehicleType,
					x.Manufacturer,
					x.Model,
					x.ManufacturingYear,
					x.FuelType,
					x.CapacityKg,
					x.CapacityCubicFeet,
					x.RcNumber,
					x.RcExpiryDate,
					x.InsurancePolicyNumber,
					x.InsuranceExpiryDate,
					x.FitnessExpiryDate,
					x.PucExpiryDate,
					x.ChassisNumber,
					x.EngineNumber,
					x.HubId,

					Hub =
						x.Hub != null
							? x.Hub.Name
							: null,

					x.IsAvailable,
					x.IsActive,
					x.Status,
					x.Notes,
					x.CreatedAt,
					x.UpdatedAt
				})
				.FirstOrDefaultAsync();

		if (vehicle == null)
		{
			return NotFound(new
			{
				message =
					"Vehicle not found"
			});
		}

		return Ok(vehicle);
	}

	[HttpPost]
	[HasPermission(Permissions.Vehicles.Create)]
	public async Task<IActionResult> Create(
		VehicleRequest request)
	{
		var validation =
			await ValidateRequestAsync(
				request);

		if (validation != null)
		{
			return validation;
		}

		var vehicleNumber =
			NormalizeVehicleNumber(
				request.VehicleNumber);

		var duplicate =
			await _db.Vehicles
				.AnyAsync(x =>
					x.VehicleNumber ==
					vehicleNumber);

		if (duplicate)
		{
			return BadRequest(new
			{
				message =
					"Vehicle number already exists"
			});
		}

		var vehicle =
			new Vehicle
			{
				VehicleNumber =
					vehicleNumber,

				VehicleType =
					request.VehicleType.Trim(),

				Manufacturer =
					request.Manufacturer?.Trim(),

				Model =
					request.Model?.Trim(),

				ManufacturingYear =
					request.ManufacturingYear,

				FuelType =
					request.FuelType?.Trim(),

				CapacityKg =
					request.CapacityKg,

				CapacityCubicFeet =
					request.CapacityCubicFeet,

				RcNumber =
					request.RcNumber?.Trim(),

				RcExpiryDate =
					request.RcExpiryDate,

				InsurancePolicyNumber =
					request.InsurancePolicyNumber?
						.Trim(),

				InsuranceExpiryDate =
					request.InsuranceExpiryDate,

				FitnessExpiryDate =
					request.FitnessExpiryDate,

				PucExpiryDate =
					request.PucExpiryDate,

				ChassisNumber =
					request.ChassisNumber?
						.Trim(),

				EngineNumber =
					request.EngineNumber?
						.Trim(),

				HubId =
					request.HubId,

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

		_db.Vehicles.Add(vehicle);

		await _db.SaveChangesAsync();

		await _auditService.LogAsync(
			"VEHICLE_CREATED",
			$"Vehicle {vehicle.VehicleNumber} created");

		return Ok(new
		{
			message =
				"Vehicle created successfully",

			vehicle
		});
	}

	[HttpPut("{id:int}")]
	[HasPermission(Permissions.Vehicles.Edit)]
	public async Task<IActionResult> Update(
		int id,
		VehicleRequest request)
	{
		var vehicle =
			await _db.Vehicles
				.FirstOrDefaultAsync(x =>
					x.Id == id);

		if (vehicle == null)
		{
			return NotFound(new
			{
				message =
					"Vehicle not found"
			});
		}

		var validation =
			await ValidateRequestAsync(
				request);

		if (validation != null)
		{
			return validation;
		}

		var vehicleNumber =
			NormalizeVehicleNumber(
				request.VehicleNumber);

		var duplicate =
			await _db.Vehicles
				.AnyAsync(x =>
					x.Id != id &&
					x.VehicleNumber ==
					vehicleNumber);

		if (duplicate)
		{
			return BadRequest(new
			{
				message =
					"Vehicle number already exists"
			});
		}

		vehicle.VehicleNumber =
			vehicleNumber;

		vehicle.VehicleType =
			request.VehicleType.Trim();

		vehicle.Manufacturer =
			request.Manufacturer?.Trim();

		vehicle.Model =
			request.Model?.Trim();

		vehicle.ManufacturingYear =
			request.ManufacturingYear;

		vehicle.FuelType =
			request.FuelType?.Trim();

		vehicle.CapacityKg =
			request.CapacityKg;

		vehicle.CapacityCubicFeet =
			request.CapacityCubicFeet;

		vehicle.RcNumber =
			request.RcNumber?.Trim();

		vehicle.RcExpiryDate =
			request.RcExpiryDate;

		vehicle.InsurancePolicyNumber =
			request.InsurancePolicyNumber?
				.Trim();

		vehicle.InsuranceExpiryDate =
			request.InsuranceExpiryDate;

		vehicle.FitnessExpiryDate =
			request.FitnessExpiryDate;

		vehicle.PucExpiryDate =
			request.PucExpiryDate;

		vehicle.ChassisNumber =
			request.ChassisNumber?.Trim();

		vehicle.EngineNumber =
			request.EngineNumber?.Trim();

		vehicle.HubId =
			request.HubId;

		vehicle.IsAvailable =
			request.IsAvailable;

		vehicle.IsActive =
			request.IsActive;

		vehicle.Status =
			request.Status.Trim();

		vehicle.Notes =
			request.Notes?.Trim();

		vehicle.UpdatedAt =
			DateTime.UtcNow;

		await _db.SaveChangesAsync();

		await _auditService.LogAsync(
			"VEHICLE_UPDATED",
			$"Vehicle {vehicle.VehicleNumber} updated");

		return Ok(new
		{
			message =
				"Vehicle updated successfully",

			vehicle
		});
	}

	[HttpPut("{id:int}/availability")]
	[HasPermission(Permissions.Vehicles.Edit)]
	public async Task<IActionResult> ChangeAvailability(
		int id,
		ChangeAvailabilityRequest request)
	{
		var vehicle =
			await _db.Vehicles
				.FirstOrDefaultAsync(x =>
					x.Id == id);

		if (vehicle == null)
		{
			return NotFound(new
			{
				message =
					"Vehicle not found"
			});
		}

		if (!vehicle.IsActive)
		{
			return BadRequest(new
			{
				message =
					"Inactive vehicle cannot be made available"
			});
		}

		var complianceIssue =
			GetComplianceIssue(vehicle);

		if (request.IsAvailable &&
			complianceIssue != null)
		{
			return BadRequest(new
			{
				message =
					complianceIssue
			});
		}

		vehicle.IsAvailable =
			request.IsAvailable;

		vehicle.Status =
			request.IsAvailable
				? "Available"
				: "Unavailable";

		vehicle.UpdatedAt =
			DateTime.UtcNow;

		await _db.SaveChangesAsync();

		return Ok(new
		{
			message =
				"Vehicle availability updated",

			vehicle.Id,
			vehicle.VehicleNumber,
			vehicle.IsAvailable,
			vehicle.Status
		});
	}

	[HttpPut("{id:int}/status")]
	[HasPermission(Permissions.Vehicles.Edit)]
	public async Task<IActionResult> ChangeStatus(
		int id,
		[FromQuery] bool active)
	{
		var vehicle =
			await _db.Vehicles
				.FirstOrDefaultAsync(x =>
					x.Id == id);

		if (vehicle == null)
		{
			return NotFound(new
			{
				message =
					"Vehicle not found"
			});
		}

		vehicle.IsActive =
			active;

		if (!active)
		{
			vehicle.IsAvailable =
				false;

			vehicle.Status =
				"Inactive";
		}
		else
		{
			var complianceIssue =
				GetComplianceIssue(vehicle);

			vehicle.IsAvailable =
				complianceIssue == null;

			vehicle.Status =
				vehicle.IsAvailable
					? "Available"
					: "Compliance Hold";
		}

		vehicle.UpdatedAt =
			DateTime.UtcNow;

		await _db.SaveChangesAsync();

		return Ok(new
		{
			message =
				active
					? "Vehicle activated successfully"
					: "Vehicle deactivated successfully",

			vehicle.IsAvailable,
			vehicle.Status
		});
	}

	[HttpDelete("{id:int}")]
	[HasPermission(Permissions.Vehicles.Delete)]
	public async Task<IActionResult> Delete(
		int id)
	{
		var vehicle =
			await _db.Vehicles
				.FirstOrDefaultAsync(x =>
					x.Id == id);

		if (vehicle == null)
		{
			return NotFound(new
			{
				message =
					"Vehicle not found"
			});
		}

		_db.Vehicles.Remove(vehicle);

		await _db.SaveChangesAsync();

		await _auditService.LogAsync(
			"VEHICLE_DELETED",
			$"Vehicle {vehicle.VehicleNumber} deleted");

		return Ok(new
		{
			message =
				"Vehicle deleted successfully"
		});
	}

	private async Task<IActionResult?>
		ValidateRequestAsync(
			VehicleRequest request)
	{
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

		var currentYear =
			DateTime.UtcNow.Year;

		if (request.ManufacturingYear.HasValue &&
			(request.ManufacturingYear < 1980 ||
			 request.ManufacturingYear >
			 currentYear + 1))
		{
			return BadRequest(new
			{
				message =
					"Invalid manufacturing year"
			});
		}

		return null;
	}

	private static string?
		GetComplianceIssue(
			Vehicle vehicle)
	{
		var today =
			DateTime.UtcNow.Date;

		if (vehicle.RcExpiryDate.HasValue &&
			vehicle.RcExpiryDate.Value.Date <
			today)
		{
			return "Vehicle RC has expired";
		}

		if (vehicle.InsuranceExpiryDate.HasValue &&
			vehicle.InsuranceExpiryDate.Value.Date <
			today)
		{
			return "Vehicle insurance has expired";
		}

		if (vehicle.FitnessExpiryDate.HasValue &&
			vehicle.FitnessExpiryDate.Value.Date <
			today)
		{
			return "Vehicle fitness certificate has expired";
		}

		if (vehicle.PucExpiryDate.HasValue &&
			vehicle.PucExpiryDate.Value.Date <
			today)
		{
			return "Vehicle PUC has expired";
		}

		return null;
	}

	private static string NormalizeVehicleNumber(
		string value)
	{
		return value
			.Trim()
			.Replace(" ", "")
			.Replace("-", "")
			.ToUpperInvariant();
	}
}