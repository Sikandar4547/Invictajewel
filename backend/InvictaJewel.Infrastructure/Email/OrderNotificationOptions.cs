namespace InvictaJewel.Infrastructure.Email;

public class OrderNotificationOptions
{
    public const string SectionName = "OrderNotification";
    public string StoreName { get; set; } = "Invicta Jewel";
    public string AdminEmail { get; set; } = string.Empty;
}
