import { request } from './api';
import type { CorporateCargoClaim } from '../types/transportOperations';

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

export async function getAllCargoClaims(): Promise<CorporateCargoClaim[]> {
  if (isProductionHttpsLocalhost()) {
    return [];
  }
  try {
    const res = await request<ApiResponse<CorporateCargoClaim[]>>('/cargo-claims');
    return res.data;
  } catch {
    return [];
  }
}

export async function createCargoClaim(claim: Partial<CorporateCargoClaim>): Promise<CorporateCargoClaim> {
  if (isProductionHttpsLocalhost()) {
    return claim as CorporateCargoClaim;
  }
  try {
    const res = await request<ApiResponse<CorporateCargoClaim>>('/cargo-claims', {
      method: 'POST',
      body: JSON.stringify(claim),
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch {
    return claim as CorporateCargoClaim;
  }
}

export async function issueClaimDebitNote(id: string, debitRef: string, agreedAmount: number): Promise<CorporateCargoClaim> {
  if (isProductionHttpsLocalhost()) {
    return { id, debitNoteRefNo: debitRef, settledAmountInr: agreedAmount } as any;
  }
  try {
    const res = await request<ApiResponse<CorporateCargoClaim>>(
      `/cargo-claims/${encodeURIComponent(id)}/issue-debit-note?debitRef=${encodeURIComponent(debitRef)}&agreedAmount=${agreedAmount}`,
      { method: 'POST' }
    );
    return res.data;
  } catch {
    return { id, debitNoteRefNo: debitRef, settledAmountInr: agreedAmount } as any;
  }
}
