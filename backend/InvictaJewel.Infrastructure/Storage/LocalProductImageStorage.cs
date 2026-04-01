using InvictaJewel.Application.Abstractions.Storage;

namespace InvictaJewel.Infrastructure.Storage;

public class LocalProductImageStorage(string rootDirectory) : IProductImageStorage
{
    public async Task<string> SaveProductImageAsync(Stream content, string originalFileName, int productId, CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(rootDirectory);
        var ext = Path.GetExtension(originalFileName);
        if (string.IsNullOrWhiteSpace(ext) || ext.Length > 10)
            ext = ".webp";
        var file = $"product-{productId}-{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(rootDirectory, file);
        await using var fs = File.Create(fullPath);
        await content.CopyToAsync(fs, cancellationToken);
        var relative = $"/uploads/products/{file}".Replace('\\', '/');
        return relative;
    }
}
