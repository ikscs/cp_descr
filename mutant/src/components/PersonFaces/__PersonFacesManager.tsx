import React from 'react';
import { Box, IconButton, Paper, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

// не используется!!!

type PersonFacesManagerProps = {
  onSelect: () => void;
  onDeselect: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  visible: boolean;
};

const PersonFacesManager: React.FC<PersonFacesManagerProps> = ({
  onSelect,
  onDeselect,
  onDelete,
  onRefresh,
  visible,
}) => {
  if (!visible) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        gap: 1,
        p: 1,
        zIndex: 10,
        background: 'rgba(255,255,255,0.95)',
      }}
    >
      <Tooltip title="Выбрать">
        <IconButton color="primary" onClick={onSelect} size="small">
          <CheckCircleIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Отменить выбор">
        <IconButton color="secondary" onClick={onDeselect} size="small">
          <CancelIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Удалить">
        <IconButton color="error" onClick={onDelete} size="small">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Обновить">
        <IconButton color="info" onClick={onRefresh} size="small">
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default PersonFacesManager;