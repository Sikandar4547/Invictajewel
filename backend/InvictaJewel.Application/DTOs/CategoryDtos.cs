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
    public List<CategoryDto> Children { get; set; } = new();
    public int? ProductCount { get; set; }
    public List<ProductListDto>? Products { get; set; }
}

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public string? ImageUrl { get; set; }
    public string? Metadata { get; set; }
}

public class UpdateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public string? ImageUrl { get; set; }
    public string? Metadata { get; set; }
}

public class ApplyCategorySaleDto
{
    public decimal SalePrice { get; set; }
}
