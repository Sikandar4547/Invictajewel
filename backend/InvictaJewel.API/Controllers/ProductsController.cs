using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService products) : ControllerBase
{
    [HttpGet("featured")]
    public async Task<ActionResult<IReadOnlyList<ProductListDto>>> Featured([FromQuery] int take = 8, CancellationToken ct = default) =>
        Ok(await products.GetFeaturedAsync(take, ct));

    [HttpGet("new-arrivals")]
    public async Task<ActionResult<IReadOnlyList<ProductListDto>>> NewArrivals([FromQuery] int take = 8, CancellationToken ct = default) =>
        Ok(await products.GetNewArrivalsAsync(take, ct));

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<ProductListDto>>> Search(
        [FromQuery] int? categoryId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] bool? isOnSale = null,
        [FromQuery] bool includeInactive = false,
        CancellationToken ct = default) =>
        Ok(await products.SearchAsync(categoryId, search, page, pageSize, sortBy, sortOrder, minPrice, maxPrice, isOnSale, includeInactive, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> GetById(int id, [FromQuery] bool admin = false, CancellationToken ct = default)
    {
        var product = await products.GetByIdAsync(id, admin, ct);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<ProductDetailDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var product = await products.GetBySlugAsync(slug, ct);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDetailDto>> Create([FromBody] CreateProductDto dto, CancellationToken ct)
    {
        var created = await products.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDetailDto>> Update(int id, [FromBody] UpdateProductDto dto, CancellationToken ct)
    {
        var result = await products.UpdateAsync(id, dto, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await products.SoftDeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpPatch("{id:int}/toggle-status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleStatus(int id, CancellationToken ct) =>
        await products.ToggleStatusAsync(id, ct) ? NoContent() : NotFound();

    [HttpPatch("{id:int}/sale")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetSale(int id, [FromBody] SetSaleDto dto, CancellationToken ct) =>
        await products.SetSaleAsync(id, dto.SalePrice, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}/sale")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveSale(int id, CancellationToken ct) =>
        await products.RemoveSaleAsync(id, ct) ? NoContent() : NotFound();

    [HttpPost("upload-image")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UploadProductImageResultDto>> UploadImage([FromForm] int productId, IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0)
            return BadRequest("File is required.");
        await using var stream = file.OpenReadStream();
        var result = await products.SaveUploadedImageAsync(productId, stream, file.FileName, ct);
        return Ok(result);
    }
}
