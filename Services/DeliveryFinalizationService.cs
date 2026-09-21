using System.Security.Cryptography;
using System.Text;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class DeliveryFinalizationService
{
    private readonly AskTransportDbContext _db;
    private readonly NotificationService _notificationService;

    public DeliveryFinalizationService(
        AskTransportDbContext db,
        NotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task<DeliveryFinalizationResult>
        FinalizeAsync(
            int shipmentId,
            FinalizeDeliveryRequest request)
    {
        var shipment =
            await _db.Shipments
                .FirstOrDefaultAsync(x =>
                    x.Id == shipmentId);

        if (shipment == null)
        {
            return Fail(
                shipmentId,
                "Shipment not found");
        }

        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(x =>
                    x.Id == shipment.BookingId);

        if (booking == null)
        {
            return Fail(
                shipmentId,
                "Booking not found");
        }

        if (shipment.Status == "Delivered")
        {
            return new DeliveryFinalizationResult
            {
                Success = true,
                ShipmentId = shipment.Id,
                BookingNumber = booking.BookingNumber,
                ShipmentStatus = shipment.Status,
                BookingStatus = booking.BookingStatus,
                Message = "Shipment is already delivered"
            };
        }

        if (shipment.Status != "Out for Delivery")
        {
            return Fail(
                shipmentId,
                "Shipment must be Out for Delivery before delivery");
        }

        var deliveryOtp =
            await _db.DeliveryOtps
                .Where(x =>
                    x.ShipmentId == shipmentId &&
                    x.BookingId == booking.Id)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();

        if (deliveryOtp == null)
        {
            return Fail(
                shipmentId,
                "Delivery OTP not found");
        }

        if (deliveryOtp.IsUsed)
        {
            return Fail(
                shipmentId,
                "Delivery OTP has already been used");
        }

        if (deliveryOtp.ExpiresAt <
            DateTime.UtcNow)
        {
            return Fail(
                shipmentId,
                "Delivery OTP has expired");
        }
        var otpBytes =
            SHA256.HashData(
                Encoding.UTF8.GetBytes(
                    request.Otp.Trim()));

        var otpHash =
            Convert.ToHexString(otpBytes);

        if (!string.Equals(
                deliveryOtp.CodeHash,
                otpHash,
                StringComparison.Ordinal))
        {
            deliveryOtp.FailedAttempts++;

            if (deliveryOtp.FailedAttempts >= 5)
            {
                deliveryOtp.IsUsed = true;
            }

            await _db.SaveChangesAsync();

            return Fail(
                shipmentId,
                "Invalid delivery OTP");
        }

        deliveryOtp.IsUsed = true;
        deliveryOtp.UsedAt = DateTime.UtcNow;

        shipment.Status = "Delivered";
        shipment.UpdatedAt = DateTime.UtcNow;

        var allOtherShipmentsDelivered =
            await _db.Shipments
                .Where(x =>
                    x.BookingId == booking.Id &&
                    x.Id != shipment.Id)
                .AllAsync(x =>
                    x.Status == "Delivered");

        if (allOtherShipmentsDelivered)
        {
            booking.BookingStatus = "Delivered";
            booking.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        await _notificationService.CreateAsync(
            booking.UserId,
            "Shipment Delivered",
            $"Shipment {shipment.ShipmentNumber} has been delivered successfully.",
            "Delivery",
            booking.Id);

        return new DeliveryFinalizationResult
        {
            Success = true,

            ShipmentId =
                shipment.Id,

            BookingNumber =
                booking.BookingNumber,

            ShipmentStatus =
                shipment.Status,

            BookingStatus =
                booking.BookingStatus,

            Message =
                "Delivery completed successfully"
        };
    }

    private static DeliveryFinalizationResult Fail(
        int shipmentId,
        string message)
    {
        return new DeliveryFinalizationResult
        {
            Success = false,
            ShipmentId = shipmentId,
            Message = message
        };
    }
}



