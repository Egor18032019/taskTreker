import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { ProfileUpdateRequest } from '../types';

export const useProfile = () => {
  const qc = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getCurrentProfile().then(r => r.data),
    staleTime: 10 * 60 * 1000, // 10 минут
  });

  const updateMut = useMutation({
    mutationFn: (data: ProfileUpdateRequest) => profileApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile,
    isLoading,
    isError,
    updateProfile: updateMut.mutateAsync,
    isUpdating: updateMut.isPending,
  };
};