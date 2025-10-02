'use client';

import { ApiClient, ApiResponse } from './Client';
import Endpoints from '@/constants/endpoints';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  TwoFactorAuthRequest,
  TwoFactorAuthResponse
} from '@/types/Auth';
import { toast } from 'sonner';

export class AuthService {
  private client: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.client = apiClient || new ApiClient();
  }

  private adaptResponse<T>(response: ApiResponse<any>): ApiResponse<T> {
    if (!response.status.success) return response as ApiResponse<T>;
    
    return {
      data: response.data as T,
      status: response.status
    };
  }

  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.Register, data);
    return this.adaptResponse<RegisterResponse>(response);
  }
  
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.Login, data);
    return this.adaptResponse<LoginResponse>(response);
  }

  async verifyTwoFactor(otpToken: string, code: string): Promise<ApiResponse<TwoFactorAuthResponse>> {
    const data: TwoFactorAuthRequest = { otp_token: otpToken, code };
    try {
      const response = await this.client.post<any>(Endpoints.Auth.TwoFactorAuth, data);
      return this.adaptResponse<TwoFactorAuthResponse>(response);
    } catch (error) {
      toast.error('2FA verification error');
      throw error;
    }
  }

  async sendResetEmail(email: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.Send_mail, { email });
    return this.adaptResponse<ForgotPasswordResponse>(response);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> {
    const response = await this.client.post<any>(Endpoints.Auth.Forget_pass, data);
    return this.adaptResponse<ResetPasswordResponse>(response);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<ChangePasswordResponse>> {
    const data: ChangePasswordRequest = {
      old_pass: oldPassword,
      new_pass: newPassword
    };
    const response = await this.client.post<any>(Endpoints.Auth.Change_password, data);
    return this.adaptResponse<ChangePasswordResponse>(response);
  }

  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
  }

  removeAuthToken(): void {
    this.client.removeAuthToken();
  }
} 