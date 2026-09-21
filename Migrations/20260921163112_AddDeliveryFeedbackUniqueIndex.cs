using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASK.Group.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryFeedbackUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DeliveryFeedbacks_BookingId",
                table: "DeliveryFeedbacks");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryFeedbacks_BookingId_UserId",
                table: "DeliveryFeedbacks",
                columns: new[] { "BookingId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DeliveryFeedbacks_BookingId_UserId",
                table: "DeliveryFeedbacks");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryFeedbacks_BookingId",
                table: "DeliveryFeedbacks",
                column: "BookingId");
        }
    }
}
