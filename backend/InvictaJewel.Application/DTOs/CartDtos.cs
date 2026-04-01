namespace InvictaJewel.Application.DTOs;

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal => UnitPrice * Quantity;
}

public class CartDto
{
    public Guid CartIdentifier { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
    public int TotalQuantity { get; set; }
}

public class AddCartItemDto
{
    public Guid CartIdentifier { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemDto
{
    public int Quantity { get; set; }
}

public class CreateCartResultDto
{
    public Guid CartIdentifier { get; set; }
}
