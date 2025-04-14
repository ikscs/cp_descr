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
    GridFilterModel as MuiGridFilterModel, // MUI's filter model type
    GridSortModel as MuiGridSortModel,     // MUI's sort model type
    GridValueFormatter,
    // GridValueFormatterParams,
    GridRowId,
} from '@mui/x-data-grid';
import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Alert, Snackbar, CircularProgress, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { Employee, GridFilterModel, GridSortModel } from '../../types/models'; // Custom types for API
import * as api from '../../services/api';
import EmployeeForm from './EmployeeForm';

const EmployeeList: React.FC = () => {
    // State for data grid
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null); // General fetch/delete error
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState<number>(0);
    // Use custom types for state representing API parameters
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);

    // State for Add/Edit Form Dialog
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // State for Delete Confirmation Dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<GridRowId | null>(null);

    // State for Snackbar notifications
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    // Fetch data from API
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null); // Clear previous errors before fetching
        try {
            // Pass state models directly to API call
            const result = await api.fetchEmployees(
                // paginationModel.page + 1, // API might be 1-based index
                paginationModel.page,
                paginationModel.pageSize,
                filterModel,
                sortModel,
            );
            setEmployees(result.items);
            setRowCount(result.total);
        } catch (err) {
            console.error("Failed to fetch employees:", err);
            const errorMsg = err instanceof Error ? err.message : 'Не удалось загрузить список сотрудников.';
            setError(errorMsg); // Set error state for display
            setSnackbar({ open: true, message: 'Ошибка загрузки данных: ' + errorMsg, severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [paginationModel, filterModel, sortModel]); // Dependencies for useCallback

    // Trigger fetchData when pagination, filter, or sort models change
    useEffect(() => {
        fetchData();
    }, [fetchData]); // fetchData is the single dependency

    // --- Handlers ---

    const handlePaginationModelChange = (newModel: GridPaginationModel) => {
        // Update state, useEffect will trigger refetch
        setPaginationModel(newModel);
    };

    const handleFilterModelChange = useCallback((newMuiModel: MuiGridFilterModel) => {
        // Convert MUI filter model to custom API filter model
        const newApiFilterModel: GridFilterModel = {
            items: newMuiModel.items.map(item => ({
                // Ensure all necessary fields are mapped
                id: item.id,
                field: item.field,
                operator: item.operator,
                value: item.value,
            })),
            // Handle linkOperator if your API uses it
            // linkOperator: newMuiModel.linkOperator,
        };
        setFilterModel(newApiFilterModel);
        // Reset to first page when filters change
        setPaginationModel(prev => ({ ...prev, page: 0 }));
        // Refetch is triggered by useEffect watching filterModel via fetchData
    }, []);

    const handleSortModelChange = useCallback((newMuiModel: MuiGridSortModel) => {
        // Convert MUI sort model to custom API sort model
        const newApiSortModel: GridSortModel = newMuiModel.map(item => ({
            field: item.field,
            sort: item.sort || 'asc', // Default to 'asc' if null/undefined
        }));
        setSortModel(newApiSortModel);
        // Refetch is triggered by useEffect watching sortModel via fetchData
    }, []);

    const handleAddClick = () => {
        setSelectedEmployee(null); // Ensure form opens in "add" mode
        setError(null); // Clear any previous errors
        setIsFormOpen(true);
    };

    const handleEditClick = (params: GridRowParams<Employee>) => {
        setSelectedEmployee(params.row);
        setError(null); // Clear any previous errors
        setIsFormOpen(true);
    };

    const handleDeleteClick = (params: GridRowParams<Employee>) => {
        setEmployeeToDelete(params.row.employee_id);
        setError(null); // Clear previous errors before showing dialog
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (employeeToDelete === null) return;

        setLoading(true); // Show loading state during deletion
        setError(null);
        try {
            await api.deleteEmployee(employeeToDelete as number); // Assuming ID is number
            setSnackbar({ open: true, message: 'Сотрудник успешно удален', severity: 'success' });
            setIsDeleteDialogOpen(false);
            setEmployeeToDelete(null);
            fetchData(); // Refresh data grid
        } catch (err) {
            console.error("Failed to delete employee:", err);
            const errorMsg = err instanceof Error ? err.message : 'Ошибка при удалении сотрудника.';
            // Set error state to display in the dialog or globally
            setError(errorMsg);
            setSnackbar({ open: true, message: `Ошибка удаления: ${errorMsg}`, severity: 'error' });
            // Keep dialog open to show error? Or close and rely on snackbar? Closing for now.
            // setIsDeleteDialogOpen(false);
        } finally {
            setLoading(false); // Stop loading indicator
             // Optionally close dialog even on error, relying on snackbar
             setIsDeleteDialogOpen(false);
             setEmployeeToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setEmployeeToDelete(null);
        setError(null); // Clear error when cancelling delete dialog
    };

    const handleSave = (message: string) => {
        setIsFormOpen(false);
        setSnackbar({ open: true, message: message, severity: 'success' });
        fetchData(); // Refresh data after save
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setSelectedEmployee(null); // Clear selection on cancel
    };

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(null);
    };

    // --- Column Definitions ---
    const columns: GridColDef<Employee>[] = [
        { field: 'employee_id', headerName: 'ID', width: 70 },
        { field: 'last_name', headerName: 'Фамилия', width: 130 },
        { field: 'first_name', headerName: 'Имя', width: 120 },
        { field: 'middle_name', headerName: 'Отчество', width: 130, sortable: false },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone_number', headerName: 'Телефон', width: 150, sortable: false },
        {
            field: 'hire_date',
            headerName: 'Дата найма',
            width: 120,
            type: 'date', // Оставляем тип 'date'
            // valueGetter теперь возвращает Date | null
            valueGetter: (value) => {
                if (value) {
                    const date = new Date(value);
                    // Проверяем, что дата валидна
                    if (!isNaN(date.getTime())) {
                        return date; // Возвращаем объект Date
                    }
                }
                // Возвращаем null вместо undefined для невалидных или отсутствующих дат
                return null;
            },
            valueFormatter: (value: Date | null) => { // Указываем тип value (Date | null)
                if (value instanceof Date) {
                    // Теперь используем 'value' напрямую вместо 'params.value'
                    return format(value, 'dd.MM.yyyy');
                }
                return '';
            },
        },
       
        {
            field: 'department_name',
            headerName: 'Подразделение',
            width: 180,
            // If filtering/sorting by department_id is needed, adjust field or use valueGetter
            // field: 'department_id', valueGetter: (value, row) => row.department_name
        },
        {
            field: 'position_name',
            headerName: 'Должность',
            width: 180,
            // Similar comment as department_name for filtering/sorting by ID
        },
        {
            field: 'manager_name',
            headerName: 'Руководитель',
            width: 180,
            sortable: false, // Often derived, sorting might not make sense or require specific API support
        },
        {
            field: 'salary',
            headerName: 'Зарплата',
            width: 120,
            valueGetter: (value) => {
                if (value == null || value === '') {
                    return null;
                }
                const num = typeof value === 'string' ? parseFloat(value) : Number(value);
                return isNaN(num) ? null : num; // Возвращает number | null
            },
            valueFormatter: (value: number | null) => {
                if (typeof value === 'number') {
                    return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 2 });
                }
                // Handle the 'null' case or any unexpected types
                return '';
            },
            align: 'right',
            headerAlign: 'right',
            // sortComparator не нужен при sortingMode="server"
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Действия',
            width: 100,
            cellClassName: 'actions',
            getActions: (params: GridRowParams<Employee>) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Редактировать"
                    onClick={() => handleEditClick(params)}
                    color="primary"
                    showInMenu={false} // Show directly in cell
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Удалить"
                    onClick={() => handleDeleteClick(params)}
                    color="error"
                    showInMenu={false} // Show directly in cell
                />,
            ],
        },
    ];

    // --- Custom Toolbar ---
    const CustomToolbar: React.FC = () => {
        return (
            <GridToolbarContainer>
                <Button color="primary" startIcon={<AddIcon />} onClick={handleAddClick}>
                    Добавить сотрудника
                </Button>
                <GridToolbarFilterButton />
                <GridToolbarExport
                    csvOptions={{
                        fileName: 'employees_export',
                        delimiter: ';',
                        utf8WithBom: true,
                    }}
                    printOptions={{
                         disableToolbarButton: true, // Example: hide print button
                    }}
                 />
                {/* Add other toolbar items if needed */}
            </GridToolbarContainer>
        );
    };

    // --- Render Component ---
    return (
        <Box sx={{ height: 'calc(100vh - 150px)', width: '100%', p: 2 }}> {/* Adjust height as needed */}
            <Typography variant="h5" gutterBottom component="div" sx={{ mb: 2 }}>
                Список сотрудников
            </Typography>
            {/* Display general fetch error above the grid */}
            {error && !loading && !isDeleteDialogOpen && !isFormOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ height: '100%', width: '100%' }}> {/* Box to constrain DataGrid height */}
                <DataGrid
                    rows={employees}
                    columns={columns}
                    getRowId={(row) => row.employee_id} // Specify the unique ID field
                    loading={loading && !isDeleteDialogOpen} // Don't show grid loading overlay when delete dialog is loading
                    pagination
                    paginationMode="server"
                    rowCount={rowCount}
                    pageSizeOptions={[5, 10, 20, 50]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePaginationModelChange}
                    filterMode="server"
                    onFilterModelChange={handleFilterModelChange} // Use the memoized handler
                    sortingMode="server"
                    sortModel={sortModel as MuiGridSortModel} // Pass MUI sort model format
                    onSortModelChange={handleSortModelChange} // Use the memoized handler
                    slots={{
                        toolbar: CustomToolbar,
                        // Use default loading overlay or customize if needed
                        // loadingOverlay: () => <CircularProgress color="inherit" size={40} />,
                    }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true, // Enable quick filter in default toolbar position
                             quickFilterProps: { debounceMs: 500 },
                        },
                    }}
                    // No need for initialState if models are controlled
                    // initialState={{ ... }}
                    // autoHeight // Remove autoHeight if using fixed height Box parent
                    density="compact" // Optional: make rows denser
                    sx={{
                        // Ensure actions cell is visible and aligned
                        '& .actions': {
                            color: 'text.secondary',
                            display: 'flex',
                            gap: 1,
                        },
                        '& .MuiDataGrid-cell--textRight': {
                            justifyContent: 'flex-end',
                        },
                        '& .MuiDataGrid-columnHeader--alignRight': {
                            justifyContent: 'flex-end',
                        },
                        // Prevent layout shift when scrollbar appears
                        '& .MuiDataGrid-virtualScroller': {
                             overflowY: 'scroll',
                        },
                    }}
                />
            </Box>

            {/* Add/Edit Employee Dialog */}
            <Dialog open={isFormOpen} onClose={handleCancelForm} maxWidth="md" fullWidth>
                <DialogTitle>{selectedEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</DialogTitle>
                <DialogContent>
                    {/* Render form only when dialog is open to reset state correctly if needed */}
                    {/* Or rely on useEffect in EmployeeForm to load initialData */}
                    {isFormOpen && (
                         <EmployeeForm
                            initialData={selectedEmployee}
                            onSave={handleSave}
                            onCancel={handleCancelForm}
                        />
                    )}
                </DialogContent>
                {/* Actions are now part of the EmployeeForm component */}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Вы уверены, что хотите удалить этого сотрудника? Это действие необратимо.
                    </DialogContentText>
                    {/* Show loading indicator inside dialog during delete operation */}
                    {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress size={30} /></Box>}
                    {/* Show delete-specific error inside dialog */}
                    {error && !loading && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} disabled={loading}>Отмена</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={loading}>
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar?.open ?? false}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {/* Ensure Alert is rendered only when snackbar is open to allow transition */}
                {snackbar?.open ? (
                    <Alert onClose={handleCloseSnackbar} severity={snackbar?.severity} sx={{ width: '100%' }} variant="filled">
                        {snackbar?.message}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </Box>
    );
};

export default EmployeeList;
