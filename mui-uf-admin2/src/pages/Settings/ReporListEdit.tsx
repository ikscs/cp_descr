// d:\dvl\ikscs\react\vp-descr\mui-uf-admin2\src\pages\Settings\ReporListEdit.tsx
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
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  Report,
} from '../../api/data/reportTools';
import { QueryEdit, QueryParam, ReportConfig, ReportDescriptor } from '../Reports/QueryEdit'; // Import QueryEdit
import SettingsIcon from '@mui/icons-material/Settings';

const ReporListEdit: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [reportName, setReportName] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reportQuery, setReportQuery] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<string | undefined>('');
  const [configError, setConfigError] = useState<string | null>(null);
  const [openQueryEditDialog, setOpenQueryEditDialog] = useState<boolean>(false); // New state for QueryEdit dialog

  useEffect(() => {
    const loadInitialReports = async () => {
      const fetchedReports = await getReports();
      setReports(fetchedReports);
    };

    loadInitialReports();
  }, []);

  useEffect(() => {
    if (selectedReport) {
      setReportName(selectedReport.name);
      setReportDescription(selectedReport.description);
      setReportQuery(selectedReport.query);
      setReportConfig(selectedReport.config);
    } else {
      setReportName('');
      setReportDescription('');
      setReportQuery('');
      setReportConfig('');
    }
  }, [selectedReport]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
    setIsEditMode(false);
    setReportName('');
    setReportDescription('');
    setReportQuery('');
    setReportConfig('');
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setIsEditMode(true);
    handleOpenDialog();
  };

  const handleDeleteReport = async (reportId: number) => {
    const success = await deleteReport(reportId);
    if (success) {
      setReports(reports.filter((report) => report.id !== reportId));
    }
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setIsEditMode(false);
    handleOpenDialog();
  };

  const handleSaveReport = async () => {
    if (isEditMode && selectedReport) {
      const updatedReportData: Report = {
        ...selectedReport,
        name: reportName,
        description: reportDescription,
        query: reportQuery,
        config: reportConfig,
      };
      const updatedReport = await updateReport(updatedReportData);
      if (updatedReport) {
        setReports(
          reports.map((report) =>
            report.id === updatedReport.id ? updatedReport : report
          )
        );
      }
    } else {
      const newReportData = {
        id: -1,
        name: reportName,
        description: reportDescription,
        query: reportQuery,
        params: [],
      };
      const newReport = await createReport(newReportData);
      if (newReport) {
        setReports([...reports, newReport]);
      }
    }
    handleCloseDialog();
  };

  // --- New functions for QueryEdit ---

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
        name: data.report_name, // Add this line
        description: data.report_description, // Add this line
      };
      const updatedReport = await updateReport(updatedReportData);
      if (updatedReport) {
        setReports(
          reports.map((report) =>
            report.id === updatedReport.id ? updatedReport : report
          )
        );
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
                  <IconButton onClick={() => handleEditReport(report)}>
                    <EditIcon />
                  </IconButton>
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

      {/* Dialog for creating/editing report */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? 'Редактировать отчет' : 'Создать отчет'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            variant="standard"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            variant="standard"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
          />
          <TextField
            margin="dense"
            label="SQL Запрос"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={reportQuery}
            onChange={(e) => setReportQuery(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Config (JSON)"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={reportConfig}
            onChange={(e) => {
              setReportConfig(e.target.value)
            }}
            error={!!configError}
            helperText={configError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSaveReport}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for QueryEdit */}
      <Dialog
        open={openQueryEditDialog}
        onClose={handleCloseQueryEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Редактировать параметры отчета</DialogTitle>
        <DialogContent sx={{ p: 0 }}> {/* Remove padding from DialogContent */}
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
              onClose={handleCloseQueryEditDialog} // Pass onClose to QueryEdit
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ReporListEdit;
