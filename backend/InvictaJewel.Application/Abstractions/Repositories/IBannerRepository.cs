using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Abstractions.Repositories;

public interface IBannerRepository
{
    Task<IReadOnlyList<Banner>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Banner>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Banner?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Banner banner, CancellationToken cancellationToken = default);
    void Update(Banner banner);
    void Remove(Banner banner);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
