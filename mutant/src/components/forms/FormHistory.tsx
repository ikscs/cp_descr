import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Stack,
    // Divider,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import {
    History as HistoryIcon,
    Restore as RestoreIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { /*FormData,*/ FormVersion, FormMetadata, FormConfig } from '../../types/form';
import { formsApi } from '../../api/forms/formsApi';

interface FormHistoryData {
    metadata: FormMetadata;
    config: FormConfig;
    versions: FormVersion[];
}

export const FormHistory: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormHistoryData | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<FormVersion | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        if (id) {
            loadFormData();
        }
    }, [id]);

    const loadFormData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const [metadata, config] = await Promise.all([
                formsApi.getFormMetadata(id),
                formsApi.getFormConfig(id)
            ]);

            setFormData({
                metadata,
                config,
                versions: metadata.versions
            });
        } catch (error) {
            console.error('Failed to load form data:', error);
            setNotification({
                open: true,
                message: 'Не удалось загрузить данные формы',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (version: FormVersion) => {
        if (!formData || !id) return;

        if (window.confirm('Вы уверены, что хотите восстановить эту версию формы?')) {
            try {
                await formsApi.updateFormConfig(id, version.config);
                await loadFormData();
                setNotification({
                    open: true,
                    message: 'Версия формы успешно восстановлена',
                    severity: 'success'
                });
            } catch (error) {
                console.error('Failed to restore version:', error);
                setNotification({
                    open: true,
                    message: 'Не удалось восстановить версию формы',
                    severity: 'error'
                });
            }
        }
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (!formData) {
        return (
            <Box p={3}>
                <Typography color="error">
                    Форма не найдена или произошла ошибка при загрузке
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/forms')}
                    sx={{ mt: 2 }}
                >
                    Вернуться к списку форм
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
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

            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/forms')}
                >
                    Назад к списку
                </Button>
                <Typography variant="h4">
                    История изменений: {formData.metadata.name}
                </Typography>
            </Stack>

            <Box display="flex" gap={3}>
                <Stack flex={1} spacing={2}>
                    {formData.metadata.versions.slice().reverse().map((version, index) => (
                        <Paper
                            key={version.version}
                            sx={{
                                p: 2,
                                cursor: 'pointer',
                                bgcolor: selectedVersion?.version === version.version
                                    ? 'action.selected'
                                    : 'background.paper'
                            }}
                            onClick={() => setSelectedVersion(version)}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <HistoryIcon color={index === 0 ? "primary" : "action"} />
                                <Box flex={1}>
                                    <Typography variant="h6">
                                        Версия {version.version}
                                    </Typography>
                                    <Typography color="text.secondary" variant="body2">
                                        {new Date(version.createdAt).toLocaleString()} • {version.createdBy}
                                    </Typography>
                                    {version.comment && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {version.comment}
                                        </Typography>
                                    )}
                                </Box>
                                {index !== 0 && (
                                    <Button
                                        startIcon={<RestoreIcon />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRestore(version);
                                        }}
                                    >
                                        Восстановить
                                    </Button>
                                )}
                            </Stack>
                        </Paper>
                    ))}
                </Stack>

                {selectedVersion && (
                    <Box flex={1}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Конфигурация версии {selectedVersion.version}
                            </Typography>
                            <pre style={{
                                overflow: 'auto',
                                backgroundColor: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '4px'
                            }}>
                                {JSON.stringify(selectedVersion.config, null, 2)}
                            </pre>
                        </Paper>
                    </Box>
                )}
            </Box>
        </Box>
    );
}; 