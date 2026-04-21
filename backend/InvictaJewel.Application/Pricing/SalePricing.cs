using InvictaJewel.Application.DTOs;
using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Pricing;

/// <summary>
/// Computes effective customer price from product sale (optional window) and category %-off sales (optional window),
/// walking ancestor categories for each product category link.
/// </summary>
public static class SalePricing
{
    public static bool IsWithinSaleWindow(DateTime? startUtc, DateTime? endUtc, DateTime utcNow)
    {
        if (startUtc.HasValue && utcNow < startUtc.Value)
            return false;
        if (endUtc.HasValue && utcNow > endUtc.Value)
            return false;
        return true;
    }

    public static bool IsProductConfiguredSaleActive(Product product, DateTime utcNow) =>
        product.SalePrice is { } sp
        && sp < product.RegularPrice
        && IsWithinSaleWindow(product.SaleStartUtc, product.SaleEndUtc, utcNow);

    public static bool IsCategoryPercentSaleActive(Category category, DateTime utcNow) =>
        category.SaleDiscountPercent is > 0 and <= 100
        && IsWithinSaleWindow(category.SaleStartUtc, category.SaleEndUtc, utcNow);

    public static IEnumerable<Category> EnumerateSelfAndAncestors(Category leaf, IReadOnlyDictionary<int, Category> byId)
    {
        Category? c = leaf;
        for (var guard = 0; guard < 64 && c != null; guard++)
        {
            yield return c;
            c = c.ParentCategoryId is { } pid && byId.TryGetValue(pid, out var p) ? p : null;
        }
    }

    /// <summary>Lowest price among regular, active product sale, and active category %-offs for assigned categories.</summary>
    public static decimal GetEffectiveUnitPrice(Product product, IReadOnlyDictionary<int, Category> categoryById, DateTime utcNow)
    {
        var regular = product.RegularPrice;
        var candidates = new List<decimal> { regular };

        if (IsProductConfiguredSaleActive(product, utcNow) && product.SalePrice is { } sp)
            candidates.Add(sp);

        foreach (var pc in product.ProductCategories)
        {
            if (!categoryById.TryGetValue(pc.CategoryId, out var leaf))
                continue;
            foreach (var cat in EnumerateSelfAndAncestors(leaf, categoryById))
            {
                if (!IsCategoryPercentSaleActive(cat, utcNow))
                    continue;
                var pct = cat.SaleDiscountPercent!.Value;
                var discounted = Math.Round(regular * (1 - pct / 100m), 2, MidpointRounding.AwayFromZero);
                if (discounted < regular)
                    candidates.Add(discounted);
            }
        }

        return candidates.Min();
    }

    /// <summary>Sets <see cref="ProductListDto.SalePrice"/> to the effective storefront sale price (or null). Leaves configured sale dates on the DTO unchanged.</summary>
    public static void ApplyEffectiveToProductListDto(Product entity, ProductListDto dto, IReadOnlyDictionary<int, Category> categoryById, DateTime utcNow)
    {
        var eff = GetEffectiveUnitPrice(entity, categoryById, utcNow);
        dto.RegularPrice = entity.RegularPrice;
        dto.SalePrice = eff < entity.RegularPrice ? eff : null;
    }
}
