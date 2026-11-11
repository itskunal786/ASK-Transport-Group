using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class NotificationPreferenceService
{
	private readonly AskTransportDbContext _db;

	public NotificationPreferenceService(
		AskTransportDbContext db)
	{
		_db = db;
	}


	public async Task<NotificationPreferenceDto>
		GetAsync(
			int userId,
			CancellationToken cancellationToken = default)
	{
		var preference =
			await _db.NotificationPreferences
				.AsNoTracking()
				.FirstOrDefaultAsync(
					x => x.UserId == userId,
					cancellationToken);


		if (preference == null)
		{
			return new NotificationPreferenceDto
			{
				EmailEnabled = true,
				SmsEnabled = true,
				InAppEnabled = true
			};
		}


		return new NotificationPreferenceDto
		{
			EmailEnabled =
				preference.EmailEnabled,

			SmsEnabled =
				preference.SmsEnabled,

			InAppEnabled =
				preference.InAppEnabled
		};
	}


	public async Task<NotificationPreferenceDto>
		UpdateAsync(
			int userId,
			UpdateNotificationPreferenceRequest request,
			CancellationToken cancellationToken = default)
	{
		var preference =
			await _db.NotificationPreferences
				.FirstOrDefaultAsync(
					x => x.UserId == userId,
					cancellationToken);


		if (preference == null)
		{
			preference =
				new NotificationPreference
				{
					UserId = userId,

					EmailEnabled =
						request.EmailEnabled,

					SmsEnabled =
						request.SmsEnabled,

					InAppEnabled =
						request.InAppEnabled,

					CreatedAt =
						DateTime.UtcNow
				};

			_db.NotificationPreferences.Add(
				preference);
		}
		else
		{
			preference.EmailEnabled =
				request.EmailEnabled;

			preference.SmsEnabled =
				request.SmsEnabled;

			preference.InAppEnabled =
				request.InAppEnabled;

			preference.UpdatedAt =
				DateTime.UtcNow;
		}


		await _db.SaveChangesAsync(
			cancellationToken);


		return new NotificationPreferenceDto
		{
			EmailEnabled =
				preference.EmailEnabled,

			SmsEnabled =
				preference.SmsEnabled,

			InAppEnabled =
				preference.InAppEnabled
		};
	}
}