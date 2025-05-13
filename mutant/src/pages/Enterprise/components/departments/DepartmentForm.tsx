import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import { type Department } from '../../types/models';
import * as api from '../../services/api';

interface DepartmentFormProps {
    initialData: Department | null; // Данные для редактирования или null для добавления
    onSave: (message: string) => void; // Колбэк после успешного сохранения
    onCancel: () => void; // Колбэк для отмены
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ initialData, onSave, onCancel }) => {
    // Используем Partial<Department> для формы, т.к. ID не нужен при создании
    const [formData, setFormData] = useState<Partial<Omit<Department, 'department_id'>>>({
        department_name: '',
        description: '',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});


    useEffect(() => {
        // Заполняем форму, если переданы initialData (режим редактирования)
        if (initialData) {
            setFormData({
                department_name: initialData.department_name || '',
                description: initialData.description || '',
            });
        } else {
            // Сбрасываем форму для добавления новой записи
             setFormData({
                department_name: '',
                description: '',
            });
        }
        // Сбрасываем ошибки при смене initialData
        setError(null);
        setValidationErrors({});
    }, [initialData]);

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};
        if (!formData.department_name?.trim()) {
            errors.department_name = 'Название подразделения обязательно для заполнения.';
        }
        // Можно добавить другие правила валидации
        setValidationErrors(errors);
        return Object.keys(errors).length === 0; // Возвращает true, если ошибок нет
    };


    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Очищаем ошибку валидации для текущего поля при изменении
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null); // Сбрасываем общую ошибку

        if (!validateForm()) {
            return; // Прерываем отправку, если валидация не прошла
        }

        setLoading(true);

        try {
            let message = '';
            if (initialData?.department_id) {
                // Режим обновления
                await api.updateDepartment({
                    department_id: initialData.department_id, // Добавляем ID
                    ...formData, // Берем данные из формы
                } as Department); // Утверждаем тип как Department
                message = 'Подразделение успешно обновлено';
            } else {
                // Режим добавления
                await api.addDepartment(formData as Omit<Department, 'department_id'>);
                message = 'Подразделение успешно добавлено';
            }
            onSave(message); // Вызываем колбэк родителя с сообщением
        } catch (err) {
            console.error("Failed to save department:", err);
            setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {/* Отображение общей ошибки API */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
                margin="normal"
                required
                fullWidth
                id="department_name"
                label="Название подразделения"
                name="department_name"
                value={formData.department_name}
                onChange={handleChange}
                autoFocus={!initialData} // Фокус на первом поле при добавлении
                disabled={loading}
                error={!!validationErrors.department_name} // Показываем ошибку валидации
                helperText={validationErrors.department_name} // Текст ошибки валидации
            />
            <TextField
                margin="normal"
                fullWidth
                id="description"
                label="Описание"
                name="description"
                value={formData.description ?? ''} // Убедимся, что value не undefined
                onChange={handleChange}
                multiline
                rows={4}
                disabled={loading}
                // Можно добавить валидацию для описания, если нужно
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                <Button onClick={onCancel} disabled={loading} variant="outlined">
                    Отмена
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {initialData ? 'Сохранить изменения' : 'Добавить подразделение'}
                </Button>
            </Box>
        </Box>
    );
};

export default DepartmentForm;
