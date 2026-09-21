using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace ASK.Group.Api.Services;

public class DeliveryService
{
    private readonly AskTransportDbContext _db;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;

    public DeliveryService(
        AskTransportDbContext db,
        NotificationService notificationService,
        AuditService auditService)
    {
        _db = db;
        _notificationService =
            notificationService;
        _auditService =
            auditService;
    }

    public async Task<(DeliveryOtp Record, string Otp)>
        GenerateOtpAsync(
            Booking booking,
            Shipment shipment)
    {
        var oldOtps =
            await _db.DeliveryOtps
                .Where(x =>
                    x.BookingId ==
                        booking.Id &&
                    !x.IsUsed)
                .ToListAsync();

        foreach (var oldOtp in oldOtps)
        {
            oldOtp.IsUsed = true;
        }

        var otp =
            RandomNumberGenerator
                .GetInt32(
                    100000,
                    1000000)
                .ToString();

        var record =
            new DeliveryOtp
            {
                BookingId =
                    booking.Id,

                ShipmentId =
                    shipment.Id,

                CodeHash =
                    HashOtp(otp),

                ExpiresAt =
                    DateTime.UtcNow
                        .AddMinutes(10),

                IsUsed =
                    false,

                FailedAttempts =
                    0,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.DeliveryOtps.Add(record);

        await _db.SaveChangesAsync();

        await _notificationService
            .CreateAsync(
                booking.UserId,
                "Delivery OTP",
                $"OTP generated for delivery of booking {booking.BookingNumber}.",
                "Delivery",
                booking.Id);

        await _auditService.LogAsync(
            "DELIVERY_OTP_GENERATED",
            $"Delivery OTP generated for booking {booking.BookingNumber}",
            booking.UserId);

        return (
            record,
            otp);
    }

    public async Task<bool> VerifyOtpAsync(
        Booking booking,
        string otp)
    {
        var record =
            await _db.DeliveryOtps
                .Where(x =>
                    x.BookingId ==
                        booking.Id &&
                    !x.IsUsed)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .FirstOrDefaultAsync();

        if (record == null)
        {
            return false;
        }

        if (record.ExpiresAt <
            DateTime.UtcNow)
        {
            record.IsUsed =
                true;

            await _db.SaveChangesAsync();

            return false;
        }

        if (record.FailedAttempts >= 5)
        {
            record.IsUsed =
                true;

            await _db.SaveChangesAsync();

            return false;
        }

        var valid =
            string.Equals(
                record.CodeHash,
                HashOtp(otp),
                StringComparison.Ordinal);

        if (!valid)
        {
            record.FailedAttempts++;

            if (record.FailedAttempts >= 5)
            {
                record.IsUsed = true;
            }

            await _db.SaveChangesAsync();

            return false;
        }

        record.IsUsed =
            true;

        record.UsedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return true;
    }

    private static string HashOtp(
        string otp)
    {
        var bytes =
            SHA256.HashData(
                Encoding.UTF8.GetBytes(
                    otp));

        return Convert
            .ToHexString(bytes);
    }
}