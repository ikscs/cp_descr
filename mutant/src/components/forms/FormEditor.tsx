import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Snackbar,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper
} from '@mui/material';
import { FormConfig, FormMetadata, FormCategory, /*FormStatus*/ } from '../../types/form';
import { formsApi } from '../../api/forms/formsApi';
import { FormManager } from '../FormManager/FormManager';

const categoryLabels: Record<FormCategory, string> = {
    customer: 'Клиенты',
    order: 'Заказы',
    product: 'Продукты',
    employee: 'Сотрудники',
    other: 'Прочее'
};

export const FormEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
    const [formMetadata, setFormMetadata] = useState<FormMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'info'
    });
    console.log(isSaving);
    useEffect(() => {
        loadForm();
    }, [id]);

    const loadForm = async () => {
        if (!id) {
            // Создание новой формы
            setFormConfig({
                title: 'Новая форма',
                layout: { type: 'stack' },
                fields: []
            });
            setFormMetadata({
                id: '',
                name: '',
                description: '',
                category: 'other',
                tags: [],
                status: 'draft',
                currentVersion: 1,
                versions: [],
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                updatedAt: new Date().toISOString(),
                updatedBy: 'system'
            });
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const [metadata, config] = await Promise.all([
                formsApi.getFormMetadata(id),
                formsApi.getFormConfig(id)
            ]);
            setFormMetadata(metadata);
            setFormConfig(config);
        } catch (err) {
            console.error('Failed to load form:', err);
            showNotification('Не удалось загрузить форму', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handleSave = async (config: FormConfig) => {
        if (!formMetadata) return;

        setIsSaving(true);
        try {
            if (id) {
                // Обновление существующей формы
                await Promise.all([
                    formsApi.updateFormMetadata(id, formMetadata),
                    formsApi.updateFormConfig(id, config)
                ]);
                showNotification('Форма успешно обновлена', 'success');
            } else {
                // Создание новой формы
                const result = await formsApi.createForm(formMetadata, config);
                showNotification('Форма успешно создана', 'success');
                navigate(`/forms/${result.id}/edit`);
            }
        } catch (err) {
            console.error('Failed to save form:', err);
            showNotification('Не удалось сохранить форму', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleMetadataChange = (field: keyof FormMetadata, value: any) => {
        if (!formMetadata) return;

        setFormMetadata(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [field]: value,
                updatedAt: new Date().toISOString()
            };
        });
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!formConfig || !formMetadata) {
        return (
            <Box p={3}>
                <Alert severity="error">Не удалось загрузить данные формы</Alert>
                <Button
                    sx={{ mt: 2 }}
                    variant="contained"
                    onClick={() => navigate('/forms')}
                >
                    Вернуться к списку форм
                </Button>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    {id ? 'Редактирование формы' : 'Создание формы'}
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/forms')}
                >
                    Отмена
                </Button>
            </Stack>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Основные параметры
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Название формы"
                        value={formMetadata.name}
                        onChange={(e) => handleMetadataChange('name', e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Описание"
                        value={formMetadata.description}
                        onChange={(e) => handleMetadataChange('description', e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Категория</InputLabel>
                        <Select
                            value={formMetadata.category}
                            label="Категория"
                            onChange={(e) => handleMetadataChange('category', e.target.value)}
                        >
                            {Object.entries(categoryLabels).map(([value, label]) => (
                                <MenuItem key={value} value={value}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {id && (
                        <FormControl fullWidth>
                            <InputLabel>Статус</InputLabel>
                            <Select
                                value={formMetadata.status}
                                label="Статус"
                                onChange={(e) => handleMetadataChange('status', e.target.value)}
                            >
                                <MenuItem value="draft">Черновик</MenuItem>
                                <MenuItem value="published">Опубликована</MenuItem>
                                <MenuItem value="archived">В архиве</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </Stack>
            </Paper>

            <FormManager
                initialConfig={formConfig}
                onSave={handleSave}
            />
        </Box>
    );
}; 