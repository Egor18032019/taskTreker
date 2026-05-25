import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Typography, Box, Card, CardContent, Stack, Chip,
    IconButton, Alert, CircularProgress, Divider, Tooltip
} from '@mui/material';
import { ArrowBack, CalendarToday, Grade, PriorityHigh, BarChart } from '@mui/icons-material';
import { useRecommendedTasks } from '../hooks/useTasks';
import { StatusChip } from '../components/StatusChip';
import { complexityConfig, priorityConfig, sizeCategoryConfig, isDeadlineOverdue } from '../utils/CategoryConfig';
import type { Task } from '../types';

export const RecommendedTasksPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const projectId = (location.state as any)?.projectId;

    const { data: tasks, isLoading, error } = useRecommendedTasks(projectId);

    const handleBack = () => {
        navigate(projectId ? `/tasks?project_id=${projectId}` : '/tasks');
    };

    const handleTaskClick = (taskId: number) => {
        // Передаём контекст навигации, чтобы работала навигация ← →
        navigate(`/tasks/${taskId}`, {
            state: {
                fromProjectId: projectId,
                taskIds: tasks?.map(t => t.id) || [],
                currentIndex: tasks?.findIndex(t => t.id === taskId) || 0
            }
        });
    };

    // 🔹 Вспомогательная функция: расчёт "срочности" для отображения
    const getDeadlineBadge = (deadline: string | null) => {
        if (!deadline) return null;
        const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        if (days < 0) return <Chip label="⚠️ Просрочено" color="error" size="small" />;
        if (days === 0) return <Chip label="🔥 Сегодня" color="error" size="small" />;
        if (days === 1) return <Chip label="📅 Завтра" color="warning" size="small" />;
        if (days <= 3) return <Chip label={`⏳ ${days} дн.`} color="info" size="small" />;
        return <Chip label={`🗓️ ${days} дн.`} variant="outlined" size="small" />;
    };

    // 🔹 Почему задача рекомендована?
    const getRecommendationReasons = (task: Task) => {
        const reasons: { icon: React.ReactNode; text: string; color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }[] = [];

        if (task.priority === 'CRITICAL' || task.priority === 'HIGH') {
            reasons.push({ icon: <PriorityHigh fontSize="small" />, text: 'Высокий приоритет', color: 'error' });
        }
        if (task.deadline && !isDeadlineOverdue(task.deadline)) {
            const days = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (days <= 3) reasons.push({ icon: <CalendarToday fontSize="small" />, text: `Срок: ${days <= 0 ? 'сегодня' : `через ${days} дн.`}`, color: 'warning' });
        }
        if (task.complexity === 'EASY' || task.complexity === 'MEDIUM') {
            reasons.push({ icon: <Grade fontSize="small" />, text: 'Быстро выполнимо', color: 'success' });
        }
        if (task.size_category === 'SMALL') {
            reasons.push({ icon: <BarChart fontSize="small" />, text: 'Малый объём', color: 'primary' });
        }

        return reasons;
    };

    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>🎯 Подбираем лучшие задачи на сегодня...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Не удалось загрузить рекомендации
                </Alert>
                <IconButton onClick={handleBack}><ArrowBack /></IconButton>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Хедер */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={handleBack} size="small">
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Typography variant="h5">🎯 Рекомендовано на сегодня</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {tasks?.length || 0} задач • {projectId ? `Проект #${projectId}` : 'Все проекты'}
                    </Typography>
                </Box>
            </Box>

            {/* Список рекомендаций */}
            {tasks && tasks.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    ✨ Нет задач для рекомендаций на сегодня.
                    Попробуйте добавить новые задачи или проверить дедлайны.
                </Alert>
            )}

            <Stack spacing={2}>
                {tasks?.map((task, index) => {
                    const reasons = getRecommendationReasons(task);
                    console.log(index);
                    return (
                        <Card
                            key={task.id}
                            variant="outlined"
                            sx={{
                                cursor: 'pointer',
                                transition: 'box-shadow 0.2s',
                                '&:hover': {
                                    boxShadow: 3,
                                    borderColor: 'primary.main'
                                },
                                borderLeft: `4px solid ${task.priority === 'CRITICAL' ? '#d32f2f' :
                                    task.priority === 'HIGH' ? '#ed6c02' :
                                        '#2196f3'
                                    }`
                            }}
                            onClick={() => handleTaskClick(task.id)}
                        >
                            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                {/* Заголовок */}
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                                    <Chip
                                        label={`#${task.id}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20 }}
                                    />
                                    <Typography variant="h6" sx={{ fontWeight: 500, flexGrow: 1 }}>
                                        {task.name}
                                    </Typography>
                                    <StatusChip status={task.status} />
                                </Stack>

                                {/* Описание (сокращённое) */}
                                {task.description && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 1.5,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {task.description}
                                    </Typography>
                                )}

                                {/* Мета-информация */}
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                                    {/* Приоритет */}
                                    {task.priority && (
                                        <Chip
                                            icon={<PriorityHigh fontSize="small" />}
                                            label={priorityConfig[task.priority].label}
                                            color={priorityConfig[task.priority].color}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}

                                    {/* Сложность */}
                                    {task.complexity && (
                                        <Chip
                                            icon={<Grade fontSize="small" />}
                                            label={task.complexity.toLowerCase()}
                                            color={complexityConfig[task.complexity].color}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}

                                    {/* Размер */}
                                    {task.size_category && (
                                        <Chip
                                            label={task.size_category.toLowerCase()}
                                            icon={<span>{sizeCategoryConfig[task.size_category].icon}</span>}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}

                                    {/* Дедлайн */}
                                    {task.deadline && (
                                        <Tooltip title={`Дедлайн: ${new Date(task.deadline).toLocaleDateString('ru-RU')}`}>
                                            <span>
                                                {getDeadlineBadge(task.deadline)}
                                            </span>
                                        </Tooltip>
                                    )}
                                </Stack>

                                <Divider sx={{ my: 1 }} />

                                {/* Почему рекомендовано */}
                                {reasons.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                            💡 Почему эта задача:
                                        </Typography>
                                        {reasons.map((reason, idx) => (
                                            <Chip
                                                key={idx}
                                                label={reason.text}
                                                size="small"
                                                //                                                 icon={reason.icon}
                                                color={reason.color}
                                                variant="outlined"
                                                sx={{ height: 24, fontSize: '0.7rem' }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>

            {/* Подсказка внизу */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    💡 Кликните на задачу, чтобы открыть детали •
                    Алгоритм учитывает: приоритет, срочность, сложность и размер
                </Typography>
            </Box>
        </Container>
    );
};