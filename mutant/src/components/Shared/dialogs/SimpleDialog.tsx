import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface SimpleDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export const SimpleDialog: React.FC<SimpleDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  showCancelButton = false,
}) => {
  return (
    <Dialog open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {showCancelButton && (
          <Button onClick={onCancel}>
            Отмена
        </Button>
        )}
        <Button onClick={onConfirm} autoFocus>
          ОК
        </Button>
      </DialogActions>
    </Dialog>
  );
};