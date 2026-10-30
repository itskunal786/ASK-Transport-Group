import { request } from './api';
import type { TaxAuditVaultEntry, GstTaxFilingType } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getTaxAuditEntries(quarter?: string, filingType?: GstTaxFilingType): Promise<TaxAuditVaultEntry[]> {
  const params = new URLSearchParams();
  if (quarter) params.append('quarter', quarter);
  if (filingType) params.append('filingType', filingType);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await request<ApiResponse<TaxAuditVaultEntry[]>>(`/tax-audit-vault${qs}`);
  return res.data;
}

export async function generateTaxAuditEntry(entry: Partial<TaxAuditVaultEntry>): Promise<TaxAuditVaultEntry> {
  const res = await request<ApiResponse<TaxAuditVaultEntry>>('/tax-audit-vault', {
    method: 'POST',
    body: JSON.stringify(entry),
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function markEntryFiled(id: string, acknowledgmentRef: string): Promise<TaxAuditVaultEntry> {
  const res = await request<ApiResponse<TaxAuditVaultEntry>>(
    `/tax-audit-vault/${encodeURIComponent(id)}/mark-filed?acknowledgmentRef=${encodeURIComponent(acknowledgmentRef)}`,
    { method: 'POST' }
  );
  return res.data;
}
