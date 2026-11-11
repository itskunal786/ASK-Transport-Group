using System.Reflection;
using System.Text;

namespace ASK.Group.Api.Services;

public class CsvExportService
{
    public byte[] Generate<T>(
        IEnumerable<T> data)
    {
        var rows =
            data.ToList();

        var properties =
            typeof(T)
                .GetProperties(
                    BindingFlags.Public |
                    BindingFlags.Instance);

        var builder =
            new StringBuilder();

        builder.AppendLine(
            string.Join(
                ",",
                properties.Select(x =>
                    Escape(x.Name))));

        foreach (var row in rows)
        {
            builder.AppendLine(
                string.Join(
                    ",",
                    properties.Select(x =>
                        Escape(
                            x.GetValue(row)?
                                .ToString()
                            ?? string.Empty))));
        }

        return Encoding.UTF8
            .GetBytes(
                builder.ToString());
    }

    private static string Escape(
        string value)
    {
        if (value.Contains(',') ||
            value.Contains('"') ||
            value.Contains('\n') ||
            value.Contains('\r'))
        {
            value =
                value.Replace(
                    "\"",
                    "\"\"");

            return $"\"{value}\"";
        }

        return value;
    }
}