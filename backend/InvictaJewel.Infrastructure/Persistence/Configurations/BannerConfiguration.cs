using InvictaJewel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvictaJewel.Infrastructure.Persistence.Configurations;

public class BannerConfiguration : IEntityTypeConfiguration<Banner>
{
    public void Configure(EntityTypeBuilder<Banner> builder)
    {
        builder.ToTable("Banners");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Title).HasMaxLength(256).IsRequired();
        builder.Property(b => b.ImageUrl).HasMaxLength(512).IsRequired();
        builder.Property(b => b.LinkUrl).HasMaxLength(1024);
        builder.Property(b => b.IsActive).HasDefaultValue(true);
        builder.Property(b => b.DisplayOrder).HasDefaultValue(0);
        builder.Property(b => b.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(b => b.IsActive);
        builder.HasIndex(b => b.CreatedAt);
    }
}

