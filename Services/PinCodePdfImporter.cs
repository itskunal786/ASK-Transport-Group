using System.Text.RegularExpressions;
using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;
using UglyToad.PdfPig;

namespace ASK.Group.Api.Services;

public sealed class PinCodePdfImporter
{
    private readonly AskTransportDbContext _db;

    public PinCodePdfImporter(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<int> ImportAsync(
        string pdfPath)
    {
        if (!File.Exists(pdfPath))
        {
            throw new FileNotFoundException(
                "PIN code PDF not found.",
                pdfPath);
        }

        var records =
            new Dictionary<string, PinCode>();

        using var document =
            PdfDocument.Open(pdfPath);

        foreach (var page in document.GetPages())
        {
            var words =
                page.GetWords()
                    .OrderByDescending(x => x.BoundingBox.Bottom)
                    .ThenBy(x => x.BoundingBox.Left)
                    .ToList();

            var lines =
                words.GroupBy(
                        x => Math.Round(
                            x.BoundingBox.Bottom / 3) * 3)
                    .OrderByDescending(x => x.Key);

            foreach (var line in lines)
            {
                var text =
                    string.Join(
                        " ",
                        line.OrderBy(
                                x => x.BoundingBox.Left)
                            .Select(x => x.Text));

                text =
                    Regex.Replace(
                        text,
                        @"\s+",
                        " ")
                    .Trim();

                var match =
                    Regex.Match(
                        text,
                        @"^(.*?)\s+(\d{6})\s+(.+)$");

                if (!match.Success)
                {
                    continue;
                }

                var postOffice =
                    match.Groups[1]
                        .Value
                        .Trim();

                var pin =
                    match.Groups[2]
                        .Value
                        .Trim();

                var state =
                    match.Groups[3]
                        .Value
                        .Trim();

                if (string.IsNullOrWhiteSpace(
                        postOffice) ||
                    string.IsNullOrWhiteSpace(
                        state))
                {
                    continue;
                }

                if (!Regex.IsMatch(
                        pin,
                        @"^[1-9][0-9]{5}$"))
                {
                    continue;
                }

                if (!records.ContainsKey(pin))
                {
                    records[pin] =
                        new PinCode
                        {
                            Pin = pin,

                            // PDF contains Post Office,
                            // PIN and State.
                            City = postOffice,

                            District =
                                string.Empty,

                            State = state,

                            DeliveryDays = 3,

                            Serviceable = true
                        };
                }
            }
        }

        Console.WriteLine(
            $"PDF PIN records found: {records.Count}");

        if (records.Count == 0)
        {
            throw new Exception(
                "No PIN codes could be extracted from PDF.");
        }

        var existingPins =
            await _db.PinCodes
                .Select(x => x.Pin)
                .ToHashSetAsync();

        var newRecords =
            records.Values
                .Where(
                    x =>
                        !existingPins.Contains(
                            x.Pin))
                .ToList();

        if (newRecords.Count == 0)
        {
            Console.WriteLine(
                "All PIN codes already exist.");

            return 0;
        }

        const int batchSize = 1000;

        var imported = 0;

        for (var i = 0;
             i < newRecords.Count;
             i += batchSize)
        {
            var batch =
                newRecords
                    .Skip(i)
                    .Take(batchSize)
                    .ToList();

            await _db.PinCodes
                .AddRangeAsync(batch);

            await _db.SaveChangesAsync();

            imported += batch.Count;

            Console.WriteLine(
                $"Imported: {imported} / {newRecords.Count}");

            _db.ChangeTracker.Clear();
        }

        return imported;
    }
}
