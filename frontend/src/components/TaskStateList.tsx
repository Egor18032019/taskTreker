import React, { useState } from 'react';
import { useTaskStates, useDeleteTaskState } from '../hooks/useTaskStates';
import type { TaskState } from '../types';
import {
    Box, Card, CardContent, Typography,
    TextField, IconButton, Stack, Chip
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

interface Props {
    projectId?: number;
    onEdit?: (state: TaskState) => void;
}

export const TaskStateList: React.FC<Props> = ({ projectId, onEdit }) => {
    const [namePrefix, setNamePrefix] = useState('');
    const { data: states, isLoading, error } = useTaskStates({
        project_id: projectId,
        name_prefix: namePrefix || undefined
    });
    const deleteMutation = useDeleteTaskState();

    const handleDelete = (id: number) => {
        if (window.confirm('Удалить это состояние задачи?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <Typography>Загрузка...</Typography>;
    if (error) return <Typography color="error">Ошибка загрузки</Typography>;

    return (
        <Box>
            <TextField
                size="small"
                placeholder="Фильтр по названию..."
                value={namePrefix}
                onChange={(e) => setNamePrefix(e.target.value)}
                sx={{ mb: 2, width: '100%', maxWidth: 300 }}
            />

            <Stack spacing={2}>
                {states?.map((state) => (
                    <Card key={state.id}>
                        <CardContent>
                            <Stack
                                direction="row"
                                sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6">{state.name}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        {state.leftTaskStateId && (
                                            <Chip label={`← #${state.leftTaskStateId}`} size="small" />
                                        )}
                                        {state.rightTaskStateId && (
                                            <Chip label={`#${state.rightTaskStateId} →`} size="small" />
                                        )}
                                    </Stack>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                    {onEdit && (
                                        <IconButton size="small" onClick={() => onEdit(state)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(state.id)}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
                {states?.length === 0 && (
                    <Typography
                        sx={{ textAlign: 'center', color: 'text.secondary' }}
                    >
                        Состояния не найдены
                    </Typography>
                )}
            </Stack>
        </Box>
    );
};