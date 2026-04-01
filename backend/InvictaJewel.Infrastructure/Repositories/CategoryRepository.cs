using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Domain.Entities;
using InvictaJewel.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InvictaJewel.Infrastructure.Repositories;

public class CategoryRepository(ApplicationDbContext db) : ICategoryRepository
{
    public async Task<IReadOnlyList<Category>> GetActiveCategoriesFlatAsync(CancellationToken cancellationToken = default) =>
        await db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive && !c.IsDeleted)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(cancellationToken);

    public async Task<Category?> GetByIdAsync(int id, bool includeDeleted, CancellationToken cancellationToken = default)
    {
        var query = db.Categories.AsQueryable();
        if (!includeDeleted)
            query = query.Where(c => !c.IsDeleted);
        return await query.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Category?> GetBySlugAsync(string slug, bool includeDeleted, CancellationToken cancellationToken = default)
    {
        var query = db.Categories.AsQueryable();
        if (!includeDeleted)
            query = query.Where(c => !c.IsDeleted);
        return await query.FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
    }

    public async Task<IReadOnlyList<int>> GetDescendantCategoryIdsAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        var rows = await db.Categories
            .AsNoTracking()
            .Where(c => !c.IsDeleted)
            .Select(c => new { c.Id, c.ParentCategoryId })
            .ToListAsync(cancellationToken);

        var childrenByParent = rows
            .Where(r => r.ParentCategoryId != null)
            .GroupBy(r => r.ParentCategoryId!.Value)
            .ToDictionary(g => g.Key, g => g.Select(x => x.Id).ToList());

        var result = new List<int>();
        var queue = new Queue<int>();
        queue.Enqueue(categoryId);
        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            if (!childrenByParent.TryGetValue(current, out var kids))
                continue;
            foreach (var kid in kids)
            {
                result.Add(kid);
                queue.Enqueue(kid);
            }
        }

        return result;
    }

    public Task AddAsync(Category category, CancellationToken cancellationToken = default) =>
        db.Categories.AddAsync(category, cancellationToken).AsTask();

    public void Update(Category category) => db.Categories.Update(category);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
