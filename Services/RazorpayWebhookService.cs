using System.Security.Cryptography;
using System.Text;

namespace ASK.Group.Api.Services;

public class RazorpayWebhookService
{
    private readonly IConfiguration _configuration;

    public RazorpayWebhookService(
        IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public bool VerifySignature(
        string payload,
        string signature)
    {
        var secret =
            _configuration["Razorpay:WebhookSecret"];

        if (string.IsNullOrWhiteSpace(secret) ||
            string.IsNullOrWhiteSpace(signature))
        {
            return false;
        }

        using var hmac =
            new HMACSHA256(
                Encoding.UTF8.GetBytes(secret));

        var hash =
            hmac.ComputeHash(
                Encoding.UTF8.GetBytes(payload));

        var generatedSignature =
            Convert.ToHexString(hash)
                .ToLowerInvariant();

        var expectedBytes =
            Encoding.UTF8.GetBytes(
                generatedSignature);

        var receivedBytes =
            Encoding.UTF8.GetBytes(
                signature.Trim()
                    .ToLowerInvariant());

        if (expectedBytes.Length !=
            receivedBytes.Length)
        {
            return false;
        }

        return CryptographicOperations
            .FixedTimeEquals(
                expectedBytes,
                receivedBytes);
    }
}