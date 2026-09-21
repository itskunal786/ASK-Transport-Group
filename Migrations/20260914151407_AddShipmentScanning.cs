using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASK.Group.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddShipmentScanning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShipmentScans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentId = table.Column<int>(type: "int", nullable: false),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    ScanCode = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ScanType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    HubId = table.Column<int>(type: "int", nullable: true),
                    ScannedByUserId = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ScannedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipmentScans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShipmentScans_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShipmentScans_Hubs_HubId",
                        column: x => x.HubId,
                        principalTable: "Hubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ShipmentScans_Shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "Shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShipmentScans_Users_ScannedByUserId",
                        column: x => x.ScannedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentScans_BookingId",
                table: "ShipmentScans",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentScans_HubId",
                table: "ShipmentScans",
                column: "HubId");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentScans_ScanCode",
                table: "ShipmentScans",
                column: "ScanCode");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentScans_ScannedByUserId",
                table: "ShipmentScans",
                column: "ScannedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentScans_ShipmentId_ScannedAt",
                table: "ShipmentScans",
                columns: new[] { "ShipmentId", "ScannedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShipmentScans");
        }
    }
}
