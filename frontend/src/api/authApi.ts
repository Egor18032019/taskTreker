import { apiClient } from './axiosInstance';
import type { LoginRequest, RegisterRequest, UserProfile,AuthResponse } from '../types';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; expiresInSec: number }>(
      '/auth/refresh',
      {},
      { headers: { 'X-Refresh-Token': refreshToken } }
    ),

  getCurrentProfile: () =>
    apiClient.get<UserProfile>('/auth/me'),

  updateProfile: (data: Partial<UserProfile>) =>
    apiClient.patch<UserProfile>('/auth/me', data),

  logout: () =>
    apiClient.post('/auth/logout'),
};