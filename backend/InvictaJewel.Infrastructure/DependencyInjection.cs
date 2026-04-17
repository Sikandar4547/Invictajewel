using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Application.Abstractions.Messaging;
using InvictaJewel.Application.Abstractions.Storage;
using InvictaJewel.Application.Services;
using InvictaJewel.Infrastructure.Email;
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
        services.AddScoped<IBannerRepository, BannerRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        var productUploads = Path.Combine(webRootPath, "uploads", "products");
        var bannerUploads = Path.Combine(webRootPath, "uploads", "banners");
        services.AddSingleton<IProductImageStorage>(_ => new LocalProductImageStorage(productUploads));
        services.AddSingleton<IBannerImageStorage>(_ => new LocalBannerImageStorage(bannerUploads));

        services.AddOptions<SmtpEmailOptions>().Bind(configuration.GetSection(SmtpEmailOptions.SectionName));
        services.AddOptions<OrderNotificationOptions>().Bind(configuration.GetSection(OrderNotificationOptions.SectionName));
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IOrderNotificationService, OrderNotificationService>();

        return services;
    }
}
