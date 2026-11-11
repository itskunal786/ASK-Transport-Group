namespace ASK.Group.Api.Services;

public class WorkflowSecurityService
{
    public bool IsValidId(int id)
    {
        return id > 0;
    }

    public bool IsValidText(
        string? value,
        int maxLength = 500)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        return value.Trim().Length <= maxLength;
    }

    public string CleanText(
        string? value)
    {
        return value?.Trim()
            ?? string.Empty;
    }

    public bool IsValidOtp(
        string? otp)
    {
        if (string.IsNullOrWhiteSpace(otp))
        {
            return false;
        }

        otp = otp.Trim();

        return otp.Length == 6 &&
               otp.All(char.IsDigit);
    }
}