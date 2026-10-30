using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Services;

namespace ASK.Group.Api.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // --------------------------------------------------------------------
        // CORE BUSINESS DOMAIN & APPLICATION WORKFLOW SERVICES
        // --------------------------------------------------------------------
        services.AddScoped<FreightService>();
        services.AddScoped<PricingService>();
        services.AddScoped<BookingQueryService>();
        services.AddScoped<BookingStatusService>();
        services.AddScoped<ShipmentStatusService>();
        services.AddScoped<TripWorkflowService>();
        services.AddScoped<DeliveryService>();
        services.AddScoped<DeliveryFinalizationService>();
        services.AddScoped<DeliveryFeedbackService>();
        services.AddScoped<SmartEtaService>();
        services.AddScoped<AutoAssignmentService>();
        services.AddScoped<RealtimeOperationsService>();
        services.AddScoped<OperationsAlertService>();
        services.AddScoped<OperationsExceptionService>();
        services.AddScoped<AdvancedAnalyticsService>();
        services.AddScoped<AdminOperationsService>();
        services.AddScoped<AdminSafetyService>();
        services.AddScoped<AdminFeedbackService>();
        services.AddScoped<AdminSupportTicketService>();
        services.AddScoped<BackendReadinessService>();
        services.AddScoped<WorkflowSecurityService>();

        // --------------------------------------------------------------------
        // CLIENT / CONSIGNOR PORTAL SERVICES
        // --------------------------------------------------------------------
        services.AddScoped<ClientDashboardService>();
        services.AddScoped<ClientBookingService>();
        services.AddScoped<ClientShipmentService>();
        services.AddScoped<ClientPaymentService>();
        services.AddScoped<ClientInvoiceService>();
        services.AddScoped<ClientAddressService>();
        services.AddScoped<ClientContactService>();
        services.AddScoped<ClientAccountService>();
        services.AddScoped<ClientDocumentService>();
        services.AddScoped<ClientNotificationService>();
        services.AddScoped<ClientSupportTicketService>();

        // --------------------------------------------------------------------
        // FINANCE, AUDIT, COMPLIANCE & SECURITY SERVICES
        // --------------------------------------------------------------------
        services.AddScoped<InvoiceService>();
        services.AddScoped<PaymentService>();
        services.AddScoped<RefundService>();
        services.AddScoped<PaymentReconciliationService>();
        services.AddScoped<AuditService>();
        services.AddScoped<ComplianceAlertService>();
        services.AddScoped<LoginSecurityService>();
        services.AddScoped<PermissionService>();
        services.AddScoped<OwnershipService>();
        services.AddScoped<CurrentUserService>();
        services.AddScoped<NumberGeneratorService>();
        services.AddScoped<SystemSettingService>();
        services.AddScoped<ReportService>();
        services.AddScoped<CsvExportService>();
        services.AddScoped<TemplateService>();
        services.AddScoped<CommunicationService>();
        services.AddScoped<NotificationService>();
        services.AddScoped<NotificationPreferenceService>();
        services.AddScoped<CleanupService>();

        // --------------------------------------------------------------------
        // TRANSPORT MODULE CLEAN ARCHITECTURE SERVICES & INTERFACES
        // --------------------------------------------------------------------
        services.AddScoped<ITyreManagementService, TyreManagementService>();
        services.AddScoped<IDockYardGatePassService, DockYardGatePassService>();
        services.AddScoped<IElectronicWeighbridgeService, ElectronicWeighbridgeService>();
        services.AddScoped<ISpotFreightRateService, SpotFreightRateService>();
        services.AddScoped<IDriverTripSettlementService, DriverTripSettlementService>();
        services.AddScoped<IAis140SafetyService, Ais140SafetyService>();
        services.AddScoped<IRtoBorderVaultService, RtoBorderVaultService>();
        services.AddScoped<ICorporateCargoClaimsService, CorporateCargoClaimsService>();

        return services;
    }
}
