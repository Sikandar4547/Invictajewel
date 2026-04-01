using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Abstractions.Repositories;

public interface IOrderRepository
{
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Order> Items, int Total)> GetAllPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
