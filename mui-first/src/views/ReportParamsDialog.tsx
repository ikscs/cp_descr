import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface ReportParamsDialogProps {
  open: boolean;
  onClose: () => void;
  onExecute: (params: { quarter?: number; startDate?: string; endDate?: string }) => void;
}

const ReportParamsDialog: React.FC<ReportParamsDialogProps> = ({ open, onClose, onExecute }) => {
  const [quarter, setQuarter] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const handleExecute = () => {
    onExecute({ quarter, startDate, endDate });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Параметры отчета</DialogTitle>
      <DialogContent>
        <TextField
          label="Номер квартала"
          type="number"
          value={quarter}
          onChange={(e) => setQuarter(parseInt(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Дата начала"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ pattern: '\\d{2}/\\d{2}/\\d{4}' }}
          placeholder="дд/мм/гггг" // Добавляем placeholder
        />
        <TextField
          label="Дата окончания"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ pattern: '\\d{2}/\\d{2}/\\d{4}' }}
          placeholder="дд/мм/гггг" // Добавляем placeholder
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Отмена
        </Button>
        <Button onClick={handleExecute} color="primary">
          Выполнить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportParamsDialog;