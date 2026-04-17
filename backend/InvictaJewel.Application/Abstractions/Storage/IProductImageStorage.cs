namespace InvictaJewel.Application.Abstractions.Storage;

public interface IProductImageStorage
{
    Task<string> SaveProductImageAsync(Stream content, string originalFileName, int productId, CancellationToken cancellationToken = default);

    /// <summary>Deletes a file previously stored under this storage root when the URL matches <c>/uploads/products/...</c>.</summary>
    void TryDeleteStoredFile(string? relativeUrl);
}
