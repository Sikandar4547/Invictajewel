using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/admin/banners")]
[Authorize(Roles = "Admin")]
public class AdminBannersController(IBannerService banners, ILogger<AdminBannersController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BannerDto>>> List(CancellationToken ct) =>
        Ok(await banners.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BannerDto>> GetById(int id, CancellationToken ct)
    {
        var item = await banners.GetByIdAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<BannerDto>> Create([FromBody] SaveBannerDto dto, CancellationToken ct)
    {
        var error = Validate(dto);
        if (error is not null) return BadRequest(new { message = error });
        var item = await banners.CreateAsync(NormalizeDto(dto), ct);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BannerDto>> Update(int id, [FromBody] SaveBannerDto dto, CancellationToken ct)
    {
        var error = Validate(dto);
        if (error is not null) return BadRequest(new { message = error });
        var item = await banners.UpdateAsync(id, NormalizeDto(dto), ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await banners.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpPost("upload-image")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<object>> UploadImage(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length <= 0) return BadRequest(new { message = "Image file is required." });
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!new[] { ".jpg", ".jpeg", ".png", ".webp" }.Contains(ext))
            return BadRequest(new { message = "Only jpg, jpeg, png, and webp are supported." });

        try
        {
            await using var stream = file.OpenReadStream();
            var imageUrl = await banners.SaveUploadedImageAsync(stream, file.FileName, ct);
            return Ok(new { imageUrl });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Banner image upload failed");
            return StatusCode(500, new { message = "Image upload failed." });
        }
    }

    private static SaveBannerDto NormalizeDto(SaveBannerDto dto)
    {
        dto.Title = dto.Title.Trim();
        dto.ImageUrl = NormalizeRelativeUploadPath(dto.ImageUrl) ?? string.Empty;
        dto.LinkUrl = NormalizeLinkUrl(dto.LinkUrl);
        return dto;
    }

    private static string? Validate(SaveBannerDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title)) return "Title is required.";
        if (NormalizeRelativeUploadPath(dto.ImageUrl) is null) return "ImageUrl must be under /uploads/banners.";
        if (!string.IsNullOrWhiteSpace(dto.LinkUrl) && NormalizeLinkUrl(dto.LinkUrl) is null) 
            return "LinkUrl must be an absolute http(s) URL or start with /.";
        if (dto.DisplayOrder < 0) return "DisplayOrder must be zero or greater.";
        return null;
    }

    private static string? NormalizeRelativeUploadPath(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim().Replace('\\', '/');
        if (v.StartsWith('/')) v = v[1..];
        if (v.Contains("..", StringComparison.Ordinal)) return null;
        return v.StartsWith("uploads/banners/", StringComparison.OrdinalIgnoreCase) ? $"/{v}" : null;
    }

    private static string? NormalizeLinkUrl(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim();
        if (v.StartsWith('/')) return v;
        return v.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || v.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ? v : null;
    }
}
