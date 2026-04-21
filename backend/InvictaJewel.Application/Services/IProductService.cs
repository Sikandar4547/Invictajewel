using InvictaJewel.Application.DTOs;

namespace InvictaJewel.Application.Services;

public interface IProductService
{
    Task<PagedResultDto<ProductListDto>> SearchAsync(int? categoryId, string? search, int page, int pageSize, string? sortBy, string? sortOrder, decimal? minPrice, decimal? maxPrice, bool? isOnSale, bool includeInactive, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> GetByIdAsync(int id, bool admin = false, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductListDto>> GetFeaturedAsync(int take, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductListDto>> GetNewArrivalsAsync(int take, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ToggleStatusAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> SetSaleAsync(int id, SetSaleDto dto, CancellationToken cancellationToken = default);
    Task<bool> RemoveSaleAsync(int id, CancellationToken cancellationToken = default);
    Task<UploadProductImageResultDto> SaveUploadedImageAsync(int productId, Stream fileStream, string fileName, CancellationToken cancellationToken = default);
}
