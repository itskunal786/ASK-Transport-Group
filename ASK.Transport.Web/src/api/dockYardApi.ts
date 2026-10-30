import { request } from './api';
import type { DockBayStatus, GatePassRecord } from '../types/transportOperations';
import type { ApiResponse } from './tyreApi';

export async function getDockBays(): Promise<DockBayStatus[]> {
  const res = await request<ApiResponse<DockBayStatus[]>>('/dock-yard/bays');
  return res.data;
}

export async function getGatePasses(): Promise<GatePassRecord[]> {
  const res = await request<ApiResponse<GatePassRecord[]>>('/dock-yard/passes');
  return res.data;
}

export async function generateGateInPass(payload: Partial<GatePassRecord>): Promise<GatePassRecord> {
  const res = await request<ApiResponse<GatePassRecord>>('/dock-yard/gate-in', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function expediteDockLoading(passId: string): Promise<GatePassRecord> {
  const res = await request<ApiResponse<GatePassRecord>>(`/dock-yard/passes/${encodeURIComponent(passId)}/expedite`, {
    method: 'POST'
  });
  return res.data;
}

export async function authorizeGateOut(passId: string): Promise<GatePassRecord> {
  const res = await request<ApiResponse<GatePassRecord>>(`/dock-yard/passes/${encodeURIComponent(passId)}/gate-out`, {
    method: 'POST'
  });
  return res.data;
}
