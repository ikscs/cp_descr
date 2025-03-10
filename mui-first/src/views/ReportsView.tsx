import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ReportParamsDialog from './ReportParamsDialog';

const reports = [
  { id: 1, title: 'Отчет о продажах', description: 'Отчет о продажах за последний месяц.' },
  { id: 2, title: 'Отчет о доходах', description: 'Отчет о доходах за последний квартал.' },
  { id: 3, title: 'Отчет о расходах', description: 'Отчет о расходах за последний год.' },
  { id: 4, title: 'Отчет 4', description: 'Описание отчета 4.' },
  { id: 5, title: 'Отчет 5', description: 'Описание отчета 5.' },
  { id: 6, title: 'Отчет 6', description: 'Описание отчета 6.' },
  { id: 7, title: 'Отчет 7', description: 'Описание отчета 7.' },
  { id: 8, title: 'Отчет 8', description: 'Описание отчета 8.' },
  { id: 9, title: 'Отчет 9', description: 'Описание отчета 9.' },
  { id: 10, title: 'Отчет 10', description: 'Описание отчета 10.' },
];

const ReportsView: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<{ id: number; title: string; description: string } | null>(null);
  const [reportParamsOpen, setReportParamsOpen] = useState(false);
  const [reportParams, setReportParams] = useState<{ quarter?: number; startDate?: string; endDate?: string } | null>(null);

  const handleReportClick = (report: { id: number; title: string; description: string }) => {
    setSelectedReport(report);
    setReportParamsOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedReport(null);
  };

  const handleExecuteReport = (params: { quarter?: number; startDate?: string; endDate?: string }) => {
    setReportParams(params);
    setReportParamsOpen(false);
    console.log('Выполнение отчета с параметрами:', params);
  };

  return (
    <div>
      <Typography variant="h4">Отчеты</Typography>
      <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>
        {reports.map((report) => (
          <ListItem component="button" key={report.id} onClick={() => handleReportClick(report)}>
            <ListItemText primary={report.title} />
          </ListItem>
        ))}
      </List>
      <Dialog open={!!selectedReport} onClose={handleCloseDialog}>
        {selectedReport && (
          <>
            <DialogTitle>{selectedReport.title}</DialogTitle>
            <DialogContent>
              <Typography variant="body1">{selectedReport.description}</Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
      <ReportParamsDialog open={reportParamsOpen} onClose={() => setReportParamsOpen(false)} onExecute={handleExecuteReport} />
    </div>
  );
};

export default ReportsView;