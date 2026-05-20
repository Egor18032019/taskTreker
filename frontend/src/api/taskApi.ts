// src/api/taskApi.ts
import { apiClient } from './axiosInstance';
import type { Task, TaskCreate, TaskUpdate, Ack, FetchTasksParams, TaskStatus } from '../types';

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

    updateStatus: (id: number, status: TaskStatus) =>
        apiClient.patch<Task>(`/tasks/${id}/status`, null, { params: { status } }),

    delete: (id: number) =>
        apiClient.delete<Ack>(`/tasks/${id}`),

    patch: (id: number, data: TaskUpdate) =>
        apiClient.patch<Task>(`/tasks/${id}`, data),
};