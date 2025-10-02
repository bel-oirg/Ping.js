// Add the 2FA types to the Auth.ts file
import { z } from "zod";

export interface ApiStatus {
  success: boolean;
  message: string;
  code?: number;
}

export interface ApiResponse<T = any> {
  data?: T | null;
  status: ApiStatus;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  otp_token?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  repassword: string;
  first_name: string;
  last_name: string;
}

export interface RegisterResponse {
  success: boolean;
}

export interface ForgotPasswordResponse {
  success: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
  repassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
}

export interface ChangePasswordRequest {
  old_pass: string;
  new_pass: string;
}

export interface ChangePasswordResponse {
  success: boolean;
}

export interface TwoFactorAuthRequest {
  otp_token: string;
  code: string;
}

export interface TwoFactorAuthResponse {
  token: string;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  verified: boolean;
}

export interface TwoFactorUpdateRequest {
  activate: 0 | 1;
}

export interface TwoFactorUpdateResponse {
  success: boolean;
}

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// JWT Token
export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

// User Profile
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  is_oauth: boolean;
}

export const twoFactorCodeSchema = z.object({
  code: z.string().length(6, "Code must be exactly 6 digits").regex(/^\d+$/, "Code must contain only digits")
});

export type TwoFactorCodeFormValues = z.infer<typeof twoFactorCodeSchema>;

