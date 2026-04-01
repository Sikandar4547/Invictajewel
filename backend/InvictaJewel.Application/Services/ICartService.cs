using InvictaJewel.Application.DTOs;

namespace InvictaJewel.Application.Services;

public interface ICartService
{
    Task<CartDto?> GetCartAsync(Guid cartIdentifier, CancellationToken cancellationToken = default);
    Task<CreateCartResultDto> CreateCartAsync(CancellationToken cancellationToken = default);
    Task<CartDto> AddItemAsync(AddCartItemDto dto, CancellationToken cancellationToken = default);
    Task<CartDto?> UpdateItemAsync(int itemId, UpdateCartItemDto dto, CancellationToken cancellationToken = default);
    Task<CartDto?> RemoveItemAsync(int itemId, CancellationToken cancellationToken = default);
    Task<bool> ClearCartAsync(Guid cartIdentifier, CancellationToken cancellationToken = default);
    Task<CartDto?> GetSummaryAsync(Guid cartIdentifier, CancellationToken cancellationToken = default);
}
