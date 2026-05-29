export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FetchTasksPaginatedParams extends FetchTasksParams {
  page?: number;
  size?: number;
}


export interface WeightsDto {
  priority?: number;
  deadline?: number;
  complexity?: number;
  size?: number;
}

export interface UserProfile {
  id: number;
  userId: number;
  username: string;
  email: string;
  telegramHandle?: string;
  maxHandle?: string;
  avatarUrl?: string;
  weights: WeightsDto;
  createdAt: string;
  updatedAt: string;
}
export interface ProfileForm {
  email: string;
  telegramHandle: string;
  maxHandle: string;
  weights: WeightsDto;
}
export interface ProfileUpdateRequest {
  email?: string;
  telegramHandle?: string;
  maxHandle?: string;
  weights?: WeightsDto;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSec: number;
  profile: UserProfile;
}

export interface UserProfile {
  id: number;
  userId: number;
  username: string;
  email: string;
  telegramHandle?: string;
  maxHandle?: string;
  weights: WeightsDto;
  createdAt: string;
  updatedAt: string;
}


export interface Task {
    id: number;
    project_id: number;
    name: string;
    description: string | null;
    created_at: string;
    status: TaskStatus;
    check_list?: ChecklistItem[];
    size_category: TaskSizeCategory | null;
    deadline: string | null; // ISO: "YYYY-MM-DD"
    complexity: TaskComplexity | null;
    priority: TaskPriority | null;
}

export interface TaskCreate {
    name: string;
    description?: string;
    project_id: number;
    //     status: TaskStatus; нужно ли при создании статус выставлять ?
    check_list?: ChecklistItem[];
    size_category: TaskSizeCategory | null;
    deadline: string | null;
    complexity: TaskComplexity | null;
    priority: TaskPriority | null;
}

export interface TaskUpdate {
    name?: string;
    description?: string;
    status?: TaskStatus;
    check_list?: ChecklistItem[];
    size_category?: TaskSizeCategory;
    deadline?: string;
    complexity?: TaskComplexity;
    priority?: TaskPriority;
}

// 🔹 Project
export interface Project {
    id: number;
    name: string;
    createdAt: string;
}

export interface ProjectCreate {
    project_name: string;      // как query-параметр, оставляем
}
export interface ProjectUpdate { project_id: number; project_name: string; }

// 🔹 Ответы API
export interface Ack {
    success: boolean;
}

// 🔹 Query params
export interface FetchProjectsParams {
    prefix_name?: string;  // фильтр по префиксу имени
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
}

export interface FetchTasksParams {
    name_prefix?: string;
    status?: TaskStatus;
    size_category?: string;
    priority?: string;
    project_id: number;
    sort_by?: TaskSortBy;
    sort_dir?: 'asc' | 'desc';
}

export interface FetchTaskStatesParams {
    project_id?: number;
}

export interface ChecklistItem {
    id?: number;
    text: string;
    completed: boolean;
    orderIndex: number;
}
export type TaskSizeCategory = 'SMALL' | 'MEDIUM' | 'LARGE' | 'YEARLY';
export type TaskComplexity = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskSortBy = 'name' | 'deadline' | 'priority' | 'complexity' | 'createdAt' | 'status';
export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'DONE';
