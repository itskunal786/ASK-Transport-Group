import { get, post } from './api';

import type {
  CaptchaResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  VerifyOtpRequest
} from '../types/auth';

export function getCaptcha() {
  return get<CaptchaResponse>(
    '/Auth/captcha'
  );
}

export function login(data: LoginRequest) {
  return post<LoginResponse>(
    '/Auth/login',
    data
  );
}

export function register(data: RegisterRequest) {
  return post<RegisterResponse>(
    '/Auth/register',
    data
  );
}

export function verifyOtp(
  data: VerifyOtpRequest
) {
  return post<MessageResponse>(
    '/Auth/verify-otp',
    data
  );
}

export function resendOtp(email: string) {
  return post<MessageResponse>(
    '/Auth/resend-otp',
    { email }
  );
}

export function forgotPassword(
  data: ForgotPasswordRequest
) {
  return post<MessageResponse>(
    '/Auth/forgot-password',
    data
  );
}

export function resetPassword(
  data: ResetPasswordRequest
) {
  return post<MessageResponse>(
    '/Auth/reset-password',
    data
  );
}

export function logout(refreshToken: string) {
  return post<MessageResponse>(
    '/Token/logout',
    { refreshToken }
  );
}

export function logoutAll() {
  return post<MessageResponse>(
    '/Token/logout-all'
  );
}