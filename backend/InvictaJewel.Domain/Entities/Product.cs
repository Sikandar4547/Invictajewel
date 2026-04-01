namespace InvictaJewel.Domain.Entities;

public class Product : ISoftDeletable
{
    public int Id { get; set; }
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
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}
