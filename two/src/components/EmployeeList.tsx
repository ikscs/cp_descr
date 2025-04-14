// src/components/EmployeeList.tsx
import React, { useState } from 'react'; // Импортируем useState
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider,
  Box,
  Dialog, // Импортируем компоненты диалога
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button, // Импортируем Button для диалога
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEmployeeStore } from '../store/employeeStore';
import { useLocalization } from '../localization/LocalizationContext';
import { LocalizedTypography } from './LocalizedTypography';
import { Employee } from '../types/employee'; // Импортируем тип Employee

interface EmployeeListProps {
  onEdit: (id: number) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit }) => {
  const { translate } = useLocalization();
  const employees = useEmployeeStore((state) => state.employees);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);

  // Состояние для управления диалогом подтверждения
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  // Состояние для хранения сотрудника, которого собираемся удалить
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Обработчик клика по иконке удаления
  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee); // Сохраняем сотрудника
    setOpenConfirmDialog(true);    // Открываем диалог
  };

  // Обработчик закрытия диалога (без удаления)
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setEmployeeToDelete(null); // Сбрасываем сотрудника
  };

  // Обработчик подтверждения удаления
  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id); // Вызываем удаление из стора
    }
    handleCloseConfirmDialog(); // Закрываем диалог
  };

  return (
    <> {/* Оборачиваем в React.Fragment, т.к. добавляем Dialog */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <LocalizedTypography
            variant="h6"
            component="h2"
            gutterBottom
            tKey="employeeListTitle"
          />
        </Box>
        <Divider />
        <List>
          {employees.length === 0 ? (
             <ListItem>
               <LocalizedTypography tKey="emptyList" />
             </ListItem>
          ) : (
            employees.map((employee) => (
              <React.Fragment key={employee.id}>
                <ListItem>
                  <ListItemText
                    primary={employee.name}
                    secondary={`${employee.position} - ${employee.email}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label={translate('editActionLabel')}
                      onClick={() => onEdit(employee.id)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label={translate('deleteActionLabel')}
                      // Вызываем handleDeleteClick вместо прямого deleteEmployee
                      onClick={() => handleDeleteClick(employee)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog} // Закрытие по клику вне диалога или Esc
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {translate('deleteConfirmationTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {/* Используем интерполяцию для имени сотрудника */}
            {employeeToDelete ? translate('deleteConfirmationText', { name: employeeToDelete.name }) : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>
            {translate('cancelBtn')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            {translate('confirmBtn')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
