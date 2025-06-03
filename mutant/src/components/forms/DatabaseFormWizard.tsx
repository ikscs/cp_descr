import React, { useState } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Paper,
    Stack,
    Alert,
    Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FormCategory, FormConfig, FieldConfig, FormStatus } from '../../types/form';
import { formsApi } from '../../api/forms/formsApi';

// В реальном приложении это будет получаться с бэкенда
interface DatabaseColumn {
    name: string;
    type: string;
    nullable: boolean;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    referencedTable?: string;
}

interface DatabaseTable {
    name: string;
    columns: DatabaseColumn[];
}

// Моковые данные для демонстрации
const MOCK_TABLES: DatabaseTable[] = [
    {
        name: 'customers',
        columns: [
            { name: 'id', type: 'int', nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: 'name', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'email', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'phone', type: 'varchar', nullable: true, isPrimaryKey: false, isForeignKey: false },
            { name: 'status', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false }
        ]
    },
    {
        name: 'orders',
        columns: [
            { name: 'id', type: 'int', nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: 'customer_id', type: 'int', nullable: false, isPrimaryKey: false, isForeignKey: true, referencedTable: 'customers' },
            { name: 'order_date', type: 'datetime', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'total_amount', type: 'decimal', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'status', type: 'varchar', nullable: false, isPrimaryKey: false, isForeignKey: false }
        ]
    }
];

const steps = ['Выбор таблицы', 'Настройка полей', 'Настройка формы'];

const mapDbTypeToFieldConfig = (column: DatabaseColumn): FieldConfig => {
    const baseField = {
        name: column.name,
        label: column.name.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        required: !column.nullable
    };

    if (column.isForeignKey && column.referencedTable) {
        return {
            ...baseField,
            type: 'dynamic-select',
            loadOptions: async () => {
                // В реальном приложении здесь будет запрос к API
                return [
                    { value: '1', label: 'Option 1' },
                    { value: '2', label: 'Option 2' }
                ];
            }
        };
    }

    switch (column.type.toLowerCase()) {
        case 'int':
        case 'decimal':
        case 'float':
            return {
                ...baseField,
                type: 'number'
            };
        case 'varchar':
        case 'text':
            if (column.name.toLowerCase().includes('status')) {
                return {
                    ...baseField,
                    type: 'select',
                    options: [
                        { value: 'active', label: 'Активный' },
                        { value: 'inactive', label: 'Неактивный' }
                    ]
                };
            }
            return {
                ...baseField,
                type: 'text',
                multiline: column.type.toLowerCase() === 'text'
            };
        case 'datetime':
            return {
                ...baseField,
                type: 'text' // В будущем можно добавить тип 'datetime'
            };
        default:
            return {
                ...baseField,
                type: 'text'
            };
    }
};

export const DatabaseFormWizard: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [formMetadata, setFormMetadata] = useState({
        name: '',
        description: '',
        category: 'other' as FormCategory
    });
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleTableSelect = (tableName: string) => {
        const table = MOCK_TABLES.find(t => t.name === tableName);
        if (table) {
            setSelectedTable(table);
            // По умолчанию выбираем все поля, кроме ID
            setSelectedFields(table.columns.filter(c => !c.isPrimaryKey).map(c => c.name));
        }
    };

    const handleFieldToggle = (fieldName: string) => {
        setSelectedFields(prev => {
            if (prev.includes(fieldName)) {
                return prev.filter(f => f !== fieldName);
            } else {
                return [...prev, fieldName];
            }
        });
    };

    const generateFormConfig = (): FormConfig => {
        if (!selectedTable) throw new Error('No table selected');

        const fields: FieldConfig[] = selectedFields.map(fieldName => {
            const column = selectedTable.columns.find(c => c.name === fieldName)!;
            return mapDbTypeToFieldConfig(column);
        });

        return {
            title: formMetadata.name,
            fields,
            layout: {
                type: 'stack'
            }
        };
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const showNotification = (message: string, severity: 'success' | 'error') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleFinish = async () => {
        try {
            const formConfig = generateFormConfig();
            const metadata = {
                id: '', // ID будет присвоен на сервере
                name: formMetadata.name,
                description: formMetadata.description,
                category: formMetadata.category,
                status: 'draft' as FormStatus,
                tags: [],
                currentVersion: 1,
                versions: [],
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                updatedAt: new Date().toISOString(),
                updatedBy: 'system'
            };

            const result = await formsApi.createForm(metadata, formConfig);
            console.log(result);
            showNotification('Форма успешно создана', 'success');
            navigate('/forms');
        } catch (error) {
            console.error('Failed to create form:', error);
            showNotification('Не удалось создать форму', 'error');
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <FormControl fullWidth>
                        <InputLabel>Таблица</InputLabel>
                        <Select
                            value={selectedTable?.name || ''}
                            label="Таблица"
                            onChange={(e) => handleTableSelect(e.target.value)}
                        >
                            {MOCK_TABLES.map(table => (
                                <MenuItem key={table.name} value={table.name}>
                                    {table.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            case 1:
                return selectedTable && (
                    <Stack spacing={2}>
                        {selectedTable.columns.filter(c => !c.isPrimaryKey).map(column => (
                            <FormControlLabel
                                key={column.name}
                                control={
                                    <Checkbox
                                        checked={selectedFields.includes(column.name)}
                                        onChange={() => handleFieldToggle(column.name)}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography>
                                            {column.name}
                                            {column.isForeignKey && ' (Foreign Key)'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {column.type} {column.nullable ? '(nullable)' : '(required)'}
                                        </Typography>
                                    </Box>
                                }
                            />
                        ))}
                    </Stack>
                );

            case 2:
                return (
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Название формы"
                            value={formMetadata.name}
                            onChange={(e) => setFormMetadata(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            label="Описание"
                            multiline
                            rows={3}
                            value={formMetadata.description}
                            onChange={(e) => setFormMetadata(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Категория</InputLabel>
                            <Select
                                value={formMetadata.category}
                                label="Категория"
                                onChange={(e) => setFormMetadata(prev => ({
                                    ...prev,
                                    category: e.target.value as FormCategory
                                }))}
                            >
                                <MenuItem value="customer">Клиенты</MenuItem>
                                <MenuItem value="order">Заказы</MenuItem>
                                <MenuItem value="product">Продукты</MenuItem>
                                <MenuItem value="employee">Сотрудники</MenuItem>
                                <MenuItem value="other">Прочее</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                );

            default:
                return null;
        }
    };

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

            <Typography variant="h4" gutterBottom>
                Создание формы из таблицы
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Paper sx={{ p: 3, mb: 3 }}>
                {renderStepContent(activeStep)}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                >
                    Назад
                </Button>
                <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
                    disabled={
                        (activeStep === 0 && !selectedTable) ||
                        (activeStep === 1 && selectedFields.length === 0) ||
                        (activeStep === 2 && !formMetadata.name)
                    }
                >
                    {activeStep === steps.length - 1 ? 'Создать форму' : 'Далее'}
                </Button>
            </Box>
        </Box>
    );
}; 