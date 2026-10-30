import { request } from './api';
import type { PhysicalPodInwardReceipt, EmergencyTransshipmentRescue } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getPendingPodReceipts(): Promise<PhysicalPodInwardReceipt[]> {
  const res = await request<ApiResponse<PhysicalPodInwardReceipt[]>>('/physical-pod/receipts');
  return res.data;
}

export async function scanAndVerifyBarcode(barcodeOrBiltyNo: string, operatorName: string): Promise<PhysicalPodInwardReceipt> {
  const res = await request<ApiResponse<PhysicalPodInwardReceipt>>(
    `/physical-pod/scan-barcode?barcodeOrBiltyNo=${encodeURIComponent(barcodeOrBiltyNo)}&operatorName=${encodeURIComponent(operatorName)}`,
    { method: 'POST' }
  );
  return res.data;
}

export async function releaseTransporterBalancePayment(id: string, transactionRef: string): Promise<PhysicalPodInwardReceipt> {
  const res = await request<ApiResponse<PhysicalPodInwardReceipt>>(
    `/physical-pod/receipts/${encodeURIComponent(id)}/release-payment?transactionRef=${encodeURIComponent(transactionRef)}`,
    { method: 'POST' }
  );
  return res.data;
}

export async function getActiveTransshipments(): Promise<EmergencyTransshipmentRescue[]> {
  const res = await request<ApiResponse<EmergencyTransshipmentRescue[]>>('/physical-pod/transshipments');
  return res.data;
}

export async function createTransshipmentRescue(rescue: Partial<EmergencyTransshipmentRescue>): Promise<EmergencyTransshipmentRescue> {
  const res = await request<ApiResponse<EmergencyTransshipmentRescue>>('/physical-pod/transshipments', {
    method: 'POST',
    body: JSON.stringify(rescue),
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}
