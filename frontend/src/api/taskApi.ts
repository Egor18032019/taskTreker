// src/api/taskApi.ts
import { apiClient } from './axiosInstance';
import type { Task, TaskCreate, TaskUpdate, Ack, FetchTasksParams } from '../types';

export const taskApi = {
    fetchAll: (params?: FetchTasksParams) =>
        apiClient.get<Task[]>('/tasks', { params }),

    getById: (id: number) =>
        apiClient.get<Task>(`/tasks/${id}`),

    create: (data: TaskCreate) =>
        apiClient.post<Task>('/tasks', null, { params: data }),

    update: (id: number, data: TaskUpdate) =>
        apiClient.put<Task>(`/tasks/${id}`, null, { params: { id, ...data } }),

    transition: (taskId: number, toStateId: number) =>
        apiClient.post<Task>(`/tasks/${taskId}/transition`, null, {
            params: { to_state_id: toStateId }
        }),

    delete: (id: number) =>
        apiClient.delete<Ack>(`/tasks/${id}`),


};