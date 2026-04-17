using Microsoft.EntityFrameworkCore;

namespace InvictaJewel.Infrastructure.Persistence;

/// <summary>
/// Applies EF Core migrations only. Data is managed through Admin API CRUD.
/// </summary>
public static class DbInitializer
{
    public static async Task MigrateAsync(ApplicationDbContext db, CancellationToken cancellationToken = default) =>
        await db.Database.MigrateAsync(cancellationToken);
}
