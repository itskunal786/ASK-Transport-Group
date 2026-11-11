using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientNotificationService
{
    private readonly AskTransportDbContext _db;

    public ClientNotificationService(
        AskTransportDbContext db)
    {
        _db = db;
    }


    public async Task<ClientNotificationListDto>
        GetMyNotificationsAsync(
            int userId,
            int page,
            int pageSize,
            bool? isRead,
            CancellationToken cancellationToken = default)
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 10;
        }

        if (pageSize > 100)
        {
            pageSize = 100;
        }


        var query = _db.Notifications
            .AsNoTracking()
            .Where(x => x.UserId == userId);


        if (isRead.HasValue)
        {
            query = query.Where(x =>
                x.IsRead == isRead.Value);
        }


        var totalRecords =
            await query.CountAsync(cancellationToken);


        var unreadCount =
            await _db.Notifications
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.UserId == userId &&
                        !x.IsRead,
                    cancellationToken);


        var data =
            await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x =>
                    new ClientNotificationDto
                    {
                        Id = x.Id,
                        Title = x.Title,
                        Message = x.Message,
                        Type = x.Type,
                        BookingId = x.BookingId,

                        BookingNumber =
                            x.Booking != null
                                ? x.Booking.BookingNumber
                                : null,

                        ShipmentNumber =
                            _db.Shipments
                                .Where(s =>
                                    s.BookingId == x.BookingId)
                                .Select(s =>
                                    s.ShipmentNumber)
                                .FirstOrDefault(),

                        IsRead = x.IsRead,
                        CreatedAt = x.CreatedAt,
                        ReadAt = x.ReadAt
                    })
                .ToListAsync(cancellationToken);


        return new ClientNotificationListDto
        {
            Page = page,
            PageSize = pageSize,
            TotalRecords = totalRecords,

            TotalPages =
                (int)Math.Ceiling(
                    totalRecords / (double)pageSize),

            UnreadCount = unreadCount,

            Data = data
        };
    }


    public async Task<ClientNotificationDto?>
        GetNotificationAsync(
            int userId,
            int notificationId,
            CancellationToken cancellationToken = default)
    {
        return await _db.Notifications
            .AsNoTracking()
            .Where(x =>
                x.Id == notificationId &&
                x.UserId == userId)
            .Select(x =>
                new ClientNotificationDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    Message = x.Message,
                    Type = x.Type,
                    BookingId = x.BookingId,

                    BookingNumber =
                        x.Booking != null
                            ? x.Booking.BookingNumber
                            : null,

                    ShipmentNumber =
                        _db.Shipments
                            .Where(s =>
                                s.BookingId == x.BookingId)
                            .Select(s =>
                                s.ShipmentNumber)
                            .FirstOrDefault(),

                    IsRead = x.IsRead,
                    CreatedAt = x.CreatedAt,
                    ReadAt = x.ReadAt
                })
            .FirstOrDefaultAsync(cancellationToken);
    }


    public async Task<bool> MarkAsReadAsync(
        int userId,
        int notificationId,
        CancellationToken cancellationToken = default)
    {
        var notification =
            await _db.Notifications
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == notificationId &&
                        x.UserId == userId,
                    cancellationToken);


        if (notification == null)
        {
            return false;
        }


        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(
                cancellationToken);
        }


        return true;
    }


    public async Task<int> MarkAllAsReadAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var notifications =
            await _db.Notifications
                .Where(x =>
                    x.UserId == userId &&
                    !x.IsRead)
                .ToListAsync(cancellationToken);


        if (notifications.Count == 0)
        {
            return 0;
        }


        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }


        await _db.SaveChangesAsync(
            cancellationToken);

        return notifications.Count;
    }


    public async Task<bool> DeleteAsync(
        int userId,
        int notificationId,
        CancellationToken cancellationToken = default)
    {
        var notification =
            await _db.Notifications
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == notificationId &&
                        x.UserId == userId,
                    cancellationToken);


        if (notification == null)
        {
            return false;
        }


        _db.Notifications.Remove(notification);

        await _db.SaveChangesAsync(
            cancellationToken);

        return true;
    }


    public async Task<int> ClearReadAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var notifications =
            await _db.Notifications
                .Where(x =>
                    x.UserId == userId &&
                    x.IsRead)
                .ToListAsync(cancellationToken);


        if (notifications.Count == 0)
        {
            return 0;
        }


        _db.Notifications.RemoveRange(
            notifications);

        await _db.SaveChangesAsync(
            cancellationToken);

        return notifications.Count;
    }
}
