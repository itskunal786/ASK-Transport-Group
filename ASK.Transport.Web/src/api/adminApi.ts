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

export interface AdminUserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'User' | 'Admin' | 'SuperAdmin';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: AdminUserData[];
}

export interface SystemPermissionItem {
  id: number;
  code: string;
  module: string;
  action: string;
  description?: string;
}

export interface UserRightsResponse {
  userId: number;
  userName: string;
  userRole: string;
  grantedPermissionIds: number[];
  revokedPermissionIds: number[];
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

export async function getAdminUsers(params?: {
  search?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.active !== undefined) query.append('active', String(params.active));
  if (params?.page) query.append('page', String(params.page));
  if (params?.pageSize) query.append('pageSize', String(params.pageSize));

  return request<AdminUsersResponse>(`/Admin/users?${query.toString()}`);
}

export async function updateAdminUser(
  id: number,
  payload: { name?: string; phone?: string; email?: string; isActive?: boolean }
): Promise<{ message: string; user: AdminUserData }> {
  return request<{ message: string; user: AdminUserData }>(`/Admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserRole(
  id: number,
  role: 'User' | 'Admin' | 'SuperAdmin'
): Promise<{ message: string; userId: number; role: string }> {
  return request<{ message: string; userId: number; role: string }>(
    `/Admin/users/${id}/role`,
    {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }
  );
}

export async function changeUserStatus(
  id: number,
  active: boolean
): Promise<{ message: string }> {
  return request<{ message: string }>(`/Admin/users/${id}/status?active=${active}`, {
    method: 'PUT',
  });
}

export async function getAllRights(): Promise<SystemPermissionItem[]> {
  return request<SystemPermissionItem[]>('/Admin/rights');
}

export async function getUserRights(id: number): Promise<UserRightsResponse> {
  return request<UserRightsResponse>(`/Admin/users/${id}/rights`);
}

export async function updateUserRights(
  id: number,
  payload: { grantedPermissionIds: number[]; revokedPermissionIds: number[] }
): Promise<{ message: string }> {
  return request<{ message: string }>(`/Admin/users/${id}/rights`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
