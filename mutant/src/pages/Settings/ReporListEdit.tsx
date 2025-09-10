// d:\dvl\ikscs\react\vp-descr\mui-uf-admin2\src\pages\Settings\ReporListEdit.tsx
import React, { useState, useEffect, useMemo } from 'react'; // Добавлен useMemo
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
  TextField, // Добавлен TextField
  CircularProgress, // Добавлен CircularProgress для индикации загрузки
  Alert, // Добавлен Alert для отображения ошибок
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  type Report,
} from '../../api/data/reportToolsDrf';
import { QueryEdit, type ReportConfig, type ReportDescriptor } from '../Reports/QueryEdit';

const ReporListEdit: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [openQueryEditDialog, setOpenQueryEditDialog] = useState<boolean>(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState<boolean>(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Состояние загрузки
  const [fetchError, setFetchError] = useState<string | null>(null); // Состояние ошибки загрузки
  const [filterText, setFilterText] = useState<string>(''); // Состояние для текста фильтра

  useEffect(() => {
    const loadInitialReports = async () => {
      setIsLoading(true); // Начать загрузку
      setFetchError(null); // Сбросить предыдущие ошибки
      try {
        const fetchedReports = await getReports();
        setReports(fetchedReports || []); // Убедиться, что reports всегда массив
      } catch (err) {
        console.error('Error fetching reports for editing:', err);
        setFetchError('Ошибка при загрузке списка отчетов для редактирования.');
        setReports([]); // Установить пустой массив в случае ошибки
      } finally {
        setIsLoading(false); // Завершить загрузку
      }
    };

    loadInitialReports();
  }, []);

  // Мемоизация отфильтрованных отчетов
  const filteredReports = useMemo(() => {
    if (!filterText) {
      return reports; // Вернуть все отчеты, если фильтр пуст
    }
    const lowerCaseFilter = filterText.toLowerCase();
    return reports.filter(report =>
      (report.name?.toLowerCase() || '').includes(lowerCaseFilter) ||
      (report.description?.toLowerCase() || '').includes(lowerCaseFilter)
    );
  }, [reports, filterText]); // Пересчитывать только при изменении reports или filterText

  const handleDeleteReport = (reportId: number) => {
    setReportToDelete(reportId);
    setOpenConfirmDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (reportToDelete !== null) {
      try {
        const success = await deleteReport(reportToDelete);
        if (success) {
          setReports(reports.filter((report) => report.id !== reportToDelete));
          setFetchError(null); // Очистить ошибку при успехе
        } else {
          // Можно добавить обработку случая, когда deleteReport вернул false
          setFetchError('Не удалось удалить отчет.');
        }
      } catch (error) {
        console.error('Error deleting report:', error);
        setFetchError('Ошибка при удалении отчета.');
      } finally {
        setReportToDelete(null);
        setOpenConfirmDeleteDialog(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setReportToDelete(null);
    setOpenConfirmDeleteDialog(false);
  };

  const handleCreateReport = () => {
    // Устанавливаем значения по умолчанию для нового отчета
    setSelectedReport({
      id: -1, // Используем -1 как индикатор нового отчета
      name: '',
      description: '',
      query: '',
      tag: null,
      params: [], 
      config: JSON.stringify({ params: [], columns: [], chart: undefined }), // Пустая конфигурация по умолчанию
    });
    setOpenQueryEditDialog(true);
  };


  const handleOpenQueryEditDialog = (report: Report) => {
    setSelectedReport(report);
    setOpenQueryEditDialog(true);
  };

  const handleCloseQueryEditDialog = () => {
    setOpenQueryEditDialog(false);
    setSelectedReport(null); // Сбрасываем выбранный отчет при закрытии
  };

  const handleQueryEditSubmit = async (data: ReportDescriptor) => {
    console.log('Submitting Report Data:', data);
    // Не нужно проверять selectedReport здесь, так как он всегда будет установлен перед открытием диалога
    // if (selectedReport) { ... } - эта проверка избыточна

    // Формируем данные для отправки на бэкенд
    const reportPayload: Omit<Report, 'id' | 'params'> & { id?: number } = {
        // Используем Omit для исключения 'params', так как его нет в Report
        // Добавляем опциональный 'id'
        name: data.report_name,
        description: data.report_description,
        query: data.query,
        tag: data.tag,
        config: JSON.stringify(data.report_config || { params: [], columns: [], chart: undefined }), // Сериализуем конфиг
    };


    try {
      setFetchError(null); 
      if (data.report_id === -1) { 
        const newReport = await createReport(reportPayload as Report);
        if (newReport) {
          setReports([...reports, newReport]);
        } else {
           throw new Error("Не удалось создать отчет (ответ API был пустым).");
        }
      } else {
        const updatedReportData: Report = {
            ...reportPayload, 
            id: data.report_id, 
            params: [], 
        };
        const updatedReport = await updateReport(updatedReportData);
        if (updatedReport) {
          setReports(
            reports.map((report) =>
              report.id === updatedReport.id ? updatedReport : report
            )
          );
        } else {
            throw new Error("Не удалось обновить отчет (ответ API был пустым).");
        }
      }
      handleCloseQueryEditDialog(); // Закрываем диалог только при успехе
    } catch (error: any) {
        console.error('Error saving report:', error);
        // Показываем ошибку пользователю (можно в диалоге или под таблицей)
        setFetchError(`Ошибка сохранения отчета: ${error.message || 'Неизвестная ошибка'}`);
        // Не закрываем диалог при ошибке, чтобы пользователь мог исправить данные
        // handleCloseQueryEditDialog();
    }
  };


  // Функция парсинга конфига с улучшенной обработкой ошибок
  const getReportConfig = (report: Report): ReportConfig => {
    if (!report.config || typeof report.config !== 'string') {
      // Возвращаем дефолтную структуру, если конфига нет или он не строка
      return { params: [], columns: [], chart: undefined };
    }
    try {
      const parsedConfig = JSON.parse(report.config);

      // Проверяем, что результат парсинга - объект и содержит ожидаемые поля (хотя бы params)
      if (typeof parsedConfig === 'object' && parsedConfig !== null) {
        // Обеспечиваем наличие обязательных полей как массивов, если они отсутствуют или имеют неверный тип
        const params = Array.isArray(parsedConfig.params) ? parsedConfig.params : [];
        const columns = Array.isArray(parsedConfig.columns) ? parsedConfig.columns : [];
        // chart может быть undefined
        const chart = typeof parsedConfig.chart === 'object' ? parsedConfig.chart : undefined;

        return { params, columns, chart };
      } else {
        console.error('Invalid report config structure after parsing:', parsedConfig, "Original config:", report.config);
        // Возвращаем дефолтную структуру при невалидной структуре JSON
        return { params: [], columns: [], chart: undefined };
      }
    } catch (error) {
      console.error('Error parsing report config JSON:', error, "Config string:", report.config);
      // Возвращаем дефолтную структуру при ошибке парсинга JSON
      return { params: [], columns: [], chart: undefined };
    }
  };


  return (
    <Box>
      {/* Заголовок и Фильтр */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Список отчетов</Typography>
        <Box display="flex" gap={2} alignItems="center"> {/* Контейнер для фильтра и кнопки */}
            <TextField
              label="Фильтр отчетов"
              variant="outlined"
              size="small"
              value={filterText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
              sx={{ width: '300px' }} // Настройте ширину по необходимости
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateReport}
            >
              Создать отчет
            </Button>
        </Box>
      </Box>

      {/* Индикатор загрузки */}
      {isLoading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}

      {/* Сообщение об ошибке загрузки */}
      {!isLoading && fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>
      )}

      {/* Таблица отчетов (показываем только если нет загрузки и нет ошибки ИЛИ если есть отчеты несмотря на ошибку) */}
      {!isLoading && (reports.length > 0 || !fetchError) && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Tag</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow
                    key={report.id}
                    hover // Добавляем эффект при наведении
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {report.id}
                    </TableCell>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>{report.description}</TableCell>
                    <TableCell>{report.tag}</TableCell>
                    <TableCell align="right" sx={{ width: '150px' }}>
                      <IconButton
                        aria-label={`Редактировать отчет ${report.name}`}
                        onClick={() => handleOpenQueryEditDialog(report)}
                        color="primary"
                      >
                        <SettingsIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Удалить отчет ${report.name}`}
                        onClick={() => handleDeleteReport(report.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Сообщение, если отчеты не найдены (с учетом фильтра)
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Отчеты не найдены{filterText ? ' по вашему фильтру' : ''}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for QueryEdit */}
      <Dialog
        open={openQueryEditDialog}
        onClose={handleCloseQueryEditDialog}
        fullWidth
        maxWidth="lg" // Можно сделать шире, если нужно больше места для редактора
      >
        <DialogTitle>
            {selectedReport?.id === -1 ? 'Создание отчета' : `Редактирование отчета: ${selectedReport?.name || ''} (${selectedReport?.id})`}
        </DialogTitle>
        {/* Убираем padding из DialogContent, так как QueryEdit имеет свой */}
        <DialogContent sx={{ p: 0, overflowY: 'hidden' }}>
          {/* Показываем QueryEdit только если selectedReport существует */}
          {selectedReport && (
            <QueryEdit
              // Ключ для пересоздания компонента при смене отчета
              key={selectedReport.id}
              initialData={{
                app_id: '', // Уточните, нужно ли это поле и откуда его брать
                report_id: selectedReport.id,
                report_name: selectedReport.name,
                report_description: selectedReport.description,
                query: selectedReport.query,
                tag: selectedReport.tag,
                report_config: getReportConfig(selectedReport), // Используем безопасную функцию парсинга
              }}
              onSubmit={handleQueryEditSubmit}
              onClose={handleCloseQueryEditDialog} // Передаем функцию закрытия
            />
          )}
          {/* Можно добавить индикатор загрузки, если selectedReport еще не загружен */}
          {!selectedReport && <CircularProgress sx={{m: 2}}/>}
        </DialogContent>
        {/* Кнопки Save/Close теперь внутри QueryEdit */}
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
