using InvictaJewel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvictaJewel.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        builder.Property(p => p.Name).HasMaxLength(500).IsRequired();
        builder.Property(p => p.Slug).HasMaxLength(500).IsRequired();
        builder.Property(p => p.SKU).HasMaxLength(100).IsRequired();
        builder.Property(p => p.RegularPrice).HasPrecision(18, 2);
        builder.Property(p => p.SalePrice).HasPrecision(18, 2);
        builder.Property(p => p.MetaTitle).HasMaxLength(200);
        builder.Property(p => p.MetaDescription).HasMaxLength(500);

        builder.HasIndex(p => p.Slug)
            .IsUnique()
            .HasDatabaseName("IX_Products_Slug_NotDeleted")
            .HasFilter("[IsDeleted] = 0");

        builder.HasIndex(p => p.SKU)
            .IsUnique()
            .HasDatabaseName("IX_Products_SKU_NotDeleted")
            .HasFilter("[IsDeleted] = 0");

        builder.HasIndex(p => new { p.IsActive, p.IsFeatured, p.IsNew, p.CreatedAt })
            .HasDatabaseName("IX_Products_Listing");

        builder.HasIndex(p => p.RegularPrice).HasDatabaseName("IX_Products_RegularPrice");
    }
}
