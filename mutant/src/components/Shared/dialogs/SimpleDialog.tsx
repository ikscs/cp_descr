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
  // Определяем, какую функцию вызвать при закрытии диалога, 
  // например, по нажатию Escape.
  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} autoFocus variant="contained">
          ОК
        </Button>
        {showCancelButton && (
          <Button onClick={onCancel} variant="outlined">
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
