
import type { TaskSizeCategory, TaskComplexity, TaskPriority, TaskStatus } from '../types';

export const sizeCategoryConfig: Record<
    TaskSizeCategory,
    { icon: string; color: 'XS' | 'S' | 'M' | 'XL' }
> = {
    SMALL: { icon: '🔹', color: 'XS' },
    MEDIUM: { icon: '🔸', color: 'S' },
    LARGE: { icon: '🔶', color: 'M' },
    YEARLY: { icon: '💎', color: 'XL' }
};

export const complexityConfig: Record<
    TaskComplexity,
    { icon: string; color: 'default' | 'success' | 'warning' | 'error' }
> = {
    EASY: { icon: '🟢', color: 'success' },
    MEDIUM: { icon: '🟡', color: 'default' },
    HARD: { icon: '🟠', color: 'warning' },
    EXPERT: { icon: '🔴', color: 'error' }
};

export const priorityConfig: Record<
    TaskPriority,
    { color: 'default' | 'info' | 'warning' | 'error'; label: string }
> = {
    LOW: { color: 'default', label: 'Низкий' },
    MEDIUM: { color: 'info', label: 'Средний' },
    HIGH: { color: 'warning', label: 'Высокий' },
    CRITICAL: { color: 'error', label: 'Критичный' }
};

// Утилита для проверки просрочки
export const isDeadlineOverdue = (deadline: string | null): boolean => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
};

export const statusConfig: Record<TaskStatus, { label: string; color: 'default' | 'warning' | 'success'; icon?: string }> = {
  BACKLOG:    { label: '📋 Бэклог',    color: 'default' },
  IN_PROGRESS:{ label: '🔄 В работе',  color: 'warning' },
  DONE:       { label: '✅ Готово',    color: 'success' },
};