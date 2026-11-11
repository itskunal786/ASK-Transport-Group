using ASK.Group.Api.Models;

namespace ASK.Group.Api.Services;

public class FreightService
{
    public decimal CalculateFreight(
        TransportService service,
        decimal weight,
        int quantity)
    {
        var freight =
            service.BaseRate +
            (service.PerKgRate * weight * quantity);

        return Math.Round(freight, 2);
    }

    public decimal CalculateGst(decimal freight)
    {
        return Math.Round(freight * 18 / 100, 2);
    }

    public decimal CalculateTotal(
        decimal freight,
        decimal gst,
        decimal discount)
    {
        var total = freight + gst - discount;

        if (total < 0)
        {
            total = 0;
        }

        return Math.Round(total, 2);
    }
}