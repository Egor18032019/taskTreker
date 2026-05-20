import React from 'react';
import { Chip, Menu, MenuItem } from '@mui/material';
import type { TaskStatus } from '../types';
import { statusConfig } from '../utils/CategoryConfig';

interface Props {
  status: TaskStatus;
  onChange?: (newStatus: TaskStatus) => void;
  editable?: boolean;
}



export const StatusChip: React.FC<Props> = ({ status, onChange, editable = false }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const config = statusConfig[status];

const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (editable && onChange) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (newStatus: TaskStatus) => {
    onChange?.(newStatus);
    handleClose();
  };

  return (
    <>
      <Chip
        label={config.label}
        color={config.color}
        variant={editable ? 'filled' : 'outlined'}
        onClick={handleClick}
        sx={{
          cursor: editable ? 'pointer' : 'default',
          fontWeight: 500,
          '&:hover': editable ? { opacity: 0.9 } : {}
        }}
      />

      {editable && (
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <MenuItem
              key={key}
              onClick={() => handleSelect(key as TaskStatus)}
              selected={status === key}
            >
              {cfg.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};