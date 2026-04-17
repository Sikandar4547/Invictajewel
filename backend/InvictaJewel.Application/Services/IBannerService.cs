using InvictaJewel.Application.DTOs;

namespace InvictaJewel.Application.Services;

public interface IBannerService
{
    Task<IReadOnlyList<BannerDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BannerDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<BannerDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<BannerDto> CreateAsync(SaveBannerDto dto, CancellationToken cancellationToken = default);
    Task<BannerDto?> UpdateAsync(int id, SaveBannerDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<string> SaveUploadedImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);
}
