using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class OwnershipService
{
    private readonly AskTransportDbContext _db;

    public OwnershipService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<bool> IsAdminAsync(
        int userId)
    {
        return await _db.Users
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == userId &&
                x.IsActive &&
                x.Role == UserRole.Admin);
    }

    public async Task<bool> CanAccessBookingAsync(
        int userId,
        int bookingId)
    {
        if (await IsAdminAsync(userId))
        {
            return true;
        }

        return await _db.Bookings
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == bookingId &&
                x.UserId == userId);
    }

    public async Task<bool> CanAccessBookingNumberAsync(
        int userId,
        string bookingNumber)
    {
        if (await IsAdminAsync(userId))
        {
            return true;
        }

        return await _db.Bookings
            .AsNoTracking()
            .AnyAsync(x =>
                x.BookingNumber == bookingNumber &&
                x.UserId == userId);
    }

    public async Task<bool> CanAccessInvoiceAsync(
        int userId,
        int invoiceId)
    {
        if (await IsAdminAsync(userId))
        {
            return true;
        }

        return await (
            from invoice in _db.Invoices
            join booking in _db.Bookings
                on invoice.BookingId equals booking.Id
            where
                invoice.Id == invoiceId &&
                booking.UserId == userId
            select invoice.Id
        ).AnyAsync();
    }

    public async Task<bool> CanAccessPaymentAsync(
        int userId,
        int paymentId)
    {
        if (await IsAdminAsync(userId))
        {
            return true;
        }

        return await (
            from payment in _db.PaymentTransactions
            join booking in _db.Bookings
                on payment.BookingId equals booking.Id
            where
                payment.Id == paymentId &&
                booking.UserId == userId
            select payment.Id
        ).AnyAsync();
    }

    public async Task<bool> CanAccessDocumentAsync(
        int userId,
        int documentId)
    {
        if (await IsAdminAsync(userId))
        {
            return true;
        }

        return await (
            from document in _db.BookingDocuments
            join booking in _db.Bookings
                on document.BookingId equals booking.Id
            where
                document.Id == documentId &&
                booking.UserId == userId
            select document.Id
        ).AnyAsync();
    }

    public async Task<bool> CanAccessShipmentAsync(
        int userId,
        int shipmentId)
    {
        if (await IsAdminAsync(userId))
        {
            return true;
        }

        return await (
            from shipment in _db.Shipments
            join booking in _db.Bookings
                on shipment.BookingId equals booking.Id
            where
                shipment.Id == shipmentId &&
                booking.UserId == userId
            select shipment.Id
        ).AnyAsync();
    }

    public async Task<bool> CanAccessShipmentNumberAsync(
        int userId,
        string shipmentNumber)
    {
        if (await IsAdminAsync(userId))
        {
            return true;
        }

        return await (
            from shipment in _db.Shipments
            join booking in _db.Bookings
                on shipment.BookingId equals booking.Id
            where
                shipment.ShipmentNumber == shipmentNumber &&
                booking.UserId == userId
            select shipment.Id
        ).AnyAsync();
    }

    public async Task<bool> CanAccessProofOfDeliveryAsync(
        int userId,
        int podId)
    {
        if (await IsAdminAsync(userId))
        {
            return true;
        }

        return await (
            from pod in _db.ProofsOfDelivery
            join booking in _db.Bookings
                on pod.BookingId equals booking.Id
            where
                pod.Id == podId &&
                booking.UserId == userId
            select pod.Id
        ).AnyAsync();
    }

    public async Task<int?> GetBookingOwnerIdAsync(
        int bookingId)
    {
        return await _db.Bookings
            .AsNoTracking()
            .Where(x =>
                x.Id == bookingId)
            .Select(x =>
                (int?)x.UserId)
            .FirstOrDefaultAsync();
    }
}