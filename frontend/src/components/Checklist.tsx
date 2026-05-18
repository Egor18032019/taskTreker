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

  if (!editable && items.length === 0) {
    return <Typography variant="body2" color="text.disabled">Чек-лист пуст</Typography>;
  }

  return (
    <Box>
      <Stack spacing={1}>
        {items.map((item, index) => (
          <Stack key={item.id || index} direction="row"
          spacing={1}
            sx={{alignItems:"center",p: 1, borderRadius: 1, bgcolor: item.completed ? 'action.hover' : 'transparent' }}>
            {editable && <DragIndicator sx={{ color: 'text.disabled', cursor: 'move' }} />}
            <Checkbox size="small" checked={item.completed} onChange={() => handleToggle(index)} />
            {editable ? (
              <TextField size="small" variant="standard" fullWidth
                value={item.text} onChange={e => handleTextChange(index, e.target.value)}
                sx={item.completed ? { textDecoration: 'line-through', opacity: 0.6 } : {}}
              />
            ) : (
              <Typography sx={item.completed ? { textDecoration: 'line-through', opacity: 0.6, flex: 1 } : { flex: 1 }}>
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
          <TextField size="small" placeholder="Добавить пункт..." value={newText}
            onChange={e => setNewText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAdd()}
            sx={{ flex: 1 }} />
          <IconButton color="primary" onClick={handleAdd} disabled={!newText.trim()}>
            <Add />
          </IconButton>
        </Stack>
      )}
    </Box>
  );
};