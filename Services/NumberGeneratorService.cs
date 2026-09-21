namespace ASK.Group.Api.Services;

public class NumberGeneratorService
{
    private readonly SystemSettingService _settings;

    public NumberGeneratorService(
        SystemSettingService settings)
    {
        _settings = settings;
    }

    public async Task<string> GenerateBookingNumberAsync()
    {
        var prefix =
            await _settings.GetAsync(
                "Numbering.BookingPrefix",
                "ASK");

        return Generate(prefix);
    }

    public async Task<string> GenerateShipmentNumberAsync()
    {
        var prefix =
            await _settings.GetAsync(
                "Numbering.ShipmentPrefix",
                "SHP");

        return Generate(prefix);
    }

    public async Task<string> GenerateTripNumberAsync()
    {
        var prefix =
            await _settings.GetAsync(
                "Numbering.TripPrefix",
                "TRP");

        return Generate(prefix);
    }

    public async Task<string> GenerateInvoiceNumberAsync()
    {
        var prefix =
            await _settings.GetAsync(
                "Numbering.InvoicePrefix",
                "INV");

        return Generate(prefix);
    }

    public async Task<string> GenerateRefundNumberAsync()
    {
        var prefix =
            await _settings.GetAsync(
                "Numbering.RefundPrefix",
                "REF");

        return Generate(prefix);
    }

    private static string Generate(
        string prefix)
    {
        return
            $"{prefix}{DateTime.UtcNow:yyyyMMddHHmmssfff}{Random.Shared.Next(100, 999)}"
                .ToUpperInvariant();
    }
}