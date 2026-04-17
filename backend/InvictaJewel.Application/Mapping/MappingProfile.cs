using AutoMapper;
using InvictaJewel.Application.DTOs;
using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Category, CategoryDto>();
        CreateMap<Category, CategorySummaryDto>();
        CreateMap<Banner, BannerDto>();
        CreateMap<ProductImage, ProductImageDto>();
        CreateMap<Product, ProductListDto>()
            .ForMember(d => d.PrimaryImageUrl, o => o.MapFrom(s =>
                s.Images
                    .OrderByDescending(i => i.IsPrimary)
                    .ThenBy(i => i.DisplayOrder)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()))
            .ForMember(d => d.ImageUrl, o => o.MapFrom(s =>
                s.Images
                    .OrderByDescending(i => i.IsPrimary)
                    .ThenBy(i => i.DisplayOrder)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()));
        CreateMap<Product, ProductDetailDto>()
            .IncludeBase<Product, ProductListDto>()
            .ForMember(d => d.PrimaryCategoryId, o => o.MapFrom((Product s) => ResolvePrimaryCategoryId(s)))
            .ForMember(d => d.Categories, o => o.MapFrom(s =>
                s.ProductCategories
                    .OrderBy(pc => pc.DisplayOrder)
                    .Select(pc => pc.Category)));
        CreateMap<Order, OrderDetailDto>();
        CreateMap<OrderItem, OrderItemDto>();
        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name))
            .ForMember(d => d.ImageUrl, o => o.MapFrom(s => s.Product.Images
                .OrderByDescending(i => i.IsPrimary)
                .ThenBy(i => i.DisplayOrder)
                .Select(i => i.ImageUrl)
                .FirstOrDefault()));
    }

    private static int? ResolvePrimaryCategoryId(Product s)
    {
        var ordered = s.ProductCategories.OrderBy(pc => pc.DisplayOrder).ToList();
        var primary = ordered.FirstOrDefault(pc => pc.IsPrimary);
        if (primary != null)
            return primary.CategoryId;
        var any = ordered.FirstOrDefault();
        return any != null ? any.CategoryId : null;
    }
}
