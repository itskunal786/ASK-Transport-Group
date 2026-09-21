using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class PricingService
{
    private readonly AskTransportDbContext _db;

    public PricingService(AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<FreightQuoteResponse> CalculateAsync(
        FreightQuoteRequest request)
    {
        if (request.FromHubId == request.ToHubId)
        {
            throw new InvalidOperationException(
                "Origin and destination hub cannot be same.");
        }

        if (request.Quantity < 1)
        {
            throw new InvalidOperationException(
                "Quantity must be at least 1.");
        }

        var now = DateTime.UtcNow;

        var route = await _db.TransportRoutes
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.FromHubId == request.FromHubId &&
                x.ToHubId == request.ToHubId &&
                x.IsActive);

        if (route == null)
        {
            throw new InvalidOperationException(
                "Active transport route not found.");
        }

        var rateCard = await _db.RateCards
            .AsNoTracking()
            .Where(x =>
                x.IsActive &&
                x.ServiceType == request.ServiceType &&
                (x.RouteId == route.Id || x.RouteId == null) &&
                x.EffectiveFrom <= now &&
                (x.EffectiveTo == null || x.EffectiveTo >= now))
            .OrderByDescending(x => x.RouteId == route.Id)
            .ThenByDescending(x => x.EffectiveFrom)
            .FirstOrDefaultAsync();

        if (rateCard == null)
        {
            throw new InvalidOperationException(
                "Applicable rate card not found.");
        }

        var volumetricWeight =
            CalculateVolumetricWeight(
                request,
                rateCard.VolumetricDivisor);

        var chargeableWeight =
            Math.Max(
                request.ActualWeightKg,
                volumetricWeight);

        var slab = await _db.RateSlabs
            .AsNoTracking()
            .Where(x =>
                x.RateCardId == rateCard.Id &&
                chargeableWeight >= x.MinWeightKg &&
                (x.MaxWeightKg == null ||
                 chargeableWeight <= x.MaxWeightKg))
            .OrderBy(x => x.MinWeightKg)
            .FirstOrDefaultAsync();

        var ratePerKg =
            slab?.RatePerKg ??
            rateCard.RatePerKg;

        var weightCharge =
            chargeableWeight * ratePerKg;

        var distanceCharge =
            (rateCard.RatePerKm ?? 0) *
            route.DistanceKm;

        var freightCharge =
            Math.Max(
                rateCard.MinimumCharge,
                weightCharge + distanceCharge);

        var fuelSurcharge =
            freightCharge *
            rateCard.FuelSurchargePercent / 100m;

        var subTotal =
            freightCharge +
            fuelSurcharge +
            rateCard.HandlingCharge;

        var sameState =
            string.Equals(
                NormalizeStateCode(request.SenderStateCode),
                NormalizeStateCode(request.ReceiverStateCode),
                StringComparison.OrdinalIgnoreCase);

        decimal cgst = 0;
        decimal sgst = 0;
        decimal igst = 0;

        if (sameState)
        {
            cgst =
                subTotal *
                (rateCard.GstPercent / 2m) /
                100m;

            sgst =
                subTotal *
                (rateCard.GstPercent / 2m) /
                100m;
        }
        else
        {
            igst =
                subTotal *
                rateCard.GstPercent /
                100m;
        }

        var gstTotal =
            cgst + sgst + igst;

        return new FreightQuoteResponse
        {
            ActualWeightKg =
                Round(request.ActualWeightKg),

            VolumetricWeightKg =
                Round(volumetricWeight),

            ChargeableWeightKg =
                Round(chargeableWeight),

            FreightCharge =
                Round(freightCharge),

            FuelSurcharge =
                Round(fuelSurcharge),

            HandlingCharge =
                Round(rateCard.HandlingCharge),

            SubTotal =
                Round(subTotal),

            Cgst =
                Round(cgst),

            Sgst =
                Round(sgst),

            Igst =
                Round(igst),

            GstTotal =
                Round(gstTotal),

            GrandTotal =
                Round(subTotal + gstTotal),

            GstPercent =
                rateCard.GstPercent,

            TaxType =
                sameState
                    ? "CGST+SGST"
                    : "IGST",

            RateCard =
                rateCard.Name
        };
    }

    private static decimal CalculateVolumetricWeight(
        FreightQuoteRequest request,
        decimal divisor)
    {
        if (!request.LengthCm.HasValue ||
            !request.WidthCm.HasValue ||
            !request.HeightCm.HasValue)
        {
            return 0;
        }

        if (request.LengthCm <= 0 ||
            request.WidthCm <= 0 ||
            request.HeightCm <= 0)
        {
            return 0;
        }

        if (divisor <= 0)
        {
            throw new InvalidOperationException(
                "Invalid volumetric divisor.");
        }

        return
            request.LengthCm.Value *
            request.WidthCm.Value *
            request.HeightCm.Value *
            request.Quantity /
            divisor;
    }

    private static string NormalizeStateCode(string value)
    {
        return value
            .Trim()
            .ToUpperInvariant();
    }

    private static decimal Round(decimal value)
    {
        return Math.Round(
            value,
            2,
            MidpointRounding.AwayFromZero);
    }
}