using InvictaJewel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvictaJewel.Infrastructure.Persistence.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");
        builder.Property(i => i.ImageUrl).HasMaxLength(1000).IsRequired();
        builder.Property(i => i.AltText).HasMaxLength(200);
        builder.HasIndex(i => new { i.ProductId, i.IsPrimary, i.DisplayOrder })
            .HasDatabaseName("IX_ProductImages_Product_Display");
    }
}
