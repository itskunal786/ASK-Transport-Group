using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Data;

public class AskTransportDbContext : DbContext
{
    public AskTransportDbContext(
        DbContextOptions<AskTransportDbContext> options)
        : base(options)
    {
    }


    public DbSet<AppUser> Users =>
        Set<AppUser>();

    public DbSet<OtpCode> OtpCodes =>
        Set<OtpCode>();

    public DbSet<CaptchaChallenge> Captchas =>
        Set<CaptchaChallenge>();

    public DbSet<State> States =>
        Set<State>();

    public DbSet<City> Cities =>
        Set<City>();

    public DbSet<PinCode> PinCodes =>
        Set<PinCode>();

    public DbSet<TransportService> TransportServices =>
        Set<TransportService>();


    public DbSet<Booking> Bookings =>
        Set<Booking>();

    public DbSet<BookingItem> BookingItems =>
        Set<BookingItem>();

    public DbSet<BookingDocument> BookingDocuments =>
        Set<BookingDocument>();

    public DbSet<ShipmentTracking> ShipmentTrackings =>
        Set<ShipmentTracking>();


    public DbSet<Invoice> Invoices =>
        Set<Invoice>();

    public DbSet<InvoiceItem> InvoiceItems =>
        Set<InvoiceItem>();

    public DbSet<PaymentTransaction> PaymentTransactions =>
        Set<PaymentTransaction>();

    public DbSet<PaymentRefund> PaymentRefunds =>
        Set<PaymentRefund>();

    public DbSet<PaymentWebhookLog> PaymentWebhookLogs =>
        Set<PaymentWebhookLog>();


    public DbSet<AuditLog> AuditLogs =>
        Set<AuditLog>();

    public DbSet<LoginAttempt> LoginAttempts =>
        Set<LoginAttempt>();

    public DbSet<RefreshToken> RefreshTokens =>
        Set<RefreshToken>();


    public DbSet<Notification> Notifications =>
        Set<Notification>();

    public DbSet<NotificationTemplate> NotificationTemplates =>
        Set<NotificationTemplate>();

    public DbSet<NotificationLog> NotificationLogs =>
        Set<NotificationLog>();

    public DbSet<SystemAlert> SystemAlerts =>
        Set<SystemAlert>();


    public DbSet<AppRole> AppRoles =>
        Set<AppRole>();

    public DbSet<Permission> Permissions =>
        Set<Permission>();

    public DbSet<RolePermission> RolePermissions =>
        Set<RolePermission>();

    public DbSet<UserRoleAssignment> UserRoleAssignments =>
        Set<UserRoleAssignment>();

    public DbSet<UserPermission> UserPermissions =>
        Set<UserPermission>();


    public DbSet<Branch> Branches =>
        Set<Branch>();

    public DbSet<Hub> Hubs =>
        Set<Hub>();


    public DbSet<Driver> Drivers =>
        Set<Driver>();

    public DbSet<Vehicle> Vehicles =>
        Set<Vehicle>();


    public DbSet<Shipment> Shipments =>
        Set<Shipment>();

    public DbSet<TransportTrip> TransportTrips =>
        Set<TransportTrip>();

    public DbSet<TripShipment> TripShipments =>
        Set<TripShipment>();

    public DbSet<ShipmentMovement> ShipmentMovements =>
        Set<ShipmentMovement>();


    public DbSet<TransportRoute> TransportRoutes =>
        Set<TransportRoute>();

    public DbSet<RateCard> RateCards =>
        Set<RateCard>();

    public DbSet<RateSlab> RateSlabs =>
        Set<RateSlab>();


    public DbSet<DeliveryAttempt> DeliveryAttempts =>
        Set<DeliveryAttempt>();

    public DbSet<DeliveryOtp> DeliveryOtps =>
        Set<DeliveryOtp>();

    public DbSet<ProofOfDelivery> ProofsOfDelivery =>
        Set<ProofOfDelivery>();


    public DbSet<SystemSetting> SystemSettings =>
        Set<SystemSetting>();

    public DbSet<CompanyProfile> CompanyProfiles =>
        Set<CompanyProfile>();


    public DbSet<ShipmentScan> ShipmentScans =>
        Set<ShipmentScan>();

    public DbSet<PartnerWebhook> PartnerWebhooks =>
        Set<PartnerWebhook>();

    public DbSet<WebhookDeliveryLog> WebhookDeliveryLogs =>
        Set<WebhookDeliveryLog>();

    public DbSet<WebhookOutboxMessage> WebhookOutboxMessages =>
        Set<WebhookOutboxMessage>();

    public DbSet<OperationsException> OperationsExceptions =>
        Set<OperationsException>();

    public DbSet<OperationsExceptionHistory> OperationsExceptionHistories =>
        Set<OperationsExceptionHistory>();

    public DbSet<SupportTicket> SupportTickets =>
    Set<SupportTicket>();

    public DbSet<SupportTicketReply> SupportTicketReplies =>
        Set<SupportTicketReply>();

    public DbSet<ClientAddress> ClientAddresses =>
    Set<ClientAddress>();

    public DbSet<NotificationPreference> NotificationPreferences
    => Set<NotificationPreference>();

    public DbSet<SavedContact> SavedContacts
    => Set<SavedContact>();
    public DbSet<DeliveryFeedback> DeliveryFeedbacks =>
        Set<DeliveryFeedback>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        modelBuilder.Entity<AppUser>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<NotificationPreference>()
    .HasIndex(x => x.UserId)
    .IsUnique();



        modelBuilder.Entity<State>()
            .HasIndex(x => x.Code)
            .IsUnique();

        modelBuilder.Entity<PinCode>()
            .HasIndex(x => x.Pin);

        modelBuilder.Entity<City>()
            .HasOne(x => x.State)
            .WithMany()
            .HasForeignKey(x => x.StateId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SavedContact>()
    .HasIndex(x => new
    {
        x.UserId,
        x.ContactType
    });

        modelBuilder.Entity<DeliveryFeedback>()
    .HasQueryFilter(x => !x.Booking!.IsDeleted);

        modelBuilder.Entity<DeliveryFeedback>()
            .HasIndex(x => new
            {
                x.BookingId,
                x.UserId
            })
            .IsUnique();


        modelBuilder.Entity<TransportService>()
            .HasIndex(x => x.Name);

        modelBuilder.Entity<TransportService>()
            .Property(x => x.BaseRate)
            .HasPrecision(18, 2);

        modelBuilder.Entity<TransportService>()
            .Property(x => x.PerKgRate)
            .HasPrecision(18, 2);


        modelBuilder.Entity<Booking>()
            .HasIndex(x => x.BookingNumber)
            .IsUnique();

        modelBuilder.Entity<Booking>()
            .Property(x => x.Weight)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Booking>()
            .Property(x => x.FreightAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Booking>()
            .Property(x => x.GstPercentage)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Booking>()
            .Property(x => x.GstAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Booking>()
            .Property(x => x.DiscountAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Booking>()
            .Property(x => x.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Booking>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(x => x.TransportService)
            .WithMany()
            .HasForeignKey(x => x.TransportServiceId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<BookingItem>()
            .Property(x => x.Weight)
            .HasPrecision(18, 2);

        modelBuilder.Entity<BookingItem>()
            .Property(x => x.Length)
            .HasPrecision(18, 2);

        modelBuilder.Entity<BookingItem>()
            .Property(x => x.Width)
            .HasPrecision(18, 2);

        modelBuilder.Entity<BookingItem>()
            .Property(x => x.Height)
            .HasPrecision(18, 2);

        modelBuilder.Entity<BookingItem>()
            .Property(x => x.DeclaredValue)
            .HasPrecision(18, 2);

        modelBuilder.Entity<BookingItem>()
            .HasOne(x => x.Booking)
            .WithMany(x => x.BookingItems)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<BookingDocument>()
            .HasIndex(x => new
            {
                x.BookingId,
                x.CreatedAt
            });

        modelBuilder.Entity<BookingDocument>()
            .HasOne(x => x.Booking)
            .WithMany()
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<ShipmentTracking>()
            .HasOne(x => x.Booking)
            .WithMany(x => x.ShipmentTrackings)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<Invoice>()
            .HasIndex(x => x.InvoiceNumber)
            .IsUnique();

        modelBuilder.Entity<Invoice>()
            .Property(x => x.SubTotal)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Invoice>()
            .Property(x => x.GstPercentage)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Invoice>()
            .Property(x => x.GstAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Invoice>()
            .Property(x => x.DiscountAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Invoice>()
            .Property(x => x.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Invoice>()
            .HasOne(x => x.Booking)
            .WithOne(x => x.Invoice)
            .HasForeignKey<Invoice>(
                x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<InvoiceItem>()
            .Property(x => x.Rate)
            .HasPrecision(18, 2);

        modelBuilder.Entity<InvoiceItem>()
            .Property(x => x.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<InvoiceItem>()
            .HasOne(x => x.Invoice)
            .WithMany(x => x.InvoiceItems)
            .HasForeignKey(x => x.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<PaymentTransaction>()
            .HasIndex(x => x.TransactionId)
            .IsUnique();

        modelBuilder.Entity<PaymentTransaction>()
            .Property(x => x.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PaymentTransaction>()
            .HasOne(x => x.Booking)
            .WithMany(x => x.PaymentTransactions)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<LoginAttempt>()
            .HasIndex(x => new
            {
                x.Email,
                x.AttemptedAt
            });

        modelBuilder.Entity<AuditLog>()
            .HasIndex(x => x.CreatedAt);


        modelBuilder.Entity<RefreshToken>()
            .HasIndex(x => x.Token)
            .IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(x => new
            {
                x.UserId,
                x.ExpiresAt
            });

        modelBuilder.Entity<RefreshToken>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<Notification>()
            .HasIndex(x => new
            {
                x.UserId,
                x.IsRead,
                x.CreatedAt
            });

        modelBuilder.Entity<Notification>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(x => x.Booking)
            .WithMany()
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.NoAction);


        modelBuilder.Entity<AppRole>()
            .HasIndex(x => x.Name)
            .IsUnique();

        modelBuilder.Entity<Permission>()
            .HasIndex(x => x.Code)
            .IsUnique();

        modelBuilder.Entity<RolePermission>()
            .HasIndex(x => new
            {
                x.RoleId,
                x.PermissionId
            })
            .IsUnique();

        modelBuilder.Entity<UserRoleAssignment>()
            .HasIndex(x => new
            {
                x.UserId,
                x.RoleId
            })
            .IsUnique();

        modelBuilder.Entity<UserPermission>()
            .HasIndex(x => new
            {
                x.UserId,
                x.PermissionId
            })
            .IsUnique();

        modelBuilder.Entity<RolePermission>()
            .HasOne(x => x.Role)
            .WithMany()
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RolePermission>()
            .HasOne(x => x.Permission)
            .WithMany()
            .HasForeignKey(x => x.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRoleAssignment>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRoleAssignment>()
            .HasOne(x => x.Role)
            .WithMany()
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserPermission>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserPermission>()
            .HasOne(x => x.Permission)
            .WithMany()
            .HasForeignKey(x => x.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<Branch>()
            .HasIndex(x => x.Code)
            .IsUnique();

        modelBuilder.Entity<Branch>()
            .HasOne(x => x.State)
            .WithMany()
            .HasForeignKey(x => x.StateId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Branch>()
            .HasOne(x => x.City)
            .WithMany()
            .HasForeignKey(x => x.CityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Branch>()
            .HasOne(x => x.ManagerUser)
            .WithMany()
            .HasForeignKey(x => x.ManagerUserId)
            .OnDelete(DeleteBehavior.SetNull);


        modelBuilder.Entity<Hub>()
            .HasIndex(x => x.Code)
            .IsUnique();

        modelBuilder.Entity<Hub>()
            .HasOne(x => x.Branch)
            .WithMany()
            .HasForeignKey(x => x.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hub>()
            .HasOne(x => x.State)
            .WithMany()
            .HasForeignKey(x => x.StateId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hub>()
            .HasOne(x => x.City)
            .WithMany()
            .HasForeignKey(x => x.CityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hub>()
            .HasOne(x => x.ManagerUser)
            .WithMany()
            .HasForeignKey(x => x.ManagerUserId)
            .OnDelete(DeleteBehavior.SetNull);


        modelBuilder.Entity<Driver>()
            .HasIndex(x =>
                x.DrivingLicenseNumber)
            .IsUnique();

        modelBuilder.Entity<Driver>()
            .HasIndex(x =>
                x.Phone);

        modelBuilder.Entity<Driver>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Driver>()
            .HasOne(x => x.Hub)
            .WithMany()
            .HasForeignKey(x => x.HubId)
            .OnDelete(DeleteBehavior.SetNull);


        modelBuilder.Entity<Vehicle>()
            .HasIndex(x =>
                x.VehicleNumber)
            .IsUnique();

        modelBuilder.Entity<Vehicle>()
            .Property(x =>
                x.CapacityKg)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Vehicle>()
            .Property(x =>
                x.CapacityCubicFeet)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Vehicle>()
            .HasOne(x => x.Hub)
            .WithMany()
            .HasForeignKey(x => x.HubId)
            .OnDelete(DeleteBehavior.SetNull);


        modelBuilder.Entity<Shipment>()
            .HasIndex(x =>
                x.ShipmentNumber)
            .IsUnique();

        modelBuilder.Entity<Shipment>()
            .Property(x =>
                x.TotalWeight)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Shipment>()
            .HasOne(x =>
                x.Booking)
            .WithMany()
            .HasForeignKey(x =>
                x.BookingId)
            .OnDelete(
                DeleteBehavior.Restrict);

        modelBuilder.Entity<Shipment>()
            .HasOne(x =>
                x.OriginHub)
            .WithMany()
            .HasForeignKey(x =>
                x.OriginHubId)
            .OnDelete(
                DeleteBehavior.Restrict);

        modelBuilder.Entity<Shipment>()
            .HasOne(x =>
                x.DestinationHub)
            .WithMany()
            .HasForeignKey(x =>
                x.DestinationHubId)
            .OnDelete(
                DeleteBehavior.Restrict);

        modelBuilder.Entity<Shipment>()
            .HasOne(x =>
                x.CurrentHub)
            .WithMany()
            .HasForeignKey(x =>
                x.CurrentHubId)
            .OnDelete(
                DeleteBehavior.Restrict);


        modelBuilder.Entity<TransportTrip>()
            .HasIndex(x =>
                x.TripNumber)
            .IsUnique();

        modelBuilder.Entity<TransportTrip>()
            .Property(x =>
                x.TotalWeight)
            .HasPrecision(18, 2);

        modelBuilder.Entity<TransportTrip>()
            .HasOne(x => x.FromHub)
            .WithMany()
            .HasForeignKey(x => x.FromHubId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TransportTrip>()
            .HasOne(x => x.ToHub)
            .WithMany()
            .HasForeignKey(x => x.ToHubId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TransportTrip>()
            .HasOne(x => x.Driver)
            .WithMany()
            .HasForeignKey(x => x.DriverId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TransportTrip>()
            .HasOne(x => x.Vehicle)
            .WithMany()
            .HasForeignKey(x => x.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<TripShipment>()
            .HasIndex(x => new
            {
                x.TripId,
                x.ShipmentId
            })
            .IsUnique();

        modelBuilder.Entity<TripShipment>()
            .HasOne(x => x.Trip)
            .WithMany()
            .HasForeignKey(x => x.TripId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TripShipment>()
            .HasOne(x => x.Shipment)
            .WithMany()
            .HasForeignKey(x => x.ShipmentId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<ShipmentMovement>()
            .HasOne(x => x.Shipment)
            .WithMany()
            .HasForeignKey(x => x.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ShipmentMovement>()
            .HasOne(x => x.Trip)
            .WithMany()
            .HasForeignKey(x => x.TripId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ShipmentMovement>()
            .HasOne(x => x.FromHub)
            .WithMany()
            .HasForeignKey(x => x.FromHubId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ShipmentMovement>()
            .HasOne(x => x.ToHub)
            .WithMany()
            .HasForeignKey(x => x.ToHubId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<TransportRoute>()
            .HasIndex(x => x.Code)
            .IsUnique();

        modelBuilder.Entity<TransportRoute>()
            .HasIndex(x => new
            {
                x.FromHubId,
                x.ToHubId
            });

        modelBuilder.Entity<TransportRoute>()
            .Property(x => x.DistanceKm)
            .HasPrecision(18, 2);

        modelBuilder.Entity<TransportRoute>()
            .HasOne(x => x.FromHub)
            .WithMany()
            .HasForeignKey(x => x.FromHubId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TransportRoute>()
            .HasOne(x => x.ToHub)
            .WithMany()
            .HasForeignKey(x => x.ToHubId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<RateCard>()
            .HasOne(x => x.Route)
            .WithMany()
            .HasForeignKey(x => x.RouteId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<RateCard>()
            .Property(x =>
                x.MinimumCharge)
            .HasPrecision(18, 2);

        modelBuilder.Entity<RateCard>()
            .Property(x =>
                x.RatePerKg)
            .HasPrecision(18, 2);

        modelBuilder.Entity<RateCard>()
            .Property(x =>
                x.RatePerKm)
            .HasPrecision(18, 2);

        modelBuilder.Entity<RateCard>()
            .Property(x =>
                x.FuelSurchargePercent)
            .HasPrecision(9, 2);

        modelBuilder.Entity<RateCard>()
            .Property(x =>
                x.HandlingCharge)
            .HasPrecision(18, 2);

        modelBuilder.Entity<RateCard>()
            .Property(x =>
                x.GstPercent)
            .HasPrecision(9, 2);

        modelBuilder.Entity<RateCard>()
            .Property(x =>
                x.VolumetricDivisor)
            .HasPrecision(18, 2);


        modelBuilder.Entity<RateSlab>()
            .HasOne(x => x.RateCard)
            .WithMany()
            .HasForeignKey(x =>
                x.RateCardId)
            .OnDelete(
                DeleteBehavior.Cascade);

        modelBuilder.Entity<RateSlab>()
            .Property(x =>
                x.MinWeightKg)
            .HasPrecision(18, 2);

        modelBuilder.Entity<RateSlab>()
            .Property(x =>
                x.MaxWeightKg)
            .HasPrecision(18, 2);

        modelBuilder.Entity<RateSlab>()
            .Property(x =>
                x.RatePerKg)
            .HasPrecision(18, 2);


        modelBuilder.Entity<PaymentRefund>()
            .HasIndex(x =>
                x.RefundNumber)
            .IsUnique();

        modelBuilder.Entity<PaymentRefund>()
            .HasIndex(x =>
                x.RazorpayRefundId);

        modelBuilder.Entity<PaymentRefund>()
            .Property(x =>
                x.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PaymentRefund>()
            .HasOne(x =>
                x.PaymentTransaction)
            .WithMany()
            .HasForeignKey(x =>
                x.PaymentTransactionId)
            .OnDelete(
                DeleteBehavior.Restrict);

        modelBuilder.Entity<PaymentRefund>()
            .HasOne(x =>
                x.Booking)
            .WithMany()
            .HasForeignKey(x =>
                x.BookingId)
            .OnDelete(
                DeleteBehavior.Restrict);


        modelBuilder.Entity<PaymentWebhookLog>()
            .HasIndex(x =>
                x.EventId)
            .IsUnique();


        modelBuilder.Entity<DeliveryAttempt>()
            .HasIndex(x => new
            {
                x.BookingId,
                x.AttemptNumber
            });

        modelBuilder.Entity<DeliveryAttempt>()
            .HasOne(x =>
                x.Shipment)
            .WithMany()
            .HasForeignKey(x =>
                x.ShipmentId)
            .OnDelete(
                DeleteBehavior.Restrict);

        modelBuilder.Entity<DeliveryAttempt>()
            .HasOne(x =>
                x.Booking)
            .WithMany()
            .HasForeignKey(x =>
                x.BookingId)
            .OnDelete(
                DeleteBehavior.Restrict);

        modelBuilder.Entity<DeliveryAttempt>()
            .HasOne(x =>
                x.Driver)
            .WithMany()
            .HasForeignKey(x =>
                x.DriverId)
            .OnDelete(
                DeleteBehavior.SetNull);


        modelBuilder.Entity<DeliveryOtp>()
            .HasIndex(x => new
            {
                x.BookingId,
                x.IsUsed,
                x.ExpiresAt
            });

        modelBuilder.Entity<DeliveryOtp>()
            .HasOne(x =>
                x.Booking)
            .WithMany()
            .HasForeignKey(x =>
                x.BookingId)
            .OnDelete(
                DeleteBehavior.Cascade);

        modelBuilder.Entity<DeliveryOtp>()
            .HasOne(x =>
                x.Shipment)
            .WithMany()
            .HasForeignKey(x =>
                x.ShipmentId)
            .OnDelete(
                DeleteBehavior.Restrict);


        modelBuilder.Entity<ProofOfDelivery>()
            .HasIndex(x =>
                x.BookingId)
            .IsUnique();

        modelBuilder.Entity<ProofOfDelivery>()
            .HasOne(x =>
                x.Booking)
            .WithMany()
            .HasForeignKey(x =>
                x.BookingId)
            .OnDelete(
                DeleteBehavior.Restrict);

        modelBuilder.Entity<ProofOfDelivery>()
            .HasOne(x =>
                x.Shipment)
            .WithMany()
            .HasForeignKey(x =>
                x.ShipmentId)
            .OnDelete(
                DeleteBehavior.Restrict);

        modelBuilder.Entity<ProofOfDelivery>()
            .HasOne(x =>
                x.Driver)
            .WithMany()
            .HasForeignKey(x =>
                x.DriverId)
            .OnDelete(
                DeleteBehavior.SetNull);

        modelBuilder.Entity<ProofOfDelivery>()
            .HasOne(x =>
                x.Document)
            .WithMany()
            .HasForeignKey(x =>
                x.DocumentId)
            .OnDelete(
                DeleteBehavior.SetNull);


        modelBuilder.Entity<SystemSetting>()
            .HasIndex(x =>
                x.Key)
            .IsUnique();

        modelBuilder.Entity<CompanyProfile>()
            .HasIndex(x =>
                x.IsActive);


        modelBuilder.Entity<NotificationTemplate>()
            .HasIndex(x =>
                x.Code)
            .IsUnique();

        modelBuilder.Entity<NotificationLog>()
            .HasIndex(x =>
                x.CreatedAt);

        modelBuilder.Entity<NotificationLog>()
            .HasOne(x =>
                x.User)
            .WithMany()
            .HasForeignKey(x =>
                x.UserId)
            .OnDelete(
                DeleteBehavior.SetNull);

        modelBuilder.Entity<Booking>()
            .Property(x => x.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<Shipment>()
            .Property(x => x.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<TransportTrip>()
            .Property(x => x.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<Driver>()
            .Property(x => x.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<Vehicle>()
            .Property(x => x.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<Branch>()
            .Property(x => x.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<Hub>()
            .Property(x => x.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<RateCard>()
            .Property(x => x.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<PaymentRefund>()
            .Property(x => x.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<Booking>()
            .HasQueryFilter(x =>
                !x.IsDeleted);

        modelBuilder.Entity<Shipment>()
            .HasQueryFilter(x =>
                !x.IsDeleted);

        modelBuilder.Entity<TransportTrip>()
            .HasQueryFilter(x =>
                !x.IsDeleted);

        modelBuilder.Entity<Driver>()
            .HasQueryFilter(x =>
                !x.IsDeleted);

        modelBuilder.Entity<Vehicle>()
            .HasQueryFilter(x =>
                !x.IsDeleted);

        modelBuilder.Entity<Branch>()
            .HasQueryFilter(x =>
                !x.IsDeleted);

        modelBuilder.Entity<Hub>()
            .HasQueryFilter(x =>
                !x.IsDeleted);

        modelBuilder.Entity<RateCard>()
            .HasQueryFilter(x =>
                !x.IsDeleted);

        modelBuilder.Entity<PaymentRefund>()
            .HasQueryFilter(x =>
                !x.IsDeleted);

        modelBuilder.Entity<BookingItem>()
            .HasQueryFilter(x =>
                !x.Booking!.IsDeleted);

        modelBuilder.Entity<BookingDocument>()
            .HasQueryFilter(x =>
                !x.Booking!.IsDeleted);

        modelBuilder.Entity<ShipmentTracking>()
            .HasQueryFilter(x =>
                !x.Booking!.IsDeleted);

        modelBuilder.Entity<Invoice>()
            .HasQueryFilter(x =>
                !x.Booking!.IsDeleted);

        modelBuilder.Entity<InvoiceItem>()
            .HasQueryFilter(x =>
                !x.Invoice!.Booking!.IsDeleted);

        modelBuilder.Entity<PaymentTransaction>()
            .HasQueryFilter(x =>
                !x.Booking!.IsDeleted);

        modelBuilder.Entity<DeliveryAttempt>()
            .HasQueryFilter(x =>
                !x.Booking!.IsDeleted &&
                !x.Shipment!.IsDeleted);

        modelBuilder.Entity<DeliveryOtp>()
            .HasQueryFilter(x =>
                !x.Booking!.IsDeleted &&
                !x.Shipment!.IsDeleted);

        modelBuilder.Entity<ProofOfDelivery>()
            .HasQueryFilter(x =>
                !x.Booking!.IsDeleted &&
                !x.Shipment!.IsDeleted);

        modelBuilder.Entity<RateSlab>()
            .HasQueryFilter(x =>
                !x.RateCard!.IsDeleted);

        modelBuilder.Entity<ShipmentMovement>()
            .HasQueryFilter(x =>
                !x.Shipment!.IsDeleted);

        modelBuilder.Entity<TripShipment>()
            .HasQueryFilter(x =>
                !x.Shipment!.IsDeleted &&
                !x.Trip!.IsDeleted);

        modelBuilder.Entity<TransportRoute>()
            .HasQueryFilter(x =>
                !x.FromHub!.IsDeleted &&
                !x.ToHub!.IsDeleted);

        modelBuilder.Entity<ShipmentScan>()
            .HasQueryFilter(x =>
                !x.Shipment!.IsDeleted);

        modelBuilder.Entity<SystemAlert>()
            .HasIndex(x => new
            {
                x.AlertType,
                x.ReferenceType,
                x.ReferenceId,
                x.IsResolved
            });

        modelBuilder.Entity<ShipmentScan>()
            .HasIndex(x => new
            {
                x.ShipmentId,
                x.ScannedAt
            });

        modelBuilder.Entity<ShipmentScan>()
            .HasOne(x => x.Shipment)
            .WithMany()
            .HasForeignKey(x => x.ShipmentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ShipmentScan>()
            .HasOne(x => x.Booking)
            .WithMany()
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ShipmentScan>()
            .HasOne(x => x.Hub)
            .WithMany()
            .HasForeignKey(x => x.HubId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ShipmentScan>()
            .HasOne(x => x.ScannedByUser)
            .WithMany()
            .HasForeignKey(x => x.ScannedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<PartnerWebhook>()
            .HasIndex(x => x.PartnerName);

        modelBuilder.Entity<PartnerWebhook>()
            .HasIndex(x => x.IsActive);

        modelBuilder.Entity<WebhookDeliveryLog>()
            .HasIndex(x => new
            {
                x.PartnerWebhookId,
                x.AttemptedAt
            });

        modelBuilder.Entity<WebhookDeliveryLog>()
            .HasIndex(x => new
            {
                x.EventName,
                x.ReferenceId
            });

        modelBuilder.Entity<WebhookDeliveryLog>()
            .HasOne(x => x.PartnerWebhook)
            .WithMany()
            .HasForeignKey(x => x.PartnerWebhookId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WebhookOutboxMessage>()
            .HasIndex(x => new
            {
                x.Status,
                x.NextAttemptAt
            });

        modelBuilder.Entity<WebhookOutboxMessage>()
            .HasIndex(x => new
            {
                x.EventName,
                x.ReferenceId
            });

        modelBuilder.Entity<OperationsException>()
            .HasIndex(x => x.ExceptionNumber)
            .IsUnique();

        modelBuilder.Entity<OperationsException>()
            .HasIndex(x => new
            {
                x.Status,
                x.Severity,
                x.DueAt
            });

        modelBuilder.Entity<OperationsException>()
            .HasOne(x => x.Booking)
            .WithMany()
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OperationsException>()
            .HasOne(x => x.Shipment)
            .WithMany()
            .HasForeignKey(x => x.ShipmentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OperationsException>()
            .HasOne(x => x.Trip)
            .WithMany()
            .HasForeignKey(x => x.TripId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OperationsException>()
            .HasOne(x => x.Driver)
            .WithMany()
            .HasForeignKey(x => x.DriverId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OperationsException>()
            .HasOne(x => x.Vehicle)
            .WithMany()
            .HasForeignKey(x => x.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OperationsException>()
            .HasOne(x => x.AssignedToUser)
            .WithMany()
            .HasForeignKey(x => x.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<OperationsExceptionHistory>()
            .HasIndex(x => new
            {
                x.OperationsExceptionId,
                x.CreatedAt
            });

        modelBuilder.Entity<OperationsExceptionHistory>()
            .HasOne(x => x.OperationsException)
            .WithMany()
            .HasForeignKey(x => x.OperationsExceptionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OperationsExceptionHistory>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ClientAddress>(entity =>
        {
            entity.Property(x => x.AddressType)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.ContactName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.AddressLine1)
                .HasMaxLength(250)
                .IsRequired();

            entity.Property(x => x.AddressLine2)
                .HasMaxLength(250);

            entity.Property(x => x.City)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.State)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.PostalCode)
                .HasMaxLength(10)
                .IsRequired();

            entity.Property(x => x.Country)
                .HasMaxLength(100)
                .IsRequired();

            entity.HasIndex(x =>
                new
                {
                    x.UserId,
                    x.AddressType,
                    x.IsDefault
                });
modelBuilder.Entity<SupportTicket>(entity =>
            {
                entity.Property(x => x.TicketNumber)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.Subject)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(x => x.Description)
                    .HasMaxLength(2000)
                    .IsRequired();

                entity.Property(x => x.Category)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.Priority)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.Status)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.HasIndex(x => x.TicketNumber)
                    .IsUnique();

                entity.HasIndex(x =>
                    new
                    {
                        x.UserId,
                        x.Status,
                        x.CreatedAt
                    });
});


            modelBuilder.Entity<SupportTicketReply>(entity =>
            {
                entity.Property(x => x.Message)
                    .HasMaxLength(2000)
                    .IsRequired();

                entity.HasIndex(x =>
                    new
                    {
                        x.SupportTicketId,
                        x.CreatedAt
                    });

                entity.HasOne(x => x.SupportTicket)
                    .WithMany(x => x.Replies)
                    .HasForeignKey(x => x.SupportTicketId)
                    .OnDelete(DeleteBehavior.Cascade);
});
        });


    }
}



