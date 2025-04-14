import React, { useState, useEffect, useCallback } from 'react';
import {
    TextField, Button, Box, CircularProgress, Alert, Grid,
    Select, MenuItem, InputLabel, FormControl, FormHelperText, SelectChangeEvent
} from '@mui/material';
// Для DatePicker (если решите использовать):
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import ru from 'date-fns/locale/ru';

import { Employee, SimpleListItem } from '../../types/models';
import * as api from '../../services/api';

interface EmployeeFormProps {
    initialData: Employee | null; // Полные данные сотрудника для редактирования или null для добавления
    onSave: (message: string) => void;
    onCancel: () => void;
}

// Начальное состояние пустой формы
const initialFormData: Partial<Employee> = {
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone_number: '',
    hire_date: new Date().toISOString().split('T')[0], // Сегодняшняя дата в формате YYYY-MM-DD
    department_id: undefined, // Используем undefined или '' для Select
    position_id: undefined,
    manager_id: undefined,
    salary: '', // Используем строку для ввода
    notes: '',
};

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Employee>>(initialFormData);
    const [loading, setLoading] = useState<boolean>(false); // Загрузка при отправке формы
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // Состояние для списков
    const [departments, setDepartments] = useState<SimpleListItem[]>([]);
    const [positions, setPositions] = useState<SimpleListItem[]>([]);
    const [managers, setManagers] = useState<SimpleListItem[]>([]);
    const [loadingLists, setLoadingLists] = useState<boolean>(true); // Загрузка списков

    // Загрузка списков для Select
    const loadLists = useCallback(async () => {
        setLoadingLists(true);
        setError(null); // Сбрасываем общую ошибку при загрузке списков
        try {
            const [deptRes, posRes, mgrRes] = await Promise.all([
                api.fetchDepartmentList(),
                api.fetchPositionList(),
                api.fetchManagerList()
            ]);
            setDepartments(deptRes);
            setPositions(posRes);
            // Фильтруем список менеджеров, чтобы нельзя было выбрать себя (если редактируем)
            setManagers(mgrRes.filter(mgr => mgr.id !== initialData?.employee_id));

        } catch (err) {
            console.error("Failed to load lists:", err);
            setError("Ошибка загрузки справочников (отделы, должности, руководители).");
        } finally {
            setLoadingLists(false);
        }
    }, [initialData?.employee_id]); // Перезагружаем списки, если меняется ID редактируемого сотрудника

    useEffect(() => {
        loadLists(); // Загружаем списки при монтировании/смене ID
    }, [loadLists]); // Зависимость только от loadLists

    useEffect(() => {
        // Заполняем форму данными initialData, когда они приходят или меняются
        if (initialData) {
             setFormData({
                ...initialData,
                // Преобразуем salary в строку для TextField, если оно есть
                salary: initialData.salary != null ? String(initialData.salary) : '',
                // Убедимся, что ID для Select установлены в number или undefined/''
                department_id: initialData.department_id ?? undefined,
                position_id: initialData.position_id ?? undefined,
                manager_id: initialData.manager_id ?? undefined,
                // Форматируем дату для input type="date" (YYYY-MM-DD)
                hire_date: initialData.hire_date ? initialData.hire_date.split('T')[0] : new Date().toISOString().split('T')[0],
            });
        } else {
            setFormData(initialFormData); // Сбрасываем форму, если добавляем нового
        }
        // Сбрасываем ошибки при смене initialData
        // setError(null); // Не сбрасываем общую ошибку здесь, чтобы видеть ошибки загрузки списков
        setValidationErrors({});
    }, [initialData]); // Зависимость от initialData

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};
        if (!formData.first_name?.trim()) errors.first_name = 'Имя обязательно.';
        if (!formData.last_name?.trim()) errors.last_name = 'Фамилия обязательна.';
        if (!formData.hire_date) errors.hire_date = 'Дата найма обязательна.';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
             errors.email = 'Неверный формат email.';
        }
         if (formData.salary && (isNaN(Number(formData.salary)) || Number(formData.salary) < 0)) {
             errors.salary = 'Зарплата должна быть неотрицательным числом.';
         }
        // Добавить другие проверки (телефон, обязательность отдела/должности и т.д.)
        if (!formData.department_id) errors.department_id = 'Подразделение обязательно.';
        if (!formData.position_id) errors.position_id = 'Должность обязательна.';


        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
         if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

     // Обработчик для Select
    const handleSelectChange = (event: SelectChangeEvent<number | string>) => { // Указываем тип значения
        const name = event.target.name;
        let value: number | string | undefined = event.target.value;

        // Преобразуем пустую строку обратно в undefined для ID
        if (value === '') {
            value = undefined;
        } else {
            // Убедимся, что это число, если не пустая строка
            value = Number(value);
        }

        if (name) {
            setFormData(prev => ({ ...prev, [name]: value }));
             if (validationErrors[name]) {
                setValidationErrors(prev => ({ ...prev, [name]: '' }));
            }
        }
    };

    // Обработчик для DatePicker (если используется)
    // const handleDateChange = (date: Date | null) => {
    //     setFormData(prev => ({ ...prev, hire_date: date ? date.toISOString().split('T')[0] : '' }));
    //      if (validationErrors.hire_date) {
    //         setValidationErrors(prev => ({ ...prev, hire_date: '' }));
    //     }
    // };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null); // Сбрасываем общую ошибку перед отправкой

        if (!validateForm()) return;

        setLoading(true);

        // Подготавливаем данные для отправки
        const dataToSend: Partial<Employee> = {
            ...formData,
            // Преобразуем ID в числа или null перед отправкой
            department_id: formData.department_id ? Number(formData.department_id) : null,
            position_id: formData.position_id ? Number(formData.position_id) : null,
            manager_id: formData.manager_id ? Number(formData.manager_id) : null,
            // Преобразуем зарплату в число или null
            salary: formData.salary != null && formData.salary !== '' ? parseFloat(String(formData.salary)) : null,
            // Убедимся, что дата в нужном формате (хотя input type="date" должен это делать)
            hire_date: formData.hire_date ? formData.hire_date : new Date().toISOString().split('T')[0],
        };

        // Удаляем поля, которых нет в Omit<Employee, 'employee_id'> для addEmployee
        const addData = { ...dataToSend };
        delete addData.employee_id;
        delete addData.department_name;
        delete addData.position_name;
        delete addData.manager_name;

        try {
            let message = '';
            if (initialData?.employee_id) {
                // Обновление
                await api.updateEmployee({
                    ...dataToSend, // Отправляем подготовленные данные
                    employee_id: initialData.employee_id, // Добавляем ID
                } as Employee); // Утверждаем тип
                message = 'Сотрудник успешно обновлен';
            } else {
                // Добавление
                await api.addEmployee(addData as Omit<Employee, 'employee_id' | 'department_name' | 'position_name' | 'manager_name'>);
                message = 'Сотрудник успешно добавлен';
            }
            onSave(message);
        } catch (err) {
            console.error("Failed to save employee:", err);
            setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении сотрудника.');
        } finally {
            setLoading(false);
        }
    };

    // Если списки еще грузятся, показываем индикатор
    if (loadingLists) {
         return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    }
     // Если ошибка загрузки списков (и не идет загрузка формы)
    if (error && !loading) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        // <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}> {/* Обертка для DatePicker */}
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                {/* Показываем ошибку отправки формы, если она есть и не идет загрузка */}
                {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {/* Индикатор загрузки при отправке */}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}><CircularProgress size={30} /></Box>}

                <Grid container spacing={2}>
                    {/* Основная информация */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            margin="dense" required fullWidth name="last_name" label="Фамилия"
                            value={formData.last_name ?? ''} onChange={handleChange} disabled={loading}
                            error={!!validationErrors.last_name} helperText={validationErrors.last_name}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            margin="dense" required fullWidth name="first_name" label="Имя"
                            value={formData.first_name ?? ''} onChange={handleChange} disabled={loading}
                            error={!!validationErrors.first_name} helperText={validationErrors.first_name}
                        />
                    </Grid>
                     <Grid item xs={12} sm={4}>
                        <TextField
                            margin="dense" fullWidth name="middle_name" label="Отчество"
                            value={formData.middle_name ?? ''} onChange={handleChange} disabled={loading}
                        />
                    </Grid>

                     {/* Контакты */}
                     <Grid item xs={12} sm={6}>
                        <TextField
                            margin="dense" fullWidth name="email" label="Email" type="email"
                            value={formData.email ?? ''} onChange={handleChange} disabled={loading}
                            error={!!validationErrors.email} helperText={validationErrors.email}
                        />
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <TextField
                            margin="dense" fullWidth name="phone_number" label="Телефон"
                            value={formData.phone_number ?? ''} onChange={handleChange} disabled={loading}
                        />
                    </Grid>

                    {/* Работа */}
                     <Grid item xs={12} sm={6}>
                         {/* Используем TextField type="date" */}
                         <TextField
                            margin="dense" required fullWidth name="hire_date" label="Дата найма"
                            type="date" InputLabelProps={{ shrink: true }}
                            value={formData.hire_date ?? ''} onChange={handleChange} disabled={loading}
                            error={!!validationErrors.hire_date} helperText={validationErrors.hire_date}
                        />
                        {/* <DatePicker
                            label="Дата найма *"
                            value={formData.hire_date ? new Date(formData.hire_date) : null}
                            onChange={handleDateChange}
                            disabled={loading}
                            slotProps={{ textField: {
                                margin: 'dense', // Используем dense
                                fullWidth: true,
                                required: true,
                                error: !!validationErrors.hire_date,
                                helperText: validationErrors.hire_date
                            }}}
                        /> */}
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <TextField
                            margin="dense" fullWidth name="salary" label="Зарплата" type="number"
                            value={formData.salary ?? ''} onChange={handleChange} disabled={loading}
                            error={!!validationErrors.salary} helperText={validationErrors.salary}
                            InputProps={{ inputProps: { step: "0.01", min: 0 } }} // Для копеек, неотрицательное
                        />
                    </Grid>

                    {/* Связи */}
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="dense" disabled={loading} error={!!validationErrors.department_id} required>
                            <InputLabel id="department-select-label">Подразделение</InputLabel>
                            <Select<number | string> // Указываем тип значения
                                labelId="department-select-label"
                                name="department_id"
                                value={formData.department_id ?? ''} // Select требует '' для пустого значения
                                label="Подразделение *"
                                onChange={handleSelectChange}
                            >
                                <MenuItem value=""><em>Не выбрано</em></MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                             {validationErrors.department_id && <FormHelperText>{validationErrors.department_id}</FormHelperText>}
                        </FormControl>
                    </Grid>
                     <Grid item xs={12} sm={6}>
                         <FormControl fullWidth margin="dense" disabled={loading} error={!!validationErrors.position_id} required>
                            <InputLabel id="position-select-label">Должность</InputLabel>
                            <Select<number | string>
                                labelId="position-select-label"
                                name="position_id"
                                value={formData.position_id ?? ''}
                                label="Должность *"
                                onChange={handleSelectChange}
                            >
                                <MenuItem value=""><em>Не выбрано</em></MenuItem>
                                {positions.map((pos) => (
                                    <MenuItem key={pos.id} value={pos.id}>
                                        {pos.name}
                                    </MenuItem>
                                ))}
                            </Select>
                             {validationErrors.position_id && <FormHelperText>{validationErrors.position_id}</FormHelperText>}
                        </FormControl>
                    </Grid>
                     <Grid item xs={12}>
                         <FormControl fullWidth margin="dense" disabled={loading} error={!!validationErrors.manager_id}>
                            <InputLabel id="manager-select-label">Руководитель</InputLabel>
                            <Select<number | string>
                                labelId="manager-select-label"
                                name="manager_id"
                                value={formData.manager_id ?? ''}
                                label="Руководитель"
                                onChange={handleSelectChange}
                            >
                                <MenuItem value=""><em>Нет руководителя</em></MenuItem>
                                {managers.map((mgr) => (
                                    <MenuItem key={mgr.id} value={mgr.id}>
                                        {mgr.name}
                                    </MenuItem>
                                ))}
                            </Select>
                             {validationErrors.manager_id && <FormHelperText>{validationErrors.manager_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Заметки */}
                    <Grid item xs={12}>
                        <TextField
                            margin="dense" fullWidth name="notes" label="Заметки" multiline rows={3}
                            value={formData.notes ?? ''} onChange={handleChange} disabled={loading}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                    <Button onClick={onCancel} disabled={loading} variant="outlined">
                        Отмена
                    </Button>
                    <Button
                        type="submit" variant="contained" disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {initialData ? 'Сохранить изменения' : 'Добавить сотрудника'}
                    </Button>
                </Box>
            </Box>
        // </LocalizationProvider>
    );
};

export default EmployeeForm;
