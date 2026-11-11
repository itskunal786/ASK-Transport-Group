using System.Text.Json.Serialization;

namespace ASK.Group.Api.DTOs;

public class RazorpayWebhookDto
{
    [JsonPropertyName("event")]
    public string Event { get; set; } = string.Empty;

    [JsonPropertyName("payload")]
    public RazorpayWebhookPayload Payload { get; set; } = new();
}

public class RazorpayWebhookPayload
{
    [JsonPropertyName("payment")]
    public RazorpayPaymentPayload? Payment { get; set; }
}

public class RazorpayPaymentPayload
{
    [JsonPropertyName("entity")]
    public RazorpayPaymentEntity? Entity { get; set; }
}

public class RazorpayPaymentEntity
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("order_id")]
    public string OrderId { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public long Amount { get; set; }

    [JsonPropertyName("method")]
    public string? Method { get; set; }
}