using AutoMapper;
using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Application.Abstractions.Storage;
using InvictaJewel.Application.DTOs;
using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Services;

public class ProductService(
    IProductRepository products,
    ICategoryRepository categories,
    IProductImageStorage imageStorage,
    IMapper mapper) : IProductService
{
    public async Task<PagedResultDto<ProductListDto>> SearchAsync(
        int? categoryId,
        string? search,
        int page,
        int pageSize,
        string? sortBy,
        string? sortOrder,
        decimal? minPrice,
        decimal? maxPrice,
        bool? isOnSale,
        bool includeInactive,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<int>? scope = null;
        if (categoryId is { } cid)
        {
            var list = new List<int> { cid };
            list.AddRange(await categories.GetDescendantCategoryIdsAsync(cid, cancellationToken));
            scope = list;
        }

        var (items, total) = await products.SearchAsync(search, page, pageSize, sortBy, sortOrder, minPrice, maxPrice, isOnSale, includeInactive, scope, cancellationToken);
        return new PagedResultDto<ProductListDto>
        {
            Items = mapper.Map<IReadOnlyList<ProductListDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductDetailDto?> GetByIdAsync(int id, bool admin = false, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetByIdAsync(id, admin, cancellationToken);
        return entity is null ? null : mapper.Map<ProductDetailDto>(entity);
    }

    public async Task<ProductDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetBySlugAsync(slug, includeDeleted: false, cancellationToken);
        return entity is null ? null : mapper.Map<ProductDetailDto>(entity);
    }

    public async Task<IReadOnlyList<ProductListDto>> GetFeaturedAsync(int take, CancellationToken cancellationToken = default)
    {
        var list = await products.GetFeaturedAsync(take, cancellationToken);
        return mapper.Map<IReadOnlyList<ProductListDto>>(list);
    }

    public async Task<IReadOnlyList<ProductListDto>> GetNewArrivalsAsync(int take, CancellationToken cancellationToken = default)
    {
        var list = await products.GetNewArrivalsAsync(take, cancellationToken);
        return mapper.Map<IReadOnlyList<ProductListDto>>(list);
    }

    public async Task<ProductDetailDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Product
        {
            Name = dto.Name,
            Slug = dto.Slug,
            Description = dto.Description,
            RegularPrice = dto.RegularPrice,
            SalePrice = dto.SalePrice,
            SKU = dto.SKU,
            StockQuantity = dto.StockQuantity,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured,
            IsNew = dto.IsNew,
            MetaTitle = dto.MetaTitle,
            MetaDescription = dto.MetaDescription
        };
        SyncCategories(entity, dto.CategoryIds, dto.PrimaryCategoryId);
        await products.AddAsync(entity, cancellationToken);
        await products.SaveChangesAsync(cancellationToken);
        var reloaded = await products.GetByIdAsync(entity.Id, includeDeleted: true, cancellationToken) ?? entity;
        return mapper.Map<ProductDetailDto>(reloaded);
    }

    public async Task<ProductDetailDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetByIdAsync(id, includeDeleted: true, cancellationToken);
        if (entity is null || entity.IsDeleted)
            return null;
        entity.Name = dto.Name;
        entity.Slug = dto.Slug;
        entity.Description = dto.Description;
        entity.RegularPrice = dto.RegularPrice;
        entity.SalePrice = dto.SalePrice;
        entity.SKU = dto.SKU;
        entity.StockQuantity = dto.StockQuantity;
        entity.IsActive = dto.IsActive;
        entity.IsFeatured = dto.IsFeatured;
        entity.IsNew = dto.IsNew;
        entity.MetaTitle = dto.MetaTitle;
        entity.MetaDescription = dto.MetaDescription;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.ProductCategories.Clear();
        SyncCategories(entity, dto.CategoryIds, dto.PrimaryCategoryId);
        products.Update(entity);
        await products.SaveChangesAsync(cancellationToken);
        var reloaded = await products.GetByIdAsync(id, includeDeleted: true, cancellationToken);
        return reloaded is null ? null : mapper.Map<ProductDetailDto>(reloaded);
    }

    public async Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetByIdAsync(id, includeDeleted: true, cancellationToken);
        if (entity is null || entity.IsDeleted)
            return false;
        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        products.Update(entity);
        await products.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ToggleStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetByIdAsync(id, includeDeleted: false, cancellationToken);
        if (entity is null)
            return false;
        entity.IsActive = !entity.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        products.Update(entity);
        await products.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> SetSaleAsync(int id, decimal salePrice, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetByIdAsync(id, includeDeleted: false, cancellationToken);
        if (entity is null)
            return false;
        entity.SalePrice = salePrice;
        entity.UpdatedAt = DateTime.UtcNow;
        products.Update(entity);
        await products.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> RemoveSaleAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetByIdAsync(id, includeDeleted: false, cancellationToken);
        if (entity is null)
            return false;
        entity.SalePrice = null;
        entity.UpdatedAt = DateTime.UtcNow;
        products.Update(entity);
        await products.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<UploadProductImageResultDto> SaveUploadedImageAsync(int productId, Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetByIdAsync(productId, includeDeleted: true, cancellationToken)
            ?? throw new InvalidOperationException("Product not found.");
        var url = await imageStorage.SaveProductImageAsync(fileStream, fileName, productId, cancellationToken);
        var order = entity.Images.Count;
        entity.Images.Add(new ProductImage
        {
            ProductId = productId,
            ImageUrl = url,
            IsPrimary = order == 0,
            DisplayOrder = order,
            AltText = entity.Name
        });
        entity.UpdatedAt = DateTime.UtcNow;
        products.Update(entity);
        await products.SaveChangesAsync(cancellationToken);
        return new UploadProductImageResultDto { ImageUrl = url };
    }

    private static void SyncCategories(Product entity, List<int> categoryIds, int? primaryCategoryId)
    {
        var primary = primaryCategoryId ?? categoryIds.FirstOrDefault();
        var order = 0;
        foreach (var cid in categoryIds.Distinct())
        {
            entity.ProductCategories.Add(new ProductCategory
            {
                CategoryId = cid,
                IsPrimary = cid == primary,
                DisplayOrder = order++
            });
        }
    }
}
