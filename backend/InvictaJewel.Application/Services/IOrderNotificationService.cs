using InvictaJewel.Domain.Entities;

namespace InvictaJewel.Application.Services;

public interface IOrderNotificationService
{
    Task SendAdminShipmentReceiptAsync(Order order, CancellationToken cancellationToken = default);
}
