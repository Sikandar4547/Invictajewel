using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvictaJewel.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProductImageUrlToOrderItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProductImageUrl",
                table: "OrderItems",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductImageUrl",
                table: "OrderItems");
        }
    }
}
