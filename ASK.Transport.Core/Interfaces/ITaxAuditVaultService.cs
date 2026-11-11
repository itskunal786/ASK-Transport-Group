namespace ASK.Group.Api.Application.Common.Interfaces;

using ASK.Group.Api.Domain.Entities;
using ASK.Group.Api.Domain.Enums;

public interface ITaxAuditVaultService
{
    Task<List<TaxAuditVaultEntry>> GetTaxAuditEntriesAsync(string? quarter, GstTaxFilingType? filingType);
    Task<TaxAuditVaultEntry> GenerateTaxAuditEntryAsync(TaxAuditVaultEntry entry);
    Task<TaxAuditVaultEntry?> MarkEntryFiledAsync(string id, string acknowledgmentRef);
}
