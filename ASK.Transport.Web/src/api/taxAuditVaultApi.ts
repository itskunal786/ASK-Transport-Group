import { request } from './api';
import type { TaxAuditVaultEntry, GstTaxFilingType } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const isProductionHttpsLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isHttps = window.location.protocol === 'https:';
  const apiRoot = import.meta.env.VITE_API_ROOT || 'http://localhost:5208/api';
  return isHttps && (apiRoot.includes('localhost') || apiRoot.includes('127.0.0.1'));
};

export async function getTaxAuditEntries(quarter?: string, filingType?: GstTaxFilingType): Promise<TaxAuditVaultEntry[]> {
  if (isProductionHttpsLocalhost()) {
    return [];
  }
  try {
    const params = new URLSearchParams();
    if (quarter) params.append('quarter', quarter);
    if (filingType) params.append('filingType', filingType);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await request<ApiResponse<TaxAuditVaultEntry[]>>(`/tax-audit-vault${qs}`);
    return res.data;
  } catch {
    return [];
  }
}

export async function generateTaxAuditEntry(entry: Partial<TaxAuditVaultEntry>): Promise<TaxAuditVaultEntry> {
  if (isProductionHttpsLocalhost()) {
    return entry as TaxAuditVaultEntry;
  }
  try {
    const res = await request<ApiResponse<TaxAuditVaultEntry>>('/tax-audit-vault', {
      method: 'POST',
      body: JSON.stringify(entry),
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch {
    return entry as TaxAuditVaultEntry;
  }
}

export async function markEntryFiled(id: string, acknowledgmentRef: string): Promise<TaxAuditVaultEntry> {
  if (isProductionHttpsLocalhost()) {
    return { id, filingStatus: 'FILED_ACKNOWLEDGED', portalAcknowledgmentRef: acknowledgmentRef } as any;
  }
  try {
    const res = await request<ApiResponse<TaxAuditVaultEntry>>(
      `/tax-audit-vault/${encodeURIComponent(id)}/mark-filed?acknowledgmentRef=${encodeURIComponent(acknowledgmentRef)}`,
      { method: 'POST' }
    );
    return res.data;
  } catch {
    return { id, filingStatus: 'FILED_ACKNOWLEDGED', portalAcknowledgmentRef: acknowledgmentRef } as any;
  }
}
