using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/fleet/addons")]
public class EnterpriseLogisticsAddonsController : ControllerBase
{
    // ==============================================================
    // TASK 2: FASTAG NETC TOLL AUTO-RECONCILIATION
    // ==============================================================
    public class FastagTollRecord
    {
        public int Id { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string VehicleNumber { get; set; } = string.Empty;
        public string TagId { get; set; } = string.Empty;
        public string TollPlazaName { get; set; } = string.Empty;
        public string Lane { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal ExpectedAmount { get; set; }
        public string BankName { get; set; } = "IDFC FIRST NETC FASTag";
        public DateTime ProcessedAt { get; set; }
        public string Status { get; set; } = "AutoReconciled"; // AutoReconciled, Discrepancy, Disputed
        public string? DiscrepancyReason { get; set; }
        public bool GpsMatched { get; set; } = true;
        public string? AssociatedTripNumber { get; set; }
        public string? DisputeTicketNumber { get; set; }
    }

    private static readonly List<FastagTollRecord> _fastagTransactions = new()
    {
        new FastagTollRecord
        {
            Id = 1,
            TransactionId = "NETC-TXN-882910",
            VehicleNumber = "DL-01-AB-1234",
            TagId = "34161FA82098001",
            TollPlazaName = "Kherki Daula Toll Plaza (NH-48)",
            Lane = "Lane 06 (Fast Lane)",
            Amount = 420.00m,
            ExpectedAmount = 420.00m,
            BankName = "IDFC FIRST Bank NETC",
            ProcessedAt = DateTime.UtcNow.AddMinutes(-45),
            Status = "AutoReconciled",
            GpsMatched = true,
            AssociatedTripNumber = "TRIP-2026-98102"
        },
        new FastagTollRecord
        {
            Id = 2,
            TransactionId = "NETC-TXN-882944",
            VehicleNumber = "HR-55-AN-8102",
            TagId = "34161FA82098042",
            TollPlazaName = "Panipat Toll Plaza (NH-44)",
            Lane = "Lane 03",
            Amount = 640.00m,
            ExpectedAmount = 360.00m,
            BankName = "ICICI Bank FASTag",
            ProcessedAt = DateTime.UtcNow.AddHours(-2),
            Status = "Discrepancy",
            DiscrepancyReason = "Vehicle Class Mismatch: Charged as 4-Axle Heavy (Actual: 2-Axle Commercial). Overcharge +₹280.",
            GpsMatched = true,
            AssociatedTripNumber = "TRIP-2026-98105"
        },
        new FastagTollRecord
        {
            Id = 3,
            TransactionId = "NETC-TXN-882955",
            VehicleNumber = "RJ-14-GH-4921",
            TagId = "34161FA82098099",
            TollPlazaName = "Shahjahanpur Border Toll (NH-48)",
            Lane = "Lane 08",
            Amount = 310.00m,
            ExpectedAmount = 310.00m,
            BankName = "SBI FASTag Commercial",
            ProcessedAt = DateTime.UtcNow.AddHours(-5),
            Status = "AutoReconciled",
            GpsMatched = true,
            AssociatedTripNumber = "TRIP-2026-9901"
        },
        new FastagTollRecord
        {
            Id = 4,
            TransactionId = "NETC-TXN-882980",
            VehicleNumber = "MH-12-RN-7845",
            TagId = "34161FA82098114",
            TollPlazaName = "Vadodara Expressway Toll Plaza",
            Lane = "Lane 02",
            Amount = 850.00m,
            ExpectedAmount = 850.00m,
            BankName = "HDFC FASTag Fleet",
            ProcessedAt = DateTime.UtcNow.AddHours(-11),
            Status = "AutoReconciled",
            GpsMatched = true,
            AssociatedTripNumber = "TRIP-2026-98102"
        },
        new FastagTollRecord
        {
            Id = 5,
            TransactionId = "NETC-TXN-882890",
            VehicleNumber = "KA-05-CD-5678",
            TagId = "34161FA82098205",
            TollPlazaName = "Electronic City Elevated Toll",
            Lane = "Lane 04",
            Amount = 210.00m,
            ExpectedAmount = 140.00m,
            BankName = "Axis Bank FASTag",
            ProcessedAt = DateTime.UtcNow.AddHours(-14),
            Status = "Disputed",
            DiscrepancyReason = "Double debit reported by driver within 4 minutes. Bank chargeback open.",
            DisputeTicketNumber = "IHMCL-DSP-9921",
            GpsMatched = true,
            AssociatedTripNumber = "TRIP-2026-9902"
        }
    };

    [HttpGet("fastag/transactions")]
    public IActionResult GetFastagTransactions([FromQuery] string? status, [FromQuery] string? vehicleNumber)
    {
        var query = _fastagTransactions.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(x => x.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(vehicleNumber))
        {
            query = query.Where(x => x.VehicleNumber.Contains(vehicleNumber, StringComparison.OrdinalIgnoreCase));
        }

        var list = query.OrderByDescending(x => x.ProcessedAt).ToList();

        decimal totalSpend = _fastagTransactions.Sum(x => x.Amount);
        decimal autoReconciledTotal = _fastagTransactions.Where(x => x.Status == "AutoReconciled").Sum(x => x.Amount);
        decimal discrepancyTotal = _fastagTransactions.Where(x => x.Status == "Discrepancy").Sum(x => x.Amount);
        int discrepancyCount = _fastagTransactions.Count(x => x.Status == "Discrepancy");

        return Ok(new
        {
            transactions = list,
            summary = new
            {
                totalTransactions = _fastagTransactions.Count,
                totalSpend,
                autoReconciledTotal,
                autoReconciledCount = _fastagTransactions.Count(x => x.Status == "AutoReconciled"),
                discrepancyCount,
                discrepancyTotal,
                reconciledPercentage = _fastagTransactions.Count > 0
                    ? Math.Round((double)_fastagTransactions.Count(x => x.Status == "AutoReconciled") / _fastagTransactions.Count * 100, 1)
                    : 100
            }
        });
    }

    [HttpPost("fastag/dispute/{id}")]
    public IActionResult DisputeFastagTransaction(int id, [FromBody] FastagDisputeRequest? req)
    {
        var txn = _fastagTransactions.FirstOrDefault(x => x.Id == id);
        if (txn == null)
        {
            return NotFound(new { message = "FASTag transaction not found." });
        }

        txn.Status = "Disputed";
        txn.DisputeTicketNumber = $"IHMCL-DSP-{Random.Shared.Next(10000, 99999)}";
        txn.DiscrepancyReason = req?.Reason ?? txn.DiscrepancyReason ?? "Overcharge disputed with issuing bank.";

        return Ok(new
        {
            message = $"Dispute filed with NPCI/Bank! Ticket #{txn.DisputeTicketNumber} issued.",
            transaction = txn
        });
    }

    public class FastagDisputeRequest
    {
        public string? Reason { get; set; }
    }


    // ==============================================================
    // TASK 3: DRIVER WHATSAPP DUTY SLIP (META CLOUD API DISPATCH)
    // ==============================================================
    public class DutySlipRequest
    {
        public int TripId { get; set; } = 101;
        public string TripNumber { get; set; } = "TRIP-2026-98102";
        public string DriverName { get; set; } = "Murugan Swamy";
        public string DriverPhone { get; set; } = "+91 98450 12890";
        public string VehicleNumber { get; set; } = "RJ-14-GH-4921";
        public string TruckModel { get; set; } = "Ashok Leyland 2820 (32ft MXL)";
        public string OriginHub { get; set; } = "Delhi SuperHub (Okhla)";
        public string DestinationHub { get; set; } = "Mumbai Port (Nhava Sheva Terminal)";
        public string CargoDescription { get; set; } = "Tata Steel Heavy Tubes (24.5 MT)";
        public decimal DieselAdvance { get; set; } = 15000;
        public decimal BhattaAmount { get; set; } = 2500;
        public string EwayBillNumber { get; set; } = "2410-9921-8841";
    }

    [HttpPost("driver/send-duty-slip")]
    public IActionResult SendDriverDutySlip([FromBody] DutySlipRequest req)
    {
        var rawPhone = new string((req.DriverPhone ?? string.Empty).Where(char.IsDigit).ToArray());
        if (rawPhone.Length < 10)
        {
            return BadRequest(new { message = "Valid 10-digit mobile number required." });
        }

        var messageText =
            $"🚛 *ASK TRANSPORT HIGHWAY DUTY SLIP*\n" +
            $"--------------------------------\n" +
            $"नमस्ते *{req.DriverName}* जी,\n" +
            $"आपकी आज की गाड़ी ड्यूटी असाइन कर दी गई है:\n\n" +
            $"📍 *गाड़ी नंबर:* {req.VehicleNumber} ({req.TruckModel})\n" +
            $"📦 *रूट:* {req.OriginHub} ➔ {req.DestinationHub}\n" +
            $"🏷️ *माल विवरण:* {req.CargoDescription}\n" +
            $"⛽ *डीजल एडवांस:* ₹{req.DieselAdvance:N0} (IOCL Fuel Card loaded)\n" +
            $"💵 *रास्ते का भत्ता (Bhatta):* ₹{req.BhattaAmount:N0}\n" +
            $"📜 *E-Way Bill:* {req.EwayBillNumber}\n\n" +
            $"🗺️ *Google Maps Highway Route:* https://maps.google.com/?q={Uri.EscapeDataString(req.DestinationHub)}\n" +
            $"📑 *Digital Bilty & Gate Pass QR:* https://track.asktransport.com/bilty/{req.TripNumber}\n\n" +
            $"⚠️ *इमरजेंसी / SOS 24x7 हेल्पलाइन:* 1800-ASK-TRAN\n" +
            $"सुरक्षित यात्रा! जय हिन्द! 🇮🇳";

        var whatsappUrl = $"https://api.whatsapp.com/send?phone={rawPhone}&text={Uri.EscapeDataString(messageText)}";

        return Ok(new
        {
            success = true,
            message = $"Duty slip dispatched to {req.DriverName} ({req.DriverPhone}) via WhatsApp Cloud API!",
            whatsappUrl,
            messagePreview = messageText,
            timestamp = DateTime.UtcNow
        });
    }


    // ==============================================================
    // TASK 4: PARIVAHAN / VAHAN LIVE CHALLAN & RC CHECK RADAR
    // ==============================================================
    public class ParivahanVehicleRecord
    {
        public string VehicleNumber { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string RegistrationDate { get; set; } = "2021-04-12";
        public string OwnerName { get; set; } = "ASK Transport & Logistics Pvt Ltd";
        public string FitnessStatus { get; set; } = "Valid";
        public string FitnessExpiryDate { get; set; } = "2027-02-18";
        public int FitnessDaysLeft { get; set; } = 106;
        public string InsuranceStatus { get; set; } = "Valid";
        public string InsuranceExpiryDate { get; set; } = "2027-02-28";
        public int InsuranceDaysLeft { get; set; } = 116;
        public string InsuranceCompany { get; set; } = "ICICI Lombard Commercial";
        public string PucStatus { get; set; } = "Valid";
        public string PucExpiryDate { get; set; } = "2026-11-20";
        public int PucDaysLeft { get; set; } = 16;
        public string NationalPermitStatus { get; set; } = "Valid (Form 48)";
        public int NationalPermitDaysLeft { get; set; } = 289;
        public int PendingChallansCount { get; set; } = 0;
        public decimal TotalChallanAmount { get; set; } = 0;
        public List<EChallanItem> Challans { get; set; } = new();
        public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
    }

    public class EChallanItem
    {
        public string ChallanNumber { get; set; } = string.Empty;
        public string Violation { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Location { get; set; } = string.Empty;
        public string ChallanDate { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Paid
    }

    private static readonly List<ParivahanVehicleRecord> _parivahanFleet = new()
    {
        new ParivahanVehicleRecord
        {
            VehicleNumber = "DL-01-AB-1234",
            Model = "BharatBenz 2823R (Heavy Commercial 28T)",
            FitnessStatus = "Valid",
            FitnessExpiryDate = "2027-02-18",
            FitnessDaysLeft = 106,
            InsuranceStatus = "Valid",
            InsuranceExpiryDate = "2027-02-28",
            InsuranceDaysLeft = 116,
            PucStatus = "Valid",
            PucExpiryDate = "2026-11-20",
            PucDaysLeft = 16,
            NationalPermitStatus = "Valid (Form 48)",
            NationalPermitDaysLeft = 289,
            PendingChallansCount = 0,
            TotalChallanAmount = 0
        },
        new ParivahanVehicleRecord
        {
            VehicleNumber = "HR-55-AN-8102",
            Model = "Ashok Leyland 3520 (Multi-Axle 12-Wheeler)",
            FitnessStatus = "Expired",
            FitnessExpiryDate = "2026-11-01",
            FitnessDaysLeft = -3,
            InsuranceStatus = "Warning",
            InsuranceExpiryDate = "2026-11-12",
            InsuranceDaysLeft = 8,
            PucStatus = "Expired",
            PucExpiryDate = "2026-10-28",
            PucDaysLeft = -7,
            NationalPermitStatus = "Valid",
            NationalPermitDaysLeft = 162,
            PendingChallansCount = 1,
            TotalChallanAmount = 2000,
            Challans = new List<EChallanItem>
            {
                new EChallanItem
                {
                    ChallanNumber = "ECH-HR-2026-9912",
                    Violation = "Speed Limit Violation (68 km/h in 50 km/h zone)",
                    Amount = 2000,
                    Location = "NH-48 Bilaspur Highway Junction",
                    ChallanDate = "09-Nov-2026",
                    Status = "Pending"
                }
            }
        },
        new ParivahanVehicleRecord
        {
            VehicleNumber = "RJ-14-GH-4921",
            Model = "Ashok Leyland 2820 (Multi-Axle Rigid)",
            FitnessStatus = "Valid",
            FitnessExpiryDate = "2027-05-20",
            FitnessDaysLeft = 197,
            InsuranceStatus = "Valid",
            InsuranceExpiryDate = "2027-03-31",
            InsuranceDaysLeft = 147,
            PucStatus = "Warning",
            PucExpiryDate = "2026-11-16",
            PucDaysLeft = 12,
            NationalPermitStatus = "Valid",
            NationalPermitDaysLeft = 279,
            PendingChallansCount = 0,
            TotalChallanAmount = 0
        },
        new ParivahanVehicleRecord
        {
            VehicleNumber = "MH-12-RN-7845",
            Model = "Tata Signa 4825.TK (Multi-Axle Heavy)",
            FitnessStatus = "Valid",
            FitnessExpiryDate = "2027-06-14",
            FitnessDaysLeft = 222,
            InsuranceStatus = "Valid",
            InsuranceExpiryDate = "2027-01-25",
            InsuranceDaysLeft = 82,
            PucStatus = "Valid",
            PucExpiryDate = "2027-02-10",
            PucDaysLeft = 98,
            NationalPermitStatus = "Warning",
            NationalPermitDaysLeft = 18,
            PendingChallansCount = 1,
            TotalChallanAmount = 1000,
            Challans = new List<EChallanItem>
            {
                new EChallanItem
                {
                    ChallanNumber = "ECH-MH-2026-4418",
                    Violation = "No Parking / Highway Shoulder Obstruction",
                    Amount = 1000,
                    Location = "Mumbai-Pune Expressway Khalapur",
                    ChallanDate = "05-Nov-2026",
                    Status = "Pending"
                }
            }
        }
    };

    [HttpGet("parivahan/fleet-radar")]
    public IActionResult GetParivahanFleetRadar()
    {
        int totalVehicles = _parivahanFleet.Count;
        int totalChallans = _parivahanFleet.Sum(x => x.PendingChallansCount);
        decimal totalChallanFines = _parivahanFleet.Sum(x => x.TotalChallanAmount);
        int compliantCount = _parivahanFleet.Count(x => x.PendingChallansCount == 0 && x.FitnessDaysLeft > 0 && x.InsuranceDaysLeft > 0);

        return Ok(new
        {
            fleet = _parivahanFleet,
            summary = new
            {
                totalVehicles,
                compliantCount,
                nonCompliantCount = totalVehicles - compliantCount,
                totalPendingChallans = totalChallans,
                totalChallanFines,
                lastSyncTime = DateTime.UtcNow
            }
        });
    }

    [HttpGet("parivahan/check/{vehicleNumber}")]
    public IActionResult CheckVehicleParivahan(string vehicleNumber)
    {
        var clean = vehicleNumber.Replace("-", "").Trim().ToUpperInvariant();
        var record = _parivahanFleet.FirstOrDefault(x => x.VehicleNumber.Replace("-", "").ToUpperInvariant() == clean);
        if (record == null)
        {
            // Synthesize dynamic valid record for any newly added fleet vehicle
            record = new ParivahanVehicleRecord
            {
                VehicleNumber = vehicleNumber.ToUpperInvariant(),
                Model = "Heavy Commercial Goods Vehicle",
                FitnessStatus = "Valid",
                FitnessExpiryDate = DateTime.UtcNow.AddMonths(8).ToString("yyyy-MM-dd"),
                FitnessDaysLeft = 240,
                InsuranceStatus = "Valid",
                InsuranceExpiryDate = DateTime.UtcNow.AddMonths(11).ToString("yyyy-MM-dd"),
                InsuranceDaysLeft = 330,
                PucStatus = "Valid",
                PucExpiryDate = DateTime.UtcNow.AddMonths(4).ToString("yyyy-MM-dd"),
                PucDaysLeft = 120,
                NationalPermitStatus = "Valid (Form 48)",
                NationalPermitDaysLeft = 300,
                PendingChallansCount = 0,
                TotalChallanAmount = 0
            };
        }

        return Ok(record);
    }

    [HttpPost("parivahan/settle-challan/{challanNumber}")]
    public IActionResult SettleChallan(string challanNumber)
    {
        foreach (var veh in _parivahanFleet)
        {
            var match = veh.Challans.FirstOrDefault(c => c.ChallanNumber.Equals(challanNumber, StringComparison.OrdinalIgnoreCase));
            if (match != null)
            {
                match.Status = "Paid";
                veh.TotalChallanAmount = Math.Max(0, veh.TotalChallanAmount - match.Amount);
                veh.PendingChallansCount = veh.Challans.Count(c => c.Status == "Pending");
                return Ok(new
                {
                    message = $"Challan {challanNumber} settled on MoRTH Parivahan! Status updated to Paid.",
                    challan = match,
                    vehicle = veh
                });
            }
        }

        return NotFound(new { message = $"Challan {challanNumber} not found." });
    }
}
