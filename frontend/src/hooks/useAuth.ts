    import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
    import { authApi } from '../api/authApi';
    import { tokenUtils } from '../utils/tokenUtils';
    import type { LoginRequest, RegisterRequest, UserProfile } from '../types';

    export const useAuth = () => {
      const qc = useQueryClient();

      // 🔹 Текущий профиль
      const { data: profile, isLoading, isError } = useQuery({
        queryKey: ['auth', 'profile'],
        queryFn: () => authApi.getCurrentProfile().then(r => r.data),
        enabled: tokenUtils.isAuthenticated(),
        staleTime: 5 * 60 * 1000, // 5 минут
      });

      // 🔹 Логин
      const loginMut = useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: (res) => {
          tokenUtils.saveTokens(
            res.data.accessToken,
            res.data.refreshToken,
            res.data.expiresInSec
          );
          qc.invalidateQueries({ queryKey: ['auth'] });
        },
      });

      // 🔹 Регистрация
      const registerMut = useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: (res) => {
          tokenUtils.saveTokens(
            res.data.accessToken,
            res.data.refreshToken,
            res.data.expiresInSec
          );
          qc.invalidateQueries({ queryKey: ['auth'] });
        },
      });

      // 🔹 Обновление профиля
      const updateProfileMut = useMutation({
        mutationFn: (data: Partial<UserProfile>) => authApi.updateProfile(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'profile'] }),
      });

      // 🔹 Выход
      const logout = () => {
        authApi.logout().catch(() => {}); // игнорируем ошибки при выходе
        tokenUtils.clearTokens();
        qc.clear();
        window.location.href = '/login';
      };

      return {
        profile,
        isLoading,
        isError,
        isAuthenticated: tokenUtils.isAuthenticated(),
        login: loginMut.mutateAsync,
        register: registerMut.mutateAsync,
        updateProfile: updateProfileMut.mutateAsync,
        logout,
        isLoggingIn: loginMut.isPending,
        isRegistering: registerMut.isPending,
      };
    };