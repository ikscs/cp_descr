import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import { type Position } from '../../types/models'; // Импортируем Position
import * as api from '../../services/api'; // Используем тот же API сервис

interface PositionFormProps {
    initialData: Position | null; // Данные для редактирования или null для добавления
    onSave: (message: string) => void; // Колбэк после успешного сохранения
    onCancel: () => void; // Колбэк для отмены
}

const PositionForm: React.FC<PositionFormProps> = ({ initialData, onSave, onCancel }) => {
    // State для данных формы должности
    const [formData, setFormData] = useState<Partial<Omit<Position, 'position_id'>>>({
        position_name: '',
        description: '',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (initialData) {
            // Заполняем форму данными редактируемой должности
            setFormData({
                position_name: initialData.position_name || '',
                description: initialData.description || '',
            });
        } else {
            // Сбрасываем форму для добавления
             setFormData({
                position_name: '',
                description: '',
            });
        }
        setError(null);
        setValidationErrors({});
    }, [initialData]);

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};
        // Валидация названия должности
        if (!formData.position_name?.trim()) {
            errors.position_name = 'Название должности обязательно для заполнения.';
        }
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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let message = '';
            if (initialData?.position_id) {
                // Режим обновления - вызываем API для обновления должности
                await api.updatePosition({
                    position_id: initialData.position_id,
                    ...formData,
                } as Position);
                message = 'Должность успешно обновлена';
            } else {
                // Режим добавления - вызываем API для добавления должности
                await api.addPosition(formData as Omit<Position, 'position_id'>);
                message = 'Должность успешно добавлена';
            }
            onSave(message); // Вызываем колбэк родителя
        } catch (err) {
            console.error("Failed to save position:", err);
            setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Поле для названия должности */}
            <TextField
                margin="normal"
                required
                fullWidth
                id="position_name"
                label="Название должности"
                name="position_name"
                value={formData.position_name}
                onChange={handleChange}
                autoFocus={!initialData}
                disabled={loading}
                error={!!validationErrors.position_name}
                helperText={validationErrors.position_name}
            />
            {/* Поле для описания должности */}
            <TextField
                margin="normal"
                fullWidth
                id="description"
                label="Описание"
                name="description"
                value={formData.description ?? ''}
                onChange={handleChange}
                multiline
                rows={4}
                disabled={loading}
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
                    {initialData ? 'Сохранить изменения' : 'Добавить должность'}
                </Button>
            </Box>
        </Box>
    );
};

export default PositionForm;
