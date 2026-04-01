namespace InvictaJewel.Application.DTOs;

public class ProductImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
    public string? AltText { get; set; }
}

public class ProductListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal RegularPrice { get; set; }
    public decimal? SalePrice { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsNew { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public bool IsActive { get; set; }
    public bool IsOnSale => SalePrice.HasValue && SalePrice < RegularPrice;
}

public class ProductDetailDto : ProductListDto
{
    public string? Description { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<CategorySummaryDto> Categories { get; set; } = new();
}

public class CategorySummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
}

public class PagedResultDto<T>
{
    public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal RegularPrice { get; set; }
    public decimal? SalePrice { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public bool IsNew { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public List<int> CategoryIds { get; set; } = new();
    public int? PrimaryCategoryId { get; set; }
}

public class UpdateProductDto : CreateProductDto
{
}

public class SetSaleDto
{
    public decimal SalePrice { get; set; }
}

public class UploadProductImageResultDto
{
    public string ImageUrl { get; set; } = string.Empty;
}
