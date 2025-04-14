// src/App.tsx
import React, { useState } from 'react';
import {
  Container,
  Grid,
  CssBaseline,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Select, // Для примера смены языка
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent, // Убедитесь, что импорт есть
} from '@mui/material';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/EmployeeForm';
import { useEmployeeStore } from './store/employeeStore';
import { LocalizationProvider } from './localization/LocalizationProvider'; // Импорт провайдера
import { useLocalization } from './localization/LocalizationContext'; // Импорт хука
import { LocalizedTypography } from './components/LocalizedTypography'; // Импорт обертки
import { supportedLanguages } from './localization/dictionaries'; // Импорт списка языков

// Компонент для смены языка (для демонстрации)
const LanguageSwitcher = () => {
  // Получаем translate вместе с language и setLanguage
  const { language, setLanguage, translate } = useLocalization();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setLanguage(event.target.value);
  };

  // Получаем переведенный label
  const labelText = translate('languageSelectLabel'); // Убедитесь, что ключ 'languageSelectLabel' добавлен в словари

  return (
    <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
      {/* Используем переведенный текст для InputLabel */}
      <InputLabel id="language-select-label">{labelText}</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={language}
        // Используем переведенный текст для label пропа Select
        label={labelText}
        onChange={handleChange} // Теперь типы совпадают
      >
        {supportedLanguages.map((lang) => (
          <MenuItem key={lang} value={lang}>
            {lang.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};


function AppContent() { // Выносим контент в отдельный компонент, чтобы он был внутри провайдера
  const selectEmployee = useEmployeeStore((state) => state.selectEmployee);
  const selectedEmployeeId = useEmployeeStore((state) => state.selectedEmployeeId);
  const { translate } = useLocalization(); // Получаем translate для заголовка диалога

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddNew = () => {
    selectEmployee(null);
    handleOpenModal();
  };

  const handleEdit = (id: number) => {
    selectEmployee(id);
    handleOpenModal();
  };

  const dialogTitleKey = selectedEmployeeId !== null ? 'editEmployeeTitle' : 'addEmployeeTitle';

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Используем LocalizedTypography */}
        <LocalizedTypography variant="h4" component="h1" gutterBottom align="center" tKey="appTitle" />

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <LanguageSwitcher /> {/* Добавляем переключатель языка */}
          {/* Используем translate для текста кнопки */}
          <Button variant="contained" color="primary" onClick={handleAddNew}>
            {translate('addEmployeeBtn')}
          </Button>
        </Box>

        {/* Employee List */}
        <Grid container spacing={3}>
          {/* Оставляем ваш вариант <Grid size={12}>, раз он компилируется,
              хотя стандартным является <Grid item xs={12}> */}
          <Grid  size={12}>
            <EmployeeList onEdit={handleEdit} />
          </Grid>
        </Grid>

        {/* Employee Form Modal */}
        <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          {/* Используем translate для заголовка */}
          <DialogTitle>{translate(dialogTitleKey)}</DialogTitle>
          <DialogContent>
            <EmployeeForm onClose={handleCloseModal} />
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
}


// Оборачиваем AppContent в провайдер
function App() {
  return (
    <LocalizationProvider>
      <AppContent />
    </LocalizationProvider>
  );
}


export default App;
