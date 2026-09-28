export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'User' | 'Admin';
  isVerified: boolean;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: User;
}

export interface CaptchaResponse {
  id: string;
  question: string;
  expiresInSeconds: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  captchaId: string;
  captchaAnswer: string;
}

export interface RegisterResponse {
  message: string;
  userId: number;
  email: string;
  otp?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}