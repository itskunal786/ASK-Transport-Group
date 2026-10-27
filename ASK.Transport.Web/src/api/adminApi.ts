import { request } from './api';

export interface AdminOperationsSummary {
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  deliveredBookings: number;
  cancelledBookings: number;
  totalShipments: number;
  inTransitShipments: number;
  outForDeliveryShipments: number;
  deliveredShipments: number;
  failedDeliveries: number;
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  availableDrivers: number;
  availableVehicles: number;
  pendingPayments: number;
  successfulPayments: number;
  failedPayments: number;
  successfulPaymentAmount: number;
}

export interface RecentActivityItem {
  bookingNumber?: string;
  senderCity?: string;
  receiverCity?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  totalAmount?: number;
}

export async function getAdminOperationsSummary(): Promise<AdminOperationsSummary> {
  return request<AdminOperationsSummary>('/admin/operations/summary');
}

export async function getAdminRecentActivity(): Promise<{
  count: number;
  data: RecentActivityItem[];
}> {
  return request<{ count: number; data: RecentActivityItem[] }>(
    '/admin/operations/recent-activity'
  );
}
