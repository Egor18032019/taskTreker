// src/api/taskApi.ts
import { apiClient } from './axiosInstance';
import type { Task, TaskCreate, TaskUpdate, Ack, FetchTasksParams } from '../types';

export const taskApi = {
    fetchAll: (params?: FetchTasksParams) =>
        apiClient.get<Task[]>('/tasks', { params }),

    getById: (id: number) =>
        apiClient.get<Task>(`/tasks/${id}`),

    create: (data: TaskCreate) => {
        console.log('createTaskData:', JSON.stringify(data));
        return apiClient.post<Task>('/tasks', data);
    },
    update: (id: number, data: TaskUpdate) =>
        apiClient.put<Task>(`/tasks/${id}`, data),

    transition: (taskId: number, toStateId: number) =>
        apiClient.post<Task>(`/tasks/${taskId}/transition`, null, {
            params: { to_state_id: toStateId }
        }),

    delete: (id: number) =>
        apiClient.delete<Ack>(`/tasks/${id}`),
};