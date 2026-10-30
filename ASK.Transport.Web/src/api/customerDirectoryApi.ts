import { request } from './api';
import type { CustomerConsigneeDirectory, ShareableTrackingSession } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getCustomerConsignees(customerId = 'cust-default'): Promise<CustomerConsigneeDirectory[]> {
  const res = await request<ApiResponse<CustomerConsigneeDirectory[]>>(`/customer-directory/consignees?customerId=${encodeURIComponent(customerId)}`);
  return res.data;
}

export async function addCustomerConsignee(entry: Partial<CustomerConsigneeDirectory>): Promise<CustomerConsigneeDirectory> {
  const res = await request<ApiResponse<CustomerConsigneeDirectory>>('/customer-directory/consignees', {
    method: 'POST',
    body: JSON.stringify(entry),
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function toggleConsigneeFavorite(id: string): Promise<CustomerConsigneeDirectory> {
  const res = await request<ApiResponse<CustomerConsigneeDirectory>>(
    `/customer-directory/consignees/${encodeURIComponent(id)}/toggle-favorite`,
    { method: 'POST' }
  );
  return res.data;
}

export async function generateWhatsAppTrackSession(consignmentNo: string, receiverPhone: string, receiverName: string): Promise<ShareableTrackingSession> {
  const res = await request<ApiResponse<ShareableTrackingSession>>(
    `/customer-directory/generate-whatsapp-session?consignmentNo=${encodeURIComponent(consignmentNo)}&receiverPhone=${encodeURIComponent(receiverPhone)}&receiverName=${encodeURIComponent(receiverName)}`,
    { method: 'POST' }
  );
  return res.data;
}

export async function getPublicTrackSession(token: string, pin?: string): Promise<ShareableTrackingSession> {
  const qs = pin ? `?pin=${encodeURIComponent(pin)}` : '';
  const res = await request<ApiResponse<ShareableTrackingSession>>(`/customer-directory/public-track/${encodeURIComponent(token)}${qs}`);
  return res.data;
}
