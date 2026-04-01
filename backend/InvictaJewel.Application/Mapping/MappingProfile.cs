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
        CreateMap<ProductImage, ProductImageDto>();
        CreateMap<Product, ProductListDto>()
            .ForMember(d => d.PrimaryImageUrl, o => o.MapFrom(s =>
                s.Images
                    .OrderByDescending(i => i.IsPrimary)
                    .ThenBy(i => i.DisplayOrder)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()));
        CreateMap<Product, ProductDetailDto>()
            .IncludeBase<Product, ProductListDto>()
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
}
