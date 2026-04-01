using InvictaJewel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvictaJewel.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.Property(o => o.OrderNumber).HasMaxLength(50).IsRequired();
        builder.Property(o => o.CustomerName).HasMaxLength(200).IsRequired();
        builder.Property(o => o.CustomerEmail).HasMaxLength(200).IsRequired();
        builder.Property(o => o.CustomerPhone).HasMaxLength(20).IsRequired();
        builder.Property(o => o.ShippingAddress).HasMaxLength(500).IsRequired();
        builder.Property(o => o.City).HasMaxLength(100).IsRequired();
        builder.Property(o => o.PostalCode).HasMaxLength(20);
        builder.Property(o => o.OrderTotal).HasPrecision(18, 2);
        builder.Property(o => o.OrderStatus).HasMaxLength(50).IsRequired();
        builder.Property(o => o.PaymentMethod).HasMaxLength(50).IsRequired();
        builder.Property(o => o.Notes).HasMaxLength(500);

        builder.HasIndex(o => o.OrderNumber).IsUnique().HasDatabaseName("IX_Orders_OrderNumber");
        builder.HasIndex(o => o.CreatedAt).HasDatabaseName("IX_Orders_CreatedAt");
        builder.HasIndex(o => o.OrderStatus).HasDatabaseName("IX_Orders_Status");
    }
}
