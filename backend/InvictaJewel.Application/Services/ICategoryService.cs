using InvictaJewel.Application.DTOs;

namespace InvictaJewel.Application.Services;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetActiveHierarchyAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CategoryDto>> GetAdminHierarchyAsync(CancellationToken cancellationToken = default);
    Task<CategoryDto?> GetByIdAsync(int id, bool includeProducts, bool admin = false, CancellationToken cancellationToken = default);
    Task<CategoryDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<PagedResultDto<ProductListDto>> GetCategoryProductsAsync(int categoryId, int page, int pageSize, string? sortBy, string? sortOrder, decimal? minPrice, decimal? maxPrice, bool? isOnSale, bool includeInactive, CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ToggleStatusAsync(int id, CancellationToken cancellationToken = default);
    Task ApplySaleAsync(int categoryId, decimal salePrice, CancellationToken cancellationToken = default);
    Task RemoveSaleAsync(int categoryId, CancellationToken cancellationToken = default);
}
