import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Select,
    MenuItem,
    Chip,
    IconButton,
    FormControl,
    InputLabel,
    Stack,
    Button,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    History as HistoryIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { FormSummary, FormCategory, FormStatus } from '../../types/form';
import { formsApi } from '../../api/forms/formsApi';
import { useNavigate } from 'react-router-dom';

const categoryLabels: Record<FormCategory, string> = {
    customer: 'Клиенты',
    order: 'Заказы',
    product: 'Продукты',
    employee: 'Сотрудники',
    other: 'Прочее'
};

const statusLabels: Record<FormStatus, string> = {
    draft: 'Черновик',
    published: 'Опубликована',
    archived: 'В архиве'
};

const statusColors: Record<FormStatus, string> = {
    draft: '#FFA726',
    published: '#66BB6A',
    archived: '#78909C'
};

export const FormsList: React.FC = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState<FormSummary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<FormCategory | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = useState<FormStatus | 'all'>('all');
    const [loading, setLoading] = useState(false);
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
        loadForms();
    }, []);

    const loadForms = async () => {
        setLoading(true);
        try {
            const formsList = await formsApi.getAllForms();
            setForms(formsList);
        } catch (error) {
            console.error('Failed to load forms:', error);
            setNotification({
                open: true,
                message: 'Не удалось загрузить список форм',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить эту форму?')) {
            try {
                await formsApi.deleteForm(id);
                await loadForms();
                setNotification({
                    open: true,
                    message: 'Форма успешно удалена',
                    severity: 'success'
                });
            } catch (error) {
                console.error('Failed to delete form:', error);
                setNotification({
                    open: true,
                    message: 'Не удалось удалить форму',
                    severity: 'error'
                });
            }
        }
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const filteredForms = forms.filter(form => {
        const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            form.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || form.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

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

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Формы</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/forms/new')}
                >
                    Создать форму
                </Button>
            </Stack>

            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Поиск"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Категория</InputLabel>
                        <Select
                            value={selectedCategory}
                            label="Категория"
                            onChange={(e) => setSelectedCategory(e.target.value as FormCategory | 'all')}
                        >
                            <MenuItem value="all">Все категории</MenuItem>
                            {Object.entries(categoryLabels).map(([value, label]) => (
                                <MenuItem key={value} value={value}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Статус</InputLabel>
                        <Select
                            value={selectedStatus}
                            label="Статус"
                            onChange={(e) => setSelectedStatus(e.target.value as FormStatus | 'all')}
                        >
                            <MenuItem value="all">Все статусы</MenuItem>
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <MenuItem key={value} value={value}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                {loading ? (
                    <Grid item xs={12}>
                        <Typography align="center">Загрузка...</Typography>
                    </Grid>
                ) : filteredForms.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography align="center">Формы не найдены</Typography>
                    </Grid>
                ) : (
                    filteredForms.map((form) => (
                        <Grid item xs={12} md={6} lg={4} key={form.id}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                        <Typography variant="h6" gutterBottom>
                                            {form.name}
                                        </Typography>
                                        <Chip
                                            label={statusLabels[form.status]}
                                            sx={{
                                                bgcolor: statusColors[form.status],
                                                color: 'white'
                                            }}
                                        />
                                    </Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        {categoryLabels[form.category]}
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {form.description}
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        {form.tags && form.tags.length > 0 && form.tags.map((tag) => (
                                            <Chip key={tag} label={tag} size="small" />
                                        ))}
                                    </Box>
                                    <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/forms/${form.id}/history`)}
                                        >
                                            <HistoryIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/forms/${form.id}/edit`)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(form.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
}; 