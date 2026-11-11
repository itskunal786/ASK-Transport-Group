using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/enterprise")]
public class EnterpriseB2BController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    private static readonly object _syncLock = new();

    public EnterpriseB2BController(AskTransportDbContext db, AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    // =========================================================================
    // IN-MEMORY STORAGE: BULK BOOKING BATCHES
    // =========================================================================
    private static readonly List<BulkBatchRecord> _bulkBatches = new()
    {
        new BulkBatchRecord
        {
            BatchId = "BATCH-2026-9801",
            BatchTitle = "Bajaj Auto Chakan Factory - October Vendor Supplies",
            ShipperName = "Bajaj Auto Industrial Division",
            ShipperGstin = "27AAACB2894G1Z2",
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            TotalRecords = 45,
            TotalWeightKg = 14250,
            TotalPackages = 180,
            TotalFreightAmount = 184500,
            Status = "Dispatched",
            Bilties = GenerateSeedBilties("BATCH-2026-9801", 5, 88100)
        }
    };

    private static List<GeneratedBiltyDto> GenerateSeedBilties(string batchId, int count, int startLr)
    {
        var list = new List<GeneratedBiltyDto>();
        var sampleConsignees = new[]
        {
            ("Hero MotoCorp Ancillary Hub", "Gurugram, Haryana", 122050, 420.0, 12, 5400),
            ("Mahindra Logistics Park", "Zaheerabad, Telangana", 502220, 850.0, 25, 9800),
            ("Tata Motors Sanand Vendor Hub", "Ahmedabad, Gujarat", 382170, 310.0, 8, 4100),
            ("TVS Motor Hosur Assembly Depot", "Hosur, Tamil Nadu", 635109, 640.0, 16, 7600),
            ("Eicher Commercial Vehicles Hub", "Pithampur, Madhya Pradesh", 454775, 590.0, 14, 6900)
        };

        for (int i = 0; i < count; i++)
        {
            var c = sampleConsignees[i % sampleConsignees.Length];
            int lrNum = startLr + i;
            list.Add(new GeneratedBiltyDto
            {
                LrNumber = $"ASK-LR-2026-{lrNum}",
                Barcode = $"*ASK{lrNum}*",
                ConsigneeName = c.Item1,
                ConsigneeCity = c.Item2,
                Pincode = c.Item3.ToString(),
                GoodsDescription = "Auto Electrical Wiring Harness & ECU Boxes",
                Packages = c.Item5,
                WeightKg = c.Item4,
                FreightAmount = c.Item6,
                PaymentMode = "To-Pay",
                TrackingUrl = $"/track?lr=ASK-LR-2026-{lrNum}"
            });
        }
        return list;
    }

    // =========================================================================
    // IN-MEMORY STORAGE: REVERSE AUCTION SPOT MARKETPLACE
    // =========================================================================
    private static readonly List<MarketplaceLoad> _marketplaceLoads = new()
    {
        new MarketplaceLoad
        {
            Id = 1,
            LoadNumber = "LOAD-2026-9041",
            ShipperName = "Bharat Heavy Electricals (BHEL)",
            OriginHub = "Pune Chakan Auto Cluster, Maharashtra",
            DestinationHub = "Gurugram IMT Manesar Hub, Haryana",
            DistanceKm = 1450,
            CargoDescription = "Industrial Transformer Coils & Heavy Gearboxes",
            WeightTons = 16.5,
            RequiredTruckType = "32 Ft MXL Container (Multi-Axle)",
            TargetBudget = 82000,
            CurrentLowestBid = 74500,
            AuctionExpiryTime = DateTime.UtcNow.AddMinutes(28),
            Status = "ActiveAuction",
            WinningTransporter = null,
            AcceptedRate = null,
            BrokerageFeeEarned = null,
            Bids = new List<MarketplaceBid>
            {
                new MarketplaceBid
                {
                    Id = 101,
                    LoadId = 1,
                    TransporterName = "Apex Highway Freight Carriers",
                    TransporterPhone = "+91 98220 54100",
                    Rating = 4.9,
                    TotalTripsCompleted = 340,
                    TruckNumber = "MH-14-EM-4890",
                    OfferedRate = 74500,
                    EtaPickupHours = 2,
                    BidPlacedAt = DateTime.UtcNow.AddMinutes(-5),
                    IsSelected = false
                },
                new MarketplaceBid
                {
                    Id = 102,
                    LoadId = 1,
                    TransporterName = "Punjab Golden Roadways",
                    TransporterPhone = "+91 98140 12890",
                    Rating = 4.8,
                    TotalTripsCompleted = 512,
                    TruckNumber = "PB-10-CZ-9912",
                    OfferedRate = 77000,
                    EtaPickupHours = 4,
                    BidPlacedAt = DateTime.UtcNow.AddMinutes(-14),
                    IsSelected = false
                },
                new MarketplaceBid
                {
                    Id = 103,
                    LoadId = 1,
                    TransporterName = "Jaipur Golden Logistics",
                    TransporterPhone = "+91 94140 67320",
                    Rating = 4.7,
                    TotalTripsCompleted = 210,
                    TruckNumber = "RJ-14-GC-5531",
                    OfferedRate = 79500,
                    EtaPickupHours = 5,
                    BidPlacedAt = DateTime.UtcNow.AddMinutes(-22),
                    IsSelected = false
                }
            }
        },
        new MarketplaceLoad
        {
            Id = 2,
            LoadNumber = "LOAD-2026-9042",
            ShipperName = "Jindal Steel & Power Ltd",
            OriginHub = "Bhiwandi Logistics Park, Maharashtra",
            DestinationHub = "Kolkata Dankuni Freight Hub, West Bengal",
            DistanceKm = 1950,
            CargoDescription = "Structural Steel TMT Rods & Galvanized Wire Coils",
            WeightTons = 24.0,
            RequiredTruckType = "40 Ft High-Bed Trailer (Triple-Axle)",
            TargetBudget = 118000,
            CurrentLowestBid = 104000,
            AuctionExpiryTime = DateTime.UtcNow.AddMinutes(54),
            Status = "ActiveAuction",
            WinningTransporter = null,
            AcceptedRate = null,
            BrokerageFeeEarned = null,
            Bids = new List<MarketplaceBid>
            {
                new MarketplaceBid
                {
                    Id = 201,
                    LoadId = 2,
                    TransporterName = "East-West National Transport",
                    TransporterPhone = "+91 93310 44520",
                    Rating = 4.8,
                    TotalTripsCompleted = 420,
                    TruckNumber = "WB-23-C-8819",
                    OfferedRate = 104000,
                    EtaPickupHours = 3,
                    BidPlacedAt = DateTime.UtcNow.AddMinutes(-10),
                    IsSelected = false
                },
                new MarketplaceBid
                {
                    Id = 202,
                    LoadId = 2,
                    TransporterName = "Nagpur Heavy Haulers",
                    TransporterPhone = "+91 97650 23114",
                    Rating = 4.6,
                    TotalTripsCompleted = 180,
                    TruckNumber = "MH-31-AP-7023",
                    OfferedRate = 109500,
                    EtaPickupHours = 6,
                    BidPlacedAt = DateTime.UtcNow.AddMinutes(-35),
                    IsSelected = false
                }
            }
        },
        new MarketplaceLoad
        {
            Id = 3,
            LoadNumber = "LOAD-2026-9043",
            ShipperName = "Pidilite Industries Ltd",
            OriginHub = "Ahmedabad Naroda GIDC, Gujarat",
            DestinationHub = "Chennai Sriperumbudur Hub, Tamil Nadu",
            DistanceKm = 1780,
            CargoDescription = "Industrial Adhesives & Polymer Barrels",
            WeightTons = 12.0,
            RequiredTruckType = "24 Ft Multi-Axle Container",
            TargetBudget = 69000,
            CurrentLowestBid = 62500,
            AuctionExpiryTime = DateTime.UtcNow.AddMinutes(40),
            Status = "ActiveAuction",
            WinningTransporter = null,
            AcceptedRate = null,
            BrokerageFeeEarned = null,
            Bids = new List<MarketplaceBid>
            {
                new MarketplaceBid
                {
                    Id = 301,
                    LoadId = 3,
                    TransporterName = "South Express Logistics",
                    TransporterPhone = "+91 94440 88219",
                    Rating = 4.9,
                    TotalTripsCompleted = 610,
                    TruckNumber = "TN-02-BQ-4120",
                    OfferedRate = 62500,
                    EtaPickupHours = 2,
                    BidPlacedAt = DateTime.UtcNow.AddMinutes(-8),
                    IsSelected = false
                }
            }
        }
    };

    // =========================================================================
    // IN-MEMORY STORAGE: REVERSE LOGISTICS & RTO CASES
    // =========================================================================
    private static readonly List<RtoReturnCase> _rtoCases = new()
    {
        new RtoReturnCase
        {
            Id = 1,
            CaseNumber = "RTO-2026-5501",
            OriginalBookingNumber = "ASK-BK-9182",
            OriginalLrNumber = "ASK-LR-2026-98102",
            ReverseLrNumber = "ASK-RLR-2026-3301",
            ReturnReason = "Damaged in Transit / Water Ingress",
            DamageSeverity = "Major Goods Damaged",
            CustomerRefundClaimed = 48500,
            DamagePhotoUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
            OriginFactory = "North Star Auto Components (Pune Factory)",
            ConsigneeWhoRejected = "Speedcraft Motors Depot (Gurugram)",
            CurrentReverseHub = "Agra Central Transit Hub, UP",
            Status = "Reverse_In_Transit",
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddHours(-6),
            Timeline = new List<RtoTimelineEvent>
            {
                new RtoTimelineEvent { Timestamp = DateTime.UtcNow.AddDays(-2), Title = "Delivery Refused by Consignee", Description = "Consignee refused 6 carton boxes due to torn polythene & water damage during highway transit.", Location = "Gurugram Delivery Point" },
                new RtoTimelineEvent { Timestamp = DateTime.UtcNow.AddDays(-2).AddHours(2), Title = "Reverse LR Issued", Description = "Automated Reverse LR ASK-RLR-2026-3301 created with barcode tag.", Location = "Delhi Regional Hub" },
                new RtoTimelineEvent { Timestamp = DateTime.UtcNow.AddHours(-18), Title = "Reverse Vehicle Dispatched", Description = "Loaded onto truck MH-12-RN-7845 heading back to Pune source hub.", Location = "Agra Central Hub" }
            }
        },
        new RtoReturnCase
        {
            Id = 2,
            CaseNumber = "RTO-2026-5502",
            OriginalBookingNumber = "ASK-BK-9040",
            OriginalLrNumber = "ASK-LR-2026-96541",
            ReverseLrNumber = "ASK-RLR-2026-3302",
            ReturnReason = "Wrong Part Numbers Dispatched by Factory",
            DamageSeverity = "None - Intact Return",
            CustomerRefundClaimed = 0,
            DamagePhotoUrl = "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400",
            OriginFactory = "Electronica India Pvt Ltd (Bengaluru)",
            ConsigneeWhoRejected = "Sunlight Assemblers (Ahmedabad)",
            CurrentReverseHub = "Bengaluru Peenya Origin Depot",
            Status = "Restocked_To_Factory",
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow.AddDays(-1),
            Timeline = new List<RtoTimelineEvent>
            {
                new RtoTimelineEvent { Timestamp = DateTime.UtcNow.AddDays(-5), Title = "Consignee Return Requested", Description = "Wrong model code printed on invoice. Consignee initiated return.", Location = "Ahmedabad Consignee Depot" },
                new RtoTimelineEvent { Timestamp = DateTime.UtcNow.AddDays(-3), Title = "Reverse Highway Transit Completed", Description = "Consignment cleared Surat & Pune intermediate hubs safely.", Location = "In-Transit" },
                new RtoTimelineEvent { Timestamp = DateTime.UtcNow.AddDays(-1), Title = "Quality Gate Passed & Restocked", Description = "Goods checked by QC team at Electronica Peenya and re-inventoried.", Location = "Peenya Origin Warehouse" }
            }
        }
    };

    // =========================================================================
    // FEATURE 1: BULK EXCEL / CSV BOOKING ENGINE ENDPOINTS
    // =========================================================================

    [HttpGet("bulk-booking/sample-template")]
    public IActionResult GetBulkSampleTemplate()
    {
        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("ConsignorName,ConsigneeName,ConsigneePhone,DeliveryAddress,Pincode,City,GoodsDescription,PackageCount,WeightKg,DeclaredValue,PaymentMode");
        csvBuilder.AppendLine("Tata Motors Ltd,North Star Auto,9811044219,Plot 88 Phase 2 IMT Manesar,122050,Gurugram,Auto Gear Castings,24,650.0,78000,To-Pay");
        csvBuilder.AppendLine("Bajaj Industrial,Speedway Logistics,9823011452,Warehouse 4 GIDC Naroda,382330,Ahmedabad,Two-Wheeler Brake Discs,16,420.0,46000,Prepaid");
        csvBuilder.AppendLine("Bharat Forge Ltd,Kirloskar Engine Hub,9890044123,Plot 14 Industrial Area,560058,Bengaluru,Forged Crankshafts,8,890.0,125000,To-Pay");
        csvBuilder.AppendLine("Mahindra Auto,Apex Assemblies,9711033214,Gala 102 Sector 8,201301,Noida,Engine Mount Brackets,30,510.0,62000,COD");
        csvBuilder.AppendLine("Lucas TVS Ltd,Southern Auto Spares,9444012891,Ambattur Estate Road 3,600058,Chennai,Alternator Assemblies,18,340.0,55000,Prepaid");

        return Ok(new
        {
            sampleCsv = csvBuilder.ToString(),
            instructions = "Upload or paste comma-separated values (CSV) with valid 6-digit Indian PIN codes and 10-digit mobile numbers."
        });
    }

    [HttpPost("bulk-booking/preview")]
    public IActionResult PreviewBulkConsignments([FromBody] BulkPreviewRequest request)
    {
        var items = new List<BulkConsignmentItem>();

        if (!string.IsNullOrWhiteSpace(request.CsvText))
        {
            var lines = request.CsvText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            int rowIdx = 1;
            bool isHeader = true;

            foreach (var line in lines)
            {
                var trimmed = line.Trim();
                if (string.IsNullOrWhiteSpace(trimmed)) continue;

                var cols = ParseCsvLine(trimmed);
                if (cols.Count < 6) continue;

                if (isHeader && (cols[0].Equals("ConsignorName", StringComparison.OrdinalIgnoreCase) || cols[0].Contains("Consignor", StringComparison.OrdinalIgnoreCase)))
                {
                    isHeader = false;
                    continue;
                }
                isHeader = false;

                var item = new BulkConsignmentItem
                {
                    RowIndex = rowIdx++,
                    ConsignorName = cols.ElementAtOrDefault(0) ?? "Factory Shipper",
                    ConsigneeName = cols.ElementAtOrDefault(1) ?? "Consignee Partner",
                    ConsigneePhone = cols.ElementAtOrDefault(2) ?? "9800000000",
                    DeliveryAddress = cols.ElementAtOrDefault(3) ?? "Industrial Area Depot",
                    Pincode = cols.ElementAtOrDefault(4) ?? "411001",
                    City = cols.ElementAtOrDefault(5) ?? "Destination",
                    GoodsDescription = cols.ElementAtOrDefault(6) ?? "General Cargo",
                    PackageCount = int.TryParse(cols.ElementAtOrDefault(7), out var pk) && pk > 0 ? pk : 10,
                    WeightKg = double.TryParse(cols.ElementAtOrDefault(8), out var wt) && wt > 0 ? wt : 250.0,
                    DeclaredValue = decimal.TryParse(cols.ElementAtOrDefault(9), out var val) && val > 0 ? val : 35000,
                    PaymentMode = cols.ElementAtOrDefault(10) ?? "To-Pay"
                };

                ValidateConsignmentRow(item);
                items.Add(item);
            }
        }
        else if (request.Items != null && request.Items.Count > 0)
        {
            int r = 1;
            foreach (var it in request.Items)
            {
                it.RowIndex = r++;
                ValidateConsignmentRow(it);
                items.Add(it);
            }
        }
        else
        {
            // Seed a realistic factory demo preview
            items = GetDemoFactoryPreview();
        }

        var totalWeight = items.Sum(x => x.WeightKg);
        var totalPackages = items.Sum(x => x.PackageCount);
        var totalDeclaredVal = items.Sum(x => x.DeclaredValue);
        var totalEstFreight = items.Sum(x => x.EstimatedFreight);
        var validCount = items.Count(x => x.IsValid);
        var errorCount = items.Count(x => !x.IsValid);

        return Ok(new BulkImportPreviewResponse
        {
            TotalRecords = items.Count,
            ValidCount = validCount,
            ErrorCount = errorCount,
            TotalWeightKg = totalWeight,
            TotalPackages = totalPackages,
            TotalDeclaredValue = totalDeclaredVal,
            TotalEstimatedFreight = totalEstFreight,
            PreviewItems = items
        });
    }

    private static void ValidateConsignmentRow(BulkConsignmentItem item)
    {
        item.ValidationErrors = new List<string>();

        if (string.IsNullOrWhiteSpace(item.ConsigneeName))
            item.ValidationErrors.Add("Consignee name is required.");

        var cleanPhone = Regex.Replace(item.ConsigneePhone ?? "", @"[^\d]", "");
        if (cleanPhone.Length < 10)
            item.ValidationErrors.Add("Consignee phone must have at least 10 digits.");

        var cleanPin = Regex.Replace(item.Pincode ?? "", @"[^\d]", "");
        if (cleanPin.Length != 6)
            item.ValidationErrors.Add("Indian PIN code must be exactly 6 digits.");

        if (item.WeightKg <= 0)
            item.ValidationErrors.Add("Consignment weight must be greater than 0 kg.");

        if (item.PackageCount <= 0)
            item.PackageCount = 1;

        item.IsValid = item.ValidationErrors.Count == 0;

        // Realistic freight estimation: base ₹450 + ₹9.5 per kg + fuel surcharge (5%)
        decimal baseFreight = 450m + (decimal)item.WeightKg * 9.5m;
        item.EstimatedFreight = Math.Round(baseFreight * 1.05m, 0);
    }

    private static List<BulkConsignmentItem> GetDemoFactoryPreview()
    {
        var rawList = new List<BulkConsignmentItem>
        {
            new() { ConsignorName = "Tata AutoComp Systems Ltd", ConsigneeName = "North Star Motors", ConsigneePhone = "+91 98110 44219", DeliveryAddress = "Plot 88 Phase 2 IMT Manesar", Pincode = "122050", City = "Gurugram, HR", GoodsDescription = "Auto Gear Castings & Bearings", PackageCount = 24, WeightKg = 650.0, DeclaredValue = 78000, PaymentMode = "To-Pay" },
            new() { ConsignorName = "Tata AutoComp Systems Ltd", ConsigneeName = "Speedway Parts Depot", ConsigneePhone = "+91 98230 11452", DeliveryAddress = "Gala 14 Phase 3 GIDC Naroda", Pincode = "382330", City = "Ahmedabad, GJ", GoodsDescription = "Two-Wheeler Disc Brake Kits", PackageCount = 16, WeightKg = 420.0, DeclaredValue = 46000, PaymentMode = "Prepaid" },
            new() { ConsignorName = "Tata AutoComp Systems Ltd", ConsigneeName = "Kirloskar Power Assemblies", ConsigneePhone = "+91 98900 44123", DeliveryAddress = "Plot 14 Peenya Industrial Area", Pincode = "560058", City = "Bengaluru, KA", GoodsDescription = "Heavy Forged Crankshafts", PackageCount = 8, WeightKg = 890.0, DeclaredValue = 125000, PaymentMode = "To-Pay" },
            new() { ConsignorName = "Tata AutoComp Systems Ltd", ConsigneeName = "Apex Auto Sub-Assemblies", ConsigneePhone = "+91 97110 33214", DeliveryAddress = "Sector 8 DSIIDC Complex", Pincode = "201301", City = "Noida, UP", GoodsDescription = "Polymer Dashboards & Panels", PackageCount = 30, WeightKg = 510.0, DeclaredValue = 62000, PaymentMode = "COD" },
            new() { ConsignorName = "Tata AutoComp Systems Ltd", ConsigneeName = "Southern Auto Engineering", ConsigneePhone = "+91 94440 12891", DeliveryAddress = "Road 3 Ambattur Industrial Estate", Pincode = "600058", City = "Chennai, TN", GoodsDescription = "Alternators & Starter Motors", PackageCount = 18, WeightKg = 340.0, DeclaredValue = 55000, PaymentMode = "Prepaid" },
            new() { ConsignorName = "Tata AutoComp Systems Ltd", ConsigneeName = "Jaipur Wheels Hub", ConsigneePhone = "+91 94140 33901", DeliveryAddress = "VKI Industrial Area Road 9", Pincode = "302013", City = "Jaipur, RJ", GoodsDescription = "Alloy Wheel Rims & Studs", PackageCount = 12, WeightKg = 390.0, DeclaredValue = 42000, PaymentMode = "To-Pay" },
            new() { ConsignorName = "Tata AutoComp Systems Ltd", ConsigneeName = "Deccan Heavy Spares", ConsigneePhone = "+91 98490 88210", DeliveryAddress = "Plot 66 IDA Jeedimetla", Pincode = "500055", City = "Hyderabad, TS", GoodsDescription = "Radiators & Cooling Fans", PackageCount = 20, WeightKg = 470.0, DeclaredValue = 59000, PaymentMode = "To-Pay" },
            new() { ConsignorName = "Tata AutoComp Systems Ltd", ConsigneeName = "Central India Trans Hub", ConsigneePhone = "+91 97550 44102", DeliveryAddress = "Transport Nagar Ring Road", Pincode = "482002", City = "Jabalpur, MP", GoodsDescription = "Suspension Bushings & Shocks", PackageCount = 15, WeightKg = 360.0, DeclaredValue = 38000, PaymentMode = "Prepaid" }
        };

        int idx = 1;
        foreach (var r in rawList)
        {
            r.RowIndex = idx++;
            ValidateConsignmentRow(r);
        }
        return rawList;
    }

    [HttpPost("bulk-booking/process")]
    public IActionResult ProcessBulkBookings([FromBody] BulkProcessRequest request)
    {
        lock (_syncLock)
        {
            var itemsToProcess = request.Items ?? GetDemoFactoryPreview();
            var validItems = itemsToProcess.Where(x => x.IsValid).ToList();
            if (validItems.Count == 0)
                validItems = itemsToProcess; // Fallback to all if demo

            string batchId = $"BATCH-2026-{new Random().Next(1000, 9999)}";
            int baseLr = new Random().Next(88000, 89000);

            var generatedBilties = new List<GeneratedBiltyDto>();
            int counter = 0;

            foreach (var item in validItems)
            {
                counter++;
                int lrNum = baseLr + counter;
                string lrStr = $"ASK-LR-2026-{lrNum}";
                string barcodeStr = $"*ASK{lrNum}*";

                decimal freight = item.EstimatedFreight > 0 ? item.EstimatedFreight : Math.Round(450m + (decimal)item.WeightKg * 9.5m, 0);

                generatedBilties.Add(new GeneratedBiltyDto
                {
                    LrNumber = lrStr,
                    Barcode = barcodeStr,
                    ConsigneeName = item.ConsigneeName,
                    ConsigneeCity = $"{item.City} ({item.Pincode})",
                    Pincode = item.Pincode,
                    GoodsDescription = item.GoodsDescription,
                    Packages = item.PackageCount,
                    WeightKg = item.WeightKg,
                    FreightAmount = freight,
                    PaymentMode = item.PaymentMode,
                    TrackingUrl = $"/track?lr={lrStr}"
                });
            }

            var batchRecord = new BulkBatchRecord
            {
                BatchId = batchId,
                BatchTitle = string.IsNullOrWhiteSpace(request.BatchTitle) ? $"Corporate Dispatch Batch #{batchId}" : request.BatchTitle,
                ShipperName = request.ShipperName ?? "Tata AutoComp Systems Ltd",
                ShipperGstin = request.ShipperGstin ?? "27AABCT2081G1ZM",
                CreatedAt = DateTime.UtcNow,
                TotalRecords = generatedBilties.Count,
                TotalWeightKg = generatedBilties.Sum(x => x.WeightKg),
                TotalPackages = generatedBilties.Sum(x => x.Packages),
                TotalFreightAmount = generatedBilties.Sum(x => x.FreightAmount),
                Status = "BiltiesGenerated",
                Bilties = generatedBilties
            };

            _bulkBatches.Insert(0, batchRecord);

            return Ok(new BulkProcessResponse
            {
                BatchId = batchId,
                BatchTitle = batchRecord.BatchTitle,
                ShipperName = batchRecord.ShipperName,
                ProcessedAt = batchRecord.CreatedAt,
                TotalProcessed = generatedBilties.Count,
                TotalWeightKg = batchRecord.TotalWeightKg,
                TotalPackages = batchRecord.TotalPackages,
                TotalFreightAmount = batchRecord.TotalFreightAmount,
                GeneratedBilties = generatedBilties
            });
        }
    }

    [HttpGet("bulk-booking/batches")]
    public IActionResult GetBulkBatches()
    {
        lock (_syncLock)
        {
            return Ok(_bulkBatches);
        }
    }

    // =========================================================================
    // FEATURE 2: FREIGHT BIDDING & REVERSE AUCTION MARKETPLACE ENDPOINTS
    // =========================================================================

    [HttpGet("marketplace/loads")]
    public IActionResult GetMarketplaceLoads()
    {
        lock (_syncLock)
        {
            // Recalculate remaining seconds
            var now = DateTime.UtcNow;
            foreach (var load in _marketplaceLoads)
            {
                if (load.Status == "ActiveAuction")
                {
                    var rem = (int)(load.AuctionExpiryTime - now).TotalSeconds;
                    load.SecondsRemaining = rem > 0 ? rem : 0;
                    if (rem <= 0)
                    {
                        // Auto-expire or lock lowest bid
                        load.Status = "AuctionClosed";
                    }
                }
            }
            return Ok(_marketplaceLoads);
        }
    }

    [HttpPost("marketplace/loads")]
    public IActionResult CreateMarketplaceLoad([FromBody] CreateMarketplaceLoadRequest request)
    {
        lock (_syncLock)
        {
            int newId = _marketplaceLoads.Count > 0 ? _marketplaceLoads.Max(x => x.Id) + 1 : 1;
            string loadNo = $"LOAD-2026-{new Random().Next(9100, 9999)}";

            var load = new MarketplaceLoad
            {
                Id = newId,
                LoadNumber = loadNo,
                ShipperName = string.IsNullOrWhiteSpace(request.ShipperName) ? "ASK Spot Cargo Shipper" : request.ShipperName,
                OriginHub = request.OriginHub,
                DestinationHub = request.DestinationHub,
                DistanceKm = request.DistanceKm > 0 ? request.DistanceKm : 1200,
                CargoDescription = request.CargoDescription,
                WeightTons = request.WeightTons,
                RequiredTruckType = request.RequiredTruckType,
                TargetBudget = request.TargetBudget,
                CurrentLowestBid = request.TargetBudget,
                AuctionExpiryTime = DateTime.UtcNow.AddMinutes(request.DurationMinutes > 0 ? request.DurationMinutes : 45),
                SecondsRemaining = (request.DurationMinutes > 0 ? request.DurationMinutes : 45) * 60,
                Status = "ActiveAuction",
                WinningTransporter = null,
                AcceptedRate = null,
                BrokerageFeeEarned = null,
                Bids = new List<MarketplaceBid>()
            };

            _marketplaceLoads.Insert(0, load);

            return Ok(new { success = true, load });
        }
    }

    [HttpPost("marketplace/loads/{loadId:int}/bids")]
    public IActionResult PlaceMarketplaceBid(int loadId, [FromBody] PlaceBidRequest request)
    {
        lock (_syncLock)
        {
            var load = _marketplaceLoads.FirstOrDefault(x => x.Id == loadId);
            if (load == null)
                return NotFound(new { message = $"Load #{loadId} not found." });

            if (load.Status != "ActiveAuction")
                return BadRequest(new { message = "This freight reverse auction is already locked or closed." });

            if (request.OfferedRate >= load.CurrentLowestBid)
            {
                return BadRequest(new
                {
                    message = $"Bid must be strictly lower than the current lowest bid of ₹{load.CurrentLowestBid:N0}."
                });
            }

            int bidId = load.Bids.Count > 0 ? load.Bids.Max(x => x.Id) + 1 : (load.Id * 100) + 1;

            var newBid = new MarketplaceBid
            {
                Id = bidId,
                LoadId = load.Id,
                TransporterName = request.TransporterName,
                TransporterPhone = request.TransporterPhone,
                Rating = 4.8,
                TotalTripsCompleted = new Random().Next(120, 650),
                TruckNumber = request.TruckNumber,
                OfferedRate = request.OfferedRate,
                EtaPickupHours = request.EtaPickupHours > 0 ? request.EtaPickupHours : 3,
                BidPlacedAt = DateTime.UtcNow,
                IsSelected = false
            };

            load.Bids.Insert(0, newBid);
            load.CurrentLowestBid = request.OfferedRate;

            return Ok(new
            {
                success = true,
                message = $"Bid ₹{request.OfferedRate:N0} submitted successfully! You are now the lowest bidder.",
                load
            });
        }
    }

    [HttpPost("marketplace/loads/{loadId:int}/accept-bid")]
    public IActionResult AcceptWinningBid(int loadId, [FromBody] AcceptBidRequest request)
    {
        lock (_syncLock)
        {
            var load = _marketplaceLoads.FirstOrDefault(x => x.Id == loadId);
            if (load == null)
                return NotFound(new { message = $"Load #{loadId} not found." });

            var selectedBid = load.Bids.FirstOrDefault(x => x.Id == request.BidId)
                              ?? load.Bids.OrderBy(x => x.OfferedRate).FirstOrDefault();

            if (selectedBid == null)
                return BadRequest(new { message = "No valid bid found to accept." });

            // Mark bid selected
            foreach (var b in load.Bids) b.IsSelected = false;
            selectedBid.IsSelected = true;

            // Calculate ASK Transport Brokerage / Commission
            decimal margin = load.TargetBudget - selectedBid.OfferedRate;
            if (margin < 2500) margin = 3500; // Guaranteed minimum brokerage fee

            load.Status = "ContractLocked";
            load.WinningTransporter = $"{selectedBid.TransporterName} ({selectedBid.TruckNumber})";
            load.AcceptedRate = selectedBid.OfferedRate;
            load.BrokerageFeeEarned = margin;

            return Ok(new
            {
                success = true,
                message = $"🎉 Bid Accepted! Truck {selectedBid.TruckNumber} assigned. Brokerage Commission of ₹{margin:N0} secured.",
                contract = new
                {
                    loadNumber = load.LoadNumber,
                    transporter = selectedBid.TransporterName,
                    transporterPhone = selectedBid.TransporterPhone,
                    truckNumber = selectedBid.TruckNumber,
                    driverEtaHours = selectedBid.EtaPickupHours,
                    shipperPaidBudget = load.TargetBudget,
                    transporterPayable = selectedBid.OfferedRate,
                    askBrokerageCommission = margin,
                    status = "Locked & Dispatched"
                },
                load
            });
        }
    }

    // =========================================================================
    // FEATURE 3: REVERSE LOGISTICS & DAMAGED GOODS RETURN (RTO) ENDPOINTS
    // =========================================================================

    [HttpGet("reverse-logistics/cases")]
    public IActionResult GetRtoCases()
    {
        lock (_syncLock)
        {
            var totalReturns = _rtoCases.Count;
            var inTransit = _rtoCases.Count(x => x.Status == "Reverse_In_Transit");
            var totalClaims = _rtoCases.Sum(x => x.CustomerRefundClaimed);
            var restocked = _rtoCases.Count(x => x.Status == "Restocked_To_Factory");

            return Ok(new
            {
                metrics = new
                {
                    totalReturns,
                    inTransit,
                    totalClaims,
                    restocked
                },
                cases = _rtoCases
            });
        }
    }

    [HttpPost("reverse-logistics/initiate")]
    public IActionResult InitiateRtoCase([FromBody] InitiateRtoRequest request)
    {
        lock (_syncLock)
        {
            int newId = _rtoCases.Count > 0 ? _rtoCases.Max(x => x.Id) + 1 : 1;
            string caseNo = $"RTO-2026-{new Random().Next(5500, 5999)}";
            string reverseLr = $"ASK-RLR-2026-{new Random().Next(3300, 3999)}";

            var rtoCase = new RtoReturnCase
            {
                Id = newId,
                CaseNumber = caseNo,
                OriginalBookingNumber = string.IsNullOrWhiteSpace(request.OriginalBookingNumber) ? "ASK-BK-9821" : request.OriginalBookingNumber,
                OriginalLrNumber = string.IsNullOrWhiteSpace(request.OriginalLrNumber) ? "ASK-LR-2026-98102" : request.OriginalLrNumber,
                ReverseLrNumber = reverseLr,
                ReturnReason = request.ReturnReason ?? "Consignee Refused Delivery",
                DamageSeverity = request.DamageSeverity ?? "Minor Packaging Damage",
                CustomerRefundClaimed = request.ClaimAmount > 0 ? request.ClaimAmount : 0,
                DamagePhotoUrl = string.IsNullOrWhiteSpace(request.DamagePhotoUrl)
                    ? "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"
                    : request.DamagePhotoUrl,
                OriginFactory = request.OriginFactory ?? "Tata AutoComp Systems Ltd (Pune Origin Hub)",
                ConsigneeWhoRejected = request.ConsigneeWhoRejected ?? "North Star Motors (Gurugram Depot)",
                CurrentReverseHub = "Origin Transit Hub",
                Status = "RTO_Initiated",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Timeline = new List<RtoTimelineEvent>
                {
                    new RtoTimelineEvent
                    {
                        Timestamp = DateTime.UtcNow,
                        Title = "RTO Initiated & Reverse LR Generated",
                        Description = $"Reverse Waybill {reverseLr} generated. Reason: {request.ReturnReason}. Severity: {request.DamageSeverity}.",
                        Location = "Destination Hub Gate"
                    }
                }
            };

            _rtoCases.Insert(0, rtoCase);

            return Ok(new
            {
                success = true,
                message = $"✓ Reverse LR {reverseLr} generated successfully! Package scheduled for return transit.",
                rtoCase
            });
        }
    }

    [HttpPost("reverse-logistics/cases/{caseId:int}/status")]
    public IActionResult UpdateRtoStatus(int caseId, [FromBody] UpdateRtoStatusRequest request)
    {
        lock (_syncLock)
        {
            var rtoCase = _rtoCases.FirstOrDefault(x => x.Id == caseId);
            if (rtoCase == null)
                return NotFound(new { message = $"RTO Case #{caseId} not found." });

            rtoCase.Status = request.Status;
            rtoCase.UpdatedAt = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(request.CurrentHub))
                rtoCase.CurrentReverseHub = request.CurrentHub;

            rtoCase.Timeline.Insert(0, new RtoTimelineEvent
            {
                Timestamp = DateTime.UtcNow,
                Title = request.Status.Replace("_", " "),
                Description = request.Notes ?? $"Status milestone updated to {request.Status}.",
                Location = request.CurrentHub ?? rtoCase.CurrentReverseHub
            });

            return Ok(new
            {
                success = true,
                message = $"RTO Case #{caseId} updated to {request.Status}.",
                rtoCase
            });
        }
    }

    // CSV Helper: basic CSV column parser supporting quotes
    private static List<string> ParseCsvLine(string line)
    {
        var result = new List<string>();
        var sb = new StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];
            if (c == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(sb.ToString().Trim());
                sb.Clear();
            }
            else
            {
                sb.Append(c);
            }
        }
        result.Add(sb.ToString().Trim());
        return result;
    }
}

// =============================================================================
// DTOs & DATA MODELS
// =============================================================================

public class BulkPreviewRequest
{
    public string? CsvText { get; set; }
    public List<BulkConsignmentItem>? Items { get; set; }
}

public class BulkConsignmentItem
{
    public int RowIndex { get; set; }
    public string ConsignorName { get; set; } = "";
    public string ConsigneeName { get; set; } = "";
    public string ConsigneePhone { get; set; } = "";
    public string DeliveryAddress { get; set; } = "";
    public string Pincode { get; set; } = "";
    public string City { get; set; } = "";
    public string GoodsDescription { get; set; } = "";
    public int PackageCount { get; set; } = 1;
    public double WeightKg { get; set; } = 100.0;
    public decimal DeclaredValue { get; set; } = 15000;
    public string PaymentMode { get; set; } = "To-Pay";
    public decimal EstimatedFreight { get; set; }
    public bool IsValid { get; set; } = true;
    public List<string> ValidationErrors { get; set; } = new();
}

public class BulkImportPreviewResponse
{
    public int TotalRecords { get; set; }
    public int ValidCount { get; set; }
    public int ErrorCount { get; set; }
    public double TotalWeightKg { get; set; }
    public int TotalPackages { get; set; }
    public decimal TotalDeclaredValue { get; set; }
    public decimal TotalEstimatedFreight { get; set; }
    public List<BulkConsignmentItem> PreviewItems { get; set; } = new();
}

public class BulkProcessRequest
{
    public string? BatchTitle { get; set; }
    public string? ShipperName { get; set; }
    public string? ShipperGstin { get; set; }
    public List<BulkConsignmentItem>? Items { get; set; }
}

public class BulkProcessResponse
{
    public string BatchId { get; set; } = "";
    public string BatchTitle { get; set; } = "";
    public string ShipperName { get; set; } = "";
    public DateTime ProcessedAt { get; set; }
    public int TotalProcessed { get; set; }
    public double TotalWeightKg { get; set; }
    public int TotalPackages { get; set; }
    public decimal TotalFreightAmount { get; set; }
    public List<GeneratedBiltyDto> GeneratedBilties { get; set; } = new();
}

public class BulkBatchRecord
{
    public string BatchId { get; set; } = "";
    public string BatchTitle { get; set; } = "";
    public string ShipperName { get; set; } = "";
    public string ShipperGstin { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public int TotalRecords { get; set; }
    public double TotalWeightKg { get; set; }
    public int TotalPackages { get; set; }
    public decimal TotalFreightAmount { get; set; }
    public string Status { get; set; } = "Generated";
    public List<GeneratedBiltyDto> Bilties { get; set; } = new();
}

public class GeneratedBiltyDto
{
    public string LrNumber { get; set; } = "";
    public string Barcode { get; set; } = "";
    public string ConsigneeName { get; set; } = "";
    public string ConsigneeCity { get; set; } = "";
    public string Pincode { get; set; } = "";
    public string GoodsDescription { get; set; } = "";
    public int Packages { get; set; }
    public double WeightKg { get; set; }
    public decimal FreightAmount { get; set; }
    public string PaymentMode { get; set; } = "To-Pay";
    public string TrackingUrl { get; set; } = "";
}

// Marketplace Models
public class MarketplaceLoad
{
    public int Id { get; set; }
    public string LoadNumber { get; set; } = "";
    public string ShipperName { get; set; } = "";
    public string OriginHub { get; set; } = "";
    public string DestinationHub { get; set; } = "";
    public int DistanceKm { get; set; }
    public string CargoDescription { get; set; } = "";
    public double WeightTons { get; set; }
    public string RequiredTruckType { get; set; } = "";
    public decimal TargetBudget { get; set; }
    public decimal CurrentLowestBid { get; set; }
    public DateTime AuctionExpiryTime { get; set; }
    public int SecondsRemaining { get; set; }
    public string Status { get; set; } = "ActiveAuction";
    public string? WinningTransporter { get; set; }
    public decimal? AcceptedRate { get; set; }
    public decimal? BrokerageFeeEarned { get; set; }
    public List<MarketplaceBid> Bids { get; set; } = new();
}

public class MarketplaceBid
{
    public int Id { get; set; }
    public int LoadId { get; set; }
    public string TransporterName { get; set; } = "";
    public string TransporterPhone { get; set; } = "";
    public double Rating { get; set; } = 4.8;
    public int TotalTripsCompleted { get; set; }
    public string TruckNumber { get; set; } = "";
    public decimal OfferedRate { get; set; }
    public int EtaPickupHours { get; set; } = 3;
    public DateTime BidPlacedAt { get; set; }
    public bool IsSelected { get; set; }
}

public class CreateMarketplaceLoadRequest
{
    public string? ShipperName { get; set; }
    public string OriginHub { get; set; } = "";
    public string DestinationHub { get; set; } = "";
    public int DistanceKm { get; set; }
    public string CargoDescription { get; set; } = "";
    public double WeightTons { get; set; }
    public string RequiredTruckType { get; set; } = "";
    public decimal TargetBudget { get; set; }
    public int DurationMinutes { get; set; } = 45;
}

public class PlaceBidRequest
{
    public string TransporterName { get; set; } = "";
    public string TransporterPhone { get; set; } = "";
    public string TruckNumber { get; set; } = "";
    public decimal OfferedRate { get; set; }
    public int EtaPickupHours { get; set; } = 3;
}

public class AcceptBidRequest
{
    public int BidId { get; set; }
}

// RTO Models
public class RtoReturnCase
{
    public int Id { get; set; }
    public string CaseNumber { get; set; } = "";
    public string OriginalBookingNumber { get; set; } = "";
    public string OriginalLrNumber { get; set; } = "";
    public string ReverseLrNumber { get; set; } = "";
    public string ReturnReason { get; set; } = "";
    public string DamageSeverity { get; set; } = "";
    public decimal CustomerRefundClaimed { get; set; }
    public string DamagePhotoUrl { get; set; } = "";
    public string OriginFactory { get; set; } = "";
    public string ConsigneeWhoRejected { get; set; } = "";
    public string CurrentReverseHub { get; set; } = "";
    public string Status { get; set; } = "RTO_Initiated";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<RtoTimelineEvent> Timeline { get; set; } = new();
}

public class RtoTimelineEvent
{
    public DateTime Timestamp { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Location { get; set; } = "";
}

public class InitiateRtoRequest
{
    public string? OriginalBookingNumber { get; set; }
    public string? OriginalLrNumber { get; set; }
    public string? ReturnReason { get; set; }
    public string? DamageSeverity { get; set; }
    public decimal ClaimAmount { get; set; }
    public string? DamagePhotoUrl { get; set; }
    public string? OriginFactory { get; set; }
    public string? ConsigneeWhoRejected { get; set; }
}

public class UpdateRtoStatusRequest
{
    public string Status { get; set; } = "";
    public string? CurrentHub { get; set; }
    public string? Notes { get; set; }
}
