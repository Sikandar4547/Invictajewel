using InvictaJewel.Application.Abstractions.Storage;

namespace InvictaJewel.Infrastructure.Storage;

public class LocalBannerImageStorage(string bannersUploadDirectory) : IBannerImageStorage
{
    public async Task<string> SaveBannerImageAsync(Stream content, string originalFileName, CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(bannersUploadDirectory);
        var ext = Path.GetExtension(originalFileName);
        if (string.IsNullOrWhiteSpace(ext) || ext.Length > 10)
            ext = ".webp";
        var file = $"banner-{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(bannersUploadDirectory, file);
        await using var fs = File.Create(fullPath);
        await content.CopyToAsync(fs, cancellationToken);
        return $"/uploads/banners/{file}".Replace('\\', '/');
    }

    public void TryDeleteStoredFile(string? relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl)) return;
        var normalized = relativeUrl.Replace('\\', '/');
        if (!normalized.StartsWith("/uploads/banners/", StringComparison.OrdinalIgnoreCase)) return;
        var fileName = Path.GetFileName(normalized);
        if (string.IsNullOrWhiteSpace(fileName)) return;
        var fullPath = Path.Combine(bannersUploadDirectory, fileName);
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
