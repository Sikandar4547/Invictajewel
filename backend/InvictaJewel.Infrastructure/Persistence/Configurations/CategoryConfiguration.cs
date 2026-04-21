using InvictaJewel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvictaJewel.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");
        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.Slug).HasMaxLength(200).IsRequired();
        builder.Property(c => c.ImageUrl).HasMaxLength(500);
        builder.Property(c => c.Metadata).HasColumnType("nvarchar(max)");
        builder.Property(c => c.SaleDiscountPercent).HasPrecision(9, 4);
        builder.Property(c => c.SaleStartUtc);
        builder.Property(c => c.SaleEndUtc);

        builder.HasIndex(c => c.Slug)
            .IsUnique()
            .HasDatabaseName("IX_Categories_Slug_NotDeleted")
            .HasFilter("[IsDeleted] = 0");

        builder.HasIndex(c => c.ParentCategoryId).HasDatabaseName("IX_Categories_ParentCategoryId");
        builder.HasIndex(c => new { c.IsActive, c.DisplayOrder }).HasDatabaseName("IX_Categories_Active_Order");

        builder.HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
