namespace InvictaJewel.Domain.Entities;

public class ProductCategory
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
}
