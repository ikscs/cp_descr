import { useForm, Controller, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    TextField,
    Button,
    Stack,
    Paper,
    MenuItem,
    Switch,
    FormControlLabel,
    Typography,
    Box,
    Grid,
} from '@mui/material';
import { DynamicSelect } from './DynamicSelect';

// Типы полей формы
type FieldType = 'text' | 'number' | 'select' | 'switch' | 'dynamic-select';

interface BaseFieldConfig {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    defaultValue?: any;
}

interface TextFieldConfig extends BaseFieldConfig {
    type: 'text';
    multiline?: boolean;
    rows?: number;
}

interface NumberFieldConfig extends BaseFieldConfig {
    type: 'number';
    min?: number;
    max?: number;
}

interface SelectFieldConfig extends BaseFieldConfig {
    type: 'select';
    options: { value: string | number; label: string }[];
}

interface SwitchFieldConfig extends BaseFieldConfig {
    type: 'switch';
}

interface DynamicSelectFieldConfig extends BaseFieldConfig {
    type: 'dynamic-select';
    loadOptions: (...args: any[]) => Promise<{ value: string | number; label: string }[]>;
    dependsOn?: string;
}

type FieldConfig =
    | TextFieldConfig
    | NumberFieldConfig
    | SelectFieldConfig
    | SwitchFieldConfig
    | DynamicSelectFieldConfig;

// Типы layout'а
type LayoutType = 'stack' | 'grid' | 'inline' | 'columns';

interface LayoutConfig {
    type: LayoutType;
    // Для grid и columns layout
    columns?: number;
    // Специфичные настройки для каждого поля
    fieldLayouts?: Record<string, {
        colSpan?: number;
        rowSpan?: number;
        width?: string | number;
    }>;
}

interface GenericFormProps {
    title?: string;
    fields: FieldConfig[];
    onSubmit: (data: any) => void;
    defaultValues?: Record<string, any>;
    layout?: LayoutConfig;
    submitButtonText?: string;
    disabled?: boolean;
}

export const GenericForm = ({
    title,
    fields,
    onSubmit,
    defaultValues = {},
    layout = { type: 'stack' },
    submitButtonText = 'Зберегти',
    disabled = false
}: GenericFormProps) => {
    // Создаем схему валидации на основе конфигурации полей
    const schema = z.object(
        fields.reduce((acc, field) => {
            let fieldSchema;

            switch (field.type) {
                case 'text':
                    fieldSchema = field.required
                        ? z.string().min(1, { message: "Це поле обов'язкове" })
                        : z.string().optional();
                    break;
                case 'number':
                    fieldSchema = z.number();
                    if (field.min !== undefined) {
                        fieldSchema = fieldSchema.min(field.min);
                    }
                    if (field.max !== undefined) {
                        fieldSchema = fieldSchema.max(field.max);
                    }
                    if (field.required) {
                        fieldSchema = fieldSchema.nullable().refine((val: any) => val !== null, {
                            message: "Це поле обов'язкове"
                        });
                    } else {
                        fieldSchema = fieldSchema.optional();
                    }
                    break;
                case 'select':
                case 'dynamic-select':
                    fieldSchema = field.required
                        ? z.union([z.string(), z.number()]).refine((val: any) => val !== '', {
                            message: "Це поле обов'язкове"
                        })
                        : z.union([z.string(), z.number()]).optional();
                    break;
                case 'switch':
                    fieldSchema = z.boolean();
                    break;
                default:
                    fieldSchema = z.any();
            }

            return { ...acc, [field.name]: fieldSchema };
        }, {} as Record<string, z.ZodType>)
    );

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FieldValues>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    // Для зависимых селектов
    const watchedValues = watch();

    const renderField = (field: FieldConfig) => {
        switch (field.type) {
            case 'text':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={field.defaultValue || ''}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                fullWidth
                                label={field.label}
                                value={value}
                                onChange={onChange}
                                error={!!errors[field.name]}
                                helperText={errors[field.name]?.message as string}
                                multiline={field.multiline}
                                rows={field.rows}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px', // MD3 style
                                    },
                                }}
                            />
                        )}
                    />
                );

            case 'number':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={field.defaultValue || ''}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                fullWidth
                                type="number"
                                label={field.label}
                                value={value}
                                onChange={(e) => onChange(Number(e.target.value))}
                                error={!!errors[field.name]}
                                helperText={errors[field.name]?.message as string}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px', // MD3 style
                                    },
                                }}
                            />
                        )}
                    />
                );

            case 'select':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={field.defaultValue || ''}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                select
                                fullWidth
                                label={field.label}
                                value={value}
                                onChange={onChange}
                                error={!!errors[field.name]}
                                helperText={errors[field.name]?.message as string}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px', // MD3 style
                                    },
                                }}
                            >
                                {field.options.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />
                );

            case 'switch':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={field.defaultValue || false}
                        render={({ field: { onChange, value } }) => (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={value}
                                        onChange={(e) => onChange(e.target.checked)}
                                    />
                                }
                                label={field.label}
                            />
                        )}
                    />
                );

            case 'dynamic-select':
                return (
                    <DynamicSelect<FieldValues>
                        name={field.name}
                        label={field.label}
                        control={control}
                        loadOptions={
                            field.dependsOn
                                ? () => field.loadOptions(watchedValues[field.dependsOn!])
                                : field.loadOptions
                        }
                        disabled={field.dependsOn ? !watchedValues[field.dependsOn] : undefined}
                        required={field.required}
                        defaultValue={field.defaultValue}
                    />
                );

            default:
                return null;
        }
    };

    const renderFields = () => {
        const fieldElements = fields.map((field) => {
            const fieldLayout = layout.fieldLayouts?.[field.name];
            const element = (
                <Box
                    key={field.name}
                    sx={{
                        width: fieldLayout?.width,
                        gridColumn: fieldLayout?.colSpan ? `span ${fieldLayout.colSpan}` : undefined,
                        gridRow: fieldLayout?.rowSpan ? `span ${fieldLayout.rowSpan}` : undefined,
                    }}
                >
                    {renderField(field)}
                </Box>
            );
            return element;
        });

        switch (layout.type) {
            case 'grid':
                return (
                    <Grid
                        container
                        spacing={3}
                        columns={layout.columns || 12}
                    >
                        {fields.map((field) => (
                            <Grid
                                item
                                key={field.name}
                                xs={layout.fieldLayouts?.[field.name]?.colSpan || 12}
                            >
                                {renderField(field)}
                            </Grid>
                        ))}
                    </Grid>
                );

            case 'inline':
                return (
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            flexWrap: 'wrap',
                            gap: 2,
                            '& > *': {
                                minWidth: (theme) => theme.spacing(30),
                                flexGrow: 1,
                            }
                        }}
                    >
                        {fieldElements}
                    </Stack>
                );

            case 'columns':
                return (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${layout.columns || 2}, 1fr)`,
                            gap: 3,
                        }}
                    >
                        {fieldElements}
                    </Box>
                );

            case 'stack':
            default:
                return (
                    <Stack spacing={3}>
                        {fieldElements}
                    </Stack>
                );
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: '28px', // MD3 style
                bgcolor: 'background.paper',
            }}
        >
            {title && (
                <Typography variant="h6" sx={{ mb: 3 }}>
                    {title}
                </Typography>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ mb: 3 }}>
                    {renderFields()}
                </Box>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        borderRadius: '20px', // MD3 style
                        textTransform: 'none', // MD3 style
                        py: 1.5,
                    }}
                    disabled={disabled}
                >
                    {submitButtonText}
                </Button>
            </form>
        </Paper>
    );
}; 