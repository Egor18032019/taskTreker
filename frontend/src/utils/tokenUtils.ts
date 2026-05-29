import axios from "axios";

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export const tokenUtils = {
  // 🔹 Сохранение токенов
  saveTokens: (accessToken: string, refreshToken: string, expiresInSec: number) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    // Сохраняем время истечения (текущее время + expiresIn)
    const expiry = Date.now() + expiresInSec * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  },

  // 🔹 Получение Access Token
  getAccessToken: (): string | null => {
    // Проверяем, не истёк ли токен
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      tokenUtils.clearTokens();
      return null;
    }
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // 🔹 Получение Refresh Token
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

  // 🔹 Очистка всех токенов
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  // 🔹 Проверка, авторизован ли пользователь
  isAuthenticated: (): boolean => !!tokenUtils.getAccessToken(),

  // 🔹 Refresh Access Token (вызов эндпоинта)
  refreshAccessToken: async (): Promise<string | null> => {
    const refreshToken = tokenUtils.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await axios.post<{ accessToken: string; expiresInSec: number }>(
        `/api/auth/refresh`,
        {},
        {
          headers: {
            'X-Refresh-Token': refreshToken,
            'Content-Type': 'application/json',
          },
        }
      );

      const { accessToken, expiresInSec } = response.data;
      // Обновляем только Access Token, Refresh остаётся тем же
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      const expiry = Date.now() + expiresInSec * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());

      return accessToken;
    } catch {
      return null;
    }
  },
};