namespace InvictaJewel.Domain.Entities;

public class Category : ISoftDeletable
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
    public Category? Parent { get; set; }
    public ICollection<Category> Children { get; set; } = new List<Category>();
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? Metadata { get; set; }
    /// <summary>Percentage discount off regular price for products in this category (and ancestors apply per product path). Null or 0 = no category sale.</summary>
    public decimal? SaleDiscountPercent { get; set; }
    public DateTime? SaleStartUtc { get; set; }
    public DateTime? SaleEndUtc { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
}
