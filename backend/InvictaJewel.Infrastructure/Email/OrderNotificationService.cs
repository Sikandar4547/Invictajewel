using InvictaJewel.Application.Abstractions.Messaging;
using InvictaJewel.Application.Services;
using InvictaJewel.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text;

namespace InvictaJewel.Infrastructure.Email;

public class OrderNotificationService(
    IEmailSender emailSender,
    IOptions<OrderNotificationOptions> options,
    ILogger<OrderNotificationService> logger) : IOrderNotificationService
{
    public async Task SendAdminShipmentReceiptAsync(Order order, CancellationToken cancellationToken = default)
    {
        var cfg = options.Value;
        if (string.IsNullOrWhiteSpace(cfg.AdminEmail))
        {
            logger.LogWarning("Order notification admin email is not configured. Skipping receipt for {Order}", order.OrderNumber);
            return;
        }

        var subject = $"New COD Order Received - {order.OrderNumber}";
        var html = BuildHtml(order, cfg.StoreName);
        await emailSender.SendHtmlAsync(cfg.AdminEmail, subject, html, cancellationToken);
    }

    private static string BuildHtml(Order order, string storeName)
    {
        var sb = new StringBuilder();
        foreach (var item in order.Items)
        {
            sb.Append($"""
<tr>
  <td style="padding:10px;border:1px solid #e5e7eb;">{WebUtility.HtmlEncode(item.ProductName)}</td>
  <td align="center" style="padding:10px;border:1px solid #e5e7eb;">{item.Quantity}</td>
  <td align="right" style="padding:10px;border:1px solid #e5e7eb;">{item.UnitPrice:N2}</td>
  <td align="right" style="padding:10px;border:1px solid #e5e7eb;">{item.TotalPrice:N2}</td>
</tr>
""");
        }

        var fullAddress = $"{order.ShippingAddress}, {order.City}{(string.IsNullOrWhiteSpace(order.PostalCode) ? string.Empty : $", {order.PostalCode}")}";
        return $"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="680" style="max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-collapse:collapse;">
          <tr>
            <td style="padding:24px;border-bottom:1px solid #e5e7eb;">
              <h1 style="margin:0;font-size:24px;color:#111827;">{WebUtility.HtmlEncode(storeName)}</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#4b5563;">New cash on delivery order for admin processing</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr><td style="padding:4px 0;font-size:14px;"><strong>Order Number:</strong> {WebUtility.HtmlEncode(order.OrderNumber)}</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;"><strong>Order Date:</strong> {order.CreatedAt:yyyy-MM-dd HH:mm} UTC</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;"><strong>Customer Name:</strong> {WebUtility.HtmlEncode(order.CustomerName)}</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;"><strong>Customer Email:</strong> {WebUtility.HtmlEncode(order.CustomerEmail)}</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;"><strong>Customer Phone:</strong> {WebUtility.HtmlEncode(order.CustomerPhone)}</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;"><strong>Shipping Address:</strong> {WebUtility.HtmlEncode(fullAddress)}</td></tr>
                <tr><td style="padding:4px 0;font-size:14px;"><strong>Payment Method:</strong> Cash on Delivery (COD)</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 20px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr style="background:#f9fafb;">
                  <th align="left" style="padding:10px;border:1px solid #e5e7eb;">Product</th>
                  <th align="center" style="padding:10px;border:1px solid #e5e7eb;">Qty</th>
                  <th align="right" style="padding:10px;border:1px solid #e5e7eb;">Price</th>
                  <th align="right" style="padding:10px;border:1px solid #e5e7eb;">Subtotal</th>
                </tr>
                {sb}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 20px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="right" style="font-size:18px;font-weight:700;color:#111827;border-top:2px solid #d1d5db;padding-top:12px;">
                    Total Amount: PKR {order.OrderTotal:N2}
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#374151;">
                <strong>Admin Action Required:</strong> This order is marked as <strong>Cash on Delivery</strong>. Please prepare shipment and dispatch to the address above.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
""";
    }
}
