import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { TaskCreate, FetchTasksParams, TaskUpdate, TaskStatus } from '../types';

export const useTasks = (params?: FetchTasksParams) =>
  useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.fetchAll(params).then(r => r.data),
  });

export const useTask = (id: number) =>
  useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.getById(id).then(r => r.data),
    enabled: !!id, // не выполнять запрос, если id = 0
    staleTime: 1 * 60 * 1000, // 1 минута
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskCreate) => taskApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) =>
      taskApi.patch(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useUpdateTaskStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      taskApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useRecommendedTasks = (projectId?: number) =>
  useQuery({
    queryKey: ['tasks', 'recommended', 'today', projectId],
    queryFn: () => taskApi.getRecommendedForToday(projectId).then(r => r.data),
    staleTime: 5 * 60 * 1000, // 5 минут — рекомендации не меняются каждую секунду
    refetchOnWindowFocus: false,
  });