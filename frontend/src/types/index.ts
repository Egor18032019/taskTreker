export interface TaskState {
  id: number;
  leftTaskStateId: number | null;
  rightTaskStateId: number | null;
  createdAt: string;
  projectId: number;
}

export interface TaskStateCreate {
  project_id: number;
  left_state_id?: number;
  right_state_id?: number;
}

export interface TaskStateUpdate {
  project_id?: number;
  left_state_id?: number | null;
  right_state_id?: number | null;
}

export interface Task {
  [x: string]: any;
//  project_id?: number;
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  task_state_id: number | null;
  size_points: number | null;
  size_category: TaskSizeCategory | null;
  deadline: string | null; // ISO: "YYYY-MM-DD"
  complexity: TaskComplexity | null;
  priority: TaskPriority | null;
}

export interface TaskCreate {
    name: string;
    description?: string;
    project_id?: number;
    task_state_id?: number;
    size_points: number | null;
    size_category: TaskSizeCategory | null;
    deadline: string | null;
    complexity: TaskComplexity | null;
    priority: TaskPriority | null;
}

export interface TaskUpdate {
  name?: string;
  description?: string;
  task_state_id?: number | null;
  size_points?: number;
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
  task_state_id?: number;
  size_category?: string;
  priority?: string;
  project_id?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface FetchTaskStatesParams {
  project_id?: number;
}

export type TaskSizeCategory = 'SMALL' | 'MEDIUM' | 'LARGE' | 'YEARLY';
export type TaskComplexity = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';