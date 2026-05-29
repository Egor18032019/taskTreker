import type { ProfileUpdateRequest, UserProfile } from "../types";
import { apiClient } from "./axiosInstance";

export const profileApi = {
  getCurrentProfile: () =>
    apiClient.get<UserProfile>('/profile/me'),

  updateProfile: (data: ProfileUpdateRequest) =>
    apiClient.patch<UserProfile>('/profile/me', data),
};