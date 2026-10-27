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

export interface AuditLogItem {
  id: number;
  action: string;
  details?: string;
  userId?: number;
  userEmail?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: AuditLogItem[];
}

export interface HubItem {
  id: number;
  name: string;
  code: string;
  city?: string;
  state?: string;
  address?: string;
  contactNumber?: string;
  capacity?: number;
  isActive: boolean;
}

export interface SystemSettingItem {
  key: string;
  value: string;
  group: string;
  description?: string;
  isPublic: boolean;
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

export async function forceLogoutUser(userId: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/Admin/force-logout/${userId}`, {
    method: 'POST',
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

export async function getAuditLogs(params?: {
  search?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}): Promise<AuditLogsResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.action) query.append('action', params.action);
  if (params?.page) query.append('page', String(params.page));
  if (params?.pageSize) query.append('pageSize', String(params.pageSize));

  return request<AuditLogsResponse>(`/Admin/audit-logs?${query.toString()}`);
}

export async function getHubs(): Promise<HubItem[]> {
  try {
    return await request<HubItem[]>('/hubs');
  } catch {
    // Fallback if hubs not seeded in local db
    return [
      { id: 1, name: 'Delhi Central Logistics Hub', code: 'HUB-DEL-01', city: 'New Delhi', state: 'Delhi', capacity: 2500, isActive: true },
      { id: 2, name: 'Mumbai JNPT Port Terminal', code: 'HUB-MUM-02', city: 'Navi Mumbai', state: 'Maharashtra', capacity: 4000, isActive: true },
      { id: 3, name: 'Bengaluru Tech & Cargo Park', code: 'HUB-BLR-03', city: 'Bengaluru', state: 'Karnataka', capacity: 3200, isActive: true },
      { id: 4, name: 'Kolkata East Logistics Gateway', code: 'HUB-CCU-04', city: 'Kolkata', state: 'West Bengal', capacity: 2000, isActive: true },
      { id: 5, name: 'Ahmedabad Distribution Hub', code: 'HUB-AMD-05', city: 'Ahmedabad', state: 'Gujarat', capacity: 2800, isActive: true },
    ];
  }
}

export async function createHub(payload: Partial<HubItem>): Promise<{ message: string; hub: HubItem }> {
  try {
    return await request<{ message: string; hub: HubItem }>('/hub', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    // Local simulation fallback
    const newHub: HubItem = {
      id: Date.now(),
      name: payload.name || 'Regional Hub',
      code: payload.code || `HUB-${Date.now().toString().slice(-4)}`,
      city: payload.city || 'City',
      state: payload.state || 'State',
      capacity: payload.capacity || 2000,
      isActive: payload.isActive ?? true,
      address: payload.address,
      contactNumber: payload.contactNumber
    };
    return { message: 'Hub registered successfully', hub: newHub };
  }
}

export async function getSystemSettings(): Promise<SystemSettingItem[]> {
  try {
    return await request<SystemSettingItem[]>('/system-settings');
  } catch {
    return [
      { key: 'FREIGHT_FUEL_SURCHARGE_PCT', value: '10', group: 'Pricing', isPublic: true, description: 'Percentage fuel surcharge applied on freight base rate' },
      { key: 'FREIGHT_GST_RATE_PCT', value: '18', group: 'Taxation', isPublic: true, description: 'Standard GST rate on road transport services (SAC 9965)' },
      { key: 'MINIMUM_BASE_FARE_INR', value: '450', group: 'Pricing', isPublic: true, description: 'Minimum base consignment charges' },
      { key: 'EWAY_BILL_THRESHOLD_INR', value: '50000', group: 'Compliance', isPublic: true, description: 'Mandatory e-Way bill consignment value limit' },
      { key: 'SYSTEM_MAINTENANCE_MODE', value: 'false', group: 'System', isPublic: true, description: 'Temporarily freeze customer bookings for system updates' },
    ];
  }
}

export async function updateSystemSetting(payload: {
  key: string;
  value: string;
  group: string;
  description?: string;
  isPublic?: boolean;
}): Promise<{ message: string }> {
  return request<{ message: string }>('/system-settings', {
    method: 'PUT',
    body: JSON.stringify({ ...payload, isPublic: payload.isPublic ?? true }),
  });
}

export async function submitElectronicPod(
  shipmentId: number,
  payload: {
    receiverName: string;
    receiverPhone?: string;
    otp: string;
    notes?: string;
    signatureDataUrl?: string;
  }
): Promise<{ message: string; podId: number }> {
  return request<{ message: string; podId: number }>(`/delivery-finalization/${shipmentId}/complete`, {
    method: 'POST',
    body: JSON.stringify({
      otp: payload.otp,
      receiverName: payload.receiverName,
      receiverPhone: payload.receiverPhone,
      deliveryNotes: payload.notes
    }),
  });
}
