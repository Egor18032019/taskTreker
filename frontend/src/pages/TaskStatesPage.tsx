import React, { useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Typography, Container, Stack
} from '@mui/material';
import { TaskStateList } from '../components/TaskStateList';
import { useCreateTaskState, useUpdateTaskState } from '../hooks/useTaskStates';
import type { TaskState, TaskStateCreate } from '../types';

export const TaskStatesPage: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<TaskState | null>(null);
    const [formData, setFormData] = useState<Partial<TaskStateCreate>>({});

    const createMutation = useCreateTaskState();
    const updateMutation = useUpdateTaskState();

    const handleSubmit = () => {


        if (editing) {
            updateMutation.mutate({ id: editing.id, data: formData });
        } else {
            createMutation.mutate(formData as TaskStateCreate);
        }
        handleClose();
    };

    const handleOpen = (state?: TaskState) => {
        if (state) {
            setEditing(state);
            setFormData({

                project_id: undefined, // нельзя менять проект при редактировании
                left_state_id: state.leftTaskStateId,
                right_state_id: state.rightTaskStateId,
            });
        } else {
            setEditing(null);
            setFormData({ project_id: 1 }); // 👈 замените на реальный выбор проекта
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditing(null);
        setFormData({});
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", mb: 3 }}
            >
                <Typography variant="h4">Состояния задач</Typography>
                <Button variant="contained" onClick={() => handleOpen()}>
                    + Добавить
                </Button>
            </Box>

            <TaskStateList projectId={formData.project_id} onEdit={handleOpen} />

            {/* Modal для создания/редактирования */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editing ? 'Редактировать состояние' : 'Новое состояние'}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>

                        {!editing && (
                            <TextField
                                label="ID проекта *"
                                type="number"
                                required
                                value={formData.project_id || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    project_id: Number(e.target.value)
                                }))}
                            />
                        )}
                        <TextField
                            label="ID левого состояния"
                            type="number"
                            value={formData.left_state_id || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                left_state_id: e.target.value ? Number(e.target.value) : undefined
                            }))}
                        />
                        <TextField
                            label="ID правого состояния"
                            type="number"
                            value={formData.right_state_id || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                right_state_id: e.target.value ? Number(e.target.value) : undefined
                            }))}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Отмена</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={createMutation.isPending || updateMutation.isPending}
                    >
                        {editing ? 'Сохранить' : 'Создать'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};