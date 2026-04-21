using AutoMapper;
using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Application.DTOs;
using InvictaJewel.Application.Pricing;
using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Services;

public class CartService(ICartRepository carts, IProductRepository products, ICategoryRepository categories, IMapper mapper) : ICartService
{
    public async Task<CartDto?> GetCartAsync(Guid cartIdentifier, CancellationToken cancellationToken = default)
    {
        var cart = await carts.GetByIdentifierAsync(cartIdentifier, cancellationToken);
        return cart is null ? null : ToDto(cart);
    }

    public async Task<CreateCartResultDto> CreateCartAsync(CancellationToken cancellationToken = default)
    {
        var cart = new Cart
        {
            CartIdentifier = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        await carts.AddAsync(cart, cancellationToken);
        await carts.SaveChangesAsync(cancellationToken);
        return new CreateCartResultDto { CartIdentifier = cart.CartIdentifier };
    }

    public async Task<CartDto> AddItemAsync(AddCartItemDto dto, CancellationToken cancellationToken = default)
    {
        var cart = await carts.GetByIdentifierAsync(dto.CartIdentifier, cancellationToken);
        if (cart is null)
        {
            cart = new Cart { CartIdentifier = dto.CartIdentifier, ExpiresAt = DateTime.UtcNow.AddDays(30) };
            await carts.AddAsync(cart, cancellationToken);
            await carts.SaveChangesAsync(cancellationToken);
        }

        var product = await products.GetByIdAsync(dto.ProductId, includeDeleted: false, cancellationToken)
            ?? throw new InvalidOperationException("Product not found or inactive.");
        if (!product.IsActive)
            throw new InvalidOperationException("Product is not available.");

        var unit = await EffectiveUnitPriceAsync(product, cancellationToken);
        var existing = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);
        if (existing is not null)
        {
            existing.Quantity += dto.Quantity;
            existing.UnitPrice = unit;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = unit,
                AddedAt = DateTime.UtcNow
            });
        }

        await carts.SaveChangesAsync(cancellationToken);
        cart = await carts.GetByIdentifierAsync(dto.CartIdentifier, cancellationToken) ?? cart;
        return ToDto(cart);
    }

    public async Task<CartDto?> UpdateItemAsync(int itemId, UpdateCartItemDto dto, CancellationToken cancellationToken = default)
    {
        var item = await carts.GetCartItemAsync(itemId, cancellationToken);
        if (item is null)
            return null;
        var product = await products.GetByIdAsync(item.ProductId, includeDeleted: false, cancellationToken);
        if (product is null)
            throw new InvalidOperationException("Product not found.");
        item.Quantity = dto.Quantity;
        item.UnitPrice = await EffectiveUnitPriceAsync(product, cancellationToken);
        await carts.SaveChangesAsync(cancellationToken);
        var cart = await carts.GetByIdentifierAsync(item.Cart.CartIdentifier, cancellationToken);
        return cart is null ? null : ToDto(cart);
    }

    public async Task<CartDto?> RemoveItemAsync(int itemId, CancellationToken cancellationToken = default)
    {
        var item = await carts.GetCartItemAsync(itemId, cancellationToken);
        if (item is null)
            return null;
        var cartId = item.Cart.CartIdentifier;
        carts.RemoveItem(item);
        await carts.SaveChangesAsync(cancellationToken);
        var cart = await carts.GetByIdentifierAsync(cartId, cancellationToken);
        return cart is null ? new CartDto { CartIdentifier = cartId } : ToDto(cart);
    }

    public async Task<bool> ClearCartAsync(Guid cartIdentifier, CancellationToken cancellationToken = default)
    {
        var cart = await carts.GetByIdentifierAsync(cartIdentifier, cancellationToken);
        if (cart is null)
            return false;
        foreach (var item in cart.Items.ToList())
            carts.RemoveItem(item);
        await carts.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<CartDto?> GetSummaryAsync(Guid cartIdentifier, CancellationToken cancellationToken = default) =>
        GetCartAsync(cartIdentifier, cancellationToken);

    private CartDto ToDto(Cart cart)
    {
        var items = mapper.Map<List<CartItemDto>>(cart.Items.ToList());
        var subtotal = items.Sum(i => i.LineTotal);
        return new CartDto
        {
            CartIdentifier = cart.CartIdentifier,
            Items = items,
            Subtotal = subtotal,
            Total = subtotal,
            TotalQuantity = items.Sum(i => i.Quantity)
        };
    }

    private async Task<decimal> EffectiveUnitPriceAsync(Product product, CancellationToken cancellationToken)
    {
        var flat = await categories.GetAllNonDeletedFlatAsync(cancellationToken);
        var dict = flat.ToDictionary(c => c.Id);
        return SalePricing.GetEffectiveUnitPrice(product, dict, DateTime.UtcNow);
    }
}
