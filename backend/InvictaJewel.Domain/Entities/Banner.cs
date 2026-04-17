namespace InvictaJewel.Domain.Entities;

public class Banner
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    /// <summary>Relative path under web root, e.g. <c>uploads/banners/banner1.jpg</c>.</summary>
    public string ImageUrl { get; set; } = string.Empty;
    /// <summary>Target when the banner is clicked (absolute URL or site-relative path e.g. <c>/category/rings</c>). Optional.</summary>
    public string? LinkUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

