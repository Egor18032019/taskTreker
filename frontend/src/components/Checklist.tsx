import React, { useState } from 'react';
import { Box, Checkbox, TextField, IconButton, Stack, Typography } from '@mui/material';
import { Add, Delete, DragIndicator } from '@mui/icons-material';
import type { ChecklistItem } from '../types';

interface Props {
    items: ChecklistItem[];
    onChange: (items: ChecklistItem[]) => void;
    editable?: boolean;
}

export const Checklist: React.FC<Props> = ({ items = [], onChange, editable = false }) => {
    const [newText, setNewText] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleAdd = () => {
        if (!newText.trim()) return;
        const newItem: ChecklistItem = {
            text: newText.trim(),
            completed: false,
            orderIndex: items.length
        };
        onChange([...items, newItem]);
        setNewText('');
    };

    const handleRemove = (index: number) => {
        const updated = items.filter((_, i) => i !== index).map((item, idx) => ({
            ...item,
            orderIndex: idx
        }));
        onChange(updated);
    };

    const handleToggle = (index: number) => {
        const updated = items.map((item, i) =>
            i === index ? { ...item, completed: !item.completed } : item
        );
        onChange(updated);
    };

    const handleTextChange = (index: number, text: string) => {
        const updated = items.map((item, i) => i === index ? { ...item, text } : item);
        onChange(updated);
    };

    // 🔥 Drag-and-Drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (!editable) return;
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        // Визуальный фидбек
        const target = e.target as HTMLElement;
        setTimeout(() => target.style.opacity = '0.5', 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
        setDraggedIndex(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!editable) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        if (!editable || draggedIndex === null || draggedIndex === dropIndex) return;
        e.preventDefault();

        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);

        // 👇 Пересчитываем orderIndex для всех элементов
        const updated = newItems.map((item, idx) => ({ ...item, orderIndex: idx }));
        onChange(updated); // 👈 Авто-сохранение через пропс
    };

    if (!editable && items.length === 0) {
        return <Typography variant="body2" color="text.disabled">Чек-лист пуст</Typography>;
    }

    return (
        <Box>
            <Stack spacing={0.5}>
                {items.map((item, index) => (
                    <Stack
                        key={item.id || index}
                        direction="row"

                        spacing={1}
                        draggable={editable}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        sx={{
                            alignItems: "center",
                            p: 1,
                            borderRadius: 1,
                            bgColor: item.completed ? 'action.hover' : 'transparent',
                            cursor: editable ? 'grab' : 'default',
                            opacity: draggedIndex === index ? 0.5 : 1,
                            transition: 'opacity 0.2s, background-color 0.2s',
                            '&:hover': editable ? { bgcolor: 'action.hover' } : {}
                        }}
                    >
                        {editable && (
                            <DragIndicator
                                sx={{
                                    color: 'text.disabled',
                                    cursor: 'grab',
                                    '&:active': { cursor: 'grabbing' }
                                }}
                            />
                        )}
                        <Checkbox
                            size="small"
                            checked={item.completed}
                            onChange={() => handleToggle(index)}
                            disabled={editable}
                        />
                        {editable ? (
                            <TextField
                                size="small"
                                variant="standard"
                                fullWidth
                                value={item.text}
                                onChange={e => handleTextChange(index, e.target.value)}
                                sx={item.completed ? { textDecoration: 'line-through', opacity: 0.6 } : {}}
                                slotProps={{
                                    htmlInput: {
                                        onBlur: (e) => {
                                            // Авто-сохранение при потере фокуса
                                            if (e.target.value !== item.text) {
                                                handleTextChange(index, e.target.value);
                                            }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <Typography
                                sx={{
                                    flex: 1,
                                    textDecoration: item.completed ? 'line-through' : 'none',
                                    opacity: item.completed ? 0.6 : 1
                                }}
                            >
                                {item.text}
                            </Typography>
                        )}
                        {editable && (
                            <IconButton size="small" color="error" onClick={() => handleRemove(index)}>
                                <Delete fontSize="small" />
                            </IconButton>
                        )}
                    </Stack>
                ))}
            </Stack>

            {editable && (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Добавить пункт..."
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        sx={{ flex: 1 }}
                    />
                    <IconButton color="primary" onClick={handleAdd} disabled={!newText.trim()}>
                        <Add />
                    </IconButton>
                </Stack>
            )}
        </Box>
    );
};