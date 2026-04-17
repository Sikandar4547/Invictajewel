using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvictaJewel.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBannerTitleAndDisplayOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SubtitleLine",
                table: "Banners",
                newName: "Title");

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "Banners",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "Banners");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Banners",
                newName: "SubtitleLine");
        }
    }
}
