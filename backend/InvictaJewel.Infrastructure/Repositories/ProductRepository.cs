using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Domain.Entities;
using InvictaJewel.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InvictaJewel.Infrastructure.Repositories;

public class ProductRepository(ApplicationDbContext db) : IProductRepository
{
    public async Task<(IReadOnlyList<Product> Items, int Total)> SearchAsync(
        string? search,
        int page,
        int pageSize,
        string? sortBy,
        string? sortOrder,
        decimal? minPrice,
        decimal? maxPrice,
        bool? isOnSale,
        bool includeInactive,
        IReadOnlyList<int>? categoryScopeIds,
        CancellationToken cancellationToken = default)
    {
        var query = db.Products
            .AsNoTracking()
            .Include(p => p.ProductCategories)
            .ThenInclude(pc => pc.Category)
            .Where(p => !p.IsDeleted);

        if (!includeInactive)
            query = query.Where(p => p.IsActive);

        if (categoryScopeIds is { Count: > 0 })
            query = query.Where(p => p.ProductCategories.Any(pc => categoryScopeIds.Contains(pc.CategoryId)));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(p =>
                p.Name.Contains(term) ||
                p.SKU.Contains(term) ||
                (p.Description != null && p.Description.Contains(term)));
        }

        if (minPrice is { } min)
            query = query.Where(p =>
                (p.SalePrice != null && p.SalePrice < p.RegularPrice ? p.SalePrice : p.RegularPrice) >= min);

        if (maxPrice is { } max)
            query = query.Where(p =>
                (p.SalePrice != null && p.SalePrice < p.RegularPrice ? p.SalePrice : p.RegularPrice) <= max);

        var now = DateTime.UtcNow;
        if (isOnSale == true)
        {
            query = query.Where(p =>
                (p.SalePrice != null && p.SalePrice < p.RegularPrice
                 && (p.SaleStartUtc == null || p.SaleStartUtc <= now)
                 && (p.SaleEndUtc == null || p.SaleEndUtc >= now))
                || p.ProductCategories.Any(pc =>
                    pc.Category.SaleDiscountPercent != null
                    && pc.Category.SaleDiscountPercent > 0
                    && pc.Category.SaleDiscountPercent <= 100
                    && (pc.Category.SaleStartUtc == null || pc.Category.SaleStartUtc <= now)
                    && (pc.Category.SaleEndUtc == null || pc.Category.SaleEndUtc >= now)));
        }
        else if (isOnSale == false)
        {
            query = query.Where(p =>
                !((p.SalePrice != null && p.SalePrice < p.RegularPrice
                   && (p.SaleStartUtc == null || p.SaleStartUtc <= now)
                   && (p.SaleEndUtc == null || p.SaleEndUtc >= now))
                  || p.ProductCategories.Any(pc =>
                      pc.Category.SaleDiscountPercent != null
                      && pc.Category.SaleDiscountPercent > 0
                      && pc.Category.SaleDiscountPercent <= 100
                      && (pc.Category.SaleStartUtc == null || pc.Category.SaleStartUtc <= now)
                      && (pc.Category.SaleEndUtc == null || pc.Category.SaleEndUtc >= now))));
        }

        var descending = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);
        query = (sortBy?.ToLowerInvariant()) switch
        {
            "price" => descending
                ? query.OrderByDescending(p => p.SalePrice != null && p.SalePrice < p.RegularPrice ? p.SalePrice : p.RegularPrice)
                : query.OrderBy(p => p.SalePrice != null && p.SalePrice < p.RegularPrice ? p.SalePrice : p.RegularPrice),
            "name" => descending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            _ => descending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
        };

        var total = await query.CountAsync(cancellationToken);
        var pageSizeClamped = Math.Clamp(pageSize, 1, 500);
        var pageClamped = Math.Max(page, 1);

        var items = await query
            .Skip((pageClamped - 1) * pageSizeClamped)
            .Take(pageSizeClamped)
            .Include(p => p.ProductCategories)
            .ThenInclude(pc => pc.Category)
            .Include(p => p.Images)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public Task<Product?> GetByIdAsync(int id, bool includeDeleted, CancellationToken cancellationToken = default) =>
        BaseQuery(includeDeleted)
            .Include(p => p.Images)
            .Include(p => p.ProductCategories).ThenInclude(pc => pc.Category)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task<Product?> GetBySlugAsync(string slug, bool includeDeleted, CancellationToken cancellationToken = default) =>
        BaseQuery(includeDeleted)
            .Include(p => p.Images)
            .Include(p => p.ProductCategories).ThenInclude(pc => pc.Category)
            .FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);

    public async Task<IReadOnlyList<Product>> GetFeaturedAsync(int take, CancellationToken cancellationToken = default) =>
        await db.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.CreatedAt)
            .Take(take)
            .Include(p => p.Images)
            .Include(p => p.ProductCategories)
            .ThenInclude(pc => pc.Category)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Product>> GetNewArrivalsAsync(int take, CancellationToken cancellationToken = default) =>
        await db.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.IsActive && p.IsNew)
            .OrderByDescending(p => p.CreatedAt)
            .Take(take)
            .Include(p => p.Images)
            .Include(p => p.ProductCategories)
            .ThenInclude(pc => pc.Category)
            .ToListAsync(cancellationToken);

    public Task AddAsync(Product product, CancellationToken cancellationToken = default) =>
        db.Products.AddAsync(product, cancellationToken).AsTask();

    public void Update(Product product) => db.Products.Update(product);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);

    private IQueryable<Product> BaseQuery(bool includeDeleted)
    {
        var q = db.Products.AsQueryable();
        if (!includeDeleted)
            q = q.Where(p => !p.IsDeleted);
        return q.AsSplitQuery();
    }
}
