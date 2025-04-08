import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
} from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  Report,
} from '../../api/data/reportTools';
import { QueryEdit, ReportConfig, ReportDescriptor } from '../Reports/QueryEdit';
import SettingsIcon from '@mui/icons-material/Settings';

const ReporListEdit: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [openQueryEditDialog, setOpenQueryEditDialog] = useState<boolean>(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState<boolean>(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  useEffect(() => {
    const loadInitialReports = async () => {
      const fetchedReports = await getReports();
      setReports(fetchedReports);
    };

    loadInitialReports();
  }, []);

  const handleDeleteReport = (reportId: number) => {
    setReportToDelete(reportId);
    setOpenConfirmDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (reportToDelete !== null) {
      const success = await deleteReport(reportToDelete);
      if (success) {
        setReports(reports.filter((report) => report.id !== reportToDelete));
      }
      setReportToDelete(null);
      setOpenConfirmDeleteDialog(false);
    }
  };

  const handleCancelDelete = () => {
    setReportToDelete(null);
    setOpenConfirmDeleteDialog(false);
  };

  const handleCreateReport = () => {
    setSelectedReport({
      id: -1,
      name: '',
      description: '',
      query: '',
      config: '',
      params: [],
    });
    setOpenQueryEditDialog(true);
  };

  const handleOpenQueryEditDialog = (report: Report) => {
    setSelectedReport(report);
    setOpenQueryEditDialog(true);
  };

  const handleCloseQueryEditDialog = () => {
    setOpenQueryEditDialog(false);
    setSelectedReport(null);
  };

  const handleQueryEditSubmit = async (data: ReportDescriptor) => {
    console.log('Report Data:', data);
    if (selectedReport) {
      const updatedReportData: Report = {
        ...selectedReport,
        config: JSON.stringify(data.report_config),
        query: data.query,
        name: data.report_name,
        description: data.report_description,
      };
      if (selectedReport.id === -1) {
        const newReport = await createReport(updatedReportData);
        if (newReport) {
          setReports([...reports, newReport]);
        }
      } else {
        const updatedReport = await updateReport(updatedReportData);
        if (updatedReport) {
          setReports(
            reports.map((report) =>
              report.id === updatedReport.id ? updatedReport : report
            )
          );
        }
      }
    }
    handleCloseQueryEditDialog();
  };

  const getReportConfig = (report: Report): ReportConfig => {
    if (!report.config) {
      return { params: [] };
    }
    try {
      const parsedConfig = JSON.parse(report.config);
      if (
        typeof parsedConfig === 'object' &&
        parsedConfig !== null &&
        Array.isArray(parsedConfig.params)
      ) {
        return parsedConfig;
      } else {
        console.error('Invalid report config structure:', parsedConfig);
        return { params: [] };
      }
    } catch (error) {
      console.error('Error parsing report config:', error);
      return { params: [] };
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Список отчетов</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateReport}
        >
          Создать отчет
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow
                key={report.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {report.id}
                </TableCell>
                <TableCell>{report.name}</TableCell>
                <TableCell>{report.description}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenQueryEditDialog(report)}>
                    <SettingsIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteReport(report.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for QueryEdit */}
      <Dialog
        open={openQueryEditDialog}
        onClose={handleCloseQueryEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Редактировать параметры отчета</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedReport && (
            <QueryEdit
              initialData={{
                app_id: '',
                report_id: selectedReport.id,
                report_name: selectedReport.name,
                report_description: selectedReport.description,
                query: selectedReport.query,
                report_config: getReportConfig(selectedReport),
              }}
              onSubmit={handleQueryEditSubmit}
              onClose={handleCloseQueryEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={openConfirmDeleteDialog} onClose={handleCancelDelete}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите удалить этот отчет?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReporListEdit;
