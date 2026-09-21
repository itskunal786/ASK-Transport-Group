using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class AdminSupportTicketService
{
	private readonly AskTransportDbContext _db;

	public AdminSupportTicketService(
		AskTransportDbContext db)
	{
		_db = db;
	}


	public async Task<AdminSupportTicketListDto> GetTicketsAsync(
		int page,
		int pageSize,
		string? status,
		string? priority,
		CancellationToken cancellationToken = default)
	{
		page = Math.Max(page, 1);

		pageSize =
			Math.Clamp(pageSize, 1, 100);


		var query =
			_db.SupportTickets
				.AsNoTracking()
				.AsQueryable();


		if (!string.IsNullOrWhiteSpace(status))
		{
			status = status.Trim();

			query =
				query.Where(x =>
					x.Status == status);
		}


		if (!string.IsNullOrWhiteSpace(priority))
		{
			priority = priority.Trim();

			query =
				query.Where(x =>
					x.Priority == priority);
		}


		var totalRecords =
			await query.CountAsync(
				cancellationToken);


		var data =
			await query
				.OrderByDescending(x =>
					x.CreatedAt)
				.Skip(
					(page - 1) * pageSize)
				.Take(pageSize)
				.Select(x =>
					new AdminSupportTicketDto
					{
						Id = x.Id,

						UserId = x.UserId,

						TicketNumber =
							x.TicketNumber,

						Subject =
							x.Subject,

						Description =
							x.Description,

						Category =
							x.Category,

						Priority =
							x.Priority,

						Status =
							x.Status,

						CreatedAt =
							x.CreatedAt,

						UpdatedAt =
							x.UpdatedAt,

						ClosedAt =
							x.ClosedAt
					})
				.ToListAsync(
					cancellationToken);


		return new AdminSupportTicketListDto
		{
			Page = page,

			PageSize = pageSize,

			TotalRecords =
				totalRecords,

			TotalPages =
				(int)Math.Ceiling(
					totalRecords /
					(double)pageSize),

			Data = data
		};
	}


	public async Task<AdminSupportTicketDto?> GetTicketAsync(
		string ticketNumber,
		CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(ticketNumber))
		{
			return null;
		}


		ticketNumber =
			ticketNumber.Trim();


		return await _db.SupportTickets
			.AsNoTracking()
			.Where(x =>
				x.TicketNumber == ticketNumber)
			.Select(x =>
				new AdminSupportTicketDto
				{
					Id = x.Id,

					UserId = x.UserId,

					TicketNumber =
						x.TicketNumber,

					Subject =
						x.Subject,

					Description =
						x.Description,

					Category =
						x.Category,

					Priority =
						x.Priority,

					Status =
						x.Status,

					CreatedAt =
						x.CreatedAt,

					UpdatedAt =
						x.UpdatedAt,

					ClosedAt =
						x.ClosedAt,

					Replies =
						x.Replies
							.OrderBy(r =>
								r.CreatedAt)
							.Select(r =>
								new AdminSupportTicketReplyDto
								{
									Id =
										r.Id,

									UserId =
										r.UserId,

									Message =
										r.Message,

									IsStaffReply =
										r.IsStaffReply,

									CreatedAt =
										r.CreatedAt
								})
							.ToList()
				})
			.FirstOrDefaultAsync(
				cancellationToken);
	}


	public async Task<bool> AddReplyAsync(
		int adminUserId,
		string ticketNumber,
		string message,
		CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(message))
		{
			return false;
		}


		var ticket =
			await _db.SupportTickets
				.FirstOrDefaultAsync(
					x =>
						x.TicketNumber ==
						ticketNumber,
					cancellationToken);


		if (ticket == null ||
			ticket.Status == "Closed")
		{
			return false;
		}


		var reply =
			new SupportTicketReply
			{
				SupportTicketId =
					ticket.Id,

				UserId =
					adminUserId,

				Message =
					message.Trim(),

				IsStaffReply =
					true,

				CreatedAt =
					DateTime.UtcNow
			};


		_db.SupportTicketReplies.Add(
			reply);


		if (ticket.Status == "Open")
		{
			ticket.Status =
				"InProgress";
		}


		ticket.UpdatedAt =
			DateTime.UtcNow;


		await _db.SaveChangesAsync(
			cancellationToken);


		return true;
	}


	public async Task<bool> UpdateStatusAsync(
		string ticketNumber,
		string status,
		CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(status))
		{
			return false;
		}


		status =
			status.Trim();


		var allowedStatuses =
			new[]
			{
				"Open",
				"InProgress",
				"Resolved",
				"Closed"
			};


		if (!allowedStatuses.Contains(
				status,
				StringComparer.OrdinalIgnoreCase))
		{
			return false;
		}


		var normalizedStatus =
			allowedStatuses.First(x =>
				x.Equals(
					status,
					StringComparison.OrdinalIgnoreCase));


		var ticket =
			await _db.SupportTickets
				.FirstOrDefaultAsync(
					x =>
						x.TicketNumber ==
						ticketNumber,
					cancellationToken);


		if (ticket == null)
		{
			return false;
		}


		ticket.Status =
			normalizedStatus;

		ticket.UpdatedAt =
			DateTime.UtcNow;


		if (normalizedStatus == "Closed")
		{
			ticket.ClosedAt =
				DateTime.UtcNow;
		}
		else
		{
			ticket.ClosedAt =
				null;
		}


		await _db.SaveChangesAsync(
			cancellationToken);


		return true;
	}


	public async Task<bool> UpdatePriorityAsync(
		string ticketNumber,
		string priority,
		CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(priority))
		{
			return false;
		}


		priority =
			priority.Trim();


		var allowedPriorities =
			new[]
			{
				"Low",
				"Normal",
				"High",
				"Urgent"
			};


		if (!allowedPriorities.Contains(
				priority,
				StringComparer.OrdinalIgnoreCase))
		{
			return false;
		}


		var normalizedPriority =
			allowedPriorities.First(x =>
				x.Equals(
					priority,
					StringComparison.OrdinalIgnoreCase));


		var ticket =
			await _db.SupportTickets
				.FirstOrDefaultAsync(
					x =>
						x.TicketNumber ==
						ticketNumber,
					cancellationToken);


		if (ticket == null)
		{
			return false;
		}


		ticket.Priority =
			normalizedPriority;

		ticket.UpdatedAt =
			DateTime.UtcNow;


		await _db.SaveChangesAsync(
			cancellationToken);


		return true;
	}
}