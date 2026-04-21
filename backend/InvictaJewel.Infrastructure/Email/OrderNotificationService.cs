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
        var html = BuildHtml(order, cfg.StoreName, cfg.ApiBaseUrl);
        await emailSender.SendHtmlAsync(cfg.AdminEmail, subject, html, cancellationToken);
    }

    private static string BuildHtml(Order order, string storeName, string apiBaseUrl)
    {
        var sb = new StringBuilder();
        foreach (var item in order.Items)
        {
            var imageHtml = item.Product?.Images?.FirstOrDefault()?.ImageUrl is string relativePath
                ? $"""<img src="{WebUtility.HtmlEncode($"{apiBaseUrl}{relativePath}")}" alt="{WebUtility.HtmlEncode(item.ProductName)}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;display:block;" />"""
                : """<div style="width:60px;height:60px;background:#f1f5f9;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#94a3b8;">No Image</div>""";

            sb.Append($"""
<tr>
  <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;">
    {imageHtml}
  </td>
  <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">{WebUtility.HtmlEncode(item.ProductName)}</td>
  <td align="center" style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">x{item.Quantity}</td>
  <td align="right" style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">Rs{item.UnitPrice:N0}</td>
  <td align="right" style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;font-weight:600;">Rs{item.TotalPrice:N0}</td>
</tr>
""");
        }

        var fullAddress = $"{order.ShippingAddress}, {order.City}{(string.IsNullOrWhiteSpace(order.PostalCode) ? string.Empty : $", {order.PostalCode}")}";
        return $"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1e293b;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.1);border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 24px;background:linear-gradient(135deg, #8b5a3c 0%, #a0644e 100%);color:#ffffff;">
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;letter-spacing:-0.5px;">New Order</h1>
              <p style="margin:0;font-size:14px;opacity:0.9;">Order #{WebUtility.HtmlEncode(order.OrderNumber)}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:24px 24px 0;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;">
                You've received a new order from <strong>{WebUtility.HtmlEncode(order.CustomerName)}</strong>
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;">
                <tr>
                  <td style="width:50%;padding-right:12px;">
                    <div style="background:#f1f5f9;padding:12px;border-radius:6px;font-size:13px;">
                      <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Order Date</p>
                      <p style="margin:0;color:#1e293b;font-weight:600;">{order.CreatedAt:MMMM dd, yyyy}</p>
                      <p style="margin:4px 0 0;color:#64748b;font-size:12px;">{order.CreatedAt:hh:mm tt} UTC</p>
                    </div>
                  </td>
                  <td style="width:50%;padding-left:12px;">
                    <div style="background:#ecfdf5;padding:12px;border-radius:6px;font-size:13px;border-left:3px solid #10b981;">
                      <p style="margin:0 0 4px;color:#047857;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Payment Method</p>
                      <p style="margin:0;color:#047857;font-weight:600;">💰 Cash on Delivery</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Summary Section -->
          <tr>
            <td style="padding:24px;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e293b;">Order Summary</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
                <tr style="background:#f8fafc;">
                  <th align="center" style="padding:12px 8px;font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;width:70px;">Image</th>
                  <th align="left" style="padding:12px 8px;font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Product</th>
                  <th align="center" style="padding:12px 8px;font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Qty</th>
                  <th align="right" style="padding:12px 8px;font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Price</th>
                  <th align="right" style="padding:12px 8px;font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Total</th>
                </tr>
                {sb}
              </table>

              <!-- Totals -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;">
                <tr>
                  <td align="right" style="padding:8px 0;font-size:14px;color:#64748b;">Subtotal:</td>
                  <td align="right" style="padding:8px 0;font-size:14px;color:#64748b;width:120px;">Rs{order.OrderTotal:N0}</td>
                </tr>
                <tr>
                  <td align="right" style="padding:8px 0;font-size:14px;color:#64748b;">Shipping:</td>
                  <td align="right" style="padding:8px 0;font-size:14px;color:#64748b;width:120px;">TBD</td>
                </tr>
                <tr style="border-top:2px solid #e2e8f0;">
                  <td align="right" style="padding:12px 0;font-size:18px;font-weight:700;color:#0f172a;">Total:</td>
                  <td align="right" style="padding:12px 0;font-size:20px;font-weight:700;color:#8b5a3c;width:120px;">Rs{order.OrderTotal:N0}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer & Shipping Info -->
          <tr>
            <td style="padding:24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="width:50%;padding-right:12px;vertical-align:top;">
                    <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1e293b;">Billing Address</h3>
                    <p style="margin:0 0 4px;font-size:14px;color:#475569;">{WebUtility.HtmlEncode(order.CustomerName)}</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#475569;">{WebUtility.HtmlEncode(fullAddress)}</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#475569;"><strong>Phone:</strong> {WebUtility.HtmlEncode(order.CustomerPhone)}</p>
                    <p style="margin:0;font-size:14px;color:#475569;"><strong>Email:</strong> {WebUtility.HtmlEncode(order.CustomerEmail)}</p>
                  </td>
                  <td style="width:50%;padding-left:12px;vertical-align:top;">
                    <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1e293b;">Shipping Address</h3>
                    <p style="margin:0 0 4px;font-size:14px;color:#475569;">{WebUtility.HtmlEncode(order.CustomerName)}</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#475569;">{WebUtility.HtmlEncode(fullAddress)}</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#475569;"><strong>Phone:</strong> {WebUtility.HtmlEncode(order.CustomerPhone)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notes -->
          {(string.IsNullOrWhiteSpace(order.Notes) ? string.Empty : $"""
<tr>
  <td style="padding:24px;border-top:1px solid #e2e8f0;">
    <h3 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1e293b;">Customer Notes</h3>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">{WebUtility.HtmlEncode(order.Notes)}</p>
  </td>
</tr>
""")}

          <!-- Action Required -->
          <tr>
            <td style="padding:24px;background:#fef3c7;border-top:1px solid #fcd34d;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="font-size:14px;color:#92400e;">
                    <p style="margin:0 0 8px;font-weight:700;">⚠️ Action Required</p>
                    <p style="margin:0;line-height:1.6;">Please prepare this order for shipment. Contact the customer if you need any clarification.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;background:#1e293b;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Invicta Jewel Admin System • New Order Notification
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#64748b;">
                This is an automated notification. Please do not reply to this email.
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
