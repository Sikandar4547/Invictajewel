using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Domain.Entities;
using InvictaJewel.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InvictaJewel.Infrastructure.Repositories;

public class BannerRepository(ApplicationDbContext db) : IBannerRepository
{
    public async Task<IReadOnlyList<Banner>> GetActiveAsync(CancellationToken cancellationToken = default) =>
        await db.Banners.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.DisplayOrder)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Banner>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await db.Banners.AsNoTracking()
            .OrderBy(x => x.DisplayOrder)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<Banner?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await db.Banners.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task AddAsync(Banner banner, CancellationToken cancellationToken = default) =>
        await db.Banners.AddAsync(banner, cancellationToken);

    public void Update(Banner banner) => db.Banners.Update(banner);

    public void Remove(Banner banner) => db.Banners.Remove(banner);

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        await db.SaveChangesAsync(cancellationToken);
}
