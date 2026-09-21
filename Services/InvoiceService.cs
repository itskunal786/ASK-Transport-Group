using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text;

namespace ASK.Group.Api.Services;

public class InvoiceService
{
    private readonly AskTransportDbContext _db;

    public InvoiceService(AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<Invoice> CreateInvoiceAsync(
        Booking booking)
    {
        var existingInvoice = await _db.Invoices
            .Include(x => x.InvoiceItems)
            .FirstOrDefaultAsync(x =>
                x.BookingId == booking.Id);

        if (existingInvoice != null)
        {
            return existingInvoice;
        }

        var invoiceNumber =
            $"INV{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(100, 999)}";

        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            BookingId = booking.Id,
            InvoiceDate = DateTime.UtcNow,

            SubTotal = booking.FreightAmount,
            GstPercentage = booking.GstPercentage,
            GstAmount = booking.GstAmount,
            DiscountAmount = booking.DiscountAmount,
            TotalAmount = booking.TotalAmount,

            PaymentStatus = booking.PaymentStatus,
            CreatedAt = DateTime.UtcNow
        };

        invoice.InvoiceItems.Add(
            new InvoiceItem
            {
                Description =
                    $"Freight Charge - {booking.GoodsType}",

                Quantity = 1,
                Rate = booking.FreightAmount,
                Amount = booking.FreightAmount
            });

        invoice.InvoiceItems.Add(
            new InvoiceItem
            {
                Description =
                    $"GST {booking.GstPercentage}%",

                Quantity = 1,
                Rate = booking.GstAmount,
                Amount = booking.GstAmount
            });

        if (booking.DiscountAmount > 0)
        {
            invoice.InvoiceItems.Add(
                new InvoiceItem
                {
                    Description = "Discount",
                    Quantity = 1,
                    Rate = -booking.DiscountAmount,
                    Amount = -booking.DiscountAmount
                });
        }

        _db.Invoices.Add(invoice);

        await _db.SaveChangesAsync();

        return invoice;
    }

    public string GenerateInvoiceHtml(
        Invoice invoice,
        Booking booking)
    {
        var itemsBuilder = new StringBuilder();

        foreach (var item in invoice.InvoiceItems)
        {
            itemsBuilder.Append("<tr>");

            itemsBuilder.Append("<td>");
            itemsBuilder.Append(
                WebUtility.HtmlEncode(item.Description));
            itemsBuilder.Append("</td>");

            itemsBuilder.Append("<td>");
            itemsBuilder.Append(item.Quantity);
            itemsBuilder.Append("</td>");

            itemsBuilder.Append("<td>₹");
            itemsBuilder.Append(
                item.Rate.ToString("N2"));
            itemsBuilder.Append("</td>");

            itemsBuilder.Append("<td>₹");
            itemsBuilder.Append(
                item.Amount.ToString("N2"));
            itemsBuilder.Append("</td>");

            itemsBuilder.Append("</tr>");
        }

        var itemsHtml =
            itemsBuilder.ToString();

        var bookingNumber =
            WebUtility.HtmlEncode(
                booking.BookingNumber);

        var fromCity =
            WebUtility.HtmlEncode(
                booking.FromCity);

        var fromState =
            WebUtility.HtmlEncode(
                booking.FromState);

        var toCity =
            WebUtility.HtmlEncode(
                booking.ToCity);

        var toState =
            WebUtility.HtmlEncode(
                booking.ToState);

        var senderName =
            WebUtility.HtmlEncode(
                booking.SenderName);

        var senderPhone =
            WebUtility.HtmlEncode(
                booking.SenderPhone);

        var invoiceNumber =
            WebUtility.HtmlEncode(
                invoice.InvoiceNumber);

        var paymentStatus =
            WebUtility.HtmlEncode(
                invoice.PaymentStatus);

        var html = new StringBuilder();

        html.AppendLine("<!DOCTYPE html>");
        html.AppendLine("<html>");
        html.AppendLine("<head>");

        html.AppendLine(
            "<meta charset=\"utf-8\" />");

        html.AppendLine(
            $"<title>{invoiceNumber}</title>");

        html.AppendLine("<style>");

        html.AppendLine(@"
body {
    font-family: Arial, sans-serif;
    background: #f5f7fb;
    padding: 30px;
    color: #1f2937;
}

.invoice {
    max-width: 900px;
    margin: auto;
    background: white;
    padding: 35px;
    border-radius: 12px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.brand {
    color: #102a56;
}

.info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    background: #102a56;
    color: white;
    padding: 12px;
    text-align: left;
}

td {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
}

.totals {
    margin-top: 25px;
    margin-left: auto;
    width: 350px;
}

.row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
}

.total {
    font-size: 20px;
    font-weight: bold;
    border-top: 2px solid #102a56;
    padding-top: 12px;
}

.status {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    background: #eef2ff;
    color: #102a56;
    font-weight: bold;
}

@media print {
    body {
        background: white;
        padding: 0;
    }

    .invoice {
        box-shadow: none;
    }
}
");

        html.AppendLine("</style>");
        html.AppendLine("</head>");

        html.AppendLine("<body>");

        html.AppendLine(
            "<div class=\"invoice\">");

        html.AppendLine(
            "<div class=\"header\">");

        html.AppendLine("<div>");

        html.AppendLine(
            "<h1 class=\"brand\">ASK GROUP</h1>");

        html.AppendLine(
            "<p>Transport &amp; Logistics</p>");

        html.AppendLine("</div>");

        html.AppendLine("<div>");

        html.AppendLine(
            "<h2>INVOICE</h2>");

        html.AppendLine(
            $"<p>{invoiceNumber}</p>");

        html.AppendLine("</div>");
        html.AppendLine("</div>");

        html.AppendLine(
            "<div class=\"info\">");

        html.AppendLine("<div>");

        html.AppendLine(
            "<h3>Booking Details</h3>");

        html.AppendLine(
            $"<p><strong>Booking:</strong> {bookingNumber}</p>");

        html.AppendLine(
            $"<p><strong>Pickup:</strong> {fromCity}, {fromState}</p>");

        html.AppendLine(
            $"<p><strong>Delivery:</strong> {toCity}, {toState}</p>");

        html.AppendLine("</div>");

        html.AppendLine("<div>");

        html.AppendLine(
            "<h3>Customer</h3>");

        html.AppendLine(
            $"<p><strong>Name:</strong> {senderName}</p>");

        html.AppendLine(
            $"<p><strong>Phone:</strong> {senderPhone}</p>");

        html.AppendLine(
            $"<p><strong>Date:</strong> {invoice.InvoiceDate:dd MMM yyyy}</p>");

        html.AppendLine("</div>");
        html.AppendLine("</div>");

        html.AppendLine("<table>");

        html.AppendLine("<thead>");
        html.AppendLine("<tr>");

        html.AppendLine(
            "<th>Description</th>");

        html.AppendLine(
            "<th>Qty</th>");

        html.AppendLine(
            "<th>Rate</th>");

        html.AppendLine(
            "<th>Amount</th>");

        html.AppendLine("</tr>");
        html.AppendLine("</thead>");

        html.AppendLine("<tbody>");

        html.AppendLine(itemsHtml);

        html.AppendLine("</tbody>");
        html.AppendLine("</table>");

        html.AppendLine(
            "<div class=\"totals\">");

        html.AppendLine(
            "<div class=\"row\">");

        html.AppendLine(
            "<span>Subtotal</span>");

        html.AppendLine(
            $"<span>₹{invoice.SubTotal:N2}</span>");

        html.AppendLine("</div>");

        html.AppendLine(
            "<div class=\"row\">");

        html.AppendLine(
            $"<span>GST ({invoice.GstPercentage}%)</span>");

        html.AppendLine(
            $"<span>₹{invoice.GstAmount:N2}</span>");

        html.AppendLine("</div>");

        html.AppendLine(
            "<div class=\"row\">");

        html.AppendLine(
            "<span>Discount</span>");

        html.AppendLine(
            $"<span>- ₹{invoice.DiscountAmount:N2}</span>");

        html.AppendLine("</div>");

        html.AppendLine(
            "<div class=\"row total\">");

        html.AppendLine(
            "<span>Total</span>");

        html.AppendLine(
            $"<span>₹{invoice.TotalAmount:N2}</span>");

        html.AppendLine("</div>");

        html.AppendLine(
            "<div class=\"row\">");

        html.AppendLine(
            "<span>Payment</span>");

        html.AppendLine(
            $"<span class=\"status\">{paymentStatus}</span>");

        html.AppendLine("</div>");

        html.AppendLine("</div>");
        html.AppendLine("</div>");

        html.AppendLine("</body>");
        html.AppendLine("</html>");

        return html.ToString();
    }
}
