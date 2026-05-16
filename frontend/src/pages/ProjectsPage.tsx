import React, { useState } from 'react';
import {
    Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Stack, Card, CardContent, IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import type { Project, ProjectCreate } from '../types';
import { useNavigate } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
    const [filter, setFilter] = useState('');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    // Храним имя проекта как поле project_name, чтобы сразу соответствовало API
    const [form, setForm] = useState<ProjectCreate>({ project_name: '' });

    // ✅ Фильтр: передаём prefix_name
    const queryParams = filter ? { prefix_name: filter } : undefined;
    const { data, isLoading } = useProjects(queryParams);
    const createMut = useCreateProject();
    const updateMut = useUpdateProject();
    const deleteMut = useDeleteProject();

    const handleSubmit = () => {
        if (!form.project_name.trim()) return;
        if (editing) {
            // PUT /api/projects?project_id=...&project_name=...
            updateMut.mutate({ id: editing.id, data: { project_name: form.project_name } });
        } else {
            // PUT /api/projects?project_name=... (без project_id)
            createMut.mutate({ project_name: form.project_name });
        }
        handleClose();
    };

    const handleOpen = (p?: Project) => {
        setEditing(p || null);
        setForm({ project_name: p?.name || '' });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditing(null);
        setForm({ project_name: '' });
    };
    const navigate = useNavigate();
    const handleProjectClick = (projectId: number) => {
        // Переход на страницу задач с параметром проекта
        navigate(`/tasks?project_id=${projectId}`);
    };
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Проекты</Typography>
                <Button variant="contained" onClick={() => handleOpen()}>+ Добавить</Button>
            </Box>

            <TextField
                label="Поиск по названию"
                size="small"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                sx={{ mb: 2, width: 300 }}
            />

            <Stack spacing={2}>
                {isLoading ? (
                    <Typography>Загрузка...</Typography>
                ) : data?.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        Проектов не найдено
                    </Typography>
                ) : (
                    data?.map(p => (
                        <Card
                            key={p.id}
                            variant="outlined"
                            sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: 1
                                }
                            }}
                            onClick={() => handleProjectClick(p.id)}  // 👈 Клик на всю карточку
                        >
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {/* Иконка проекта (опционально) */}
                                    <Box sx={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        bgcolor: 'primary.light', color: 'primary.contrastText',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold'
                                    }}>
                                        {p.name.charAt(0).toUpperCase()}
                                    </Box>
                                    <Typography variant="h6">{p.name}</Typography>
                                </Box>

                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); handleOpen(p); }}  // 👈 Стоп-пропагация
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => { e.stopPropagation(); deleteMut.mutate(p.id); }}
                                        disabled={deleteMut.isPending}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Stack>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editing ? 'Редактировать' : 'Создать'} проект</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название *"
                        fullWidth
                        value={form.project_name}
                        onChange={e => setForm({ project_name: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Отмена</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};