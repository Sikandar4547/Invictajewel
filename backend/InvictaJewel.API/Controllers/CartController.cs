using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController(ICartService carts) : ControllerBase
{
    [HttpGet("{cartIdentifier:guid}")]
    public async Task<ActionResult<CartDto>> Get(Guid cartIdentifier, CancellationToken ct)
    {
        var cart = await carts.GetCartAsync(cartIdentifier, ct);
        return cart is null ? NotFound() : Ok(cart);
    }

    [HttpPost]
    public async Task<ActionResult<CreateCartResultDto>> Create(CancellationToken ct)
    {
        var result = await carts.CreateCartAsync(ct);
        return CreatedAtAction(nameof(Get), new { cartIdentifier = result.CartIdentifier }, result);
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddCartItemDto dto, CancellationToken ct)
    {
        try
        {
            return Ok(await carts.AddItemAsync(dto, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("items/{itemId:int}")]
    public async Task<ActionResult<CartDto>> UpdateItem(int itemId, [FromBody] UpdateCartItemDto dto, CancellationToken ct)
    {
        try
        {
            var cart = await carts.UpdateItemAsync(itemId, dto, ct);
            return cart is null ? NotFound() : Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("items/{itemId:int}")]
    public async Task<ActionResult<CartDto>> RemoveItem(int itemId, CancellationToken ct)
    {
        var cart = await carts.RemoveItemAsync(itemId, ct);
        return cart is null ? NotFound() : Ok(cart);
    }

    [HttpDelete("{cartIdentifier:guid}")]
    public async Task<IActionResult> Clear(Guid cartIdentifier, CancellationToken ct) =>
        await carts.ClearCartAsync(cartIdentifier, ct) ? NoContent() : NotFound();

    [HttpGet("{cartIdentifier:guid}/summary")]
    public async Task<ActionResult<CartDto>> Summary(Guid cartIdentifier, CancellationToken ct)
    {
        var cart = await carts.GetSummaryAsync(cartIdentifier, ct);
        return cart is null ? NotFound() : Ok(cart);
    }
}
