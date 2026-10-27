import { request } from './api';
import type { User } from '../types/auth';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface DeactivateAccountPayload {
  password: string;
}

export interface UpdateProfilePayload {
  name: string;
  phone: string;
}

export async function getProfile(): Promise<User> {
  return request<User>('/Profile');
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<{ message: string; user: User }> {
  return request<{ message: string; user: User }>('/Profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<{ message: string }> {
  return request<{ message: string }>('/Auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deactivateAccount(
  payload: DeactivateAccountPayload
): Promise<{ message: string }> {
  return request<{ message: string }>('/client/account/deactivate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
