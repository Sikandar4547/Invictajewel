using InvictaJewel.Application.Abstractions.Messaging;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace InvictaJewel.Infrastructure.Email;

public class SmtpEmailSender(IOptions<SmtpEmailOptions> options, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendHtmlAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var cfg = options.Value;
        if (string.IsNullOrWhiteSpace(cfg.Host) || string.IsNullOrWhiteSpace(cfg.FromEmail))
        {
            logger.LogWarning("SMTP email not configured. Skipping email to {To}", to);
            return;
        }

        using var msg = new MailMessage
        {
            From = new MailAddress(cfg.FromEmail, cfg.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        msg.To.Add(to);

        using var client = new SmtpClient(cfg.Host, cfg.Port)
        {
            EnableSsl = cfg.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network
        };
        if (!string.IsNullOrWhiteSpace(cfg.Username))
        {
            client.Credentials = new NetworkCredential(cfg.Username, cfg.Password);
        }

        cancellationToken.ThrowIfCancellationRequested();
        await client.SendMailAsync(msg);
    }
}
