import { apiClient } from './axiosInstance';
import type { TaskState, TaskStateCreate, TaskStateUpdate, Ack, FetchTaskStatesParams, Task } from '../types';

export const taskStateApi = {
  fetchAll: (params?: FetchTaskStatesParams) =>
    apiClient.get<TaskState[]>('/task-states', { params }),

  getById: (id: number) =>
    apiClient.get<TaskState>(`/task-states/${id}`),

  getWorkflow: (projectId: number) =>
    apiClient.get<TaskState[]>('/task-states/workflow', {
      params: { project_id: projectId }
    }),

  getTasksInState: (stateId: number) =>
    apiClient.get<Task[]>(`/task-states/${stateId}/tasks`),

  create: (data: TaskStateCreate) =>
    apiClient.post<TaskState>('/task-states', null, { params: data }),

  update: (id: number, data: TaskStateUpdate) =>
    apiClient.put<TaskState>(`/task-states/${id}`, null, { params: { id, ...data } }),

  delete: (id: number) =>
    apiClient.delete<Ack>(`/task-states/${id}`),
};