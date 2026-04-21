using AutoMapper;
using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Application.Abstractions.Storage;
using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Pricing;
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
        var itemList = items.ToList();
        var dtoList = mapper.Map<List<ProductListDto>>(itemList);
        if (!includeInactive && dtoList.Count > 0)
            await ApplyStorefrontPricingAsync(itemList, dtoList, cancellationToken);

        return new PagedResultDto<ProductListDto>
        {
            Items = dtoList,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductDetailDto?> GetByIdAsync(int id, bool admin = false, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetByIdAsync(id, admin, cancellationToken);
        if (entity is null)
            return null;
        var dto = mapper.Map<ProductDetailDto>(entity);
        if (!admin)
            await ApplyStorefrontPricingSingleAsync(entity, dto, cancellationToken);
        return dto;
    }

    public async Task<ProductDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetBySlugAsync(slug, includeDeleted: false, cancellationToken);
        if (entity is null)
            return null;
        var dto = mapper.Map<ProductDetailDto>(entity);
        await ApplyStorefrontPricingSingleAsync(entity, dto, cancellationToken);
        return dto;
    }

    public async Task<IReadOnlyList<ProductListDto>> GetFeaturedAsync(int take, CancellationToken cancellationToken = default)
    {
        var list = await products.GetFeaturedAsync(take, cancellationToken);
        var itemList = list.ToList();
        var dtoList = mapper.Map<List<ProductListDto>>(itemList);
        if (dtoList.Count > 0)
            await ApplyStorefrontPricingAsync(itemList, dtoList, cancellationToken);
        return dtoList;
    }

    public async Task<IReadOnlyList<ProductListDto>> GetNewArrivalsAsync(int take, CancellationToken cancellationToken = default)
    {
        var list = await products.GetNewArrivalsAsync(take, cancellationToken);
        var itemList = list.ToList();
        var dtoList = mapper.Map<List<ProductListDto>>(itemList);
        if (dtoList.Count > 0)
            await ApplyStorefrontPricingAsync(itemList, dtoList, cancellationToken);
        return dtoList;
    }

    public async Task<ProductDetailDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Product
        {
            Name = dto.Name.Trim(),
            Slug = dto.Slug.Trim(),
            Description = dto.Description,
            RegularPrice = dto.RegularPrice,
            SalePrice = dto.SalePrice,
            SaleStartUtc = dto.SaleStartUtc,
            SaleEndUtc = dto.SaleEndUtc,
            SKU = dto.SKU.Trim(),
            StockQuantity = dto.StockQuantity,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured,
            IsNew = dto.IsNew,
            MetaTitle = dto.MetaTitle,
            MetaDescription = dto.MetaDescription
        };
        SyncCategories(entity, dto);
        if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
        {
            entity.Images.Add(new ProductImage
            {
                ImageUrl = dto.ImageUrl.Trim(),
                IsPrimary = true,
                DisplayOrder = 0,
                AltText = entity.Name
            });
        }
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
        entity.Name = dto.Name.Trim();
        entity.Slug = dto.Slug.Trim();
        entity.Description = dto.Description;
        entity.RegularPrice = dto.RegularPrice;
        entity.SalePrice = dto.SalePrice;
        entity.SaleStartUtc = dto.SaleStartUtc;
        entity.SaleEndUtc = dto.SaleEndUtc;
        entity.SKU = dto.SKU.Trim();
        entity.StockQuantity = dto.StockQuantity;
        entity.IsActive = dto.IsActive;
        entity.IsFeatured = dto.IsFeatured;
        entity.IsNew = dto.IsNew;
        entity.MetaTitle = dto.MetaTitle;
        entity.MetaDescription = dto.MetaDescription;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.ProductCategories.Clear();
        SyncCategories(entity, dto);

        if (dto.ImageUrl != null)
            ApplyImageUrlUpdate(entity, dto.ImageUrl);

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

    public async Task<bool> SetSaleAsync(int id, SetSaleDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.SaleStartUtc.HasValue && dto.SaleEndUtc.HasValue && dto.SaleEndUtc.Value < dto.SaleStartUtc.Value)
            return false;
        var entity = await products.GetByIdAsync(id, includeDeleted: false, cancellationToken);
        if (entity is null)
            return false;
        if (dto.SalePrice > entity.RegularPrice)
            return false;
        entity.SalePrice = dto.SalePrice;
        entity.SaleStartUtc = dto.SaleStartUtc;
        entity.SaleEndUtc = dto.SaleEndUtc;
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
        entity.SaleStartUtc = null;
        entity.SaleEndUtc = null;
        entity.UpdatedAt = DateTime.UtcNow;
        products.Update(entity);
        await products.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<UploadProductImageResultDto> SaveUploadedImageAsync(int productId, Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        var entity = await products.GetByIdAsync(productId, includeDeleted: true, cancellationToken)
            ?? throw new InvalidOperationException("Product not found.");
        foreach (var img in entity.Images.ToList())
        {
            imageStorage.TryDeleteStoredFile(img.ImageUrl);
            entity.Images.Remove(img);
        }
        var url = await imageStorage.SaveProductImageAsync(fileStream, fileName, productId, cancellationToken);
        entity.Images.Add(new ProductImage
        {
            ProductId = productId,
            ImageUrl = url,
            IsPrimary = true,
            DisplayOrder = 0,
            AltText = entity.Name
        });
        entity.UpdatedAt = DateTime.UtcNow;
        products.Update(entity);
        await products.SaveChangesAsync(cancellationToken);
        return new UploadProductImageResultDto { ImageUrl = url };
    }

    private void ApplyImageUrlUpdate(Product entity, string? imageUrlFromDto)
    {
        var primary = entity.Images
            .OrderByDescending(i => i.IsPrimary)
            .ThenBy(i => i.DisplayOrder)
            .Select(i => i.ImageUrl)
            .FirstOrDefault();
        if (string.IsNullOrWhiteSpace(imageUrlFromDto))
        {
            foreach (var img in entity.Images.ToList())
            {
                imageStorage.TryDeleteStoredFile(img.ImageUrl);
                entity.Images.Remove(img);
            }
            return;
        }
        var trimmed = imageUrlFromDto.Trim();
        if (string.Equals(trimmed, primary, StringComparison.OrdinalIgnoreCase))
            return;
        foreach (var img in entity.Images.ToList())
        {
            imageStorage.TryDeleteStoredFile(img.ImageUrl);
            entity.Images.Remove(img);
        }
        entity.Images.Add(new ProductImage
        {
            ImageUrl = trimmed,
            IsPrimary = true,
            DisplayOrder = 0,
            AltText = entity.Name
        });
    }

    private async Task ApplyStorefrontPricingAsync(IReadOnlyList<Product> entities, List<ProductListDto> dtos, CancellationToken cancellationToken)
    {
        if (entities.Count != dtos.Count || entities.Count == 0)
            return;
        var flat = await categories.GetAllNonDeletedFlatAsync(cancellationToken);
        var dict = flat.ToDictionary(c => c.Id);
        var now = DateTime.UtcNow;
        for (var i = 0; i < entities.Count; i++)
            SalePricing.ApplyEffectiveToProductListDto(entities[i], dtos[i], dict, now);
    }

    private async Task ApplyStorefrontPricingSingleAsync(Product entity, ProductListDto dto, CancellationToken cancellationToken)
    {
        var flat = await categories.GetAllNonDeletedFlatAsync(cancellationToken);
        var dict = flat.ToDictionary(c => c.Id);
        SalePricing.ApplyEffectiveToProductListDto(entity, dto, dict, DateTime.UtcNow);
    }

    private static void SyncCategories(Product entity, CreateProductDto dto)
    {
        var categoryIds = dto.CategoryIds?.Where(x => x > 0).Distinct().ToList() ?? new List<int>();
        if (categoryIds.Count == 0 && dto.CategoryId is { } single && single > 0)
            categoryIds.Add(single);
        var primary = dto.PrimaryCategoryId ?? categoryIds.FirstOrDefault();
        var order = 0;
        foreach (var cid in categoryIds)
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
