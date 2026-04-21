using InvictaJewel.Application.DTOs;

namespace InvictaJewel.Application.Services;

public interface IOrderService
{
    Task<OrderDetailDto> CreateFromCartAsync(CreateOrderDto dto, CancellationToken cancellationToken = default);
    Task<OrderDetailDto?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<PagedResultDto<OrderDetailDto>> GetAllAsync(int page, int pageSize, bool incompleteOnly = false, CancellationToken cancellationToken = default);
    Task<int> GetIncompleteCountAsync(CancellationToken cancellationToken = default);
    Task<bool> UpdateStatusAsync(int orderId, string status, CancellationToken cancellationToken = default);
}
