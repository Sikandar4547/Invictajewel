using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Domain.Entities;
using InvictaJewel.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InvictaJewel.Infrastructure.Repositories;

public class CartRepository(ApplicationDbContext db) : ICartRepository
{
    public Task<Cart?> GetByIdentifierAsync(Guid cartIdentifier, CancellationToken cancellationToken = default) =>
        db.Carts
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.CartIdentifier == cartIdentifier, cancellationToken);

    public Task AddAsync(Cart cart, CancellationToken cancellationToken = default) =>
        db.Carts.AddAsync(cart, cancellationToken).AsTask();

    public Task<CartItem?> GetCartItemAsync(int itemId, CancellationToken cancellationToken = default) =>
        db.CartItems
            .Include(i => i.Cart)
            .Include(i => i.Product).ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(i => i.Id == itemId, cancellationToken);

    public void RemoveItem(CartItem item) => db.CartItems.Remove(item);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
