import { request } from './api';

export interface ClientNotification {
  id: number;
  title: string;
  message: string;
  type?: string;
  bookingId?: number | null;
  bookingNumber?: string | null;
  shipmentNumber?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface ClientNotificationListResponse {
  success: boolean;
  message: string;
  data: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    unreadCount: number;
    data: ClientNotification[];
  };
}

export async function getNotifications(
  page = 1,
  pageSize = 20,
  isRead?: boolean
): Promise<ClientNotificationListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (typeof isRead === 'boolean') {
    query.set('isRead', String(isRead));
  }

  return request<ClientNotificationListResponse>(`/client/notifications?${query.toString()}`);
}

export async function markNotificationAsRead(
  id: number
): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/client/notifications/${id}/read`, {
    method: 'PUT',
  });
}

export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  message: string;
  data: { updatedCount: number };
}> {
  return request<{
    success: boolean;
    message: string;
    data: { updatedCount: number };
  }>('/client/notifications/read-all', {
    method: 'PUT',
  });
}

export async function deleteNotification(
  id: number
): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/client/notifications/${id}`, {
    method: 'DELETE',
  });
}

export async function clearReadNotifications(): Promise<{
  success: boolean;
  message: string;
}> {
  return request<{ success: boolean; message: string }>('/client/notifications/read', {
    method: 'DELETE',
  });
}
