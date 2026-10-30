import { request } from './api';
import type { TruckTyreFleetRecord, TyreItem } from '../types/transportOperations';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getFleetTyres(): Promise<TruckTyreFleetRecord[]> {
  const res = await request<ApiResponse<TruckTyreFleetRecord[]>>('/tyre-management/fleet');
  return res.data;
}

export async function getTruckTyres(plateNo: string): Promise<TruckTyreFleetRecord> {
  const res = await request<ApiResponse<TruckTyreFleetRecord>>(`/tyre-management/truck/${encodeURIComponent(plateNo)}`);
  return res.data;
}

export async function inflateTyre(plateNo: string, tyreId: string, targetPsi = 118): Promise<TyreItem> {
  const res = await request<ApiResponse<TyreItem>>(
    `/tyre-management/truck/${encodeURIComponent(plateNo)}/tyres/${encodeURIComponent(tyreId)}/inflate?targetPsi=${targetPsi}`,
    { method: 'POST' }
  );
  return res.data;
}

export async function sendTyreForColdRetread(plateNo: string, tyreId: string): Promise<TyreItem> {
  const res = await request<ApiResponse<TyreItem>>(
    `/tyre-management/truck/${encodeURIComponent(plateNo)}/tyres/${encodeURIComponent(tyreId)}/retread`,
    { method: 'POST' }
  );
  return res.data;
}
