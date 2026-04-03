using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Services;
using InvictaJewel.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(ICategoryService categories) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetActive(CancellationToken ct) =>
        Ok(await categories.GetActiveHierarchyAsync(ct));


    [HttpPost("import-from-wp")]
    public async Task<ActionResult> ImportFromWordPress([FromServices] ApplicationDbContext db, [FromServices] ILoggerFactory loggerFactory, [FromServices] IWebHostEnvironment env, CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("WPImport");
        var wpConn = "Server=localhost;Database=mysql_178265_invicta;User=root;Password=;";
        var report = await InvictaJewel.Infrastructure.Persistence.DbInitializer.SeedProductsFromWordPressReportAsync(db, wpConn, env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), ct);
        return Ok(report);
    }
    [HttpPost("repair-images")]
    public async Task<ActionResult> RepairProductImages([FromServices] ApplicationDbContext db, [FromServices] IWebHostEnvironment env, CancellationToken ct)
    {
        var repaired = await InvictaJewel.Infrastructure.Persistence.DbInitializer.RepairProductImagesAsync(db, env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), ct);
        return Ok(new { repaired });
    }

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

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryDto dto, CancellationToken ct)
    {
        var created = await categories.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoryDto>> Update(int id, [FromBody] UpdateCategoryDto dto, CancellationToken ct)
    {
        var result = await categories.UpdateAsync(id, dto, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await categories.SoftDeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpPatch("{id:int}/toggle-status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleStatus(int id, CancellationToken ct) =>
        await categories.ToggleStatusAsync(id, ct) ? NoContent() : NotFound();

    [HttpPost("{id:int}/apply-sale")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApplySale(int id, [FromBody] ApplyCategorySaleDto dto, CancellationToken ct)
    {
        await categories.ApplySaleAsync(id, dto.SalePrice, ct);
        return NoContent();
    }

    [HttpDelete("{id:int}/remove-sale")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveSale(int id, CancellationToken ct)
    {
        await categories.RemoveSaleAsync(id, ct);
        return NoContent();
    }
}
