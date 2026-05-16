import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskStateApi } from '../api/taskStateApi';
import type { TaskStateCreate, TaskStateUpdate, FetchTaskStatesParams } from '../types';

export const useTaskStates = (params?: FetchTaskStatesParams) =>
  useQuery({
    queryKey: ['task-states', params],
    queryFn: () => taskStateApi.fetchAll(params).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useWorkflow = (projectId: number) =>
  useQuery({
    queryKey: ['workflow', projectId],
    queryFn: () => taskStateApi.getWorkflow(projectId).then(r => r.data),
    enabled: !!projectId,
  });

export const useCreateTaskState = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskStateCreate) => taskStateApi.create(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['task-states'] });
      qc.invalidateQueries({ queryKey: ['workflow', vars.project_id] });
    },
  });
};

export const useUpdateTaskState = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskStateUpdate }) =>
      taskStateApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['task-states'] });
      // Если меняли workflow, инвалидируем кэш
      if (vars.data.left_state_id !== undefined || vars.data.right_state_id !== undefined) {
        // project_id нужно получить из контекста или передать явно
      }
    },
  });
};

export const useDeleteTaskState = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskStateApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-states'] });
      qc.invalidateQueries({ queryKey: ['workflow'] });
    },
  });
};

