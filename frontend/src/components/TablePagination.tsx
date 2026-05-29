import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from '@mui/icons-material';

interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  hasNext,
  hasPrevious,
}) => {
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElements);

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
      py: 1,
      borderTop: '1px solid',
      borderColor: 'divider'
    }}>
      {/* Информация о диапазоне */}
      <Typography variant="body2" color="text.secondary">
        Показано {startItem}–{endItem} из {totalElements}
      </Typography>

      {/* Кнопки навигации */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={() => onPageChange(0)}
          disabled={!hasPrevious}
          title="Первая страница"
        >
          <FirstPage fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevious}
          title="Предыдущая"
        >
          <ChevronLeft fontSize="small" />
        </IconButton>

        <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
          Стр. {page + 1} из {totalPages}
        </Typography>

        <IconButton
          size="small"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          title="Следующая"
        >
          <ChevronRight fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!hasNext}
          title="Последняя страница"
        >
          <LastPage fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};