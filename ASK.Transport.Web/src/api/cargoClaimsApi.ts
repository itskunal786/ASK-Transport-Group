import { request } from './api';
import type { CorporateCargoClaim } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getAllCargoClaims(): Promise<CorporateCargoClaim[]> {
  const res = await request<ApiResponse<CorporateCargoClaim[]>>('/cargo-claims');
  return res.data;
}

export async function createCargoClaim(claim: Partial<CorporateCargoClaim>): Promise<CorporateCargoClaim> {
  const res = await request<ApiResponse<CorporateCargoClaim>>('/cargo-claims', {
    method: 'POST',
    body: JSON.stringify(claim),
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function issueClaimDebitNote(id: string, debitRef: string, agreedAmount: number): Promise<CorporateCargoClaim> {
  const res = await request<ApiResponse<CorporateCargoClaim>>(
    `/cargo-claims/${encodeURIComponent(id)}/issue-debit-note?debitRef=${encodeURIComponent(debitRef)}&agreedAmount=${agreedAmount}`,
    { method: 'POST' }
  );
  return res.data;
}
