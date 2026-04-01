using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Abstractions.Repositories;

public interface ICartRepository
{
    Task<Cart?> GetByIdentifierAsync(Guid cartIdentifier, CancellationToken cancellationToken = default);
    Task AddAsync(Cart cart, CancellationToken cancellationToken = default);
    Task<CartItem?> GetCartItemAsync(int itemId, CancellationToken cancellationToken = default);
    void RemoveItem(CartItem item);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
