using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

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
    public string SKU { get; set; } = string.Empty;
    public decimal RegularPrice { get; set; }
    public decimal? SalePrice { get; set; }
    public DateTime? SaleStartUtc { get; set; }
    public DateTime? SaleEndUtc { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsNew { get; set; }
    public string? PrimaryImageUrl { get; set; }
    /// <summary>Same as primary image URL (admin / API convenience).</summary>
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public bool IsOnSale => SalePrice.HasValue && SalePrice < RegularPrice;
}

public class ProductDetailDto : ProductListDto
{
    public string? Description { get; set; }
    public int? PrimaryCategoryId { get; set; }
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

public class CreateProductDto : IValidatableObject
{
    [Required(ErrorMessage = "Name is required.")]
    [MaxLength(500)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Slug is required.")]
    [MaxLength(500)]
    public string Slug { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Range(typeof(decimal), "0", "999999999999")]
    public decimal RegularPrice { get; set; }

    public decimal? SalePrice { get; set; }
    public DateTime? SaleStartUtc { get; set; }
    public DateTime? SaleEndUtc { get; set; }

    [Required(ErrorMessage = "SKU is required.")]
    [MaxLength(100)]
    public string SKU { get; set; } = string.Empty;

    public int StockQuantity { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public bool IsNew { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }

    /// <summary>Convenience: assign to a single category (ignored if <see cref="CategoryIds"/> is non-empty).</summary>
    public int? CategoryId { get; set; }

    public List<int> CategoryIds { get; set; } = new();

    public int? PrimaryCategoryId { get; set; }

    [MaxLength(1000)]
    public string? ImageUrl { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var ids = CategoryIds?.Where(x => x > 0).Distinct().ToList() ?? new List<int>();
        if (ids.Count == 0 && (!CategoryId.HasValue || CategoryId.Value <= 0))
            yield return new ValidationResult("A category is required.", new[] { nameof(CategoryIds), nameof(CategoryId) });

        if (RegularPrice < 0)
            yield return new ValidationResult("Regular price must be a non-negative number.", new[] { nameof(RegularPrice) });
        if (SalePrice.HasValue && SalePrice.Value < 0)
            yield return new ValidationResult("Sale price must be a non-negative number.", new[] { nameof(SalePrice) });
        if (SalePrice.HasValue && SalePrice.Value > RegularPrice)
            yield return new ValidationResult("Sale price must be less than or equal to regular price.", new[] { nameof(SalePrice) });
        if (SaleStartUtc.HasValue && SaleEndUtc.HasValue && SaleEndUtc.Value < SaleStartUtc.Value)
            yield return new ValidationResult("Sale end must be on or after sale start.", new[] { nameof(SaleEndUtc), nameof(SaleStartUtc) });
    }
}

public class UpdateProductDto : CreateProductDto
{
}

public class SetSaleDto
{
    [Range(typeof(decimal), "0", "999999999999")]
    public decimal SalePrice { get; set; }

    public DateTime? SaleStartUtc { get; set; }
    public DateTime? SaleEndUtc { get; set; }
}

public class UploadProductImageResultDto
{
    public string ImageUrl { get; set; } = string.Empty;
}
