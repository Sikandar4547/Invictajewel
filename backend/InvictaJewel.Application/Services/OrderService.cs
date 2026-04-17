using AutoMapper;
using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Application.DTOs;
using InvictaJewel.Domain.Common;
using InvictaJewel.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace InvictaJewel.Application.Services;

public class OrderService(
    ICartRepository carts,
    IOrderRepository orders,
    IProductRepository products,
    IOrderNotificationService orderNotificationService,
    IMapper mapper,
    ILogger<OrderService> logger) : IOrderService
{
    public async Task<OrderDetailDto> CreateFromCartAsync(CreateOrderDto dto, CancellationToken cancellationToken = default)
    {
        var cart = await carts.GetByIdentifierAsync(dto.CartIdentifier, cancellationToken)
            ?? throw new InvalidOperationException("Cart not found.");
        if (cart.Items.Count == 0)
            throw new InvalidOperationException("Cart is empty.");

        var order = new Order
        {
            OrderNumber = await GenerateUniqueOrderNumberAsync(cancellationToken),
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            CustomerPhone = dto.CustomerPhone,
            ShippingAddress = dto.ShippingAddress,
            City = dto.City,
            PostalCode = dto.PostalCode,
            Notes = dto.Notes,
            OrderStatus = OrderStatuses.Pending,
            PaymentMethod = "COD"
        };

        decimal total = 0;
        foreach (var line in cart.Items)
        {
            var product = await products.GetByIdAsync(line.ProductId, includeDeleted: false, cancellationToken)
                ?? throw new InvalidOperationException($"Product {line.ProductId} no longer available.");
            if (!product.IsActive || line.Quantity > product.StockQuantity)
                throw new InvalidOperationException($"Insufficient stock for {product.Name}.");

            var unit = line.UnitPrice;
            var lineTotal = unit * line.Quantity;
            total += lineTotal;
            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = unit,
                Quantity = line.Quantity,
                TotalPrice = lineTotal
            });
            product.StockQuantity -= line.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            products.Update(product);
        }

        order.OrderTotal = total;
        await orders.AddAsync(order, cancellationToken);

        foreach (var item in cart.Items.ToList())
            carts.RemoveItem(item);
        await orders.SaveChangesAsync(cancellationToken);

        var reloaded = await orders.GetByOrderNumberAsync(order.OrderNumber, cancellationToken) ?? order;
        try
        {
            await orderNotificationService.SendAdminShipmentReceiptAsync(reloaded, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send shipment receipt email for order {OrderNumber}", reloaded.OrderNumber);
        }
        return mapper.Map<OrderDetailDto>(reloaded);
    }

    public async Task<OrderDetailDto?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        var entity = await orders.GetByOrderNumberAsync(orderNumber, cancellationToken);
        return entity is null ? null : mapper.Map<OrderDetailDto>(entity);
    }

    public async Task<PagedResultDto<OrderDetailDto>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var (items, total) = await orders.GetAllPagedAsync(page, pageSize, cancellationToken);
        return new PagedResultDto<OrderDetailDto>
        {
            Items = mapper.Map<IReadOnlyList<OrderDetailDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<bool> UpdateStatusAsync(int orderId, string status, CancellationToken cancellationToken = default)
    {
        if (!OrderStatuses.All.Contains(status))
            return false;
        var entity = await orders.GetByIdAsync(orderId, cancellationToken);
        if (entity is null)
            return false;
        entity.OrderStatus = status;
        entity.UpdatedAt = DateTime.UtcNow;
        await orders.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<string> GenerateUniqueOrderNumberAsync(CancellationToken cancellationToken)
    {
        for (var i = 0; i < 10; i++)
        {
            var candidate = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";
            if (await orders.GetByOrderNumberAsync(candidate, cancellationToken) is null)
                return candidate;
        }
        var fallback = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}";
        return fallback.Length <= 50 ? fallback : fallback[..50];
    }
}
