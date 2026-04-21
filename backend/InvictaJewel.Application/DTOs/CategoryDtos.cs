using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InvictaJewel.Application.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public int? ParentCategoryId { get; set; }
    /// <summary>Percentage off regular price for products in this category (and ancestors when resolving pricing).</summary>
    public decimal? SaleDiscountPercent { get; set; }
    public DateTime? SaleStartUtc { get; set; }
    public DateTime? SaleEndUtc { get; set; }
    public List<CategoryDto> Children { get; set; } = new();
    public int? ProductCount { get; set; }
    public List<ProductListDto>? Products { get; set; }
}

public class CreateCategoryDto : IValidatableObject
{
    [Required(ErrorMessage = "Name is required.")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Slug is required.")]
    [MaxLength(200)]
    [RegularExpression(@"^[a-z0-9][a-z0-9-]*$", ErrorMessage = "Slug must be lowercase letters, numbers, and hyphens only.")]
    public string Slug { get; set; } = string.Empty;

    public int? ParentCategoryId { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }

    public string? ImageUrl { get; set; }
    public string? Metadata { get; set; }

    [Range(typeof(decimal), "0", "100")]
    public decimal? SaleDiscountPercent { get; set; }

    public DateTime? SaleStartUtc { get; set; }
    public DateTime? SaleEndUtc { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (ParentCategoryId is { } pid && pid <= 0)
            yield return new ValidationResult("Parent category is invalid.", new[] { nameof(ParentCategoryId) });
        if (SaleStartUtc.HasValue && SaleEndUtc.HasValue && SaleEndUtc.Value < SaleStartUtc.Value)
            yield return new ValidationResult("Sale end must be on or after sale start.", new[] { nameof(SaleEndUtc), nameof(SaleStartUtc) });
    }
}

public class UpdateCategoryDto : CreateCategoryDto
{
}

