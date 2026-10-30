import { request } from './api';
import type { RtoBorderInspectionDossier } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getAllRtoDossiers(): Promise<RtoBorderInspectionDossier[]> {
  const res = await request<ApiResponse<RtoBorderInspectionDossier[]>>('/rto-vault');
  return res.data;
}

export async function getRtoDossierByVehicle(vehicleNumber: string): Promise<RtoBorderInspectionDossier> {
  const res = await request<ApiResponse<RtoBorderInspectionDossier>>(`/rto-vault/vehicle/${encodeURIComponent(vehicleNumber)}`);
  return res.data;
}

export async function verifyRtoDossier(id: string): Promise<RtoBorderInspectionDossier> {
  const res = await request<ApiResponse<RtoBorderInspectionDossier>>(`/rto-vault/verify/${encodeURIComponent(id)}`, {
    method: 'POST',
  });
  return res.data;
}
