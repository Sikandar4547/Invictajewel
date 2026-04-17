using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Services;
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
    public async Task<ActionResult<ProductDetailDto>> GetById(int id, CancellationToken ct = default)
    {
        var product = await products.GetByIdAsync(id, admin: false, ct);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<ProductDetailDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var product = await products.GetBySlugAsync(slug, ct);
        return product is null ? NotFound() : Ok(product);
    }
}
