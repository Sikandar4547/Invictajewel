using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvictaJewel.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(IOrderService orders) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderDetailDto>> Create([FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        try
        {
            var order = await orders.CreateFromCartAsync(dto, ct);
            return CreatedAtAction(nameof(GetByOrderNumber), new { orderNumber = order.OrderNumber }, order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{orderNumber}")]
    public async Task<ActionResult<OrderDetailDto>> GetByOrderNumber(string orderNumber, CancellationToken ct)
    {
        var order = await orders.GetByOrderNumberAsync(orderNumber, ct);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpGet("track/{orderNumber}")]
    public async Task<ActionResult<OrderDetailDto>> Track(string orderNumber, CancellationToken ct)
    {
        var order = await orders.GetByOrderNumberAsync(orderNumber, ct);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResultDto<OrderDetailDto>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        Ok(await orders.GetAllAsync(page, pageSize, ct));

    [HttpPut("{orderId:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int orderId, [FromBody] UpdateOrderStatusDto dto, CancellationToken ct) =>
        await orders.UpdateStatusAsync(orderId, dto.Status, ct) ? NoContent() : BadRequest();
}
