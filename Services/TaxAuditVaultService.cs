namespace ASK.Group.Api.Services;

using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

public class TaxAuditVaultService : ITaxAuditVaultService
{
    private static readonly List<TaxAuditVaultEntry> _entries =
    [
        new()
        {
            Id = "tax-1",
            AuditPeriodQuarter = "Q3 FY 2026-27",
            TaxFilingType = GstTaxFilingType.Gstr1B2B,
            DocumentReferenceNo = "INV-2026-OCT-88124",
            PartyGstin = "08AABCA1234F1Z5",
            PartyLegalName = "Hindustan Unilever Ltd",
            TaxableFreightAmountInr = 1845000m,
            CgstAmountInr = 0m,
            SgstAmountInr = 0m,
            IgstAmountInr = 221400m,
            RcmApplicable = false,
            RcmTaxLiabilityInr = 0m,
            Section194CTdsDeductedInr = 36900m,
            TdsCertificateNumber = "TDS-HUL-OCT-9901",
            FilingStatus = "READY_FOR_PORTAL"
        },
        new()
        {
            Id = "tax-2",
            AuditPeriodQuarter = "Q3 FY 2026-27",
            TaxFilingType = GstTaxFilingType.RcmFivePercent,
            DocumentReferenceNo = "INV-2026-OCT-77192",
            PartyGstin = "27AAACR4412K1ZX",
            PartyLegalName = "Reliance Retail Ventures Ltd",
            TaxableFreightAmountInr = 920000m,
            CgstAmountInr = 23000m,
            SgstAmountInr = 23000m,
            IgstAmountInr = 0m,
            RcmApplicable = true,
            RcmTaxLiabilityInr = 46000m,
            Section194CTdsDeductedInr = 18400m,
            TdsCertificateNumber = "TDS-REL-OCT-4410",
            FilingStatus = "READY_FOR_PORTAL"
        },
        new()
        {
            Id = "tax-3",
            AuditPeriodQuarter = "Q3 FY 2026-27",
            TaxFilingType = GstTaxFilingType.Tds194C26As,
            DocumentReferenceNo = "TDS-SUB-OCT-2201",
            PartyGstin = "07AAJCR9012L1Z9",
            PartyLegalName = "Sharma Roadlines Market Transporter",
            TaxableFreightAmountInr = 640000m,
            CgstAmountInr = 0m,
            SgstAmountInr = 0m,
            IgstAmountInr = 0m,
            RcmApplicable = false,
            RcmTaxLiabilityInr = 0m,
            Section194CTdsDeductedInr = 6400m,
            TdsCertificateNumber = "FORM26AS-OCT-8802",
            FilingStatus = "FILED_ACKNOWLEDGED"
        }
    ];

    public Task<List<TaxAuditVaultEntry>> GetTaxAuditEntriesAsync(string? quarter, GstTaxFilingType? filingType)
    {
        var query = _entries.AsEnumerable();
        if (!string.IsNullOrEmpty(quarter))
        {
            query = query.Where(e => e.AuditPeriodQuarter.Equals(quarter, StringComparison.OrdinalIgnoreCase));
        }
        if (filingType.HasValue)
        {
            query = query.Where(e => e.TaxFilingType == filingType.Value);
        }
        return Task.FromResult(query.ToList());
    }

    public Task<TaxAuditVaultEntry> GenerateTaxAuditEntryAsync(TaxAuditVaultEntry entry)
    {
        _entries.Insert(0, entry);
        return Task.FromResult(entry);
    }

    public Task<TaxAuditVaultEntry?> MarkEntryFiledAsync(string id, string acknowledgmentRef)
    {
        var item = _entries.FirstOrDefault(e => e.Id == id);
        if (item != null)
        {
            item.FilingStatus = "FILED_ACKNOWLEDGED";
            item.TdsCertificateNumber = acknowledgmentRef;
        }
        return Task.FromResult(item);
    }
}
