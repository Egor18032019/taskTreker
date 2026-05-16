import { apiClient } from './axiosInstance';
import type { Project, ProjectCreate, Ack, FetchProjectsParams } from '../types';

export const projectApi = {
  fetchAll: (params?: FetchProjectsParams) =>
    apiClient.get<Project[]>('/projects', { params }),

  create: (data: ProjectCreate) =>
    apiClient.post<Project>('/projects', null, { params: data }),

  update: (id: number, data: ProjectCreate) =>
    apiClient.put<Project>('/projects', null, { params: { id, ...data } }),

  delete: (id: number) =>
    apiClient.delete<Ack>(`/projects/${id}`),
};