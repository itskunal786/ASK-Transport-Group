using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASK.Group.Api.Migrations
{
    /// <inheritdoc />
    public partial class FinalizeBackendV1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShipmentScans_Bookings_BookingId",
                table: "ShipmentScans");

            migrationBuilder.DropForeignKey(
                name: "FK_WebhookDeliveryLogs_PartnerWebhooks_PartnerWebhookId",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropIndex(
                name: "IX_WebhookDeliveryLogs_PartnerWebhookId_EventName_AttemptedAt",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_HubId_IsActive_IsAvailable",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_TransportTrips_DriverId_Status",
                table: "TransportTrips");

            migrationBuilder.DropIndex(
                name: "IX_TransportTrips_FromHubId_ToHubId_Status",
                table: "TransportTrips");

            migrationBuilder.DropIndex(
                name: "IX_TransportTrips_VehicleId_Status",
                table: "TransportTrips");

            migrationBuilder.DropIndex(
                name: "IX_SystemAlerts_IsResolved_CreatedAt",
                table: "SystemAlerts");

            migrationBuilder.DropIndex(
                name: "IX_ShipmentScans_ScanCode",
                table: "ShipmentScans");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_BookingId_Status",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_CurrentHubId_Status",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_PaymentTransactions_BookingId_PaymentStatus_CreatedAt",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentRefunds_BookingId_Status_CreatedAt",
                table: "PaymentRefunds");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_HubId_IsActive_IsAvailable",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryAttempts_ShipmentId_AttemptNumber",
                table: "DeliveryAttempts");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_PaymentStatus_CreatedAt",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_UserId_BookingStatus_CreatedAt",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_UserId_CreatedAt",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "TransportTrips");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "TransportTrips");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "TransportTrips");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "PartnerWebhooks");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "PartnerWebhooks");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "PartnerWebhooks");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "PartnerWebhooks");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "PartnerWebhooks");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "PartnerWebhooks");

            migrationBuilder.AlterColumn<string>(
                name: "ScanCode",
                table: "ShipmentScans",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(120)",
                oldMaxLength: 120);

            migrationBuilder.AlterColumn<int>(
                name: "BookingId",
                table: "ShipmentScans",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "WebhookUrl",
                table: "PartnerWebhooks",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "SecretKey",
                table: "PartnerWebhooks",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "PartnerName",
                table: "PartnerWebhooks",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(120)",
                oldMaxLength: 120);

            migrationBuilder.AlterColumn<string>(
                name: "LastError",
                table: "PartnerWebhooks",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Events",
                table: "PartnerWebhooks",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "OperationsExceptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExceptionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ExceptionType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ReferenceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AssignedDepartment = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    BookingId = table.Column<int>(type: "int", nullable: true),
                    ShipmentId = table.Column<int>(type: "int", nullable: true),
                    TripId = table.Column<int>(type: "int", nullable: true),
                    DriverId = table.Column<int>(type: "int", nullable: true),
                    VehicleId = table.Column<int>(type: "int", nullable: true),
                    AssignedToUserId = table.Column<int>(type: "int", nullable: true),
                    EscalationLevel = table.Column<int>(type: "int", nullable: false),
                    DetectedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastEscalatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcknowledgedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcknowledgedByUserId = table.Column<int>(type: "int", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedByUserId = table.Column<int>(type: "int", nullable: true),
                    Resolution = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ResolutionNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsAutoGenerated = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationsExceptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperationsExceptions_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperationsExceptions_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperationsExceptions_Shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "Shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperationsExceptions_TransportTrips_TripId",
                        column: x => x.TripId,
                        principalTable: "TransportTrips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperationsExceptions_Users_AssignedToUserId",
                        column: x => x.AssignedToUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_OperationsExceptions_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WebhookOutboxMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReferenceId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Payload = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    MaxAttempts = table.Column<int>(type: "int", nullable: false),
                    NextAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessingStartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebhookOutboxMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OperationsExceptionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OperationsExceptionId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    OldStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NewStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OldSeverity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NewSeverity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EscalationLevel = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    PerformedByUserId = table.Column<int>(type: "int", nullable: true),
                    ActionAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationsExceptionHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperationsExceptionHistories_OperationsExceptions_OperationsExceptionId",
                        column: x => x.OperationsExceptionId,
                        principalTable: "OperationsExceptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperationsExceptionHistories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WebhookDeliveryLogs_EventName_ReferenceId",
                table: "WebhookDeliveryLogs",
                columns: new[] { "EventName", "ReferenceId" });

            migrationBuilder.CreateIndex(
                name: "IX_WebhookDeliveryLogs_PartnerWebhookId_AttemptedAt",
                table: "WebhookDeliveryLogs",
                columns: new[] { "PartnerWebhookId", "AttemptedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_HubId",
                table: "Vehicles",
                column: "HubId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportTrips_DriverId",
                table: "TransportTrips",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportTrips_FromHubId",
                table: "TransportTrips",
                column: "FromHubId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportTrips_VehicleId",
                table: "TransportTrips",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_BookingId",
                table: "Shipments",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_CurrentHubId",
                table: "Shipments",
                column: "CurrentHubId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_BookingId",
                table: "PaymentTransactions",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentRefunds_BookingId",
                table: "PaymentRefunds",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_PartnerWebhooks_IsActive",
                table: "PartnerWebhooks",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_HubId",
                table: "Drivers",
                column: "HubId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryAttempts_ShipmentId",
                table: "DeliveryAttempts",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserId",
                table: "Bookings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptionHistories_OperationsExceptionId_CreatedAt",
                table: "OperationsExceptionHistories",
                columns: new[] { "OperationsExceptionId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptionHistories_UserId",
                table: "OperationsExceptionHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptions_AssignedToUserId",
                table: "OperationsExceptions",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptions_BookingId",
                table: "OperationsExceptions",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptions_DriverId",
                table: "OperationsExceptions",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptions_ExceptionNumber",
                table: "OperationsExceptions",
                column: "ExceptionNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptions_ShipmentId",
                table: "OperationsExceptions",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptions_Status_Severity_DueAt",
                table: "OperationsExceptions",
                columns: new[] { "Status", "Severity", "DueAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptions_TripId",
                table: "OperationsExceptions",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationsExceptions_VehicleId",
                table: "OperationsExceptions",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_WebhookOutboxMessages_EventName_ReferenceId",
                table: "WebhookOutboxMessages",
                columns: new[] { "EventName", "ReferenceId" });

            migrationBuilder.CreateIndex(
                name: "IX_WebhookOutboxMessages_Status_NextAttemptAt",
                table: "WebhookOutboxMessages",
                columns: new[] { "Status", "NextAttemptAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_ShipmentScans_Bookings_BookingId",
                table: "ShipmentScans",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_WebhookDeliveryLogs_PartnerWebhooks_PartnerWebhookId",
                table: "WebhookDeliveryLogs",
                column: "PartnerWebhookId",
                principalTable: "PartnerWebhooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShipmentScans_Bookings_BookingId",
                table: "ShipmentScans");

            migrationBuilder.DropForeignKey(
                name: "FK_WebhookDeliveryLogs_PartnerWebhooks_PartnerWebhookId",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropTable(
                name: "OperationsExceptionHistories");

            migrationBuilder.DropTable(
                name: "WebhookOutboxMessages");

            migrationBuilder.DropTable(
                name: "OperationsExceptions");

            migrationBuilder.DropIndex(
                name: "IX_WebhookDeliveryLogs_EventName_ReferenceId",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropIndex(
                name: "IX_WebhookDeliveryLogs_PartnerWebhookId_AttemptedAt",
                table: "WebhookDeliveryLogs");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_HubId",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_TransportTrips_DriverId",
                table: "TransportTrips");

            migrationBuilder.DropIndex(
                name: "IX_TransportTrips_FromHubId",
                table: "TransportTrips");

            migrationBuilder.DropIndex(
                name: "IX_TransportTrips_VehicleId",
                table: "TransportTrips");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_BookingId",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_CurrentHubId",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_PaymentTransactions_BookingId",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentRefunds_BookingId",
                table: "PaymentRefunds");

            migrationBuilder.DropIndex(
                name: "IX_PartnerWebhooks_IsActive",
                table: "PartnerWebhooks");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_HubId",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryAttempts_ShipmentId",
                table: "DeliveryAttempts");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_UserId",
                table: "Bookings");

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "WebhookDeliveryLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "WebhookDeliveryLogs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedByUserId",
                table: "WebhookDeliveryLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "WebhookDeliveryLogs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "WebhookDeliveryLogs",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "WebhookDeliveryLogs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedByUserId",
                table: "WebhookDeliveryLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "TransportTrips",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedByUserId",
                table: "TransportTrips",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedByUserId",
                table: "TransportTrips",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ScanCode",
                table: "ShipmentScans",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<int>(
                name: "BookingId",
                table: "ShipmentScans",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "WebhookUrl",
                table: "PartnerWebhooks",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<string>(
                name: "SecretKey",
                table: "PartnerWebhooks",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "PartnerName",
                table: "PartnerWebhooks",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "LastError",
                table: "PartnerWebhooks",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Events",
                table: "PartnerWebhooks",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "PartnerWebhooks",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "PartnerWebhooks",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedByUserId",
                table: "PartnerWebhooks",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "PartnerWebhooks",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "PartnerWebhooks",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedByUserId",
                table: "PartnerWebhooks",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WebhookDeliveryLogs_PartnerWebhookId_EventName_AttemptedAt",
                table: "WebhookDeliveryLogs",
                columns: new[] { "PartnerWebhookId", "EventName", "AttemptedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_HubId_IsActive_IsAvailable",
                table: "Vehicles",
                columns: new[] { "HubId", "IsActive", "IsAvailable" });

            migrationBuilder.CreateIndex(
                name: "IX_TransportTrips_DriverId_Status",
                table: "TransportTrips",
                columns: new[] { "DriverId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TransportTrips_FromHubId_ToHubId_Status",
                table: "TransportTrips",
                columns: new[] { "FromHubId", "ToHubId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TransportTrips_VehicleId_Status",
                table: "TransportTrips",
                columns: new[] { "VehicleId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SystemAlerts_IsResolved_CreatedAt",
                table: "SystemAlerts",
                columns: new[] { "IsResolved", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentScans_ScanCode",
                table: "ShipmentScans",
                column: "ScanCode");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_BookingId_Status",
                table: "Shipments",
                columns: new[] { "BookingId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_CurrentHubId_Status",
                table: "Shipments",
                columns: new[] { "CurrentHubId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_BookingId_PaymentStatus_CreatedAt",
                table: "PaymentTransactions",
                columns: new[] { "BookingId", "PaymentStatus", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentRefunds_BookingId_Status_CreatedAt",
                table: "PaymentRefunds",
                columns: new[] { "BookingId", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_HubId_IsActive_IsAvailable",
                table: "Drivers",
                columns: new[] { "HubId", "IsActive", "IsAvailable" });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryAttempts_ShipmentId_AttemptNumber",
                table: "DeliveryAttempts",
                columns: new[] { "ShipmentId", "AttemptNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_PaymentStatus_CreatedAt",
                table: "Bookings",
                columns: new[] { "PaymentStatus", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserId_BookingStatus_CreatedAt",
                table: "Bookings",
                columns: new[] { "UserId", "BookingStatus", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId_CreatedAt",
                table: "AuditLogs",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_ShipmentScans_Bookings_BookingId",
                table: "ShipmentScans",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WebhookDeliveryLogs_PartnerWebhooks_PartnerWebhookId",
                table: "WebhookDeliveryLogs",
                column: "PartnerWebhookId",
                principalTable: "PartnerWebhooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
