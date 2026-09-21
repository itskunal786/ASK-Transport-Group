using ASK.Group.Api.Authorization;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
	private readonly ReportService _reportService;

	public AnalyticsController(
		ReportService reportService)
	{
		_reportService =
			reportService;
	}

	[HttpGet("dashboard")]
	[HasPermission(
		Permissions.Reports.View)]
	public async Task<IActionResult> Dashboard(
		[FromQuery] DateTime? fromDate,
		[FromQuery] DateTime? toDate)
	{
		var data =
			await _reportService
				.GetDashboardAsync(
					new ReportFilterRequest
					{
						FromDate =
							fromDate,

						ToDate =
							toDate
					});

		return Ok(data);
	}

	[HttpGet("monthly-bookings")]
	[HasPermission(
		Permissions.Reports.View)]
	public async Task<IActionResult>
		MonthlyBookings(
			[FromQuery] int? year)
	{
		var selectedYear =
			year ??
			DateTime.UtcNow.Year;

		var data =
			await _reportService
				.GetMonthlyBookingsAsync(
					selectedYear);

		return Ok(data);
	}

	[HttpGet("booking-status")]
	[HasPermission(
		Permissions.Reports.View)]
	public async Task<IActionResult>
		BookingStatus()
	{
		return Ok(
			await _reportService
				.GetBookingStatusSummaryAsync());
	}

	[HttpGet("payments")]
	[HasPermission(
		Permissions.Reports.View)]
	public async Task<IActionResult>
		Payments()
	{
		return Ok(
			await _reportService
				.GetPaymentSummaryAsync());
	}

	[HttpGet("top-routes")]
	[HasPermission(
		Permissions.Reports.View)]
	public async Task<IActionResult>
		TopRoutes(
			[FromQuery] int count = 10)
	{
		return Ok(
			await _reportService
				.GetTopRoutesAsync(count));
	}

	[HttpGet("drivers")]
	[HasPermission(
		Permissions.Reports.View)]
	public async Task<IActionResult>
		Drivers()
	{
		return Ok(
			await _reportService
				.GetDriverPerformanceAsync());
	}

	[HttpGet("vehicles")]
	[HasPermission(
		Permissions.Reports.View)]
	public async Task<IActionResult>
		Vehicles()
	{
		return Ok(
			await _reportService
				.GetVehiclePerformanceAsync());
	}
}