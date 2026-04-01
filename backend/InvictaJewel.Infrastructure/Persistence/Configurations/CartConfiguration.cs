using InvictaJewel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvictaJewel.Infrastructure.Persistence.Configurations;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.ToTable("Carts");
        builder.HasIndex(c => c.CartIdentifier).IsUnique().HasDatabaseName("IX_Carts_CartIdentifier");
        builder.HasIndex(c => c.ExpiresAt).HasDatabaseName("IX_Carts_ExpiresAt");
    }
}
