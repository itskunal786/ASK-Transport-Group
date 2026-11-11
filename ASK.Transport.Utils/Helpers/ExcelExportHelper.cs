using System.Text;

namespace ASK.Transport.Utils.Helpers;

public static class ExcelExportHelper
{
    public static byte[] GenerateCsvBytes<T>(
        IEnumerable<T> data,
        Func<T, string> rowFormatter,
        string header)
    {
        var sb = new StringBuilder();
        sb.AppendLine(header);
        foreach (var item in data)
        {
            sb.AppendLine(rowFormatter(item));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
