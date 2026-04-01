using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Abstractions.Repositories;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetActiveCategoriesFlatAsync(CancellationToken cancellationToken = default);
    Task<Category?> GetByIdAsync(int id, bool includeDeleted, CancellationToken cancellationToken = default);
    Task<Category?> GetBySlugAsync(string slug, bool includeDeleted, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> GetDescendantCategoryIdsAsync(int categoryId, CancellationToken cancellationToken = default);
    Task AddAsync(Category category, CancellationToken cancellationToken = default);
    void Update(Category category);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
