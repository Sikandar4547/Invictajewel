namespace InvictaJewel.Domain.Entities;

public class Cart
{
    public int Id { get; set; }
    public Guid CartIdentifier { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
