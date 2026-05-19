
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Container, Typography, Box, Button, Stack, Card, CardContent,
    Chip, IconButton, Divider, Alert, CircularProgress,
    TextField
} from '@mui/material';
import { ArrowBack, Edit, Delete, CalendarToday, BarChart, Grade, PriorityHigh } from '@mui/icons-material';
import { useTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useWorkflow } from '../hooks/useTaskStates';
import type { TaskUpdate, ChecklistItem } from '../types';
import { sizeCategoryConfig, complexityConfig, priorityConfig, isDeadlineOverdue } from '../utils/ColorCategoryConfig';
import { Checklist } from '../components/Checklist';

export const TaskDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const taskId = id ? Number(id) : null;
    // Получаем project_id: либо из state, либо (резерв) из задачи
    const projectIdFromState = (location.state as any)?.fromProjectId;
    const { data: task, isLoading, error } = useTask(taskId ?? 0);
    const { data: workflow } = useWorkflow(task?.project_id ?? 0);

    const updateMut = useUpdateTask();
    const deleteMut = useDeleteTask();

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<TaskUpdate>({
        check_list: [],
    });
    const goToNextTask = (nextTaskId?: number) => {
        if (nextTaskId != null) {
            navigate(`/tasks/${nextTaskId}`, { state: location.state });
        }
    };
    // Заполняем форму при входе в режим редактирования
    useEffect(() => {
        if (task && isEditing) {
            setForm({
                name: task.name,
                description: task.description ?? undefined,
                task_state_id: task.task_state_id ?? undefined,
                check_list: task.check_list?.map(item => ({
                    id: item.id,
                    text: item.text,
                    completed: item.completed,
                    orderIndex: item.orderIndex,
                })) ?? [],
                size_category: task.size_category ?? undefined,
                deadline: task.deadline ?? undefined,
                complexity: task.complexity ?? undefined,
                priority: task.priority ?? undefined,
            });
        }
    }, [task, isEditing]);

    const handleSave = () => {
        if (!taskId) return;
        const clean = Object.fromEntries(
            Object.entries(form).filter(([_, v]) => v !== '' && v != null)
        ) as TaskUpdate;

        updateMut.mutate({ id: taskId, data: clean }, {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleDelete = () => {
        if (!taskId) return;
        if (window.confirm('Удалить эту задачу?')) {
            deleteMut.mutate(taskId, {
                onSuccess: () => {
                    if (task?.project_id) {
                        navigate(`/tasks?project_id=${task.project_id}`);
                    } else {
                        navigate('/tasks');
                    }
                }
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (task) {
            setForm({
                name: task.name,
                description: task.description ?? undefined,
                task_state_id: task.task_state_id ?? undefined,
                check_list: task.check_list?.map(item => ({
                    id: item.id,
                    text: item.text,
                    completed: item.completed,
                    orderIndex: item.orderIndex,
                })) ?? [],
                size_category: task.size_category ?? undefined,
                deadline: task.deadline ?? undefined,
                complexity: task.complexity ?? undefined,
                priority: task.priority ?? undefined,
            });
        }
    };
    const handleBack = () => {
        const projectId = projectIdFromState || task?.project_id;
        navigate(projectId ? `/tasks?project_id=${projectId}` : '/tasks');
    };
    // Пока загрузка или ошибка
    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Загрузка задачи...</Typography>
            </Container>
        );
    }

    if (error || !task) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Задача не найдена или произошла ошибка
                </Alert>
                <Button component={Link} to="/projects" startIcon={<ArrowBack />}>
                    К проектам
                </Button>
            </Container>
        );
    }

    // Позиция в воркфлоу
    const workflowIndex = workflow?.findIndex(s => s.id === task.task_state_id) ?? -1;

    const currentStateLabel = workflowIndex >= 0 ? `Этап ${workflowIndex + 1}` : 'Без состояния';


    console.log(workflow && workflowIndex >= 0 && workflowIndex <= workflow.length - 1);
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Хедер с навигацией */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={handleBack} size="small">
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4">
                        {isEditing ? '✏️ Редактирование' : '📋 Задача'} #{task.id}
                    </Typography>
                </Box>
                {!isEditing && (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => setIsEditing(true)}
                        >
                            Редактировать
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleDelete}
                            disabled={deleteMut.isPending}
                        >
                            Удалить
                        </Button>
                    </Stack>
                )}
            </Box>

            {/* Карточка задачи */}
            <Card variant="outlined">
                <CardContent sx={{ '& > *': { mb: 2 } }}>
                    {/* 🔗 Состояние / воркфлоу */}
                    <Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                            <Chip
                                label={`#${task.task_state_id} • ${currentStateLabel}`}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />

                            {/* Предыдущий этап */}
                            {workflow && workflowIndex > 0 && (
                                <Chip
                                    label={`← Предыдущий: #${workflow[workflowIndex - 1].id}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => {

                                        console.log("workflow")
                                        console.log(workflow)
                                        console.log("workflowIndex")
                                        console.log(workflowIndex)
                                        console.log("task")
                                        console.log(task)
                                        goToNextTask(workflow[workflowIndex - 1].id)

                                    }}
                                />
                            )}

                            {/* Следующий этап */}
                            {workflow && workflowIndex >= 0 && workflowIndex < workflow.length - 1 && (
                                <Chip
                                    label={`→ Следующий: #${workflow[workflowIndex + 1].id}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => {

                                        goToNextTask(workflow[workflowIndex + 1].id)
                                        console.log(workflow)
                                        console.log(workflowIndex)
                                        console.log(task)

                                    }}
                                />
                            )}
                        </Stack>
                    </Box>

                    {/* Название */}
                    {isEditing ? (
                        <TextField
                            label="Название"
                            fullWidth
                            value={form.name ?? ''}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            autoFocus
                        />
                    ) : (
                        <Typography variant="h5"
                            sx={{ fontWeight: 600 }}>{task.name}</Typography>
                    )
                    }

                    {/* Описание */}
                    {isEditing ? (
                        <TextField
                            label="Описание"
                            fullWidth
                            multiline
                            rows={4}
                            value={form.description ?? ''}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        />
                    ) : task.description ? (
                        <Typography variant="body1" color="text.secondary">{task.description}</Typography>
                    ) : (
                        <Typography variant="body2" color="text.disabled">Нет описания</Typography>
                    )}

                    <Divider />

                    {/* 📏 Размер */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            <BarChart fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Размер
                        </Typography>
                        {task.size_category ? (
                            <Chip
                                label={`${sizeCategoryConfig[task.size_category].icon} ${task.size_category.toLowerCase()}`}
                                size="small"
                                color={sizeCategoryConfig[task.size_category].color}
                            />
                        ) : (
                            <Typography variant="body2" color="text.disabled">Не задан</Typography>
                        )}
                    </Box>

                    <Divider />
                    {/* 📋 Чек-лист */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            📋 Чек-лист задач
                        </Typography>
                        {isEditing ? (
                            <Checklist
                                items={form.check_list || []}
                                onChange={(items: ChecklistItem[]) => setForm(p => ({ ...p, check_list: items }))}
                                editable={true}
                            />
                        ) : task.check_list?.length ? (
                            <Checklist
                                items={task.check_list}
                                onChange={(items: ChecklistItem[]) => {
                                    updateMut.mutate({ id: task.id, data: { check_list: items } });
                                }}
                                editable={false}
                            />
                        ) : (
                            <Typography variant="body2" color="text.disabled">Чек-лист пуст</Typography>
                        )}
                    </Box>

                    {/* ⚙️ Сложность */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            <Grade fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Сложность
                        </Typography>
                        {task.complexity ? (
                            <Chip
                                label={`${complexityConfig[task.complexity].icon} ${task.complexity.toLowerCase()}`}
                                size="small"
                                color={complexityConfig[task.complexity].color}
                                variant="outlined"
                            />
                        ) : (
                            <Typography variant="body2" color="text.disabled">Не задана</Typography>
                        )}
                    </Box>

                    {/* 🎯 Приоритет */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            <PriorityHigh fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Приоритет
                        </Typography>
                        {task.priority ? (
                            <Chip
                                label={priorityConfig[task.priority].label}
                                size="small"
                                color={priorityConfig[task.priority].color}
                                variant="filled"
                            />
                        ) : (
                            <Typography variant="body2" color="text.disabled">Не задан</Typography>
                        )}
                    </Box>

                    {/* 📅 Дедлайн */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            <CalendarToday fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Срок выполнения
                        </Typography>
                        {task.deadline ? (
                            <Chip
                                label={task.deadline}
                                size="small"
                                color={isDeadlineOverdue(task.deadline) ? 'error' : 'default'}
                                variant={isDeadlineOverdue(task.deadline) ? 'filled' : 'outlined'}
                            />
                        ) : (
                            <Typography variant="body2" color="text.disabled">Не задан</Typography>
                        )}
                    </Box>

                    {/* 🕐 Метаданные */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            📊 Метаданные
                        </Typography>
                        <Stack direction="row" spacing={2}
                            sx={{ flexWrap: "wrap" }}>
                            <Typography variant="body2">
                                <strong>ID:</strong> {task.id}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Создана:</strong> {new Date(task.created_at).toLocaleString('ru-RU')}
                            </Typography>
                            {task.project_id && (
                                <Typography variant="body2">
                                    <strong>Проект:</strong> #{task.project_id}
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                </CardContent>
            </Card>

            {/* Кнопки сохранения/отмены в режиме редактирования */}
            {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={handleCancel}>
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={updateMut.isPending || !form.name?.trim()}
                    >
                        {updateMut.isPending ? 'Сохранение...' : '💾 Сохранить изменения'}
                    </Button>
                </Box>
            )}
        </Container>
    );
};