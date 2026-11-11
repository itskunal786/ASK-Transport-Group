namespace ASK.Group.Api.DTOs;

public class FreightQuoteResponse
{
    public decimal ActualWeightKg { get; set; }

    public decimal VolumetricWeightKg { get; set; }

    public decimal ChargeableWeightKg { get; set; }

    public decimal FreightCharge { get; set; }

    public decimal FuelSurcharge { get; set; }

    public decimal HandlingCharge { get; set; }

    public decimal SubTotal { get; set; }

    public decimal Cgst { get; set; }

    public decimal Sgst { get; set; }

    public decimal Igst { get; set; }

    public decimal GstTotal { get; set; }

    public decimal GrandTotal { get; set; }

    public decimal GstPercent { get; set; }

    public string TaxType { get; set; } = string.Empty;

    public string RateCard { get; set; } = string.Empty;
}