using ASK.Group.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ASK.Group.Api.Services;

public sealed class InvoicePdfService
{
    private const string Navy = "#082653";
    private const string Blue = "#0874D1";
    private const string Orange = "#F58220";
    private const string LightBlue = "#EEF7FF";
    private const string Border = "#C9DDED";
    private const string Grey = "#64748B";
    private const string Green = "#169447";
    private const string Amber = "#D97706";

    // Vector ASK logo.
    // No external PNG/JPG is required.
    private const string LogoSvg = """
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 120 90">

      <path d="M10 63 L39 14 L58 14 L31 63 Z"
            fill="#082653"/>

      <path d="M45 14 L68 14 L93 63 L72 63 Z"
            fill="#0874D1"/>

      <path d="M21 54 L87 54 L98 69 L12 69 Z"
            fill="#F58220"/>

      <path d="M70 25 L108 25 L98 36 L75 36 Z"
            fill="#F58220"/>

      <path d="M77 41 L105 41 L96 50 L82 50 Z"
            fill="#082653"/>

      <circle cx="31" cy="76" r="6"
              fill="#082653"/>

      <circle cx="82" cy="76" r="6"
              fill="#082653"/>
    </svg>
    """;

    public byte[] Generate(
        Invoice invoice,
        Booking booking)
    {
        var document = Document.Create(document =>
        {
            document.Page(page =>
            {
                // Exact 3:4 aspect ratio
                // 600 / 800 = 0.75
                page.Size(600, 800);

                page.PageColor(Colors.White);

                page.MarginHorizontal(26);
                page.MarginTop(24);
                page.MarginBottom(20);

                page.DefaultTextStyle(style =>
                    style
                        .FontFamily("Lato")
                        .FontSize(9)
                        .FontColor(Navy));

                page.Content()
                    .Column(column =>
                    {
                        column.Spacing(13);

                        column.Item()
                            .Element(x =>
                                BuildHeader(
                                    x,
                                    invoice,
                                    booking));

                        column.Item()
                            .Element(x =>
                                BuildAddresses(
                                    x,
                                    booking));

                        column.Item()
                            .Element(x =>
                                BuildItems(
                                    x,
                                    invoice));

                        column.Item()
                            .Element(x =>
                                BuildBottom(
                                    x,
                                    invoice,
                                    booking));
                    });

                page.Footer()
                    .Element(BuildFooter);
            });
        });

        return document.GeneratePdf();
    }

    // =========================================================
    // HEADER
    // =========================================================

    private static void BuildHeader(
        IContainer container,
        Invoice invoice,
        Booking booking)
    {
        container
            .Height(92)
            .Row(row =>
            {
                row.ConstantItem(66)
                    .AlignMiddle()
                    .Svg(LogoSvg)
                    .FitArea();

                row.ConstantItem(9);

                row.RelativeItem(1.15f)
                    .AlignMiddle()
                    .Column(column =>
                    {
                        column.Item()
                            .Text(text =>
                            {
                                text.Span("ASK ")
                                    .FontSize(24)
                                    .Bold()
                                    .FontColor(Navy);

                                text.Span("GROUP")
                                    .FontSize(24)
                                    .Bold()
                                    .FontColor(Orange);
                            });

                        column.Item()
                            .PaddingTop(2)
                            .Text("TRANSPORT & LOGISTICS")
                            .FontSize(8.5f)
                            .Bold()
                            .LetterSpacing(0.7f)
                            .FontColor(Navy);

                        column.Item()
                            .PaddingTop(6)
                            .Text(
                                "Reliable Transport & Logistics Services")
                            .FontSize(7.5f)
                            .FontColor(Grey);
                    });

                row.ConstantItem(14);

                row.ConstantItem(2)
                    .Height(86)
                    .Background(Blue);

                row.ConstantItem(17);

                row.RelativeItem()
                    .Column(column =>
                    {
                        column.Item()
                            .Text("Invoice")
                            .FontSize(22)
                            .Bold()
                            .FontColor(Navy);

                        column.Item()
                            .PaddingTop(8)
                            .Element(x =>
                                HeaderRow(
                                    x,
                                    "Invoice No:",
                                    invoice.InvoiceNumber));

                        column.Item()
                            .PaddingTop(5)
                            .Element(x =>
                                HeaderRow(
                                    x,
                                    "Invoice Date:",
                                    invoice.InvoiceDate
                                        .ToString("dd MMM yyyy")));

                        column.Item()
                            .PaddingTop(5)
                            .Element(x =>
                                HeaderRow(
                                    x,
                                    "Booking No:",
                                    booking.BookingNumber));
                    });
            });
    }

    private static void HeaderRow(
        IContainer container,
        string label,
        string? value)
    {
        container.Row(row =>
        {
            row.ConstantItem(70)
                .Text(label)
                .FontSize(7.5f)
                .FontColor(Grey);

            row.RelativeItem()
                .Text(Display(value))
                .FontSize(7.5f)
                .Bold()
                .FontColor(Navy);
        });
    }

    // =========================================================
    // BILL TO / SHIP TO
    // =========================================================

    private static void BuildAddresses(
        IContainer container,
        Booking booking)
    {
        container.Row(row =>
        {
            row.RelativeItem()
                .Element(x =>
                    AddressCard(
                        x,
                        "Bill To",
                        booking.SenderName,
                        booking.SenderPhone,
                        booking.FromCity,
                        booking.FromState));

            row.ConstantItem(13);

            row.RelativeItem()
                .Element(x =>
                    AddressCard(
                        x,
                        "Ship To",
                        booking.ReceiverName,
                        booking.ReceiverPhone,
                        booking.ToCity,
                        booking.ToState));
        });
    }

    private static void AddressCard(
        IContainer container,
        string title,
        string? name,
        string? phone,
        string? city,
        string? state)
    {
        container
            .Height(116)
            .Background(LightBlue)
            .Border(1)
            .BorderColor(Border)
            .Padding(11)
            .Column(column =>
            {
                column.Item()
                    .Width(95)
                    .Background(Blue)
                    .PaddingVertical(6)
                    .AlignCenter()
                    .Text(title)
                    .FontSize(10)
                    .Bold()
                    .FontColor(Colors.White);

                column.Item()
                    .PaddingTop(10)
                    .Text(Display(name))
                    .FontSize(11)
                    .Bold()
                    .FontColor(Navy);

                column.Item()
                    .PaddingTop(6)
                    .Text(
                        Location(
                            city,
                            state))
                    .FontSize(8);

                column.Item()
                    .PaddingTop(5)
                    .Text(text =>
                    {
                        text.DefaultTextStyle(
                            style =>
                                style.FontSize(8));

                        text.Span("Phone: ")
                            .Bold();

                        text.Span(
                            Display(phone));
                    });
            });
    }

    // =========================================================
    // ITEMS TABLE
    // =========================================================

    private static void BuildItems(
        IContainer container,
        Invoice invoice)
    {
        container
            .Border(1)
            .BorderColor(Border)
            .Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(30);
                    columns.RelativeColumn(4.1f);
                    columns.RelativeColumn(1.25f);
                    columns.RelativeColumn(1.65f);
                    columns.RelativeColumn(1.75f);
                });

                table.Header(header =>
                {
                    TableHeader(
                        header.Cell(),
                        "#",
                        true);

                    TableHeader(
                        header.Cell(),
                        "Description",
                        false);

                    TableHeader(
                        header.Cell(),
                        "Quantity",
                        true);

                    TableHeader(
                        header.Cell(),
                        "Rate",
                        true);

                    TableHeader(
                        header.Cell(),
                        "Amount",
                        true);
                });

                int number = 1;

                foreach (var item in invoice.InvoiceItems)
                {
                    TableCell(
                        table.Cell(),
                        number.ToString(),
                        true);

                    TableCell(
                        table.Cell(),
                        item.Description,
                        false);

                    TableCell(
                        table.Cell(),
                        item.Quantity.ToString(),
                        true);

                    TableCell(
                        table.Cell(),
                        Money(item.Rate),
                        true);

                    TableCell(
                        table.Cell(),
                        Money(item.Amount),
                        true);

                    number++;
                }

                table.Cell()
                    .ColumnSpan(2)
                    .Background(LightBlue)
                    .PaddingVertical(8)
                    .PaddingHorizontal(8)
                    .Text("Sub Total")
                    .FontSize(9)
                    .Bold()
                    .FontColor(Navy);

                table.Cell()
                    .Background(LightBlue)
                    .PaddingVertical(8)
                    .AlignCenter()
                    .Text(
                        invoice.InvoiceItems
                            .Sum(x => x.Quantity)
                            .ToString())
                    .FontSize(9)
                    .Bold();

                table.Cell()
                    .Background(LightBlue)
                    .Text("");

                table.Cell()
                    .Background(LightBlue)
                    .PaddingVertical(8)
                    .PaddingHorizontal(8)
                    .AlignRight()
                    .Text(
                        Money(invoice.SubTotal))
                    .FontSize(9)
                    .Bold()
                    .FontColor(Navy);
            });
    }

    private static void TableHeader(
        IContainer container,
        string value,
        bool center)
    {
        var cell = container
            .Background(Blue)
            .PaddingVertical(8)
            .PaddingHorizontal(6);

        if (center)
        {
            cell
                .AlignCenter()
                .Text(value)
                .FontSize(8)
                .Bold()
                .FontColor(Colors.White);
        }
        else
        {
            cell
                .Text(value)
                .FontSize(8)
                .Bold()
                .FontColor(Colors.White);
        }
    }

    private static void TableCell(
        IContainer container,
        string? value,
        bool center)
    {
        var cell = container
            .MinHeight(34)
            .BorderBottom(1)
            .BorderColor(Border)
            .PaddingVertical(8)
            .PaddingHorizontal(6);

        if (center)
        {
            cell
                .AlignCenter()
                .Text(Display(value))
                .FontSize(8);
        }
        else
        {
            cell
                .Text(Display(value))
                .FontSize(8);
        }
    }

    // =========================================================
    // SHIPMENT + AMOUNT DETAILS
    // =========================================================

    private static void BuildBottom(
        IContainer container,
        Invoice invoice,
        Booking booking)
    {
        container.Row(row =>
        {
            row.RelativeItem()
                .Height(166)
                .Border(1)
                .BorderColor(Border)
                .Column(column =>
                {
                    column.Item()
                        .Background(LightBlue)
                        .PaddingVertical(8)
                        .PaddingHorizontal(10)
                        .Text("Shipment Details")
                        .FontSize(10)
                        .Bold()
                        .FontColor(Navy);

                    column.Item()
                        .PaddingHorizontal(11)
                        .PaddingTop(11)
                        .Element(x =>
                            DetailRow(
                                x,
                                "Booking No:",
                                booking.BookingNumber));

                    column.Item()
                        .PaddingHorizontal(11)
                        .PaddingTop(8)
                        .Element(x =>
                            DetailRow(
                                x,
                                "Pickup:",
                                Location(
                                    booking.FromCity,
                                    booking.FromState)));

                    column.Item()
                        .PaddingHorizontal(11)
                        .PaddingTop(8)
                        .Element(x =>
                            DetailRow(
                                x,
                                "Delivery:",
                                Location(
                                    booking.ToCity,
                                    booking.ToState)));

                    column.Item()
                        .PaddingHorizontal(11)
                        .PaddingTop(8)
                        .Element(x =>
                            DetailRow(
                                x,
                                "Customer:",
                                booking.SenderName));

                    column.Item()
                        .PaddingHorizontal(11)
                        .PaddingTop(8)
                        .Element(x =>
                            DetailRow(
                                x,
                                "Phone:",
                                booking.SenderPhone));
                });

            row.ConstantItem(13);

            row.RelativeItem()
                .Height(166)
                .Border(1)
                .BorderColor(Border)
                .Column(column =>
                {
                    column.Item()
                        .Background(LightBlue)
                        .PaddingVertical(8)
                        .PaddingHorizontal(10)
                        .Text("Amount Details")
                        .FontSize(10)
                        .Bold()
                        .FontColor(Navy);

                    column.Item()
                        .PaddingHorizontal(11)
                        .PaddingTop(10)
                        .Element(x =>
                            AmountRow(
                                x,
                                "Sub Total",
                                Money(invoice.SubTotal)));

                    column.Item()
                        .PaddingHorizontal(11)
                        .PaddingTop(7)
                        .Element(x =>
                            AmountRow(
                                x,
                                $"GST @ {invoice.GstPercentage:0.##}%",
                                Money(invoice.GstAmount)));

                    column.Item()
                        .PaddingHorizontal(11)
                        .PaddingTop(7)
                        .Element(x =>
                            AmountRow(
                                x,
                                "Discount",
                                Money(invoice.DiscountAmount)));

                    column.Item()
                        .PaddingTop(9)
                        .Background(LightBlue)
                        .PaddingVertical(9)
                        .PaddingHorizontal(11)
                        .Row(total =>
                        {
                            total.RelativeItem()
                                .Text("Total Amount")
                                .FontSize(10)
                                .Bold()
                                .FontColor(Navy);

                            total.RelativeItem()
                                .AlignRight()
                                .Text(
                                    Money(
                                        invoice.TotalAmount))
                                .FontSize(10)
                                .Bold()
                                .FontColor(Navy);
                        });

                    column.Item()
                        .PaddingHorizontal(11)
                        .PaddingTop(10)
                        .Row(payment =>
                        {
                            payment.RelativeItem()
                                .Text("Payment Status")
                                .FontSize(8);

                            payment.RelativeItem()
                                .AlignRight()
                                .Text(
                                    Display(
                                        invoice.PaymentStatus))
                                .FontSize(9)
                                .Bold()
                                .FontColor(
                                    IsPaid(
                                        invoice.PaymentStatus)
                                        ? Green
                                        : Amber);
                        });
                });
        });
    }

    private static void DetailRow(
        IContainer container,
        string label,
        string? value)
    {
        container.Row(row =>
        {
            row.ConstantItem(66)
                .Text(label)
                .FontSize(7.5f)
                .FontColor(Grey);

            row.RelativeItem()
                .Text(Display(value))
                .FontSize(7.5f)
                .Bold()
                .FontColor(Navy);
        });
    }

    private static void AmountRow(
        IContainer container,
        string label,
        string value)
    {
        container
            .BorderBottom(1)
            .BorderColor(Border)
            .PaddingBottom(6)
            .Row(row =>
            {
                row.RelativeItem()
                    .Text(label)
                    .FontSize(8);

                row.RelativeItem()
                    .AlignRight()
                    .Text(value)
                    .FontSize(8)
                    .Bold();
            });
    }

    // =========================================================
    // FOOTER
    // =========================================================

    private static void BuildFooter(
        IContainer container)
    {
        container
            .PaddingBottom(3)
            .Column(column =>
            {
                column.Item()
                    .Row(row =>
                    {
                        row.RelativeItem()
                            .PaddingTop(6)
                            .LineHorizontal(1)
                            .LineColor(Blue);

                        row.ConstantItem(215)
                            .AlignCenter()
                            .Text(
                                "Thank you for choosing ASK GROUP")
                            .FontSize(8.5f)
                            .Bold()
                            .Italic()
                            .FontColor(Navy);

                        row.RelativeItem()
                            .PaddingTop(6)
                            .LineHorizontal(1)
                            .LineColor(Blue);
                    });

                column.Item()
                    .PaddingTop(5)
                    .AlignCenter()
                    .Text(
                        "ASK GROUP  |  Transport & Logistics")
                    .FontSize(6.5f)
                    .FontColor(Grey);
            });
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private static string Display(
        string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? "-"
            : value;
    }

    private static string Location(
        string? city,
        string? state)
    {
        return $"{Display(city)}, {Display(state)}";
    }

    private static string Money(
        decimal amount)
    {
        return $"Rs. {amount:N2}";
    }

    private static bool IsPaid(
        string? status)
    {
        return string.Equals(
            status,
            "Paid",
            StringComparison.OrdinalIgnoreCase);
    }
}
