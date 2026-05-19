import React from 'react';
import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { CalendarSidebar } from './CalendarSidebar';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project_id') ? Number(searchParams.get('project_id')) : undefined;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CalendarSidebar projectId={projectId} />
      <Box component="main" sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};