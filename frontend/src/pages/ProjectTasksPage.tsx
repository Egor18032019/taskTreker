import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Stack, Card, CardContent, IconButton, Chip,
    FormControl, InputLabel, Select, MenuItem,
    FormHelperText
} from '@mui/material';
import { Edit, Delete, CalendarToday, Sort, GroupWork, ArrowBack } from '@mui/icons-material';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import type { Task, TaskCreate, TaskSizeCategory, FetchTasksParams, ChecklistItem } from '../types';
import { sizeCategoryConfig, complexityConfig, priorityConfig, isDeadlineOverdue } from '../utils/CategoryConfig';
import { Checklist } from '../components/Checklist';

export const ProjectTasksPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 👇 Получаем project_id из URL (если есть)
    const projectIdFromUrl = searchParams.get('project_id');
    const projectId = projectIdFromUrl ? Number(projectIdFromUrl) : undefined;
    const [filter, setFilter] = useState('');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Task | null>(null);
    const [, setSelectedTask] = useState<Task | null>(null);

    // Сортировка и группировка
    const [sortBy, setSortBy] = useState<string>('');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [groupBy, setGroupBy] = useState<string>('');

    // 👇 Форма использует snake_case для API-совместимости
    const [form, setForm] = useState<TaskCreate>({
        name: '', description: '', check_list: [], size_category: undefined,
        deadline: '', complexity: undefined, priority: undefined, project_id: projectId,
    });

    // Параметры запроса
    const fetchParams: FetchTasksParams = useMemo(() => {
        const params: FetchTasksParams = {
            project_id: projectId
        };
        if (filter) params.name_prefix = filter;
        if (sortBy) params.sort_by = sortBy as any;
        if (sortDir) params.sort_dir = sortDir;

        return params;
    }, [filter, sortBy, sortDir, projectId]);

    const { data: tasks, isLoading } = useTasks(fetchParams);

    const createMut = useCreateTask();
    const updateMut = useUpdateTask();
    const deleteMut = useDeleteTask();



    // 🔗 Возврат к списку проектов
    const handleBackToProjects = () => {
        navigate('/projects');
    };

    const handleSubmit = () => {
        if (!form.name.trim()) return;
        const clean = Object.fromEntries(
            Object.entries(form).filter(([_, v]) => v !== '' && v != null)
        ) as TaskCreate;

        if (editing) updateMut.mutate({ id: editing.id, data: clean });
        else createMut.mutate(clean);
        handleClose();
    };

    const handleOpen = (t?: Task) => {
        setEditing(t || null);
        setForm({
            name: t?.name || '', description: t?.description || '',
            check_list: t?.check_list?.map(item => ({
                id: item.id,
                text: item.text,
                completed: item.completed,
                orderIndex: item.orderIndex,
            })) ?? [],
            size_category: t?.size_category ?? undefined,
            deadline: t?.deadline || '',
            complexity: t?.complexity ?? undefined,
            priority: t?.priority ?? undefined,
            project_id: t ? t.project_id : projectId
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false); setEditing(null); setSelectedTask(null);
        setForm({
            name: '', description: '', check_list: [], size_category: undefined,
            deadline: '', complexity: undefined, priority: undefined, project_id: projectId
        });
    };

    // 🔗 Группировка задач на клиенте
    const groupedTasks = useMemo(() => {
        if (!tasks || !groupBy) return { All: tasks };
        return tasks.reduce((acc, task) => {
            let key = 'Unspecified';
            if (groupBy === 'priority' && task.priority) key = task.priority;
            else if (groupBy === 'complexity' && task.complexity) key = task.complexity;

            acc[key] = acc[key] || [];
            acc[key].push(task);
            return acc;
        }, {} as Record<string, Task[]>);
    }, [tasks, groupBy]);



    // 🔗 Рендер одной карточки задачи
    const renderTaskCard = (task: Task) => {
        const handleCardClick = (e: React.MouseEvent, task: Task) => {
            // Игнорируем клик, если нажали на кнопку
            if ((e.target as HTMLElement).closest('button')) return;

            //   Формируем массив ID задач в текущем! порядке отображения
            const taskIds = tasks?.map(t => t.id) || [];
            const currentIndex = taskIds.indexOf(task.id);

            navigate(`/tasks/${task.id}`, {
                state: {
                    fromProjectId: projectId,
                    taskIds,           // 👈 [10, 45, 123, 78]
                    currentIndex,      // 👈 2
                    filters: {         // 👈 На случай, если нужно пересчитать
                        project_id: projectId,
                        sort_by: sortBy,
                        sort_dir: sortDir,
                    }
                }
            });

        };
        return (
            <Card key={task.id} variant="outlined"
                onClick={(e) => handleCardClick(e, task)}
                sx={{
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 1 }
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6"
                            sx={{ wordBreak: 'break-word' }}>{task.name}</Typography>
                        <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" onClick={() => { setSelectedTask(task); handleOpen(task); }}>
                                <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteMut.mutate(task.id)} disabled={deleteMut.isPending}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Box>

                    {task.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {task.description}
                        </Typography>
                    )}

                    {/* Чипы с параметрами */}
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 1 }}>
                        {task.size_category && (
                            <Chip
                                label={`${sizeCategoryConfig[task.size_category].icon} ${task.size_category.toLowerCase()}`}
                                size="small" color={sizeCategoryConfig[task.size_category].color} variant="outlined"
                            />
                        )}
                        {/* 📋 Превью чек-листа */}
                        {task.check_list?.length > 0 && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                    📋 Чек-лист ({task.check_list.filter(i => i.completed).length}/{task.check_list.length})
                                </Typography>
                                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                    {task.check_list.slice(0, 3).map((item, idx) => (
                                        <Chip
                                            key={item.id || idx}
                                            label={item.text}
                                            size="small"
                                            color={item.completed ? 'success' : 'default'}
                                            variant={item.completed ? 'filled' : 'outlined'}
                                            sx={{
                                                height: 24,
                                                fontSize: '0.7rem',
                                                textDecoration: item.completed ? 'line-through' : 'none'
                                            }}
                                        />
                                    ))}
                                    {task.check_list.length > 3 && (
                                        <Chip label={`+${task.check_list.length - 3}`} size="small" variant="outlined" />
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {task.complexity && (
                            <Chip
                                label={`${complexityConfig[task.complexity].icon} ${task.complexity.toLowerCase()}`}
                                size="small" color={complexityConfig[task.complexity].color} variant="outlined"
                            />
                        )}
                        {task.priority && (
                            <Chip
                                label={priorityConfig[task.priority].label}
                                size="small" color={priorityConfig[task.priority].color}
                                variant="filled"
                            />
                        )}
                        {task.deadline && (
                            <Chip
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CalendarToday fontSize="small" /> {task.deadline}
                                    </Box>
                                }
                                size="small"
                                color={isDeadlineOverdue(task.deadline) ? 'error' : 'default'}
                                variant={isDeadlineOverdue(task.deadline) ? 'filled' : 'outlined'}
                            />
                        )}

                    </Stack>
                </CardContent>
            </Card>
        );
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Заголовок с кнопкой "Назад" если есть проект */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {projectId && (
                        <IconButton onClick={handleBackToProjects} size="small">
                            <ArrowBack />
                        </IconButton>
                    )}
                    <Typography variant="h4">
                        {projectId ? `Задачи проекта #${projectId}` : 'Все задачи'}
                    </Typography>
                </Box>
                <Button variant="contained" onClick={() => handleOpen()}>+ Добавить</Button>
            </Box>

            {/* Панель управления: поиск + сортировка + группировка */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
                    <TextField
                        label="Поиск по названию"
                        size="small"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        sx={{ width: { xs: '100%', sm: 200 } }}
                    />

                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 180 } }}>
                        <InputLabel>Сортировка</InputLabel>
                        <Select
                            value={sortBy}
                            label="Сортировка"
                            onChange={e => setSortBy(e.target.value)}
                            startAdornment={<Sort fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                        >
                            <MenuItem value="">Нет</MenuItem>
                            <MenuItem value="priority">Приоритет</MenuItem>
                            <MenuItem value="complexity">Сложность</MenuItem>

                            <MenuItem value="size_category">Категория размера</MenuItem>
                            <MenuItem value="deadline">Срок</MenuItem>
                            <MenuItem value="createdAt">Дата создания</MenuItem>
                            <MenuItem value="name">Название</MenuItem>
                        </Select>
                    </FormControl>

                    {sortBy && (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                            sx={{ minWidth: 'auto' }}
                        >
                            {sortDir === 'asc' ? '↑' : '↓'}
                        </Button>
                    )}

                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 180 } }}>
                        <InputLabel>Группировка</InputLabel>
                        <Select
                            value={groupBy}
                            label="Группировка"
                            onChange={e => setGroupBy(e.target.value)}
                            startAdornment={<GroupWork fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                        >
                            <MenuItem value="">Нет</MenuItem>
                            <MenuItem value="priority">По приоритету</MenuItem>
                            <MenuItem value="complexity">По сложности</MenuItem>
                            <MenuItem value="size_category">По размеру</MenuItem>
                            <MenuItem value="task_state_id">По состоянию</MenuItem>
                            <MenuItem value="deadline">По сроку</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Box>



            {/* Список задач */}
            <Stack spacing={2}>
                {isLoading ? (
                    <Typography sx={{ textAlign: 'center' }}>Загрузка...</Typography>
                ) : tasks?.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            {filter || sortBy || groupBy ? 'Ничего не найдено' : 'Задач пока нет'}
                        </Typography>
                        {!projectId && (
                            <Button variant="outlined" onClick={() => navigate('/projects')}>
                                Перейти к проектам
                            </Button>
                        )}
                    </Box>
                ) : (
                    Object.entries(groupedTasks).map(([groupKey, groupTasks]) => (
                        <Box key={groupKey}>
                            {groupBy && (
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {groupKey}
                                    <Chip size="small" label={`${groupTasks.length}`} sx={{ height: 20 }} />
                                </Typography>
                            )}
                            <Stack spacing={1}>
                                {groupTasks.map(renderTaskCard)}
                            </Stack>
                        </Box>
                    ))
                )}
            </Stack>

            {/* Модалка создания/редактирования */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
                <DialogTitle>{editing ? '✏️ Редактировать' : '➕ Новая'} задачу</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Название *" required fullWidth
                            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        />
                        <TextField label="Описание" fullWidth multiline rows={3}
                            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        />



                        {/* Размер: Points + Category */}
                        {/* 📋 Чек-лист задач */}
                        <FormControl fullWidth>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                📋 Чек-лист задач
                            </Typography>
                            <Checklist
                                items={form.check_list || []}
                                onChange={(items: ChecklistItem[]) => setForm(p => ({ ...p, check_list: items }))}
                                editable={true}
                            />
                            <FormHelperText>
                                Добавьте пункты: "Позвонить", "Подготовить документы"... Отмечайте выполненные ✓
                            </FormHelperText>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Категория</InputLabel>
                            <Select
                                value={form.size_category || ''} label="Категория"
                                onChange={e => setForm(p => ({ ...p, size_category: (e.target.value as TaskSizeCategory) || undefined }))}
                            >
                                <MenuItem value=""><em>Не задано</em></MenuItem>
                                {Object.keys(sizeCategoryConfig).map(cat => (
                                    <MenuItem key={cat} value={cat}>
                                        {sizeCategoryConfig[cat as TaskSizeCategory].icon} {cat.toLowerCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    {/* Сложность + Приоритет */}
                    <Stack direction="row" spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel>Сложность</InputLabel>
                            <Select
                                value={form.complexity || ''} label="Сложность"
                                onChange={e => setForm(p => ({ ...p, complexity: (e.target.value as any) || undefined }))}
                            >
                                <MenuItem value=""><em>Не задано</em></MenuItem>
                                {Object.keys(complexityConfig).map(c => (
                                    <MenuItem key={c} value={c}>
                                        {complexityConfig[c as any].icon} {c.toLowerCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Приоритет</InputLabel>
                            <Select
                                value={form.priority || ''} label="Приоритет"
                                onChange={e => setForm(p => ({ ...p, priority: (e.target.value as any) || undefined }))}
                            >
                                <MenuItem value=""><em>Не задано</em></MenuItem>
                                {Object.keys(priorityConfig).map(p => (
                                    <MenuItem key={p} value={p}>
                                        <Chip size="small" label={priorityConfig[p as any].label}
                                            color={priorityConfig[p as any].color} sx={{ height: 20 }} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    {/* Дедлайн */}
                    <TextField label="Срок" type="date" fullWidth
                        value={form.deadline || ''}
                        onChange={e => setForm(p => ({ ...p, deadline: e.target.value || undefined }))}
                        slotProps={{
                            htmlInput: { min: new Date().toISOString().split('T')[0] },
                            inputLabel: { shrink: true }
                        }}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Отмена</Button>
                    <Button variant="contained" onClick={handleSubmit}
                        disabled={createMut.isPending || updateMut.isPending || !form.name.trim()}>
                        {editing ? '💾 Сохранить' : '✨ Создать'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
};