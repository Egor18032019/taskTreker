import React, { useState, useMemo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTasks } from '../hooks/useTasks';
import { TaskMiniCard } from './TaskMiniCard';

interface Props {
  projectId?: number;
}

export const CalendarSidebar: React.FC<Props> = ({ projectId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Загружаем задачи (все или только проекта)
  const { data: allTasks, isLoading } = useTasks(
    projectId ? { project_id: projectId } : undefined
  );

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Задачи на выбранный день
  const tasksForDate = useMemo(() =>
    allTasks?.filter(t => t.deadline === dateStr && t.deadline !== null) || [],
  [allTasks, dateStr]);

  // Подсчёт задач по дням для индикации в календаре
  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    allTasks?.forEach(t => {
      if (t.deadline) map[t.deadline] = (map[t.deadline] || 0) + 1;
    });
    return map;
  }, [allTasks]);

  return (
    <Box
      sx={{
        width: 340,
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0
      }}
    >
      {/* 📅 ВЕРХ: Календарь */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
          📅 Календарь
        </Typography>
        <Calendar
          onChange={(val) => setSelectedDate(val as Date)}
          value={selectedDate}
          locale="ru-RU"
          tileContent={({ date }) => {
            const d = format(date, 'yyyy-MM-dd');
            const count = tasksByDate[d] || 0;
            return count > 0 ? (
              <Box sx={{ fontSize: '0.7rem', color: 'primary.main', fontWeight: 'bold', mt: 0.5 }}>
                {count}
              </Box>
            ) : null;
          }}
          tileClassName={({ date }) => {
            const d = format(date, 'yyyy-MM-dd');
            return tasksByDate[d] ? 'calendar-tile--has-tasks' : '';
          }}
        />
      </Box>

      {/* 📋 НИЗ: Список задач */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          📋 Задачи на {format(selectedDate, 'dd MMM yyyy', { locale: ru })}
        </Typography>

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">Загрузка...</Typography>
        ) : tasksForDate.length > 0 ? (
          <Stack spacing={1.5}>
            {tasksForDate.map(task => (
              <TaskMiniCard key={task.id} task={task} />
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            <Typography variant="body1" sx={{ fontSize: '2rem', mb: 1 }}>🍃</Typography>
            <Typography variant="body2">Нет задач на этот день</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};