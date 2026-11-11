using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PinCodeController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private static readonly HttpClient _httpClient = new() { Timeout = TimeSpan.FromSeconds(4) };

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

        // 1. Check local database cache first
        var cached = await _db.PinCodes
            .FirstOrDefaultAsync(x => x.Pin == pin);

        if (cached != null)
        {
            return Ok(new
            {
                cached.Pin,
                cached.City,
                cached.District,
                cached.State,
                cached.DeliveryDays,
                cached.Serviceable
            });
        }

        // 2. Query official India Post API for exact post office, district, and state
        string city = "";
        string district = "";
        string state = "";
        int deliveryDays = 3;
        bool apiResponded = false;
        bool pinExists = false;

        try
        {
            var response = await _httpClient.GetStringAsync($"https://api.postalpincode.in/pincode/{pin}");
            using var doc = JsonDocument.Parse(response);
            var root = doc.RootElement;
            if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
            {
                apiResponded = true;
                var first = root[0];
                if (first.TryGetProperty("Status", out var status))
                {
                    if (status.GetString() == "Success")
                    {
                        pinExists = true;
                        if (first.TryGetProperty("PostOffice", out var poArray) && poArray.ValueKind == JsonValueKind.Array && poArray.GetArrayLength() > 0)
                        {
                            var po = poArray[0];
                            district = po.TryGetProperty("District", out var d) ? d.GetString() ?? "" : "";
                            state = po.TryGetProperty("State", out var s) ? s.GetString() ?? "" : "";
                            var poName = po.TryGetProperty("Name", out var n) ? n.GetString() ?? "" : "";
                            var division = po.TryGetProperty("Division", out var div) ? div.GetString() ?? "" : "";

                            // Clean up district name (e.g., "Raigarh(MH)" -> "Navi Mumbai", "Gurgaon" -> "Gurugram", "Bangalore" -> "Bengaluru")
                            if (!string.IsNullOrEmpty(district))
                            {
                                district = Regex.Replace(district, @"\s*\(.*?\)", "").Trim();
                                if (district.Equals("Gurgaon", StringComparison.OrdinalIgnoreCase)) district = "Gurugram";
                                if (district.Equals("Bangalore", StringComparison.OrdinalIgnoreCase)) district = "Bengaluru";
                                if (district.Equals("Raigarh", StringComparison.OrdinalIgnoreCase) && state.Equals("Maharashtra", StringComparison.OrdinalIgnoreCase)) district = "Navi Mumbai";
                                city = district;
                            }
                            else if (!string.IsNullOrEmpty(division))
                            {
                                city = division;
                                district = division;
                            }
                            else
                            {
                                city = poName;
                                district = poName;
                            }

                            if (!string.IsNullOrEmpty(poName))
                            {
                                var cleanPo = Regex.Replace(poName, @"\s*\(.*?\)", "").Trim();
                                if (cleanPo.Equals("Noida", StringComparison.OrdinalIgnoreCase)) city = "Noida";
                            }
                        }
                    }
                    else if (status.GetString() == "Error")
                    {
                        pinExists = false;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"India Post API lookup failed for {pin}: {ex.Message}");
        }

        // If India Post definitely answered and said the PIN does not exist, return 404
        if (apiResponded && !pinExists)
        {
            return NotFound(new { message = $"PIN code {pin} was not found in the official Indian postal registry." });
        }

        // 3. Fallback to Indian postal circle resolution ONLY if remote postal API was unreachable (offline mode)
        if (string.IsNullOrEmpty(city) || string.IsNullOrEmpty(state))
        {
            var fallback = ResolveFallback(pin);
            city = fallback.City;
            district = fallback.District;
            state = fallback.State;
            deliveryDays = fallback.Days;
        }

        // 4. Save to database cache for instant future lookups
        var newPin = new PinCode
        {
            Pin = pin,
            City = city,
            District = district,
            State = state,
            DeliveryDays = deliveryDays,
            Serviceable = true
        };

        try
        {
            await _db.PinCodes.AddAsync(newPin);
            await _db.SaveChangesAsync();
        }
        catch
        {
            // Ignore DB concurrency or unique key duplicate
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

    private static (string City, string District, string State, int Days) ResolveFallback(string pin)
    {
        string p2 = pin.Substring(0, 2);

        if (p2 == "11") return ("New Delhi", "Central Delhi", "Delhi", 2);
        if (p2 is "12" or "13") return (pin.StartsWith("122") ? "Gurugram" : "Faridabad", "NCR Region", "Haryana", 2);
        if (p2 is "14" or "15" or "16") return ("Ludhiana", "Ludhiana", "Punjab", 3);
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
            string city = pin.StartsWith("400") ? "Mumbai" : pin.StartsWith("411") ? "Pune" : "Nagpur";
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
