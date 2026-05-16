
import type { TaskSizeCategory, TaskComplexity, TaskPriority } from '../types';

export const sizeCategoryConfig: Record<
    TaskSizeCategory,
    { icon: string; color: 'default' | 'primary' | 'success' | 'warning' }
> = {
    SMALL: { icon: '🔹', color: 'success' },
    MEDIUM: { icon: '🔸', color: 'primary' },
    LARGE: { icon: '🔴', color: 'warning' },
    YEARLY: { icon: '📅', color: 'default' }
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