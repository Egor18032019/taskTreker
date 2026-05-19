import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types';
import { priorityConfig, isDeadlineOverdue } from '../utils/ColorCategoryConfig';

export const TaskMiniCard: React.FC<{ task: Task }> = ({ task }) => {
  const navigate = useNavigate();

  const completedCount = task.checklist?.filter(i => i.completed).length || 0;
  const totalCount = task.checklist?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Box
      onClick={() => navigate(`/tasks/${task.id}`)}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.light'
        }
      }}
    >
      <Stack direction="row"
      sx={{ justifyContent: 'space-between',alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
          {task.name}
        </Typography>

        {task.priority && (
          <Chip
            label={priorityConfig[task.priority].label}
            size="small"
            color={priorityConfig[task.priority].color}
            sx={{ height: 20, ml: 1 }}
          />
        )}
      </Stack>

      {/* Прогресс чек-листа */}
      {totalCount > 0 && (
        <Box sx={{ mt: 1 }}>
          <Box sx={{
            width: '100%',
            height: 4,
            bgcolor: 'action.selected',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <Box sx={{
              width: `${progress}%`,
              height: '100%',
              bgcolor: progress === 100 ? 'success.main' : 'primary.main',
              transition: 'width 0.3s'
            }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {completedCount}/{totalCount} выполнено
          </Typography>
        </Box>
      )}

      {/* Дедлайн */}
      {task.deadline && (
        <Typography
          variant="caption"
          color={isDeadlineOverdue(task.deadline) ? 'error.main' : 'text.secondary'}
          sx={{ mt: 0.5, display: 'block' }}
        >
          📅 {new Date(task.deadline).toLocaleDateString('ru-RU')}
          {isDeadlineOverdue(task.deadline) && ' (просрочено)'}
        </Typography>
      )}
    </Box>
  );
};