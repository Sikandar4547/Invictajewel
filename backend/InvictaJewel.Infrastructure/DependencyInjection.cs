using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Application.Abstractions.Storage;
using InvictaJewel.Infrastructure.Persistence;
using InvictaJewel.Infrastructure.Repositories;
using InvictaJewel.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InvictaJewel.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration, string webRootPath)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        var migrationsAssembly = typeof(ApplicationDbContext).Assembly.GetName().Name!;
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString, sql => sql.MigrationsAssembly(migrationsAssembly)));

        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        var uploads = Path.Combine(webRootPath, "uploads", "products");
        services.AddSingleton<IProductImageStorage>(_ => new LocalProductImageStorage(uploads));

        return services;
    }
}
