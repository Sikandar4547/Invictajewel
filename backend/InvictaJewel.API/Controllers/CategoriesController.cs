using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(ICategoryService categories) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetActive(CancellationToken ct) =>
        Ok(await categories.GetActiveHierarchyAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id, [FromQuery] bool includeProducts = false, CancellationToken ct = default)
    {
        var category = await categories.GetByIdAsync(id, includeProducts, admin: false, ct);
        return category is null ? NotFound() : Ok(category);
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<CategoryDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var category = await categories.GetBySlugAsync(slug, ct);
        return category is null ? NotFound() : Ok(category);
    }

    /// <summary>Resolves a category by slug (same as /by-slug/{slug}; numeric segments still use GetById).</summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<CategoryDto>> GetBySlugPath(string slug, CancellationToken ct)
    {
        if (string.Equals(slug, "by-slug", StringComparison.OrdinalIgnoreCase))
            return NotFound();
        var category = await categories.GetBySlugAsync(slug, ct);
        return category is null ? NotFound() : Ok(category);
    }

    [HttpGet("{id:int}/products")]
    public async Task<ActionResult<PagedResultDto<ProductListDto>>> GetProducts(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] bool? isOnSale = null,
        [FromQuery] bool includeInactive = false,
        CancellationToken ct = default) =>
        Ok(await categories.GetCategoryProductsAsync(id, page, pageSize, sortBy, sortOrder, minPrice, maxPrice, isOnSale, includeInactive, ct));

    [HttpGet("{slug}/products")]
    public async Task<ActionResult<PagedResultDto<ProductListDto>>> GetProductsBySlug(
        string slug,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] bool? isOnSale = null,
        [FromQuery] bool includeInactive = false,
        CancellationToken ct = default)
    {
        if (string.Equals(slug, "by-slug", StringComparison.OrdinalIgnoreCase))
            return NotFound();
        var category = await categories.GetBySlugAsync(slug, ct);
        if (category is null)
            return NotFound();
        return Ok(await categories.GetCategoryProductsAsync(category.Id, page, pageSize, sortBy, sortOrder, minPrice, maxPrice, isOnSale, includeInactive, ct));
    }
}
