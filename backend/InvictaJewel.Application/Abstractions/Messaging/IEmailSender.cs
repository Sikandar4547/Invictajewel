namespace InvictaJewel.Application.Abstractions.Messaging;

public interface IEmailSender
{
    Task SendHtmlAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default);
}
