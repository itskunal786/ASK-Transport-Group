import { request } from './api';
import type { Ais140SafetyTelemetry } from '../types/transportOperations';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getAis140FleetSafety(): Promise<Ais140SafetyTelemetry[]> {
  const res = await request<ApiResponse<Ais140SafetyTelemetry[]>>('/ais140-safety');
  return res.data;
}

export async function getAis140PanicAlerts(): Promise<Ais140SafetyTelemetry[]> {
  const res = await request<ApiResponse<Ais140SafetyTelemetry[]>>('/ais140-safety/alerts');
  return res.data;
}

export async function ackAis140Panic(id: string): Promise<Ais140SafetyTelemetry> {
  const res = await request<ApiResponse<Ais140SafetyTelemetry>>(`/ais140-safety/${encodeURIComponent(id)}/ack-panic`, {
    method: 'POST',
  });
  return res.data;
}
