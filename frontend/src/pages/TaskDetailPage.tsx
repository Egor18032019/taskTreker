
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Container, Typography, Box, Button, Stack, Card, CardContent,
    Chip, IconButton, Divider, Alert, CircularProgress,
    TextField,
    MenuItem, Menu,
    FormControl, Select
} from '@mui/material';
import {
    ArrowBack, Edit, Delete, CalendarToday, BarChart, Grade, PriorityHigh

} from '@mui/icons-material';
import { useTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus } from '../hooks/useTasks';

import type { TaskUpdate, ChecklistItem, TaskStatus, TaskComplexity, TaskPriority, TaskSizeCategory } from '../types';
import { sizeCategoryConfig, complexityConfig, priorityConfig, isDeadlineOverdue } from '../utils/CategoryConfig';
import { Checklist } from '../components/Checklist';
import { StatusChip } from '../components/StatusChip';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { Edit as EditIcon } from '@mui/icons-material';

export const TaskDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const taskId = id ? Number(id) : null;
    // Получаем project_id: либо из state, либо (резерв) из задачи
    const projectIdFromState = (location.state as any)?.fromProjectId;
    const navState = location.state as {
        taskIds?: number[];
        currentIndex?: number;
        fromProjectId?: number;
        filters?: any;
    } | null;
    const taskIds = navState?.taskIds || [];
    const currentIndex = navState?.currentIndex ?? -1;

    const { data: task, isLoading, error } = useTask(taskId ?? 0);
    const updateMut = useUpdateTask();
    const deleteMut = useDeleteTask();
    const updateStatusMut = useUpdateTaskStatus();
    const [deadlineAnchorEl, setDeadlineAnchorEl] = useState<HTMLElement | null>(null);
    const [tempDeadline, setTempDeadline] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<TaskUpdate>({
        check_list: [],
    });
    // Anchor-элементы для выпадающих меню
    const [complexityAnchor, setComplexityAnchor] = useState<HTMLElement | null>(null);
    const [priorityAnchor, setPriorityAnchor] = useState<HTMLElement | null>(null);
    const [sizeAnchor, setSizeAnchor] = useState<HTMLElement | null>(null);

    // 🔹 Сложность
    const handleComplexityClick = (e: React.MouseEvent) => setComplexityAnchor(e.currentTarget as HTMLElement);
    const handleComplexityClose = () => setComplexityAnchor(null);
    const handleComplexityChange = (value: TaskComplexity | undefined) => {
        updateMut.mutate({ id: taskId, data: { complexity: value } });
        handleComplexityClose();
    };

    // 🔹 Приоритет
    const handlePriorityClick = (e: React.MouseEvent) => setPriorityAnchor(e.currentTarget as HTMLElement);
    const handlePriorityClose = () => setPriorityAnchor(null);
    const handlePriorityChange = (value: TaskPriority | undefined) => {
        updateMut.mutate({ id: taskId, data: { priority: value } });
        handlePriorityClose();
    };

    // 🔹 Размер (категория)
    const handleSizeClick = (e: React.MouseEvent) => setSizeAnchor(e.currentTarget as HTMLElement);
    const handleSizeClose = () => setSizeAnchor(null);
    const handleSizeChange = (value: TaskSizeCategory | undefined) => {
        updateMut.mutate({ id: taskId, data: { size_category: value } });
        handleSizeClose();
    };

    const goToPrevTask = () => {
        if (currentIndex > 0 && taskIds[currentIndex - 1]) {
            const prevTaskId = currentIndex - 1;
            navState.currentIndex = prevTaskId;
            navigate(`/tasks/${taskIds[prevTaskId]}`, { state: location.state });
        }
    };

    const goToNextTask = () => {
        if (currentIndex >= 0 && currentIndex < taskIds.length - 1 && taskIds[currentIndex + 1]) {
            const nextTaskId = currentIndex + 1;
            navState.currentIndex = nextTaskId;
            navigate(`/tasks/${taskIds[nextTaskId]}`, { state: location.state });
        }
    };
    // Заполняем форму при входе в режим редактирования
    useEffect(() => {
        if (task && isEditing) {
            setForm({
                name: task.name,
                description: task.description ?? undefined,
                status: task.status,
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

    // Открыть выбор даты
    const handleDeadlineClick = (event: React.MouseEvent) => {
        setTempDeadline(task.deadline || null);
        setDeadlineAnchorEl(event.currentTarget as HTMLElement);
    };

    // Закрыть без сохранения
    const handleDeadlineCancel = () => {
        setDeadlineAnchorEl(null);
        setTempDeadline(null);
    };

    // Сохранить новую дату
    const handleDeadlineSave = (date: Date | null) => {
        const newDeadline = date ? date.toISOString().split('T')[0] : null; // "YYYY-MM-DD"

        updateMut.mutate({
            id: taskId,
            data: { deadline: newDeadline }
        }, {
            onSuccess: () => {
                setDeadlineAnchorEl(null);
                setTempDeadline(null);
            }
        });
    };

    // Убрать дедлайн совсем
    const handleDeadlineClear = () => {
        handleDeadlineSave(null);
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
                status: task.status ?? undefined,
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

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Хедер с навигацией */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={handleBack} size="small">
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5">
                        {isEditing ? '✏️ Редактирование' : '📋 Задача'} #{task.id} Проекта №{task.project_id}
                    </Typography>
                </Box>
                {!isEditing && (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => setIsEditing(true)}>
                            Редактировать
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleDelete}
                            disabled={deleteMut.isPending}>
                            Удалить
                        </Button>
                    </Stack>
                )}
            </Box>

            {/* Карточка задачи */}
            <Card variant="outlined">
                <CardContent sx={{ '& > *': { mb: 2 } }}>
                    {/* Переходы */}
                    <Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                            <Chip
                                label={`#${task.id}`}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />

                            {/* Предыдущий этап */}
                            {(
                                <Chip
                                    label={`← Предыдущий: #${taskIds[currentIndex - 1]}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        console.log("task")
                                        console.log(task)
                                        goToPrevTask()
                                    }}
                                    disabled={currentIndex <= 0}
                                />
                            )}

                            {/* Следующий этап */}
                            {(
                                <Chip
                                    label={`→ Следующий: #${taskIds[currentIndex + 1]}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        console.log(task)

                                        goToNextTask();
                                    }}
                                    disabled={currentIndex >= taskIds.length - 1}
                                />
                            )}
                        </Stack>
                    </Box>

                    <Stack direction="row" spacing={2}
                        sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: "space-around" }}>
                        {/* 🔄 Статус задачи */}
                        <Stack direction="row" spacing={2}
                            sx={{ alignItems: "center", mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Статус:</Typography>
                            {isEditing ? (
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={form.status || 'BACKLOG'}
                                        onChange={e => setForm(p => ({ ...p, status: e.target.value as TaskStatus }))}
                                    >
                                        <MenuItem value="BACKLOG">📋 Бэклог</MenuItem>
                                        <MenuItem value="IN_PROGRESS">🔄 В работе</MenuItem>
                                        <MenuItem value="DONE">✅ Готово</MenuItem>
                                    </Select>
                                </FormControl>
                            ) : (
                                <StatusChip
                                    status={task.status}
                                    editable={true}
                                    onChange={(newStatus) => {
                                        updateStatusMut.mutate({ id: task.id, status: newStatus });
                                    }}
                                />
                            )}
                        </Stack>

                        {/* 📅 Дедлайн — интерактивный */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                <CalendarToday fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                Срок выполнения
                            </Typography>

                            {/* 👇 Клик-чип или кнопка редактирования */}
                            <Chip
                                label={task.deadline || 'Не задан'}
                                size="small"
                                color={task.deadline && isDeadlineOverdue(task.deadline) ? 'error' : 'default'}
                                variant={task.deadline ? 'filled' : 'outlined'}
                                onClick={handleDeadlineClick}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.9 }
                                }}
                                onDelete={task.deadline ? handleDeadlineClear : undefined}
                                deleteIcon={<EditIcon fontSize="small" />}
                            />

                            {/* 👇 Всплывающий DatePicker */}
                            {deadlineAnchorEl && (
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                                    <DatePicker
                                        open
                                        value={tempDeadline ? new Date(tempDeadline) : null}
                                        onChange={handleDeadlineSave}
                                        onClose={handleDeadlineCancel}
                                        minDate={new Date()} // нельзя выбрать прошедшую дату (опционально)
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                label: 'Выберите дату',
                                                sx: {
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    mt: 1,
                                                    zIndex: 1000,
                                                    bgcolor: 'background.paper',
                                                    width: 280
                                                }
                                            },
                                            popper: { keepMounted: true }
                                        }}
                                    />
                                </LocalizationProvider>
                            )}

                            {task.deadline && !isDeadlineOverdue(task.deadline) && (
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Осталось дней: {Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                                </Typography>
                            )}
                        </Box>

                    </Stack>
                    {/* Название */}
                    {isEditing ? (
                        <TextField
                            label="Название"
                            sx={{ marginBottom: 0.7 }}
                            fullWidth
                            value={form.name ?? ''}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            autoFocus
                        />
                    ) : (
                        <Typography variant="h5"
                            sx={{ fontWeight: 600 }}>{task.name}</Typography>
                    )}

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

                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* ⚙️ Сложность — редактируемая */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                <Grade fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                Сложность
                            </Typography>

                            <Chip
                                label={task.complexity ? `${complexityConfig[task.complexity].icon} ${task.complexity.toLowerCase()}` : 'Не задана'}
                                size="small"
                                color={task.complexity ? complexityConfig[task.complexity].color : 'default'}
                                variant={task.complexity ? 'filled' : 'outlined'}
                                onClick={handleComplexityClick}
                                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
                                onDelete={task.complexity ? () => handleComplexityChange(undefined) : undefined}
                            />

                            {/* Меню выбора */}
                            <Menu anchorEl={complexityAnchor} open={!!complexityAnchor} onClose={handleComplexityClose}>
                                <MenuItem onClick={() => handleComplexityChange(undefined)} selected={!task.complexity}>
                                    <em>Не задана</em>
                                </MenuItem>
                                {Object.entries(complexityConfig).map(([key, cfg]) => (
                                    <MenuItem
                                        key={key}
                                        onClick={() => handleComplexityChange(key as TaskComplexity)}
                                        selected={task.complexity === key}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>{cfg.icon}</span>
                                            <span>{key.toLowerCase()}</span>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>``

                        {/* 🎯 Приоритет — редактируемый */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                <PriorityHigh fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                Приоритет
                            </Typography>

                            <Chip
                                label={task.priority ? priorityConfig[task.priority].label : 'Не задан'}
                                size="small"
                                color={task.priority ? priorityConfig[task.priority].color : 'default'}
                                variant={task.priority ? 'filled' : 'outlined'}
                                onClick={handlePriorityClick}
                                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
                                onDelete={task.priority ? () => handlePriorityChange(undefined) : undefined}
                            />

                            {/* Меню выбора */}
                            <Menu anchorEl={priorityAnchor} open={!!priorityAnchor} onClose={handlePriorityClose}>
                                <MenuItem onClick={() => handlePriorityChange(undefined)} selected={!task.priority}>
                                    <em>Не задан</em>
                                </MenuItem>
                                {Object.entries(priorityConfig).map(([key, cfg]) => (
                                    <MenuItem
                                        key={key}
                                        onClick={() => handlePriorityChange(key as TaskPriority)}
                                        selected={task.priority === key}
                                    >
                                        <Chip size="small" label={cfg.label} color={cfg.color} sx={{ height: 20 }} />
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                        {/* 📏 Размер — редактируемый */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                <BarChart fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                Размер
                            </Typography>

                            <Chip
                                label={task.size_category ? `${sizeCategoryConfig[task.size_category].icon} ${task.size_category.toLowerCase()}` : 'Не задан'}
                                size="small"
                                color={task.size_category ? sizeCategoryConfig[task.size_category].color : 'default'}
                                variant={task.size_category ? 'filled' : 'outlined'}
                                onClick={handleSizeClick}
                                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
                                onDelete={task.size_category ? () => handleSizeChange(undefined) : undefined}
                            />

                            {/* Меню выбора */}
                            <Menu anchorEl={sizeAnchor} open={!!sizeAnchor} onClose={handleSizeClose}>
                                <MenuItem onClick={() => handleSizeChange(undefined)} selected={!task.size_category}>
                                    <em>Не задан</em>
                                </MenuItem>
                                {Object.entries(sizeCategoryConfig).map(([key, cfg]) => (
                                    <MenuItem
                                        key={key}
                                        onClick={() => handleSizeChange(key as TaskSizeCategory)}
                                        selected={task.size_category === key}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>{cfg.icon}</span>
                                            <span>{key.toLowerCase()}</span>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                        {/*  Метаданные */}
                        <Box>
                            <Stack direction="row" spacing={2}
                                sx={{ flexWrap: "wrap" }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Метаданные
                                </Typography>
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
                    </Stack>
                </CardContent>
            </Card>

            {/* Кнопки сохранения/отмены в режиме редактирования */}
            {
                isEditing && (
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
                )
            }
        </Container >
    );
};