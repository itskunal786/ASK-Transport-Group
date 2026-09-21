using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class CommunicationService
{
    private readonly AskTransportDbContext _db;

    private readonly TemplateService
        _templateService;

    private readonly EmailService
        _emailService;

    private readonly IConfiguration
        _configuration;


    public CommunicationService(
        AskTransportDbContext db,
        TemplateService templateService,
        EmailService emailService,
        IConfiguration configuration)
    {
        _db = db;

        _templateService =
            templateService;

        _emailService =
            emailService;

        _configuration =
            configuration;
    }


    public async Task SendAsync(
        AppUser user,
        string templateCode,
        Dictionary<string, string> values)
    {
        var template =
            await _templateService
                .GetAsync(
                    templateCode);


        if (template == null)
        {
            throw new InvalidOperationException(
                "Notification template not found.");
        }


        var preference =
            await _db.NotificationPreferences
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserId == user.Id);


        // Preference row nahi hai
        // to notifications default enabled hain.
        if (template.Channel.Equals(
                "Email",
                StringComparison.OrdinalIgnoreCase) &&
            preference != null &&
            !preference.EmailEnabled)
        {
            return;
        }


        // Future SMS support ke liye preference ready hai.
        if (template.Channel.Equals(
                "SMS",
                StringComparison.OrdinalIgnoreCase) &&
            preference != null &&
            !preference.SmsEnabled)
        {
            return;
        }


        var subject =
            _templateService.Render(
                template.Subject ??
                    string.Empty,
                values);


        var body =
            _templateService.Render(
                template.Body,
                values);


        var recipient =
            template.Channel.Equals(
                "SMS",
                StringComparison.OrdinalIgnoreCase)
                    ? user.Phone
                    : user.Email;


        var log =
            new NotificationLog
            {
                UserId =
                    user.Id,

                Channel =
                    template.Channel,

                Recipient =
                    recipient,

                Subject =
                    subject,

                Message =
                    body,

                TemplateCode =
                    template.Code,

                Status =
                    "Pending",

                CreatedAt =
                    DateTime.UtcNow
            };


        _db.NotificationLogs.Add(
            log);

        await _db.SaveChangesAsync();


        try
        {
            if (template.Channel.Equals(
                    "Email",
                    StringComparison.OrdinalIgnoreCase))
            {
                var smtpHost =
                    _configuration[
                        "Smtp:Host"];


                if (string.IsNullOrWhiteSpace(
                    smtpHost))
                {
                    throw new InvalidOperationException(
                        "SMTP is not configured.");
                }


                await _emailService
                    .SendHtmlEmailAsync(
                        user.Email,
                        subject,
                        body);
            }


            // Actual SMS provider abhi project me nahi hai.
            if (template.Channel.Equals(
                    "SMS",
                    StringComparison.OrdinalIgnoreCase))
            {
                log.Status =
                    "Skipped";

                log.ErrorMessage =
                    "SMS provider is not configured.";

                await _db.SaveChangesAsync();

                return;
            }


            log.Status =
                "Sent";

            log.SentAt =
                DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            log.Status =
                "Failed";

            log.ErrorMessage =
                ex.Message;


            await _db.SaveChangesAsync();

            throw;
        }
    }
}