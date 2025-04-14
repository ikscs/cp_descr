import React, { useState, useEffect, useCallback } from 'react';
import {
    DataGrid,
    GridColDef,
    GridRowParams,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridPaginationModel,
    GridFilterModel as MuiGridFilterModel, // Переименовываем, чтобы избежать конфликта
    GridSortModel as MuiGridSortModel,     // Переименовываем
} from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert, Snackbar, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Department, GridFilterModel, GridSortModel } from '../../types/models'; // Наши типы
import * as api from '../../services/api';
import DepartmentForm from './DepartmentForm';

const DepartmentList: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [rowCount, setRowCount] = useState<number>(0);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState<GridFilterModel | undefined>(undefined);
    const [sortModel, setSortModel] = useState<GridSortModel | undefined>(undefined);

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'info',
    });

    // Функция загрузки данных с учетом пагинации, фильтрации, сортировки
    const loadDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.fetchDepartments(
                paginationModel.page,
                paginationModel.pageSize,
                filterModel,
                sortModel
            );
            setDepartments(response.items);
            setRowCount(response.total);
        } catch (error) {
            console.error("Failed to fetch departments:", error);
            setSnackbar({ open: true, message: 'Не удалось загрузить подразделения', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, filterModel, sortModel]); // Зависимости для useCallback

    // Загружаем данные при монтировании и при изменении зависимостей loadDepartments
    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    const handleEditClick = (params: GridRowParams) => {
        setEditingDepartment(params.row as Department);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (params: GridRowParams) => {
        setDepartmentToDelete(params.row as Department);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!departmentToDelete) return;
        setLoading(true); // Показываем индикатор загрузки на кнопке или глобально
        try {
            await api.deleteDepartment(departmentToDelete.department_id);
            setSnackbar({ open: true, message: 'Подразделение успешно удалено', severity: 'success' });
            setIsDeleteDialogOpen(false);
            setDepartmentToDelete(null);
            loadDepartments(); // Перезагружаем список
        } catch (error) {
            console.error("Failed to delete department:", error);
            setSnackbar({ open: true, message: `Ошибка при удалении: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, severity: 'error' });
            setIsDeleteDialogOpen(false); // Закрываем диалог даже при ошибке
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingDepartment(null); // Убеждаемся, что форма открывается для добавления
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingDepartment(null); // Сбрасываем редактируемый элемент при закрытии
    };

    const handleFormSave = (message: string) => {
        handleFormClose();
        setSnackbar({ open: true, message: message, severity: 'success' });
        loadDepartments(); // Перезагружаем список после сохранения
    };

     const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    // Обработчики для серверной пагинации, фильтрации, сортировки
    const handlePaginationModelChange = (newModel: GridPaginationModel) => {
        setPaginationModel(newModel);
    };

    const handleFilterModelChange = useCallback((newModel: MuiGridFilterModel) => {
        // Преобразуем модель фильтра MUI в нашу модель
        const ourFilterModel: GridFilterModel = { items: newModel.items.map(item => ({
            field: item.field,
            operator: item.operator, // Возможно, понадобится маппинг операторов
            value: item.value
        }))};
         // Если есть quickFilter, добавляем его (простой пример)
        if (newModel.quickFilterValues?.length) {
             ourFilterModel.quickFilterValues = newModel.quickFilterValues;
             // Можно добавить логику для поиска по нескольким полям
             // Например, добавить еще один item в items для quick filter
        }

        setFilterModel(ourFilterModel);
    }, []);

    const handleSortModelChange = useCallback((newModel: MuiGridSortModel) => {
        // Create a mutable copy of the readonly array provided by DataGrid
        const mutableSortModel: GridSortModel = [...newModel];
        setSortModel(mutableSortModel); // Наша модель совпадает с MUI
    }, []);


    const columns: GridColDef[] = [
        { field: 'department_id', headerName: 'ID', width: 90 },
        { field: 'department_name', headerName: 'Название подразделения', width: 300, editable: false },
        { field: 'description', headerName: 'Описание', width: 450, editable: false, sortable: false }, // Описание часто не сортируют
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Действия',
            width: 100,
            cellClassName: 'actions',
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Редактировать"
                    onClick={() => handleEditClick(params)}
                    color="primary"
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Удалить"
                    onClick={() => handleDeleteClick(params)}
                    color="error"
                />,
            ],
        },
    ];

    // Кастомный тулбар с кнопкой добавления
    const CustomToolbar: React.FC = () => (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleAddClick}>
                Добавить подразделение
            </Button>
            <GridToolbarFilterButton />
            <GridToolbarExport />
            {/* Можно добавить другие кнопки тулбара */}
        </GridToolbarContainer>
    );

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}> {/* Пример адаптивной высоты */}
             <Typography variant="h4" gutterBottom>
                Подразделения
            </Typography>
            <DataGrid
                rows={departments}
                columns={columns}
                loading={loading}
                rowCount={rowCount}
                pageSizeOptions={[5, 10, 20, 50]}
                paginationModel={paginationModel}
                paginationMode="server" // Включаем серверную пагинацию
                filterMode="server"     // Включаем серверную фильтрацию
                sortingMode="server"    // Включаем серверную сортировку
                onPaginationModelChange={handlePaginationModelChange}
                onFilterModelChange={handleFilterModelChange}
                onSortModelChange={handleSortModelChange}
                getRowId={(row) => row.department_id} // Указываем поле для ID строки
                slots={{
                    toolbar: CustomToolbar, // Используем кастомный тулбар
                }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true, // Включаем быстрый поиск
                    },
                }}
                sx={{
                    // Убираем outline при фокусе ячейки/заголовка для эстетики
                    '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus': {
                        outline: 'none !important',
                    },
                    '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus': {
                         outline: 'none !important',
                    }
                }}
            />

            {/* Диалог добавления/редактирования */}
            <Dialog open={isFormOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editingDepartment ? 'Редактировать подразделение' : 'Добавить подразделение'}</DialogTitle>
                <DialogContent>
                    {/* Передаем initialData и колбэки в форму */}
                    <DepartmentForm
                        initialData={editingDepartment}
                        onSave={handleFormSave}
                        onCancel={handleFormClose}
                    />
                </DialogContent>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Подтвердить удаление</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Вы уверены, что хотите удалить подразделение "{departmentToDelete?.department_name}"? Это действие необратимо.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)} disabled={loading}>Отмена</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus disabled={loading}>
                         {loading ? <CircularProgress size={20} color="inherit" /> : 'Удалить'}
                    </Button>
                </DialogActions>
            </Dialog>

             {/* Снэкбар для уведомлений */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// Добавим Typography для заголовка
import { Typography } from '@mui/material';

export default DepartmentList;

