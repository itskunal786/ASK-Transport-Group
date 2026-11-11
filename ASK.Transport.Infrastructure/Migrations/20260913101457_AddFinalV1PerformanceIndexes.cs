using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASK.Group.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFinalV1PerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "IX_Drivers_HubId",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryAttempts_ShipmentId",
                table: "DeliveryAttempts");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_UserId",
                table: "Bookings");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
