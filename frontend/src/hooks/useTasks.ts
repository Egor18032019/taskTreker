import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { TaskCreate, FetchTasksParams } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { getErrorMessage } from '../utils/getErrorMessage';

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
    mutationFn: ({ id, data }: { id: number; data: Partial<TaskCreate> }) => taskApi.update(id, data),
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

export const useTransitionTask = () => {
  const qc = useQueryClient();
  const { notify } = useNotification();

  return useMutation({
    mutationFn: ({ taskId, toStateId }: { taskId: number; toStateId: number }) =>
      taskApi.transition(taskId, toStateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      notify('Задача перемещена', 'success');
    },
    onError: (error: unknown) => {
      notify(getErrorMessage(error), 'error');
    },
  });
};