using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using InvictaJewel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
#if WPIMPORT
using MySql.Data.MySqlClient;
#endif

namespace InvictaJewel.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext db, ILogger logger, CancellationToken cancellationToken = default)
    {
        await db.Database.MigrateAsync(cancellationToken);

        async Task<Category> EnsureCategoryAsync(string name, string slug, int? parentId, int displayOrder, string? description = null)
        {
            var existing = await db.Categories.FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
            if (existing != null)
            {
                var changed = false;
                if (existing.ParentCategoryId != parentId) { existing.ParentCategoryId = parentId; changed = true; }
                if (existing.Name != name) { existing.Name = name; changed = true; }
                if (existing.DisplayOrder != displayOrder) { existing.DisplayOrder = displayOrder; changed = true; }
                if (existing.Description != description) { existing.Description = description; changed = true; }
                if (!existing.IsActive) { existing.IsActive = true; changed = true; }
                if (changed) { db.Categories.Update(existing); await db.SaveChangesAsync(cancellationToken); }
                return existing;
            }

            var c = new Category { Name = name, Slug = slug, ParentCategoryId = parentId, IsActive = true, DisplayOrder = displayOrder, Description = description };
            db.Categories.Add(c);
            await db.SaveChangesAsync(cancellationToken);
            return c;
        }

        // Top-level navigation
        var invictaWorld = await EnsureCategoryAsync("INVICTA WORLD", "invicta-world", null, 1);
        var collection = await EnsureCategoryAsync("COLLECTION", "collection", null, 2);
        var contemporary = await EnsureCategoryAsync("CONTEMPORARY", "contemporary", null, 3);
        var newIn = await EnsureCategoryAsync("NEW IN", "new-in", null, 4);
        var bridal = await EnsureCategoryAsync("BRIDAL", "bridal", null, 5);

        await EnsureCategoryAsync("About Invicta", "about-invicta", invictaWorld.Id, 1);

        await EnsureCategoryAsync("Spring in desert", "spring-in-desert", collection.Id, 1);
        await EnsureCategoryAsync("Tres Haute collection", "tres-haute-collection", collection.Id, 2);
        await EnsureCategoryAsync("Vernal state collection", "vernal-state-collection", collection.Id, 3);

        var earrings = await EnsureCategoryAsync("Earrings", "earrings", contemporary.Id, 1);
        var necklaces = await EnsureCategoryAsync("Necklaces", "necklaces", contemporary.Id, 2);
        var bracelets = await EnsureCategoryAsync("Bracelets", "bracelets", contemporary.Id, 3);
        var rings = await EnsureCategoryAsync("Rings", "rings", contemporary.Id, 4);
        await EnsureCategoryAsync("Glass chain", "glass-chain", contemporary.Id, 5);

        await EnsureCategoryAsync("Drop Earring", "drop-earring", earrings.Id, 1);
        await EnsureCategoryAsync("Ear Stud", "ear-stud", earrings.Id, 2);
        await EnsureCategoryAsync("Ear Cuff", "ear-cuff", earrings.Id, 3);

        await EnsureCategoryAsync("Choker", "choker", necklaces.Id, 1);
        await EnsureCategoryAsync("Pendant", "pendant", necklaces.Id, 2);

        await EnsureCategoryAsync("Bangle", "bangle", bracelets.Id, 1);
        await EnsureCategoryAsync("Cuff", "cuff", bracelets.Id, 2);
        await EnsureCategoryAsync("Charm", "charm", bracelets.Id, 3);

        await EnsureCategoryAsync("Vernal slate collection", "vernal-slate-collection", newIn.Id, 1);
        await EnsureCategoryAsync("New Collection", "bridal-new-collection", bridal.Id, 1);

        // Ensure parent-child relationships are correct
        await RepairCategoryParentsAsync(db, cancellationToken);

        // Seed demo products (idempotent)
        var dropEarring = await db.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Slug == "drop-earring", cancellationToken);
        var pendantCat = await db.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Slug == "pendant", cancellationToken);
        var ringsCat = await db.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Slug == "rings" && c.ParentCategoryId == contemporary.Id, cancellationToken);

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
            if (ringsCat != null) aurora.ProductCategories.Add(new ProductCategory { CategoryId = ringsCat.Id, IsPrimary = true, DisplayOrder = 0 });
            aurora.Images.Add(new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop", IsPrimary = true, DisplayOrder = 0, AltText = "Aurora Band" });
            db.Products.Add(aurora);
        }

        if (!await db.Products.AnyAsync(p => p.Slug == "lumiere-pendant", cancellationToken))
        {
            var lumiere = new Product { Name = "Lumière Pendant", Slug = "lumiere-pendant", Description = "Rose-gold pendant with soft satin chain.", RegularPrice = 189m, SKU = "DEMO-NEC-001", StockQuantity = 40, IsActive = true, IsFeatured = true, IsNew = false };
            if (pendantCat != null) lumiere.ProductCategories.Add(new ProductCategory { CategoryId = pendantCat.Id, IsPrimary = true, DisplayOrder = 0 });
            lumiere.Images.Add(new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop", IsPrimary = true, DisplayOrder = 0, AltText = "Lumière Pendant" });
            db.Products.Add(lumiere);
        }

        if (!await db.Products.AnyAsync(p => p.Slug == "desert-bloom-drops", cancellationToken))
        {
            if (dropEarring != null)
            {
                var desertDrops = new Product { Name = "Desert Bloom Drops", Slug = "desert-bloom-drops", Description = "Statement drops with warm metal tones.", RegularPrice = 320m, SalePrice = 279m, SKU = "DEMO-EAR-001", StockQuantity = 18, IsActive = true, IsFeatured = true, IsNew = true };
                desertDrops.ProductCategories.Add(new ProductCategory { CategoryId = dropEarring.Id, IsPrimary = true, DisplayOrder = 0 });
                desertDrops.Images.Add(new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop", IsPrimary = true, DisplayOrder = 0, AltText = "Desert Bloom Drops" });
                db.Products.Add(desertDrops);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Database seeded with Invicta menu categories and demo products.");
    }

    public class WordPressImportReport { public int Processed { get; set; } public int Added { get; set; } public List<string> Errors { get; set; } = new(); }

    public static async Task SeedProductsFromWordPressAsync(ApplicationDbContext db, ILogger logger, string wpConnectionString, string webRoot, CancellationToken cancellationToken = default)
    {
        var report = await SeedProductsFromWordPressReportAsync(db, wpConnectionString, webRoot, cancellationToken);
        logger.LogInformation("WordPress import: processed {Processed}, added {Added}", report.Processed, report.Added);
        foreach (var e in report.Errors) logger.LogWarning("WP import: {Msg}", e);
    }

    public static async Task<WordPressImportReport> SeedProductsFromWordPressReportAsync(ApplicationDbContext db, string wpConnectionString, string webRoot, CancellationToken cancellationToken = default)
    {
        var report = new WordPressImportReport();
#if WPIMPORT
        const string sql = @"
SELECT p.ID AS wp_id,
       p.post_title,
       p.post_content,
       pm_price.meta_value AS price,
       thumb.guid AS thumbnail_url,
       GROUP_CONCAT(t.name ORDER BY tt.term_taxonomy_id SEPARATOR '||') AS categories
FROM wp_posts p
LEFT JOIN wp_postmeta pm_price ON pm_price.post_id = p.ID AND pm_price.meta_key = '_price'
LEFT JOIN wp_postmeta pm_thumb ON pm_thumb.post_id = p.ID AND pm_thumb.meta_key = '_thumbnail_id'
LEFT JOIN wp_posts thumb ON thumb.ID = pm_thumb.meta_value
LEFT JOIN wp_term_relationships tr ON tr.object_id = p.ID
LEFT JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy = 'product_cat'
LEFT JOIN wp_terms t ON t.term_id = tt.term_id
WHERE p.post_type = 'product' AND p.post_status = 'publish'
GROUP BY p.ID;";

        try
        {
            await using var conn = new MySqlConnection(wpConnectionString);
            await conn.OpenAsync(cancellationToken);
            await using var cmd = new MySqlCommand(sql, conn);
            await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);

            var categoryCache = await db.Categories.AsNoTracking().ToDictionaryAsync(c => c.Name, StringComparer.OrdinalIgnoreCase, cancellationToken);
            var slugLookup = await db.Categories.AsNoTracking().ToDictionaryAsync(c => c.Slug, c => c, cancellationToken);

            var parentMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["drop earring"] = "earrings",
                ["ear stud"] = "earrings",
                ["ear cuff"] = "earrings",
                ["choker"] = "necklaces",
                ["pendant"] = "necklaces",
                ["bangle"] = "bracelets",
                ["cuff"] = "bracelets",
                ["charm"] = "bracelets",
            };

            var productsToAdd = new List<Product>();
            while (await reader.ReadAsync(cancellationToken))
            {
                report.Processed++;
                try
                {
                    var wpIdObj = reader["wp_id"];
                    var wpId = wpIdObj is long l ? (long)l : (wpIdObj is int i ? (long)i : -1L);
                    var name = reader["post_title"] as string ?? string.Empty;
                    if (string.IsNullOrWhiteSpace(name)) continue;
                    var description = reader["post_content"] as string;
                    var priceRaw = reader["price"] as string;
                    var thumbnailUrl = reader["thumbnail_url"] as string;
                    var categoriesRaw = reader["categories"] as string;

                    var generatedSku = wpId > 0 ? $"WP-{wpId}" : Guid.NewGuid().ToString("N");
                    if (await db.Products.AnyAsync(p => p.SKU == generatedSku, cancellationToken)) continue;
                    if (await db.Products.AnyAsync(p => p.Name == name, cancellationToken)) continue;

                    string? categoryName = null;
                    if (!string.IsNullOrWhiteSpace(categoriesRaw)) categoryName = categoriesRaw.Split(new[] { "||" }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault()?.Trim();

                    int? categoryId = null;
                    if (!string.IsNullOrWhiteSpace(categoryName))
                    {
                        if (!categoryCache.TryGetValue(categoryName!, out var cat))
                        {
                            var slug = Slugify(categoryName!);
                            int? parentId = null;
                            if (parentMap.TryGetValue(categoryName!.ToLowerInvariant(), out var parentSlug))
                            {
                                if (slugLookup.TryGetValue(parentSlug, out var parentCat)) parentId = parentCat.Id;
                            }
                            cat = new Category { Name = categoryName!, Slug = slug, ParentCategoryId = parentId, IsActive = true, DisplayOrder = 0 };
                            db.Categories.Add(cat);
                            await db.SaveChangesAsync(cancellationToken);
                            categoryCache[cat.Name] = cat;
                            slugLookup[cat.Slug] = cat;
                        }
                        categoryId = categoryCache[categoryName!].Id;
                    }

                    decimal price = 0m;
                    if (!string.IsNullOrWhiteSpace(priceRaw) && decimal.TryParse(priceRaw, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var pval)) price = pval;

                    string? localImage = null;
                    if (!string.IsNullOrWhiteSpace(thumbnailUrl))
                    {
                        try
                        {
                            var uri = new Uri(thumbnailUrl);
                            var filename = Path.GetFileName(uri.LocalPath);
                            if (!string.IsNullOrWhiteSpace(filename))
                            {
                                var uploadsRoot = Path.Combine(webRoot, "uploads");
                                var upIndex = uri.LocalPath.IndexOf("/uploads/", StringComparison.OrdinalIgnoreCase);
                                if (upIndex >= 0)
                                {
                                    var relative = uri.LocalPath.Substring(upIndex + "/uploads/".Length).TrimStart('/', '\\');
                                    var candidate2 = Path.Combine(uploadsRoot, relative.Replace('/', Path.DirectorySeparatorChar));
                                    if (File.Exists(candidate2)) localImage = "/uploads/" + relative.Replace('\\', '/');
                                }
                                if (localImage == null)
                                {
                                    var candidate = Path.Combine(uploadsRoot, filename);
                                    if (File.Exists(candidate)) localImage = "/uploads/" + filename;
                                }
                                if (localImage == null && Directory.Exists(Path.Combine(webRoot, "uploads")))
                                {
                                    var baseName = Path.GetFileNameWithoutExtension(filename);
                                    var found = Directory.EnumerateFiles(Path.Combine(webRoot, "uploads"), "*", SearchOption.AllDirectories)
                                        .FirstOrDefault(f => Path.GetFileName(f).IndexOf(baseName, StringComparison.OrdinalIgnoreCase) >= 0);
                                    if (found != null)
                                    {
                                        var rel = Path.GetRelativePath(webRoot, found).Replace('\\', '/');
                                        if (!rel.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase)) rel = "uploads/" + rel;
                                        localImage = "/" + rel;
                                    }
                                }
                            }
                        }
                        catch { }
                    }

                    var baseSlug = Slugify(name);
                    var generatedSlug = wpId > 0 ? $"wp-{wpId}-{baseSlug}" : baseSlug;

                    var product = new Product { Name = name, Slug = generatedSlug, SKU = generatedSku, Description = description, RegularPrice = price, StockQuantity = 0, IsActive = true };
                    if (categoryId.HasValue) product.ProductCategories.Add(new ProductCategory { CategoryId = categoryId.Value, IsPrimary = true, DisplayOrder = 0 });
                    if (!string.IsNullOrWhiteSpace(localImage)) product.Images.Add(new ProductImage { ImageUrl = localImage, IsPrimary = true, DisplayOrder = 0 });

                    productsToAdd.Add(product);
                    report.Added++;
                }
                catch (Exception exRow)
                {
                    report.Errors.Add("Row import failed: " + exRow.Message);
                }
            }

            if (productsToAdd.Count > 0)
            {
                await db.Products.AddRangeAsync(productsToAdd, cancellationToken);
                await db.SaveChangesAsync(cancellationToken);
            }

            await RepairCategoryParentsAsync(db, cancellationToken);
            await RepairProductImagesAsync(db, webRoot, cancellationToken);
        }
        catch (Exception ex)
        {
            report.Errors.Add("Import failed: " + ex.Message);
        }
#else
        report.Errors.Add("WordPress import is not enabled at compile time. Define WPIMPORT and add MySql.Data or MySqlConnector.");
#endif
        return report;
    }

    private static string Slugify(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var s = input.ToLowerInvariant();
        s = System.Text.RegularExpressions.Regex.Replace(s, "[^a-z0-9]+", "-").Trim('-');
        return s;
    }

    private static async Task RepairCategoryParentsAsync(ApplicationDbContext db, CancellationToken cancellationToken = default)
    {
        var root = await db.Categories.FirstOrDefaultAsync(c => c.Slug == "contemporary", cancellationToken);
        if (root == null) return;
        var childSlugs = new[] { "earrings", "necklaces", "bracelets", "rings", "glass-chain" };
        var toUpdate = await db.Categories.Where(c => childSlugs.Contains(c.Slug)).ToListAsync(cancellationToken);
        var changed = false;
        foreach (var cat in toUpdate)
        {
            if (cat.ParentCategoryId != root.Id) { cat.ParentCategoryId = root.Id; changed = true; }
        }
        if (changed) { db.Categories.UpdateRange(toUpdate); await db.SaveChangesAsync(cancellationToken); }
    }

    public static async Task<int> RepairProductImagesAsync(ApplicationDbContext db, string webRoot, CancellationToken cancellationToken = default)
    {
        var uploadsRoot = Path.Combine(webRoot, "uploads");
        if (!Directory.Exists(uploadsRoot)) return 0;
        var images = await db.ProductImages.Where(pi => pi.ImageUrl != null && pi.ImageUrl.StartsWith("/uploads/")).ToListAsync(cancellationToken);
        var updated = 0;
        foreach (var img in images)
        {
            try
            {
                var url = img.ImageUrl!;
                var filename = Path.GetFileName(url);
                if (string.IsNullOrWhiteSpace(filename)) continue;
                var found = Directory.EnumerateFiles(uploadsRoot, filename, SearchOption.AllDirectories).FirstOrDefault();
                if (found == null) continue;
                var rel = Path.GetRelativePath(webRoot, found).Replace('\\', '/');
                if (!rel.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase)) rel = "uploads/" + rel;
                img.ImageUrl = "/" + rel;
                updated++;
            }
            catch { }
        }
        if (updated > 0) { db.ProductImages.UpdateRange(images.Where(i => i.ImageUrl != null)); await db.SaveChangesAsync(cancellationToken); }
        return updated;
    }
}
