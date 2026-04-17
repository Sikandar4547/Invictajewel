using AutoMapper;
using InvictaJewel.Application.Abstractions.Repositories;
using InvictaJewel.Application.Abstractions.Storage;
using InvictaJewel.Application.DTOs;
using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Services;

public class BannerService(IBannerRepository banners, IBannerImageStorage imageStorage, IMapper mapper) : IBannerService
{
    public async Task<IReadOnlyList<BannerDto>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var items = await banners.GetActiveAsync(cancellationToken);
        return mapper.Map<IReadOnlyList<BannerDto>>(items);
    }

    public async Task<IReadOnlyList<BannerDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await banners.GetAllAsync(cancellationToken);
        return mapper.Map<IReadOnlyList<BannerDto>>(items);
    }

    public async Task<BannerDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await banners.GetByIdAsync(id, cancellationToken);
        return item is null ? null : mapper.Map<BannerDto>(item);
    }

    public async Task<BannerDto> CreateAsync(SaveBannerDto dto, CancellationToken cancellationToken = default)
    {
        var entity = BuildEntity(dto);
        await banners.AddAsync(entity, cancellationToken);
        await banners.SaveChangesAsync(cancellationToken);
        return mapper.Map<BannerDto>(entity);
    }

    public async Task<BannerDto?> UpdateAsync(int id, SaveBannerDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await banners.GetByIdAsync(id, cancellationToken);
        if (entity is null) return null;
        entity.Title = dto.Title.Trim();
        entity.ImageUrl = dto.ImageUrl.Trim();
        entity.LinkUrl = dto.LinkUrl?.Trim();
        entity.IsActive = dto.IsActive;
        entity.DisplayOrder = dto.DisplayOrder;
        banners.Update(entity);
        await banners.SaveChangesAsync(cancellationToken);
        return mapper.Map<BannerDto>(entity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await banners.GetByIdAsync(id, cancellationToken);
        if (entity is null) return false;
        imageStorage.TryDeleteStoredFile(entity.ImageUrl);
        banners.Remove(entity);
        await banners.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<string> SaveUploadedImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default) =>
        await imageStorage.SaveBannerImageAsync(fileStream, fileName, cancellationToken);

    private static Banner BuildEntity(SaveBannerDto dto) => new()
    {
        Title = dto.Title.Trim(),
        ImageUrl = dto.ImageUrl.Trim(),
        LinkUrl = dto.LinkUrl?.Trim(),
        IsActive = dto.IsActive,
        DisplayOrder = dto.DisplayOrder,
        CreatedAt = DateTime.UtcNow
    };
}
