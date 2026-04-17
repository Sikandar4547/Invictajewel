using AutoMapper;
using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Application.DTOs;
using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Services;

public class CategoryService(
    ICategoryRepository categories,
    IProductRepository products,
    IMapper mapper) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryDto>> GetActiveHierarchyAsync(CancellationToken cancellationToken = default)
    {
        var flat = await categories.GetActiveCategoriesFlatAsync(cancellationToken);
        var dtos = mapper.Map<List<CategoryDto>>(flat);
        return BuildTree(dtos);
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAdminHierarchyAsync(CancellationToken cancellationToken = default)
    {
        var flat = await categories.GetAllNonDeletedFlatAsync(cancellationToken);
        var dtos = mapper.Map<List<CategoryDto>>(flat);
        return BuildTree(dtos);
    }

    public async Task<CategoryDto?> GetByIdAsync(int id, bool includeProducts, bool admin = false, CancellationToken cancellationToken = default)
    {
        var entity = await categories.GetByIdAsync(id, admin, cancellationToken);
        if (entity is null)
            return null;
        var dto = mapper.Map<CategoryDto>(entity);
        if (includeProducts)
        {
            var scope = (await GetCategoryScopeIdsAsync(id, cancellationToken)).ToList();
            var (items, _) = await products.SearchAsync(null, 1, 50, null, null, null, null, null, admin, scope, cancellationToken);
            dto.Products = mapper.Map<List<ProductListDto>>(items);
        }
        return dto;
    }

    public async Task<CategoryDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var entity = await categories.GetBySlugAsync(slug, includeDeleted: false, cancellationToken);
        return entity is null ? null : mapper.Map<CategoryDto>(entity);
    }

    public async Task<PagedResultDto<ProductListDto>> GetCategoryProductsAsync(
        int categoryId,
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
        var scope = (await GetCategoryScopeIdsAsync(categoryId, cancellationToken)).ToList();
        var (items, total) = await products.SearchAsync(null, page, pageSize, sortBy, sortOrder, minPrice, maxPrice, isOnSale, includeInactive, scope, cancellationToken);
        return new PagedResultDto<ProductListDto>
        {
            Items = mapper.Map<IReadOnlyList<ProductListDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Category
        {
            Name = dto.Name,
            Slug = dto.Slug,
            ParentCategoryId = dto.ParentCategoryId,
            Description = dto.Description,
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder,
            ImageUrl = dto.ImageUrl,
            Metadata = dto.Metadata
        };
        await categories.AddAsync(entity, cancellationToken);
        await categories.SaveChangesAsync(cancellationToken);
        return mapper.Map<CategoryDto>(entity);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await categories.GetByIdAsync(id, includeDeleted: true, cancellationToken);
        if (entity is null || entity.IsDeleted)
            return null;
        if (dto.ParentCategoryId == id)
            throw new ArgumentException("A category cannot be its own parent.");
        if (dto.ParentCategoryId is { } newParentId)
        {
            var descendants = await categories.GetDescendantCategoryIdsAsync(id, cancellationToken);
            if (descendants.Contains(newParentId))
                throw new ArgumentException("Parent cannot be a descendant of this category.");
        }
        entity.Name = dto.Name;
        entity.Slug = dto.Slug;
        entity.ParentCategoryId = dto.ParentCategoryId;
        entity.Description = dto.Description;
        entity.IsActive = dto.IsActive;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.ImageUrl = dto.ImageUrl;
        entity.Metadata = dto.Metadata;
        entity.UpdatedAt = DateTime.UtcNow;
        categories.Update(entity);
        await categories.SaveChangesAsync(cancellationToken);
        return mapper.Map<CategoryDto>(entity);
    }

    public async Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await categories.GetByIdAsync(id, includeDeleted: true, cancellationToken);
        if (entity is null || entity.IsDeleted)
            return false;
        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        categories.Update(entity);
        await categories.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ToggleStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await categories.GetByIdAsync(id, includeDeleted: false, cancellationToken);
        if (entity is null)
            return false;
        entity.IsActive = !entity.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        categories.Update(entity);
        await categories.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task ApplySaleAsync(int categoryId, decimal salePrice, CancellationToken cancellationToken = default)
    {
        var scope = (await GetCategoryScopeIdsAsync(categoryId, cancellationToken)).ToList();
        if (scope.Count == 0)
            return;
        await products.ApplySaleToProductsInCategoriesAsync(scope, salePrice, cancellationToken);
    }

    public async Task RemoveSaleAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        var scope = (await GetCategoryScopeIdsAsync(categoryId, cancellationToken)).ToList();
        if (scope.Count == 0)
            return;
        await products.RemoveSaleFromProductsInCategoriesAsync(scope, cancellationToken);
    }

    private async Task<IReadOnlyList<int>> GetCategoryScopeIdsAsync(int categoryId, CancellationToken cancellationToken)
    {
        var ids = new List<int> { categoryId };
        ids.AddRange(await categories.GetDescendantCategoryIdsAsync(categoryId, cancellationToken));
        return ids;
    }

    private static List<CategoryDto> BuildTree(List<CategoryDto> flat)
    {
        var byParent = flat.ToLookup(c => c.ParentCategoryId);

        void AttachChildren(CategoryDto parent)
        {
            parent.Children = byParent[parent.Id].OrderBy(c => c.DisplayOrder).ToList();
            foreach (var child in parent.Children)
                AttachChildren(child);
        }

        var roots = byParent[null].OrderBy(r => r.DisplayOrder).ToList();
        foreach (var r in roots)
            AttachChildren(r);
        return roots;
    }
}
