import { request } from './api';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface DeactivateAccountPayload {
  password: string;
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
