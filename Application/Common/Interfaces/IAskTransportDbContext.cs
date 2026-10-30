using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace ASK.Group.Api.Application.Common.Interfaces;

public interface IAskTransportDbContext
{
    DbSet<AppUser> Users { get; }
    DbSet<OtpCode> OtpCodes { get; }
    DbSet<CaptchaChallenge> Captchas { get; }
    DbSet<State> States { get; }
    DbSet<City> Cities { get; }
    DbSet<PinCode> PinCodes { get; }
    DbSet<TransportService> TransportServices { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<BookingItem> BookingItems { get; }
    DbSet<BookingDocument> BookingDocuments { get; }
    DbSet<ShipmentTracking> ShipmentTrackings { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<InvoiceItem> InvoiceItems { get; }
    DbSet<PaymentTransaction> PaymentTransactions { get; }
    DbSet<PaymentRefund> PaymentRefunds { get; }
    DbSet<PaymentWebhookLog> PaymentWebhookLogs { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<LoginAttempt> LoginAttempts { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<NotificationTemplate> NotificationTemplates { get; }
    DbSet<NotificationLog> NotificationLogs { get; }
    DbSet<SystemAlert> SystemAlerts { get; }
    DbSet<AppRole> AppRoles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<UserRoleAssignment> UserRoleAssignments { get; }
    DbSet<UserPermission> UserPermissions { get; }
    DbSet<Branch> Branches { get; }
    DbSet<Hub> Hubs { get; }
    DbSet<Driver> Drivers { get; }
    DbSet<Vehicle> Vehicles { get; }
    DbSet<Shipment> Shipments { get; }
    DbSet<TransportTrip> TransportTrips { get; }
    DbSet<TripShipment> TripShipments { get; }
    DbSet<ShipmentMovement> ShipmentMovements { get; }
    DbSet<TransportRoute> TransportRoutes { get; }
    DbSet<RateCard> RateCards { get; }
    DbSet<RateSlab> RateSlabs { get; }
    DbSet<DeliveryAttempt> DeliveryAttempts { get; }
    DbSet<DeliveryOtp> DeliveryOtps { get; }
    DbSet<ProofOfDelivery> ProofsOfDelivery { get; }
    DbSet<SystemSetting> SystemSettings { get; }
    DbSet<CompanyProfile> CompanyProfiles { get; }
    DbSet<ShipmentScan> ShipmentScans { get; }
    DbSet<PartnerWebhook> PartnerWebhooks { get; }
    DbSet<WebhookDeliveryLog> WebhookDeliveryLogs { get; }
    DbSet<WebhookOutboxMessage> WebhookOutboxMessages { get; }
    DbSet<OperationsException> OperationsExceptions { get; }
    DbSet<OperationsExceptionHistory> OperationsExceptionHistories { get; }
    DbSet<SupportTicket> SupportTickets { get; }
    DbSet<SupportTicketReply> SupportTicketReplies { get; }
    DbSet<ClientAddress> ClientAddresses { get; }
    DbSet<NotificationPreference> NotificationPreferences { get; }
    DbSet<SavedContact> SavedContacts { get; }
    DbSet<DeliveryFeedback> DeliveryFeedbacks { get; }

    DatabaseFacade Database { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    int SaveChanges();
}
