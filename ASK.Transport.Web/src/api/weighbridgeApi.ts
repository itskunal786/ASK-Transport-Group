import { request } from './api';
import type { WeighbridgeSlipRecord } from '../types/transportOperations';
import type { ApiResponse } from './tyreApi';

export async function getWeighbridgeSlips(): Promise<WeighbridgeSlipRecord[]> {
  const res = await request<ApiResponse<WeighbridgeSlipRecord[]>>('/weighbridge/slips');
  return res.data;
}

export async function getSlipByNumber(slipNumber: string): Promise<WeighbridgeSlipRecord> {
  const res = await request<ApiResponse<WeighbridgeSlipRecord>>(`/weighbridge/slips/${encodeURIComponent(slipNumber)}`);
  return res.data;
}

export async function recordWeighment(payload: Partial<WeighbridgeSlipRecord>): Promise<WeighbridgeSlipRecord> {
  const res = await request<ApiResponse<WeighbridgeSlipRecord>>('/weighbridge/record', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function authorizeCrossDockDeLoad(slipId: string): Promise<WeighbridgeSlipRecord> {
  const res = await request<ApiResponse<WeighbridgeSlipRecord>>(`/weighbridge/slips/${encodeURIComponent(slipId)}/cross-dock-deload`, {
    method: 'POST'
  });
  return res.data;
}
