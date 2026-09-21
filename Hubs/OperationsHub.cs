using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Hubs;

[Authorize]
public class OperationsHub : Hub
{
	private readonly AskTransportDbContext _db;
	private readonly PermissionService _permissionService;
	private readonly ILogger<OperationsHub> _logger;

	public OperationsHub(
		AskTransportDbContext db,
		PermissionService permissionService,
		ILogger<OperationsHub> logger)
	{
		_db = db;
		_permissionService =
			permissionService;
		_logger = logger;
	}

	public override async Task OnConnectedAsync()
	{
		var userId =
			GetUserId();

		if (userId == null)
		{
			Context.Abort();
			return;
		}

		var userExists =
			await _db.Users
				.AsNoTracking()
				.AnyAsync(x =>
					x.Id == userId.Value &&
					x.IsActive);

		if (!userExists)
		{
			Context.Abort();
			return;
		}

		await Groups.AddToGroupAsync(
			Context.ConnectionId,
			GetUserGroup(
				userId.Value));

		_logger.LogInformation(
			"SignalR connection {ConnectionId} established for user {UserId}.",
			Context.ConnectionId,
			userId.Value);

		await base.OnConnectedAsync();
	}

	public override async Task OnDisconnectedAsync(
		Exception? exception)
	{
		var userId =
			GetUserId();

		if (userId.HasValue)
		{
			await Groups.RemoveFromGroupAsync(
				Context.ConnectionId,
				GetUserGroup(
					userId.Value));
		}

		if (exception != null)
		{
			_logger.LogWarning(
				exception,
				"SignalR connection {ConnectionId} disconnected with an error.",
				Context.ConnectionId);
		}

		await base.OnDisconnectedAsync(
			exception);
	}

	public async Task JoinOperations()
	{
		var userId =
			GetRequiredUserId();

		var allowed =
			await HasOperationsAccessAsync(
				userId);

		if (!allowed)
		{
			throw new HubException(
				"You do not have permission to join the operations channel.");
		}

		await Groups.AddToGroupAsync(
			Context.ConnectionId,
			"operations");

		_logger.LogInformation(
			"User {UserId} joined SignalR operations group.",
			userId);
	}

	public async Task LeaveOperations()
	{
		await Groups.RemoveFromGroupAsync(
			Context.ConnectionId,
			"operations");
	}

	public async Task JoinBooking(
		string bookingNumber)
	{
		var userId =
			GetRequiredUserId();

		bookingNumber =
			NormalizeBookingNumber(
				bookingNumber);

		var booking =
			await _db.Bookings
				.AsNoTracking()
				.Where(x =>
					x.BookingNumber ==
					bookingNumber)
				.Select(x => new
				{
					x.Id,
					x.BookingNumber,
					x.UserId
				})
				.FirstOrDefaultAsync();

		if (booking == null)
		{
			throw new HubException(
				"Booking not found.");
		}

		var ownsBooking =
			booking.UserId ==
			userId;

		var canViewAllBookings =
			await _permissionService
				.HasPermissionAsync(
					userId,
					Permissions.Bookings.View);

		var canViewOwnBookings =
			await _permissionService
				.HasPermissionAsync(
					userId,
					Permissions.Bookings.ViewOwn);

		var allowed =
			canViewAllBookings ||
			(
				ownsBooking &&
				canViewOwnBookings
			);

		if (!allowed)
		{
			throw new HubException(
				"You do not have access to this booking.");
		}

		await Groups.AddToGroupAsync(
			Context.ConnectionId,
			GetBookingGroup(
				booking.BookingNumber));

		_logger.LogInformation(
			"User {UserId} joined SignalR booking group {BookingNumber}.",
			userId,
			booking.BookingNumber);
	}

	public async Task LeaveBooking(
		string bookingNumber)
	{
		bookingNumber =
			NormalizeBookingNumber(
				bookingNumber);

		await Groups.RemoveFromGroupAsync(
			Context.ConnectionId,
			GetBookingGroup(
				bookingNumber));
	}

	private async Task<bool>
		HasOperationsAccessAsync(
			int userId)
	{
		if (await _permissionService
			.HasPermissionAsync(
				userId,
				Permissions.Bookings.View))
		{
			return true;
		}

		if (await _permissionService
			.HasPermissionAsync(
				userId,
				Permissions.Shipments.View))
		{
			return true;
		}

		if (await _permissionService
			.HasPermissionAsync(
				userId,
				Permissions.Trips.View))
		{
			return true;
		}

		if (await _permissionService
			.HasPermissionAsync(
				userId,
				Permissions.Notifications.ViewAlerts))
		{
			return true;
		}

		return false;
	}

	private int GetRequiredUserId()
	{
		var userId =
			GetUserId();

		if (!userId.HasValue)
		{
			throw new HubException(
				"Invalid authenticated user.");
		}

		return userId.Value;
	}

	private int? GetUserId()
	{
		var value =
			Context.User?
				.FindFirstValue(
					ClaimTypes.NameIdentifier);

		return int.TryParse(
			value,
			out var userId)
			? userId
			: null;
	}

	private static string NormalizeBookingNumber(
		string bookingNumber)
	{
		if (string.IsNullOrWhiteSpace(
			bookingNumber))
		{
			throw new HubException(
				"Booking number is required.");
		}

		bookingNumber =
			bookingNumber.Trim();

		if (bookingNumber.Length >
			100)
		{
			throw new HubException(
				"Invalid booking number.");
		}

		return bookingNumber;
	}

	public static string GetBookingGroup(
		string bookingNumber)
	{
		return $"booking:{bookingNumber}";
	}

	public static string GetUserGroup(
		int userId)
	{
		return $"user:{userId}";
	}
}