using Razorpay.Api;
using System.Security.Cryptography;
using System.Text;

namespace ASK.Group.Api.Services;

public class RazorpayService
{
    private readonly IConfiguration _configuration;

    public RazorpayService(
        IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // =========================================================
    // CONFIGURATION
    // =========================================================

    public bool IsConfigured()
    {
        return
            !string.IsNullOrWhiteSpace(
                _configuration["Razorpay:KeyId"]) &&
            !string.IsNullOrWhiteSpace(
                _configuration["Razorpay:KeySecret"]);
    }

    public string GetKeyId()
    {
        return _configuration[
            "Razorpay:KeyId"] ?? string.Empty;
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

    public Order CreateOrder(
        decimal amount,
        string receipt)
    {
        if (amount <= 0)
        {
            throw new InvalidOperationException(
                "Payment amount must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(receipt))
        {
            throw new InvalidOperationException(
                "Payment receipt is required.");
        }

        var client =
            CreateClient();

        var amountInPaise =
            Convert.ToInt32(
                Math.Round(
                    amount * 100m,
                    0,
                    MidpointRounding.AwayFromZero));

        var options =
            new Dictionary<string, object>
            {
                ["amount"] =
                    amountInPaise,

                ["currency"] =
                    "INR",

                ["receipt"] =
                    receipt.Trim(),

                ["payment_capture"] =
                    1
            };

        return client.Order.Create(
            options);
    }

    // =========================================================
    // FETCH PAYMENT
    // =========================================================

    public Payment FetchPayment(
        string paymentId)
    {
        if (string.IsNullOrWhiteSpace(
            paymentId))
        {
            throw new InvalidOperationException(
                "Razorpay payment ID is required.");
        }

        var client =
            CreateClient();

        return client.Payment.Fetch(
            paymentId.Trim());
    }

    // =========================================================
    // CREATE REFUND
    // =========================================================

    public Refund CreateRefund(
        string paymentId,
        decimal amount,
        string? reason = null)
    {
        if (string.IsNullOrWhiteSpace(
            paymentId))
        {
            throw new InvalidOperationException(
                "Razorpay payment ID is required.");
        }

        if (amount <= 0)
        {
            throw new InvalidOperationException(
                "Refund amount must be greater than zero.");
        }

        var client =
            CreateClient();

        var payment =
            client.Payment.Fetch(
                paymentId.Trim());

        var amountInPaise =
            Convert.ToInt32(
                Math.Round(
                    amount * 100m,
                    0,
                    MidpointRounding.AwayFromZero));

        var data =
            new Dictionary<string, object>
            {
                ["amount"] =
                    amountInPaise,

                ["speed"] =
                    "normal"
            };

        if (!string.IsNullOrWhiteSpace(
            reason))
        {
            data["notes"] =
                new Dictionary<string, string>
                {
                    ["reason"] =
                        reason.Trim()
                };
        }

        return payment.Refund(
            data);
    }

    // =========================================================
    // OLD CONTROLLER COMPATIBILITY
    // =========================================================

    public bool VerifySignature(
        string orderId,
        string paymentId,
        string signature)
    {
        return VerifyPaymentSignature(
            orderId,
            paymentId,
            signature);
    }

    // =========================================================
    // PAYMENT SIGNATURE
    // =========================================================

    public bool VerifyPaymentSignature(
        string orderId,
        string paymentId,
        string signature)
    {
        if (string.IsNullOrWhiteSpace(
                orderId) ||
            string.IsNullOrWhiteSpace(
                paymentId) ||
            string.IsNullOrWhiteSpace(
                signature))
        {
            return false;
        }

        var secret =
            GetRequiredConfiguration(
                "Razorpay:KeySecret");

        var payload =
            $"{orderId.Trim()}|{paymentId.Trim()}";

        return VerifyHmacSha256(
            payload,
            signature,
            secret);
    }

    // =========================================================
    // WEBHOOK SIGNATURE
    // =========================================================

    public bool VerifyWebhookSignature(
        string payload,
        string signature)
    {
        if (string.IsNullOrWhiteSpace(
                payload) ||
            string.IsNullOrWhiteSpace(
                signature))
        {
            return false;
        }

        var webhookSecret =
            GetRequiredConfiguration(
                "Razorpay:WebhookSecret");

        return VerifyHmacSha256(
            payload,
            signature,
            webhookSecret);
    }

    // =========================================================
    // CLIENT
    // =========================================================

    private RazorpayClient CreateClient()
    {
        var keyId =
            GetRequiredConfiguration(
                "Razorpay:KeyId");

        var keySecret =
            GetRequiredConfiguration(
                "Razorpay:KeySecret");

        return new RazorpayClient(
            keyId,
            keySecret);
    }

    // =========================================================
    // CONFIG HELPER
    // =========================================================

    private string GetRequiredConfiguration(
        string key)
    {
        var value =
            _configuration[key];

        if (string.IsNullOrWhiteSpace(
            value))
        {
            throw new InvalidOperationException(
                $"{key} is not configured.");
        }

        return value;
    }

    // =========================================================
    // HMAC VERIFICATION
    // =========================================================

    private static bool VerifyHmacSha256(
        string payload,
        string suppliedSignature,
        string secret)
    {
        using var hmac =
            new HMACSHA256(
                Encoding.UTF8.GetBytes(
                    secret));

        var payloadBytes =
            Encoding.UTF8.GetBytes(
                payload);

        var hashBytes =
            hmac.ComputeHash(
                payloadBytes);

        var expectedSignature =
            Convert.ToHexString(
                    hashBytes)
                .ToLowerInvariant();

        var actualSignature =
            suppliedSignature
                .Trim()
                .ToLowerInvariant();

        if (expectedSignature.Length !=
            actualSignature.Length)
        {
            return false;
        }

        var expectedBytes =
            Encoding.UTF8.GetBytes(
                expectedSignature);

        var actualBytes =
            Encoding.UTF8.GetBytes(
                actualSignature);

        return CryptographicOperations
            .FixedTimeEquals(
                expectedBytes,
                actualBytes);
    }
}