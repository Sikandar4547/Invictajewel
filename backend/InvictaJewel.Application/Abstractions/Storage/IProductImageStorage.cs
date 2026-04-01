namespace InvictaJewel.Application.Abstractions.Storage;

public interface IProductImageStorage
{
    Task<string> SaveProductImageAsync(Stream content, string originalFileName, int productId, CancellationToken cancellationToken = default);
}
