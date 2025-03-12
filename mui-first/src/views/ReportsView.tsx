import React, { JSX, useState } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ReportParamsDialog from './ReportParamsDialog';
import SalesReport from './reports/SalesReport';
import Dialog from '@mui/material/Dialog';
import SalesDynamic from './reports/SalesDynamic';
import { Tooltip } from '@mui/material';

const reports = [
  { id: 1, title: 'Отчет о продажах', description: 'Описание отчета о продажах за последний месяц за последний месяц за последний месяц за последний месяц за последний месяц за последний месяц.' },
  { id: 2, title: 'Отчет о доходах', description: 'Отчет о доходах за последний квартал.' },
  { id: 3, title: 'Отчет о расходах', description: 'Отчет о расходах за последний год.' },
  { id: 4, title: 'Динамика продаж', description: 'Описание отчета Динамика продаж' },
  { id: 5, title: 'Отчет 5', description: 'Описание отчета 5.' },
  { id: 6, title: 'Отчет 6', description: 'Описание отчета 6.' },
  { id: 7, title: 'Отчет 7', description: 'Описание отчета 7.' },
  { id: 8, title: 'Отчет 8', description: 'Описание отчета 8.' },
  { id: 9, title: 'Отчет 9', description: 'Описание отчета 9.' },
  { id: 10, title: 'Отчет 10', description: 'Описание отчета 10.' },
];

const ReportsView: React.FC = () => {
  const [selectedReportName, setSelectedReportName] = useState<string>('');
  const [reportParamsOpen, setReportParamsOpen] = useState(false);
  const [reportParams, setReportParams] = useState<{ quarter?: number; startDate?: string; endDate?: string } | null>(null);
  const [reportResult, setReportResult] = useState<JSX.Element | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const handleReportClick = (report: { id: number; title: string; description: string }) => {
    setSelectedReportName(report.title);
    setReportParamsOpen(true);
  };

  const handleExecuteReport = (params: { quarter?: number; startDate?: string; endDate?: string }) => {
    setReportParams(params);
    setReportParamsOpen(false);
    console.log('Выполнение отчета с параметрами:', params);
  };

  const handleExecute = (params: any) => {
    if (selectedReportName === 'Отчет о продажах') { // Изменяем условие if
      setReportResult(<SalesReport onClose={handleClose} reportName={selectedReportName} />);
      setReportDialogOpen(true);
    } else if (selectedReportName === 'Динамика продаж') { // Изменяем условие if
      setReportResult(<SalesDynamic onClose={handleClose} reportName={selectedReportName} />);
      setReportDialogOpen(true);
    } else {
      setReportResult(null);
    }
    handleExecuteReport(params);
  };

  const handleClose = () => {
    setReportResult(null);
    setReportDialogOpen(false);
  };

  return (
    <div>
      <Typography variant="h4">Отчеты</Typography>
      <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>
        {reports.map((report) => (
          <Tooltip key={report.id} title={report.description}>
            <ListItem component="button" key={report.id} onClick={() => handleReportClick(report)}>
              <ListItemText primary={report.title} />
            </ListItem>
          </Tooltip>
        ))}
      </List>
      <ReportParamsDialog
        open={reportParamsOpen}
        onClose={() => setReportParamsOpen(false)}
        reportName={selectedReportName} // Передаем selectedReportName
        onExecute={handleExecute}
      />
      <Dialog open={reportDialogOpen} onClose={handleClose} fullWidth maxWidth="md">
        {reportResult}
      </Dialog>
    </div>
  );
};

export default ReportsView;