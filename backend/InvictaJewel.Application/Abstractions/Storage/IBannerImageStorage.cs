namespace InvictaJewel.Application.Abstractions.Storage;

public interface IBannerImageStorage
{
    Task<string> SaveBannerImageAsync(Stream content, string originalFileName, CancellationToken cancellationToken = default);
    void TryDeleteStoredFile(string? relativeUrl);
}
