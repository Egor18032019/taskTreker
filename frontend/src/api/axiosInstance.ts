import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { tokenUtils } from '../utils/tokenUtils';


export const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // JWT в заголовке, не в cookie
    timeout: 10000,
});


// 🔹 Response interceptor: обрабатываем 401 → refresh flow
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // 🔐 Если 401 и ещё не пытались обновить токен
        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
            (originalRequest as any)._retry = true;

            try {
                // Пытаемся получить новый Access Token
                const newAccessToken = await tokenUtils.refreshAccessToken();

                if (newAccessToken) {
                    // Повторяем исходный запрос с новым токеном
                    if (originalRequest.headers) {
                        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
                    }
                    return apiClient(originalRequest as AxiosRequestConfig);
                }
            } catch (refreshError) {
                // ❌ Refresh не удался → выходим
                tokenUtils.clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// 🔹 Request interceptor: добавляем Access Token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenUtils.getAccessToken();
        if (token && config.headers) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);
