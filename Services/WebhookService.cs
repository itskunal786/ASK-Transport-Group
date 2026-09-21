using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace ASK.Group.Api.Services;

public class WebhookService
{
    private readonly AskTransportDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WebhookService> _logger;

    public WebhookService(
        AskTransportDbContext db,
        IHttpClientFactory httpClientFactory,
        ILogger<WebhookService> logger)
    {
        _db = db;
        _httpClientFactory =
            httpClientFactory;
        _logger = logger;
    }

    public async Task PublishEventAsync(
        string eventName,
        string referenceId,
        object? data,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(
            eventName))
        {
            throw new ArgumentException(
                "Event name is required.",
                nameof(eventName));
        }

        if (string.IsNullOrWhiteSpace(
            referenceId))
        {
            throw new ArgumentException(
                "Reference ID is required.",
                nameof(referenceId));
        }

        var payload =
            JsonSerializer.Serialize(
                new
                {
                    eventName =
                        eventName.Trim(),

                    referenceId =
                        referenceId.Trim(),

                    timestamp =
                        DateTime.UtcNow,

                    data
                });

        var message =
            new WebhookOutboxMessage
            {
                EventName =
                    eventName.Trim(),

                ReferenceId =
                    referenceId.Trim(),

                Payload =
                    payload,

                Status =
                    "Pending",

                AttemptCount =
                    0,

                MaxAttempts =
                    5,

                NextAttemptAt =
                    DateTime.UtcNow
            };

        _db.WebhookOutboxMessages.Add(
            message);

        await _db.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<int> ProcessPendingAsync(
        int batchSize = 25,
        CancellationToken cancellationToken = default)
    {
        batchSize =
            Math.Clamp(
                batchSize,
                1,
                100);

        var now =
            DateTime.UtcNow;

        var messages =
            await _db.WebhookOutboxMessages
                .Where(x =>
                    (
                        x.Status ==
                            "Pending" ||
                        x.Status ==
                            "Retry"
                    ) &&
                    x.NextAttemptAt <= now &&
                    x.AttemptCount <
                        x.MaxAttempts)
                .OrderBy(x =>
                    x.NextAttemptAt)
                .ThenBy(x =>
                    x.Id)
                .Take(
                    batchSize)
                .ToListAsync(
                    cancellationToken);

        var processed =
            0;

        foreach (var message in messages)
        {
            if (cancellationToken
                .IsCancellationRequested)
            {
                break;
            }

            await ProcessMessageAsync(
                message,
                cancellationToken);

            processed++;
        }

        return processed;
    }

    public async Task<int> RecoverStuckMessagesAsync(
        CancellationToken cancellationToken = default)
    {
        var threshold =
            DateTime.UtcNow
                .AddMinutes(-10);

        var messages =
            await _db.WebhookOutboxMessages
                .Where(x =>
                    x.Status ==
                        "Processing" &&
                    x.ProcessingStartedAt
                        .HasValue &&
                    x.ProcessingStartedAt.Value <
                        threshold)
                .ToListAsync(
                    cancellationToken);

        if (messages.Count == 0)
        {
            return 0;
        }

        var now =
            DateTime.UtcNow;

        foreach (var message in messages)
        {
            if (message.AttemptCount >=
                message.MaxAttempts)
            {
                message.Status =
                    "Failed";

                message.FailedAt =
                    now;

                message.ProcessingStartedAt =
                    null;

                message.LastError =
                    "Webhook processing was interrupted and maximum retry attempts were reached.";

                continue;
            }

            message.Status =
                "Retry";

            message.ProcessingStartedAt =
                null;

            message.NextAttemptAt =
                now;

            message.CompletedAt =
                null;

            message.FailedAt =
                null;

            message.LastError =
                "Webhook processing was interrupted and automatically recovered for retry.";
        }

        await _db.SaveChangesAsync(
            cancellationToken);

        _logger.LogWarning(
            "Recovered {Count} stuck webhook outbox message(s).",
            messages.Count);

        return messages.Count;
    }

    private async Task ProcessMessageAsync(
        WebhookOutboxMessage message,
        CancellationToken cancellationToken)
    {
        message.Status =
            "Processing";

        message.ProcessingStartedAt =
            DateTime.UtcNow;

        message.AttemptCount++;

        await _db.SaveChangesAsync(
            cancellationToken);

        try
        {
            var partners =
                await _db.PartnerWebhooks
                    .AsNoTracking()
                    .Where(x =>
                        x.IsActive)
                    .ToListAsync(
                        cancellationToken);

            var eligiblePartners =
                partners
                    .Where(x =>
                        ShouldReceiveEvent(
                            x.Events,
                            message.EventName))
                    .ToList();

            if (eligiblePartners.Count ==
                0)
            {
                message.Status =
                    "Completed";

                message.CompletedAt =
                    DateTime.UtcNow;

                message.ProcessingStartedAt =
                    null;

                message.LastError =
                    null;

                await _db.SaveChangesAsync(
                    cancellationToken);

                return;
            }

            var allSuccessful =
                true;

            var errors =
                new List<string>();

            foreach (var partner
                     in eligiblePartners)
            {
                var result =
                    await SendToPartnerAsync(
                        partner,
                        message,
                        cancellationToken);

                if (!result.Success)
                {
                    allSuccessful =
                        false;

                    errors.Add(
                        $"{partner.PartnerName}: {result.Error}");
                }
            }

            if (allSuccessful)
            {
                message.Status =
                    "Completed";

                message.CompletedAt =
                    DateTime.UtcNow;

                message.ProcessingStartedAt =
                    null;

                message.FailedAt =
                    null;

                message.LastError =
                    null;
            }
            else
            {
                ScheduleRetry(
                    message,
                    string.Join(
                        " | ",
                        errors));
            }
        }
        catch (OperationCanceledException)
            when (cancellationToken
                .IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Webhook outbox processing failed for message {MessageId}.",
                message.Id);

            ScheduleRetry(
                message,
                ex.Message);
        }

        await _db.SaveChangesAsync(
            cancellationToken);
    }

    private async Task<WebhookSendResult>
        SendToPartnerAsync(
            PartnerWebhook partner,
            WebhookOutboxMessage message,
            CancellationToken cancellationToken)
    {
        var attemptedAt =
            DateTime.UtcNow;

        var log =
            new WebhookDeliveryLog
            {
                PartnerWebhookId =
                    partner.Id,

                EventName =
                    message.EventName,

                ReferenceId =
                    message.ReferenceId,

                Payload =
                    message.Payload,

                AttemptNumber =
                    message.AttemptCount,

                AttemptedAt =
                    attemptedAt,

                IsSuccess =
                    false
            };

        try
        {
            var client =
                _httpClientFactory
                    .CreateClient(
                        "PartnerWebhookClient");

            using var request =
                new HttpRequestMessage(
                    HttpMethod.Post,
                    partner.WebhookUrl);

            var timestamp =
                DateTimeOffset.UtcNow
                    .ToUnixTimeSeconds()
                    .ToString();

            var signature =
                GenerateSignature(
                    timestamp,
                    message.Payload,
                    partner.SecretKey);

            request.Content =
                new StringContent(
                    message.Payload,
                    Encoding.UTF8,
                    "application/json");

            request.Headers.Add(
                "X-ASK-Event",
                message.EventName);

            request.Headers.Add(
                "X-ASK-Signature",
                signature);

            request.Headers.Add(
                "X-ASK-Timestamp",
                timestamp);

            request.Headers.Add(
                "X-ASK-Webhook-Id",
                partner.Id.ToString());

            request.Headers.Add(
                "X-ASK-Delivery-Id",
                message.Id.ToString());

            using var response =
                await client.SendAsync(
                    request,
                    cancellationToken);

            var responseBody =
                await response.Content
                    .ReadAsStringAsync(
                        cancellationToken);

            log.HttpStatusCode =
                (int)response.StatusCode;

            log.ResponseBody =
                LimitLength(
                    responseBody,
                    2000);

            if (response.IsSuccessStatusCode)
            {
                log.IsSuccess =
                    true;

                partner.LastSuccessAt =
                    attemptedAt;

                partner.LastError =
                    null;

                _db.PartnerWebhooks.Update(
                    partner);

                _db.WebhookDeliveryLogs.Add(
                    log);

                await _db.SaveChangesAsync(
                    cancellationToken);

                return WebhookSendResult.Ok();
            }

            var error =
                $"HTTP {(int)response.StatusCode}";

            log.ErrorMessage =
                error;

            partner.LastFailureAt =
                attemptedAt;

            partner.LastError =
                error;

            _db.PartnerWebhooks.Update(
                partner);

            _db.WebhookDeliveryLogs.Add(
                log);

            await _db.SaveChangesAsync(
                cancellationToken);

            return WebhookSendResult.Fail(
                error);
        }
        catch (OperationCanceledException)
            when (cancellationToken
                .IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            log.ErrorMessage =
                LimitLength(
                    ex.Message,
                    2000);

            partner.LastFailureAt =
                attemptedAt;

            partner.LastError =
                LimitLength(
                    ex.Message,
                    1000);

            _db.PartnerWebhooks.Update(
                partner);

            _db.WebhookDeliveryLogs.Add(
                log);

            await _db.SaveChangesAsync(
                cancellationToken);

            return WebhookSendResult.Fail(
                ex.Message);
        }
    }

    public async Task BookingCreatedAsync(
        int bookingId,
        string bookingNumber,
        string status,
        decimal totalAmount,
        CancellationToken cancellationToken = default)
    {
        await PublishEventAsync(
            "booking.created",
            bookingNumber,
            new
            {
                bookingId,
                bookingNumber,
                status,
                totalAmount
            },
            cancellationToken);
    }

    public async Task BookingCancelledAsync(
        int bookingId,
        string bookingNumber,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        await PublishEventAsync(
            "booking.cancelled",
            bookingNumber,
            new
            {
                bookingId,
                bookingNumber,
                reason
            },
            cancellationToken);
    }

    public async Task BookingStatusChangedAsync(
        int bookingId,
        string bookingNumber,
        string status,
        string? location,
        CancellationToken cancellationToken = default)
    {
        await PublishEventAsync(
            "booking.status_changed",
            bookingNumber,
            new
            {
                bookingId,
                bookingNumber,
                status,
                location
            },
            cancellationToken);
    }

    public async Task PaymentUpdatedAsync(
        int transactionId,
        string transactionNumber,
        string bookingNumber,
        string status,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        await PublishEventAsync(
            "payment.updated",
            transactionNumber,
            new
            {
                transactionId,
                transactionNumber,
                bookingNumber,
                status,
                amount
            },
            cancellationToken);
    }

    public async Task ShipmentUpdatedAsync(
        int shipmentId,
        string shipmentNumber,
        string? status,
        DateTime? deliveredAt,
        CancellationToken cancellationToken = default)
    {
        var eventName =
            string.Equals(
                status,
                "Delivered",
                StringComparison.OrdinalIgnoreCase)
                ? "shipment.delivered"
                : "shipment.status_changed";

        await PublishEventAsync(
            eventName,
            shipmentNumber,
            new
            {
                shipmentId,
                shipmentNumber,
                status,
                deliveredAt
            },
            cancellationToken);
    }

    private static bool ShouldReceiveEvent(
        string? configuredEvents,
        string eventName)
    {
        if (string.IsNullOrWhiteSpace(
            configuredEvents))
        {
            return true;
        }

        var events =
            configuredEvents.Split(
                ',',
                StringSplitOptions
                    .RemoveEmptyEntries |
                StringSplitOptions
                    .TrimEntries);

        return events.Any(x =>
            string.Equals(
                x,
                eventName,
                StringComparison.OrdinalIgnoreCase));
    }

    private static string GenerateSignature(
        string timestamp,
        string payload,
        string secret)
    {
        var signedPayload =
            $"{timestamp}.{payload}";

        var secretBytes =
            Encoding.UTF8.GetBytes(
                secret);

        var payloadBytes =
            Encoding.UTF8.GetBytes(
                signedPayload);

        using var hmac =
            new HMACSHA256(
                secretBytes);

        return Convert
            .ToHexString(
                hmac.ComputeHash(
                    payloadBytes))
            .ToLowerInvariant();
    }

    private static void ScheduleRetry(
        WebhookOutboxMessage message,
        string? error)
    {
        message.LastError =
            LimitLength(
                error,
                2000);

        message.ProcessingStartedAt =
            null;

        message.CompletedAt =
            null;

        if (message.AttemptCount >=
            message.MaxAttempts)
        {
            message.Status =
                "Failed";

            message.FailedAt =
                DateTime.UtcNow;

            return;
        }

        message.Status =
            "Retry";

        message.FailedAt =
            null;

        message.NextAttemptAt =
            DateTime.UtcNow.Add(
                GetRetryDelay(
                    message.AttemptCount));
    }

    private static TimeSpan GetRetryDelay(
        int attempt)
    {
        return attempt switch
        {
            <= 1 =>
                TimeSpan.FromMinutes(1),

            2 =>
                TimeSpan.FromMinutes(5),

            3 =>
                TimeSpan.FromMinutes(15),

            4 =>
                TimeSpan.FromMinutes(30),

            _ =>
                TimeSpan.FromHours(1)
        };
    }

    private static string? LimitLength(
        string? value,
        int maxLength)
    {
        if (string.IsNullOrEmpty(
            value))
        {
            return value;
        }

        return value.Length <=
               maxLength
            ? value
            : value[..maxLength];
    }
}

public class WebhookSendResult
{
    public bool Success { get; private set; }

    public string? Error { get; private set; }

    public static WebhookSendResult Ok()
    {
        return new WebhookSendResult
        {
            Success = true
        };
    }

    public static WebhookSendResult Fail(
        string? error)
    {
        return new WebhookSendResult
        {
            Success = false,
            Error = error
        };
    }
}