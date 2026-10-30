import { request } from './api';
import type { DriverTripSettlement } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getAllDriverSettlements(): Promise<DriverTripSettlement[]> {
  const res = await request<ApiResponse<DriverTripSettlement[]>>('/driver-settlement');
  return res.data;
}

export async function getDriverSettlementById(id: string): Promise<DriverTripSettlement> {
  const res = await request<ApiResponse<DriverTripSettlement>>(`/driver-settlement/${encodeURIComponent(id)}`);
  return res.data;
}

export async function createDriverSettlement(item: Partial<DriverTripSettlement>): Promise<DriverTripSettlement> {
  const res = await request<ApiResponse<DriverTripSettlement>>('/driver-settlement', {
    method: 'POST',
    body: JSON.stringify(item),
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function approveDriverSettlement(id: string): Promise<DriverTripSettlement> {
  const res = await request<ApiResponse<DriverTripSettlement>>(`/driver-settlement/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
  });
  return res.data;
}
