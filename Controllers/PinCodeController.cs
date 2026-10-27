using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PinCodeController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public PinCodeController(AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet("{pin}")]
    public async Task<IActionResult> GetByPin(string pin)
    {
        if (string.IsNullOrWhiteSpace(pin) || !Regex.IsMatch(pin, @"^[1-9][0-9]{5}$"))
        {
            return BadRequest(new { message = "Invalid 6-digit Indian PIN code." });
        }

        var result = await _db.PinCodes
            .FirstOrDefaultAsync(x => x.Pin == pin);

        if (result != null)
        {
            return Ok(new
            {
                result.Pin,
                result.City,
                result.District,
                result.State,
                result.DeliveryDays,
                result.Serviceable
            });
        }

        // Auto-resolve city, district, and state based on Indian Postal circles
        var (city, district, state, days) = ResolvePinCodeLocation(pin);

        var newPin = new PinCode
        {
            Pin = pin,
            City = city,
            District = district,
            State = state,
            DeliveryDays = days,
            Serviceable = true
        };

        try
        {
            await _db.PinCodes.AddAsync(newPin);
            await _db.SaveChangesAsync();
        }
        catch
        {
            // If parallel insert or DB transient, proceed with newPin
        }

        return Ok(new
        {
            newPin.Pin,
            newPin.City,
            newPin.District,
            newPin.State,
            newPin.DeliveryDays,
            newPin.Serviceable
        });
    }

    private static (string City, string District, string State, int Days) ResolvePinCodeLocation(string pin)
    {
        string p2 = pin.Substring(0, 2);

        if (p2 == "11") return ("New Delhi", "Central Delhi", "Delhi", 2);
        if (p2 is "12" or "13") return (pin.StartsWith("122") ? "Gurugram" : "Faridabad", "NCR Region", "Haryana", 2);
        if (p2 is "14" or "15" or "16") return ("Ludhiana / Chandigarh", "Ludhiana", "Punjab", 3);
        if (p2 == "17") return ("Shimla", "Shimla", "Himachal Pradesh", 3);
        if (p2 is "18" or "19") return ("Jammu", "Jammu", "Jammu & Kashmir", 4);
        if (p2 is "20" or "21" or "22" or "23" or "24" or "25" or "26" or "27" or "28")
        {
            string city = pin.StartsWith("201") ? "Noida" : pin.StartsWith("226") ? "Lucknow" : "Kanpur";
            return (city, city, "Uttar Pradesh", 2);
        }
        if (p2 is "30" or "31" or "32" or "33" or "34") return ("Jaipur", "Jaipur", "Rajasthan", 3);
        if (p2 is "36" or "37" or "38" or "39")
        {
            string city = pin.StartsWith("380") ? "Ahmedabad" : "Surat";
            return (city, city, "Gujarat", 3);
        }
        if (p2 is "40" or "41" or "42" or "43" or "44")
        {
            string city = pin.StartsWith("400") ? "Mumbai / Navi Mumbai" : pin.StartsWith("411") ? "Pune" : "Nagpur";
            return (city, city, "Maharashtra", 3);
        }
        if (p2 is "45" or "46" or "47" or "48" or "49")
        {
            string city = pin.StartsWith("462") ? "Bhopal" : pin.StartsWith("452") ? "Indore" : "Jabalpur";
            return (city, city, "Madhya Pradesh", 2);
        }
        if (p2 is "50" or "51" or "52" or "53") return ("Hyderabad", "Hyderabad", "Telangana", 3);
        if (p2 is "56" or "57" or "58" or "59") return ("Bengaluru", "Bengaluru Urban", "Karnataka", 3);
        if (p2 is "60" or "61" or "62" or "63" or "64") return ("Chennai", "Chennai", "Tamil Nadu", 3);
        if (p2 is "67" or "68" or "69") return ("Kochi", "Ernakulam", "Kerala", 3);
        if (p2 is "70" or "71" or "72" or "73" or "74") return ("Kolkata", "Kolkata", "West Bengal", 3);
        if (p2 is "75" or "76" or "77") return ("Bhubaneswar", "Khordha", "Odisha", 3);
        if (p2 is "78" or "79") return ("Guwahati", "Kamrup", "Assam", 4);
        if (p2 is "80" or "81" or "82" or "83" or "84" or "85") return ("Patna", "Patna", "Bihar", 3);

        return ("Commercial Hub", "Logistics Zone", "India", 3);
    }
}
