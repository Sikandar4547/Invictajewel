using InvictaJewel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InvictaJewel.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext db, ILogger logger, CancellationToken cancellationToken = default)
    {
        await db.Database.MigrateAsync(cancellationToken);

        // Make seeding idempotent: return existing category if found, otherwise create it
        async Task<Category> AddAsync(string name, string slug, int? parentId, int displayOrder, string? description = null)
        {
            // Slug is unique (for non-deleted), so find by slug if exists and correct its parent/metadata
            var existing = await db.Categories.FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
            if (existing != null)
            {
                var changed = false;
                if (existing.ParentCategoryId != parentId)
                {
                    existing.ParentCategoryId = parentId;
                    changed = true;
                }
                if (existing.Name != name)
                {
                    existing.Name = name;
                    changed = true;
                }
                if (existing.DisplayOrder != displayOrder)
                {
                    existing.DisplayOrder = displayOrder;
                    changed = true;
                }
                if (existing.Description != description)
                {
                    existing.Description = description;
                    changed = true;
                }
                if (!existing.IsActive)
                {
                    existing.IsActive = true;
                    changed = true;
                }
                if (changed)
                {
                    db.Categories.Update(existing);
                    await db.SaveChangesAsync(cancellationToken);
                }
                return existing;
            }

            var c = new Category
            {
                Name = name,
                Slug = slug,
                ParentCategoryId = parentId,
                IsActive = true,
                DisplayOrder = displayOrder,
                Description = description
            };
            db.Categories.Add(c);
            await db.SaveChangesAsync(cancellationToken);
            return c;
        }

        // Top-level navigation (display order matches menu: Invicta World → … → Bridal)
        var invictaWorld = await AddAsync("INVICTA WORLD", "invicta-world", null, 1);
        var collection = await AddAsync("COLLECTION", "collection", null, 2);
        var contemporary = await AddAsync("CONTEMPORARY", "contemporary", null, 3);
        var newIn = await AddAsync("NEW IN", "new-in", null, 4);
        var bridal = await AddAsync("BRIDAL", "bridal", null, 5);

        await AddAsync("About Invicta", "about-invicta", invictaWorld.Id, 1);

        await AddAsync("Spring in desert", "spring-in-desert", collection.Id, 1);
        await AddAsync("Tres Haute collection", "tres-haute-collection", collection.Id, 2);
        await AddAsync("Vernal state collection", "vernal-state-collection", collection.Id, 3);

        var earrings = await AddAsync("Earrings", "earrings", contemporary.Id, 1);
        var necklaces = await AddAsync("Necklaces", "necklaces", contemporary.Id, 2);
        var bracelets = await AddAsync("Bracelets", "bracelets", contemporary.Id, 3);
        var rings = await AddAsync("Rings", "rings", contemporary.Id, 4);
        await AddAsync("Glass chain", "glass-chain", contemporary.Id, 5);

        await AddAsync("Drop Earring", "drop-earring", earrings.Id, 1);
        await AddAsync("Ear Stud", "ear-stud", earrings.Id, 2);
        await AddAsync("Ear Cuff", "ear-cuff", earrings.Id, 3);

        await AddAsync("Choker", "choker", necklaces.Id, 1);
        await AddAsync("Pendant", "pendant", necklaces.Id, 2);

        await AddAsync("Bangle", "bangle", bracelets.Id, 1);
        await AddAsync("Cuff", "cuff", bracelets.Id, 2);
        await AddAsync("Charm", "charm", bracelets.Id, 3);

        await AddAsync("Vernal slate collection", "vernal-slate-collection", newIn.Id, 1);

        await AddAsync("New Collection", "bridal-new-collection", bridal.Id, 1);

        var dropEarring = await db.Categories.AsNoTracking().FirstAsync(c => c.Slug == "drop-earring", cancellationToken);
        var pendant = await db.Categories.AsNoTracking().FirstAsync(c => c.Slug == "pendant", cancellationToken);
        var ringsCat = await db.Categories.AsNoTracking().FirstAsync(c => c.Slug == "rings" && c.ParentCategoryId == contemporary.Id, cancellationToken);

        // Add products only when they don't already exist
        if (!await db.Products.AnyAsync(p => p.Slug == "aurora-band", cancellationToken))
        {
            var aurora = new Product
        {
            Name = "Aurora Band",
            Slug = "aurora-band",
            Description = "Hand-finished band with warm gold tone.",
            RegularPrice = 249.99m,
            SalePrice = 199.99m,
            SKU = "DEMO-RING-001",
            StockQuantity = 25,
            IsActive = true,
            IsFeatured = true,
            IsNew = true,
            MetaTitle = "Aurora Band | Invicta Jewel",
            MetaDescription = "Aurora Band — limited-time offer."
        };
        aurora.ProductCategories.Add(new ProductCategory { CategoryId = ringsCat.Id, IsPrimary = true, DisplayOrder = 0 });
        aurora.Images.Add(new ProductImage
        {
            ImageUrl = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
            IsPrimary = true,
            DisplayOrder = 0,
            AltText = "Aurora Band"
        });
        db.Products.Add(aurora);
        }

        if (!await db.Products.AnyAsync(p => p.Slug == "lumiere-pendant", cancellationToken))
        {
            var lumiere = new Product
        {
            Name = "Lumière Pendant",
            Slug = "lumiere-pendant",
            Description = "Rose-gold pendant with soft satin chain.",
            RegularPrice = 189m,
            SKU = "DEMO-NEC-001",
            StockQuantity = 40,
            IsActive = true,
            IsFeatured = true,
            IsNew = false
        };
        lumiere.ProductCategories.Add(new ProductCategory { CategoryId = pendant.Id, IsPrimary = true, DisplayOrder = 0 });
        lumiere.Images.Add(new ProductImage
        {
            ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop",
            IsPrimary = true,
            DisplayOrder = 0,
            AltText = "Lumière Pendant"
        });
        db.Products.Add(lumiere);
        }

        if (!await db.Products.AnyAsync(p => p.Slug == "desert-bloom-drops", cancellationToken))
        {
            var desertDrops = new Product
        {
            Name = "Desert Bloom Drops",
            Slug = "desert-bloom-drops",
            Description = "Statement drops with warm metal tones.",
            RegularPrice = 320m,
            SalePrice = 279m,
            SKU = "DEMO-EAR-001",
            StockQuantity = 18,
            IsActive = true,
            IsFeatured = true,
            IsNew = true
        };
        desertDrops.ProductCategories.Add(new ProductCategory { CategoryId = dropEarring.Id, IsPrimary = true, DisplayOrder = 0 });
        desertDrops.Images.Add(new ProductImage
        {
            ImageUrl = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop",
            IsPrimary = true,
            DisplayOrder = 0,
            AltText = "Desert Bloom Drops"
        });
        db.Products.Add(desertDrops);
        }

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Database seeded with Invicta menu categories and demo products.");
    }
}
