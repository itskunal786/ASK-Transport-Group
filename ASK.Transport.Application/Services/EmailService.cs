using System.Net;
using System.Net.Mail;

namespace ASK.Group.Api.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string body,
        bool isHtml = true)
    {
        var host = _configuration["Smtp:Host"];
        var portText = _configuration["Smtp:Port"];
        var username = _configuration["Smtp:Username"];
        var password = _configuration["Smtp:Password"];
        var fromEmail = _configuration["Smtp:From"];
        var enableSslText = _configuration["Smtp:EnableSsl"];

        if (string.IsNullOrWhiteSpace(host))
        {
            throw new Exception("SMTP Host is missing.");
        }

        if (string.IsNullOrWhiteSpace(portText))
        {
            throw new Exception("SMTP Port is missing.");
        }

        if (string.IsNullOrWhiteSpace(fromEmail))
        {
            throw new Exception("SMTP From email is missing.");
        }

        var port = int.Parse(portText);

        var enableSsl =
            bool.TryParse(enableSslText, out var ssl)
                ? ssl
                : true;

        using var client = new SmtpClient(host, port);

        client.EnableSsl = enableSsl;

        if (!string.IsNullOrWhiteSpace(username))
        {
            client.Credentials =
                new NetworkCredential(
                    username,
                    password);
        }

        using var message = new MailMessage();

        message.From = new MailAddress(fromEmail);

        message.To.Add(toEmail);

        message.Subject = subject;

        message.Body = body;

        message.IsBodyHtml = isHtml;

        await client.SendMailAsync(message);
    }

    public async Task SendHtmlEmailAsync(
    string toEmail,
    string subject,
    string htmlBody)
    {
        await SendEmailAsync(
            toEmail,
            subject,
            htmlBody);
    }

    public async Task SendOtpEmailAsync(
        string toEmail,
        string name,
        string otp)
    {
        var subject = "ASK GROUP OTP Verification";

        var body = $"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>ASK GROUP</h2>

            <p>Hello {name},</p>

            <p>Your OTP for account verification is:</p>

            <h1>{otp}</h1>

            <p>This OTP is valid for 10 minutes.</p>

            <p>Please do not share this OTP with anyone.</p>

            <br />

            <p>Regards,</p>

            <p>ASK GROUP Transport</p>
        </body>
        </html>
        """;

        await SendEmailAsync(
            toEmail,
            subject,
            body,
            true);
    }

    public async Task SendInvoiceEmailAsync(
        string toEmail,
        string name,
        string invoiceNumber,
        string bookingNumber,
        decimal totalAmount)
    {
        var subject =
            $"ASK GROUP Invoice - {invoiceNumber}";

        var body = $"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>ASK GROUP Transport</h2>

            <p>Hello {name},</p>

            <p>Your invoice has been generated successfully.</p>

            <p>
                <strong>Invoice Number:</strong>
                {invoiceNumber}
            </p>

            <p>
                <strong>Booking Number:</strong>
                {bookingNumber}
            </p>

            <p>
                <strong>Total Amount:</strong>
                ₹{totalAmount:N2}
            </p>

            <p>
                You can view complete invoice details
                from your ASK GROUP account.
            </p>

            <br />

            <p>Regards,</p>

            <p>ASK GROUP Transport</p>
        </body>
        </html>
        """;

        await SendEmailAsync(
            toEmail,
            subject,
            body,
            true);
    }
}