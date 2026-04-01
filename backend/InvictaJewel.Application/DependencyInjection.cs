using InvictaJewel.Application.Mapping;
using InvictaJewel.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace InvictaJewel.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        return services;
    }
}
