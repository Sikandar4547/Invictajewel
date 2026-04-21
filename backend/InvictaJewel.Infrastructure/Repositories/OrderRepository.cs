using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Domain.Common;
using InvictaJewel.Domain.Entities;
using InvictaJewel.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InvictaJewel.Infrastructure.Repositories;

public class OrderRepository(ApplicationDbContext db) : IOrderRepository
{
    public Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default) =>
        db.Orders
            .AsSplitQuery()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, cancellationToken);

    public Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        db.Orders
            .AsSplitQuery()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

    public async Task<(IReadOnlyList<Order> Items, int Total)> GetAllPagedAsync(int page, int pageSize, bool incompleteOnly = false, CancellationToken cancellationToken = default)
    {
        var query = db.Orders.AsNoTracking();
        if (incompleteOnly)
        {
            query = query.Where(o => o.OrderStatus != OrderStatuses.Delivered && o.OrderStatus != OrderStatuses.Cancelled);
        }
        query = query.OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(cancellationToken);
        var size = Math.Clamp(pageSize, 1, 100);
        var p = Math.Max(page, 1);
        var items = await query
            .Skip((p - 1) * size)
            .Take(size)
            .Include(o => o.Items)
            .ToListAsync(cancellationToken);
        return (items, total);
    }

    public Task<int> GetIncompleteCountAsync(CancellationToken cancellationToken = default) =>
        db.Orders.AsNoTracking()
            .CountAsync(o => o.OrderStatus != OrderStatuses.Delivered && o.OrderStatus != OrderStatuses.Cancelled, cancellationToken);

    public Task AddAsync(Order order, CancellationToken cancellationToken = default) =>
        db.Orders.AddAsync(order, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
