using InvictaJewel.Application.Abstractions.Storage;

namespace InvictaJewel.Infrastructure.Storage;

public class LocalProductImageStorage(string productsUploadDirectory) : IProductImageStorage
{
    public async Task<string> SaveProductImageAsync(Stream content, string originalFileName, int productId, CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(productsUploadDirectory);
        var ext = Path.GetExtension(originalFileName);
        if (string.IsNullOrWhiteSpace(ext) || ext.Length > 10)
            ext = ".webp";
        var file = $"product-{productId}-{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(productsUploadDirectory, file);
        await using var fs = File.Create(fullPath);
        await content.CopyToAsync(fs, cancellationToken);
        var relative = $"/uploads/products/{file}".Replace('\\', '/');
        return relative;
    }

    public void TryDeleteStoredFile(string? relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl))
            return;
        var normalized = relativeUrl.Replace('\\', '/');
        if (!normalized.StartsWith("/uploads/products/", StringComparison.OrdinalIgnoreCase))
            return;
        var fileName = Path.GetFileName(normalized);
        if (string.IsNullOrEmpty(fileName))
            return;
        var fullPath = Path.Combine(productsUploadDirectory, fileName);
        try
        {
            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }
        catch
        {
            // best-effort cleanup
        }
    }
}
