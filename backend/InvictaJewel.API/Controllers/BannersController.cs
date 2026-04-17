using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BannersController(IBannerService banners) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BannerDto>>> GetActive(CancellationToken ct)
    {
        var items = await banners.GetActiveAsync(ct);
        return Ok(items);
    }
}

