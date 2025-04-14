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
    GridFilterModel as MuiGridFilterModel,
    GridSortModel as MuiGridSortModel,
} from '@mui/x-data-grid';
import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Alert, Snackbar, CircularProgress, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Position, GridFilterModel, GridSortModel } from '../../types/models'; // Импортируем Position
import * as api from '../../services/api'; // Используем тот же API сервис
import PositionForm from './PositionForm'; // Импортируем форму для должностей

const PositionList: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>([]); // State для должностей
    const [loading, setLoading] = useState<boolean>(false);
    const [rowCount, setRowCount] = useState<number>(0);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState<GridFilterModel | undefined>(undefined);
    const [sortModel, setSortModel] = useState<GridSortModel | undefined>(undefined);

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null); // State для редактируемой должности
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [positionToDelete, setPositionToDelete] = useState<Position | null>(null); // State для удаляемой должности

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'info',
    });

    // Функция загрузки данных
    const loadPositions = useCallback(async () => {
        setLoading(true);
        try {
            // Вызываем API для получения должностей
            const response = await api.fetchPositions(
                paginationModel.page,
                paginationModel.pageSize,
                filterModel,
                sortModel
            );
            setPositions(response.items);
            setRowCount(response.total);
        } catch (error) {
            console.error("Failed to fetch positions:", error);
            setSnackbar({ open: true, message: 'Не удалось загрузить должности', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, filterModel, sortModel]);

    useEffect(() => {
        loadPositions();
    }, [loadPositions]);

    const handleEditClick = (params: GridRowParams) => {
        setEditingPosition(params.row as Position); // Устанавливаем редактируемую должность
        setIsFormOpen(true);
    };

    const handleDeleteClick = (params: GridRowParams) => {
        setPositionToDelete(params.row as Position); // Устанавливаем должность для удаления
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!positionToDelete) return;
        setLoading(true);
        try {
            // Вызываем API для удаления должности
            await api.deletePosition(positionToDelete.position_id);
            setSnackbar({ open: true, message: 'Должность успешно удалена', severity: 'success' });
            setIsDeleteDialogOpen(false);
            setPositionToDelete(null);
            loadPositions(); // Перезагружаем список
        } catch (error) {
            console.error("Failed to delete position:", error);
            setSnackbar({ open: true, message: `Ошибка при удалении: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, severity: 'error' });
            setIsDeleteDialogOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingPosition(null); // Сбрасываем редактируемую должность для добавления
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingPosition(null);
    };

    const handleFormSave = (message: string) => {
        handleFormClose();
        setSnackbar({ open: true, message: message, severity: 'success' });
        loadPositions(); // Перезагружаем список
    };

     const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    const handlePaginationModelChange = (newModel: GridPaginationModel) => {
        setPaginationModel(newModel);
    };

    const handleFilterModelChange = useCallback((newModel: MuiGridFilterModel) => {
        const ourFilterModel: GridFilterModel = { items: newModel.items.map(item => ({
            field: item.field,
            operator: item.operator,
            value: item.value
        }))};
        if (newModel.quickFilterValues?.length) {
             ourFilterModel.quickFilterValues = newModel.quickFilterValues;
        }
        setFilterModel(ourFilterModel);
    }, []);

    const handleSortModelChange = useCallback((newModel: MuiGridSortModel) => {
        const mutableSortModel: GridSortModel = [...newModel];
        setSortModel(mutableSortModel);
    }, []);

    // Определяем колонки для таблицы должностей
    const columns: GridColDef[] = [
        { field: 'position_id', headerName: 'ID', width: 90 },
        { field: 'position_name', headerName: 'Название должности', width: 300, editable: false },
        { field: 'description', headerName: 'Описание', width: 450, editable: false, sortable: false },
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

    // Кастомный тулбар
    const CustomToolbar: React.FC = () => (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleAddClick}>
                Добавить должность
            </Button>
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </GridToolbarContainer>
    );

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}>
             <Typography variant="h4" gutterBottom>
                Должности
            </Typography>
            <DataGrid
                rows={positions} // Используем state positions
                columns={columns}
                loading={loading}
                rowCount={rowCount}
                pageSizeOptions={[5, 10, 20, 50]}
                paginationModel={paginationModel}
                paginationMode="server"
                filterMode="server"
                sortingMode="server"
                onPaginationModelChange={handlePaginationModelChange}
                onFilterModelChange={handleFilterModelChange}
                onSortModelChange={handleSortModelChange}
                getRowId={(row) => row.position_id} // ID строки - position_id
                slots={{
                    toolbar: CustomToolbar,
                }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                    },
                }}
                sx={{
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
                <DialogTitle>{editingPosition ? 'Редактировать должность' : 'Добавить должность'}</DialogTitle>
                <DialogContent>
                    {/* Используем PositionForm */}
                    <PositionForm
                        initialData={editingPosition}
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
                        Вы уверены, что хотите удалить должность "{positionToDelete?.position_name}"? Это действие необратимо.
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

export default PositionList;
