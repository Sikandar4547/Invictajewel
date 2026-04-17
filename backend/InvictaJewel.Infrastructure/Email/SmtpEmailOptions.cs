namespace InvictaJewel.Infrastructure.Email;

public class SmtpEmailOptions
{
    public const string SectionName = "SmtpEmail";
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Invicta Jewel";
}
