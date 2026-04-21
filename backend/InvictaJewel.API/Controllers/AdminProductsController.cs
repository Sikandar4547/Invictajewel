using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController(IProductService products) : ControllerBase
{
    /// <summary>List products including inactive (admin catalog).</summary>
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<ProductListDto>>> List(
        [FromQuery] int? categoryId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        CancellationToken ct = default) =>
        Ok(await products.SearchAsync(categoryId, search, page, pageSize, sortBy, sortOrder, null, null, null, includeInactive: true, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> GetById(int id, CancellationToken ct)
    {
        var product = await products.GetByIdAsync(id, admin: true, ct);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDetailDto>> Create([FromBody] CreateProductDto dto, CancellationToken ct)
    {
        var created = await products.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> Update(int id, [FromBody] UpdateProductDto dto, CancellationToken ct)
    {
        var result = await products.UpdateAsync(id, dto, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await products.SoftDeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpPatch("{id:int}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(int id, CancellationToken ct) =>
        await products.ToggleStatusAsync(id, ct) ? NoContent() : NotFound();

    [HttpPatch("{id:int}/sale")]
    public async Task<IActionResult> SetSale(int id, [FromBody] SetSaleDto dto, CancellationToken ct) =>
        await products.SetSaleAsync(id, dto, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}/sale")]
    public async Task<IActionResult> RemoveSale(int id, CancellationToken ct) =>
        await products.RemoveSaleAsync(id, ct) ? NoContent() : NotFound();

    /// <summary>Uploads a new image and replaces any existing product images.</summary>
    [HttpPost("{id:int}/image")]
    public async Task<ActionResult<UploadProductImageResultDto>> UploadImage(int id, IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0)
            return BadRequest("File is required.");
        await using var stream = file.OpenReadStream();
        var result = await products.SaveUploadedImageAsync(id, stream, file.FileName, ct);
        return Ok(result);
    }
}
