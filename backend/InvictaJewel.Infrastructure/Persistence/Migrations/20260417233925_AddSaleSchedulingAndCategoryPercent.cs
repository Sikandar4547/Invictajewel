using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvictaJewel.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSaleSchedulingAndCategoryPercent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "SaleEndUtc",
                table: "Products",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SaleStartUtc",
                table: "Products",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SaleDiscountPercent",
                table: "Categories",
                type: "decimal(9,4)",
                precision: 9,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SaleEndUtc",
                table: "Categories",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SaleStartUtc",
                table: "Categories",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SaleEndUtc",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SaleStartUtc",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SaleDiscountPercent",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "SaleEndUtc",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "SaleStartUtc",
                table: "Categories");
        }
    }
}
