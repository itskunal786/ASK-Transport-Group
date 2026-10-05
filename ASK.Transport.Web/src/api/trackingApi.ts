import { get } from './api';

export interface Shipment {
  id: number;
  trackingNumber: string;
  bookingNumber: string;
  status: string;
  currentHubId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TrackingEvent {
  id: number;
  status: string;
  location?: string | null;
  remarks?: string | null;
  date: string;
}

export interface Eta {
  success: boolean;
  message: string;
  status?: string | null;
  estimatedArrivalAt?: string | null;
  confidenceScore?: number | null;
  calculationMethod?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export function getShipment(trackingNumber: string) {
  return get<ApiResponse<Shipment>>(
    `/client/shipments/${encodeURIComponent(trackingNumber)}`
  );
}

export function getTimeline(trackingNumber: string) {
  return get<ApiResponse<TrackingEvent[]>>(
    `/client/shipments/${encodeURIComponent(trackingNumber)}/timeline`
  );
}

export function getEta(trackingNumber: string) {
  return get<ApiResponse<Eta>>(
    `/client/shipments/${encodeURIComponent(trackingNumber)}/eta`
  );
}
