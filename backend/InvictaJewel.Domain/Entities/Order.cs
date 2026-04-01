using InvictaJewel.Domain.Common;

namespace InvictaJewel.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    public decimal OrderTotal { get; set; }
    public string OrderStatus { get; set; } = OrderStatuses.Pending;
    public string PaymentMethod { get; set; } = "COD";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
