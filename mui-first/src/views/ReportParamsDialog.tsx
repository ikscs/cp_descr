import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface ReportParamsDialogProps {
  open: boolean;
  onClose: () => void;
  reportName: string; // Добавляем пропс reportName
  onExecute: (params: {
    reportName: string; // Используем reportName из пропсов
    quarter?: number;
    startDate?: string;
    endDate?: string;
  }) => void;
}

const ReportParamsDialog: React.FC<ReportParamsDialogProps> = ({
  open,
  onClose,
  reportName, // Получаем reportName из пропсов
  onExecute,
}) => {
  const [quarter, setQuarter] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleExecute = () => {
    onExecute({
      reportName, // Используем reportName из пропсов
      quarter,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Параметры отчета: {reportName}</DialogTitle> {/* Используем reportName в заголовке */}
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TextField
            label="Номер квартала"
            type="number"
            value={quarter}
            onChange={(e) => setQuarter(parseInt(e.target.value))}
            fullWidth
            margin="normal"
          />
          <DatePicker
            label="Дата начала"
            value={startDate}
            onChange={(newValue) => {
              setStartDate(newValue);
            }}
            format="dd/MM/yyyy"
            slotProps={{
              textField: (params) => (
                <TextField {...params} fullWidth margin="normal" />
              ),
            }}
          />
          <DatePicker
            label="Дата окончания"
            value={endDate}
            onChange={(newValue) => {
              setEndDate(newValue);
            }}
            format="dd/MM/yyyy"
            slotProps={{
              textField: (params) => (
                <TextField {...params} fullWidth margin="normal" />
              ),
            }}
          />
        </LocalizationProvider>
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