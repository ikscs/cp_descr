import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  Button,
  Modal,
  Snackbar,
  Alert,
} from '@mui/material';
import { DbThemeData, dbThemeSchema } from './themeSchema copy2';
// import { DbThemeData, dbThemeSchema } from './themeSchema';
import axios from 'axios';
import DynamicForm from './DynamicFormGenerator';
import { getFormDefaultValues } from './zodUtils';
import packageJson from '../../../package.json';
import { ca } from 'date-fns/locale';

const ThemeList: React.FC = () => {
  const [themes, setThemes] = useState<DbThemeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<DbThemeData | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false); // Состояние для открытия Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); // Сообщение для Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('error'); // Тип сообщения для Snackbar

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await axios.get(`https://cnt.theweb.place/api/theme/?app_id=mutant`);
        // Валидируем каждую тему с помощью Zod
        const validatedData = res.data.filter((item: any): item is DbThemeData => {
          const result = dbThemeSchema.safeParse(item);
          if (!result.success) {
            console.error('Некорректная тема получена с сервера:', result.error);
          }
          return result.success;
        });
        setThemes(res.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const onDuplicateTheme = async (id: number) => {
    if (!window.confirm('Ви впевнені, що хочете дублювати цю тему?')) {
      return;
    }

    const themeToDuplicate = themes.find((theme) => theme.id === id);
    if (!themeToDuplicate) { // never happens, but to suppress TS error
      alert('Тема не знайдена'); 
      return;
    }

    const newTheme = { ...themeToDuplicate, id: undefined }; // Убираем ID для создания новой темы
    newTheme.name = `Копия ${themeToDuplicate.name}`; // Изменяем имя для новой темы
    try {
      const res = await axios.post<DbThemeData>('https://cnt.theweb.place/api/theme/', newTheme);
      if (res.status === 201) {
        setThemes([...themes, res.data]);
        setSnackbarMessage('Тема успешно дублирована');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        alert('Невозможно дублировать тему');
      }
    } catch (err: any) {
      setSnackbarMessage(`Ошибка при дублировании темы: ${err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Ошибка при дублировании темы:', err);
    }
  }

  const onDeleteTheme = async (id: number) => {
      
      if (!window.confirm('Ви впевнені, що хочете видалити цю тему?')) {
        return;
      }

      const deleteTheme = async () => {
        const res = await axios.delete(`https://cnt.theweb.place/api/theme/${id}/` );
        if (res.status === 204) {
          setThemes(themes.filter((theme) => theme.id !== id));
        } else {
          alert('Неможливо видалити тему');
        }
      }
      deleteTheme();
  };
  
  const onEditTheme = async (_theme: DbThemeData) => {
    // Здесь можно реализовать логику редактирования темы
  }
  
  const handleSaveTheme = async (data: DbThemeData) => {
    try {  
      if (!data.id) { // Если ID не указан, значит это новая тема
        const {id, ...rest} = data;
        const res = await axios.post<DbThemeData>('https://cnt.theweb.place/api/theme/', rest);
        if (res.status === 201) {
          setThemes([...themes, res.data]);
          handleCloseModal();
        } else {
          alert('Невозможно сохранить тему');
        }
        return;
      }

      const res = await axios.put(`https://cnt.theweb.place/api/theme/${data.id}/`, data);
      if (res.status === 200) {
        setThemes(themes.map((theme) => (theme.id === data.id ? data : theme)));
        handleCloseModal();
      } else {
        alert('Невозможно сохранить тему');
      }
    } catch (err: any) {
      setSnackbarMessage(`Ошибка при сохранении темы: ${err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Ошибка при сохранении темы:', err);
    }
  }

  const handleOpenModal = async (theme: DbThemeData | null) => {
    const initialValuesForForm = getFormDefaultValues(dbThemeSchema, theme ? theme : {});
    if (!initialValuesForForm.id) { // Если ID не указан, значит это новая тема
      initialValuesForForm.app_id = packageJson.name;
    }

    setSelectedTheme(initialValuesForForm);
    // setSelectedTheme(theme ? { ...theme } : null);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTheme(null);
    setSnackbarOpen(false); 
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Список тем
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-begin' }}>
        <Button variant="contained" onClick={() => handleOpenModal(null)}>
          Добавить тему
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Название темы</TableCell>
            <TableCell>Основной цвет</TableCell>
            <TableCell>Режим</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {themes.map((theme) => (
            <TableRow
              key={theme.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
              // onClick={() => onSelectTheme(theme)}
            >
              <TableCell>{theme.id}</TableCell>
              <TableCell>{theme.name}</TableCell>
              <TableCell>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    // backgroundColor: theme.value.palette.primary.main,
                    border: '1px solid #ccc',
                  }}
                />
              </TableCell>
              <TableCell>{theme.value?.palette?.mode ? theme.value.palette.mode : 'N/A'}</TableCell>
              {/* <TableCell>{theme.value.palette.mode}</TableCell> */}
              <TableCell>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    // onEditTheme(theme);
                    handleOpenModal(theme)
                  }}
                  sx={{ mr: 1 }}
                >
                  Редактировать
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    onDuplicateTheme(theme.id);
                  }}
                  sx={{ mr: 1 }}
                >
                  Дублировать
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    onDeleteTheme(theme.id);
                  }}
                  sx={{ mr: 1 }}
                >
                  Удалить
                </Button>

              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={{ p: 4, backgroundColor: 'white', borderRadius: 2, maxWidth: 600, margin: 'auto', mt: 10 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {selectedTheme ? 'Редактировать тему' : 'Добавить новую тему'}
          </Typography>
          <DynamicForm
              schema={dbThemeSchema}
              initialData={selectedTheme} 
              onSave={handleSaveTheme} 
            // schema={dbThemeSchema}
            // defaultValues={selectedTheme ? selectedTheme : {}}
            // onSubmit={async (data) => {
            //   if (selectedTheme) {
            //     // Здесь можно реализовать логику обновления темы
            //   } else {
            //     // Здесь можно реализовать логику добавления новой темы
            //   }
            //   handleCloseModal();
            // }}
          />
        </Box>
      </Modal>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </TableContainer>
  );
};

export default ThemeList;