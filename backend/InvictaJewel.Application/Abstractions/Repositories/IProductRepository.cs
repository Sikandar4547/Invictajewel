using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Abstractions.Repositories;

public interface IProductRepository
{
    Task<(IReadOnlyList<Product> Items, int Total)> SearchAsync(
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
        CancellationToken cancellationToken = default);

    Task<Product?> GetByIdAsync(int id, bool includeDeleted, CancellationToken cancellationToken = default);
    Task<Product?> GetBySlugAsync(string slug, bool includeDeleted, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetFeaturedAsync(int take, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetNewArrivalsAsync(int take, CancellationToken cancellationToken = default);
    Task AddAsync(Product product, CancellationToken cancellationToken = default);
    void Update(Product product);
    Task ApplySaleToProductsInCategoriesAsync(IReadOnlyList<int> categoryIds, decimal salePrice, CancellationToken cancellationToken = default);
    Task RemoveSaleFromProductsInCategoriesAsync(IReadOnlyList<int> categoryIds, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
