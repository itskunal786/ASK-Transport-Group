using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class ComplianceAlertService
{
	private readonly AskTransportDbContext _db;

	public ComplianceAlertService(
		AskTransportDbContext db)
	{
		_db = db;
	}

	public async Task GenerateAlertsAsync()
	{
		var today =
			DateTime.UtcNow.Date;

		var warningDate =
			today.AddDays(30);

		var drivers =
			await _db.Drivers
				.Where(x =>
					x.IsActive &&
					x.LicenseExpiryDate.Date <= warningDate)
				.ToListAsync();

		foreach (var driver in drivers)
		{
			await CreateAlertIfMissingAsync(
				"DriverLicenseExpiry",
				"Driver",
				driver.Id,
				driver.LicenseExpiryDate.Date < today
					? "Driver License Expired"
					: "Driver License Expiring",

				$"Driving license for {driver.Name} expires on {driver.LicenseExpiryDate:dd-MMM-yyyy}.",

				driver.LicenseExpiryDate.Date < today
					? "Critical"
					: "Warning");
		}

		var vehicles =
			await _db.Vehicles
				.Where(x =>
					x.IsActive)
				.ToListAsync();

		foreach (var vehicle in vehicles)
		{
			await CheckVehicleDateAsync(
				vehicle,
				vehicle.InsuranceExpiryDate,
				"VehicleInsuranceExpiry",
				"Vehicle Insurance");

			await CheckVehicleDateAsync(
				vehicle,
				vehicle.RcExpiryDate,
				"VehicleRcExpiry",
				"Vehicle RC");

			await CheckVehicleDateAsync(
				vehicle,
				vehicle.FitnessExpiryDate,
				"VehicleFitnessExpiry",
				"Vehicle Fitness");

			await CheckVehicleDateAsync(
				vehicle,
				vehicle.PucExpiryDate,
				"VehiclePucExpiry",
				"Vehicle PUC");
		}

		await _db.SaveChangesAsync();
	}

	private async Task CheckVehicleDateAsync(
		Vehicle vehicle,
		DateTime? expiryDate,
		string alertType,
		string label)
	{
		if (!expiryDate.HasValue)
		{
			return;
		}

		var today =
			DateTime.UtcNow.Date;

		var warningDate =
			today.AddDays(30);

		if (expiryDate.Value.Date >
			warningDate)
		{
			return;
		}

		await CreateAlertIfMissingAsync(
			alertType,
			"Vehicle",
			vehicle.Id,

			expiryDate.Value.Date < today
				? $"{label} Expired"
				: $"{label} Expiring",

			$"{label} for vehicle {vehicle.VehicleNumber} expires on {expiryDate:dd-MMM-yyyy}.",

			expiryDate.Value.Date < today
				? "Critical"
				: "Warning");
	}

	private async Task CreateAlertIfMissingAsync(
		string alertType,
		string referenceType,
		int referenceId,
		string title,
		string message,
		string severity)
	{
		var exists =
			await _db.SystemAlerts
				.AnyAsync(x =>
					x.AlertType ==
						alertType &&
					x.ReferenceType ==
						referenceType &&
					x.ReferenceId ==
						referenceId &&
					!x.IsResolved);

		if (exists)
		{
			return;
		}

		_db.SystemAlerts.Add(
			new SystemAlert
			{
				AlertType =
					alertType,

				ReferenceType =
					referenceType,

				ReferenceId =
					referenceId,

				Title =
					title,

				Message =
					message,

				Severity =
					severity,

				IsResolved =
					false,

				CreatedAt =
					DateTime.UtcNow
			});
	}
}