namespace ASK.Group.Api.Services;

public class StartupValidationService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public StartupValidationService(
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    public void Validate()
    {
        ValidateRequired(
            "ConnectionStrings:DefaultConnection");

        ValidateRequired(
            "Jwt:Key");

        ValidateRequired(
            "Jwt:Issuer");

        ValidateRequired(
            "Jwt:Audience");

        if (!_environment.IsDevelopment())
        {
            ValidateProductionSecret(
                "Jwt:Key");

            ValidateOptionalSecretPair(
                "Razorpay:KeyId",
                "Razorpay:KeySecret");
        }
    }

    private void ValidateRequired(
        string key)
    {
        var value =
            _configuration[key];

        if (string.IsNullOrWhiteSpace(
            value))
        {
            throw new InvalidOperationException(
                $"Required configuration '{key}' is missing.");
        }
    }

    private void ValidateProductionSecret(
        string key)
    {
        var value =
            _configuration[key];

        if (string.IsNullOrWhiteSpace(
            value))
        {
            throw new InvalidOperationException(
                $"Production secret '{key}' is missing.");
        }

        if (value.Contains(
                "YOUR_",
                StringComparison.OrdinalIgnoreCase) ||
            value.Contains(
                "xxxxx",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"Production secret '{key}' contains a placeholder value.");
        }

        if (value.Length < 32)
        {
            throw new InvalidOperationException(
                $"{key} must be at least 32 characters in production.");
        }
    }

    private void ValidateOptionalSecretPair(
        string firstKey,
        string secondKey)
    {
        var first =
            _configuration[firstKey];

        var second =
            _configuration[secondKey];

        var firstExists =
            !string.IsNullOrWhiteSpace(first);

        var secondExists =
            !string.IsNullOrWhiteSpace(second);

        if (firstExists != secondExists)
        {
            throw new InvalidOperationException(
                $"{firstKey} and {secondKey} must be configured together.");
        }
    }
}