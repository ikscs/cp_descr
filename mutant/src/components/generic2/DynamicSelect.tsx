import { useEffect, useState } from 'react';
import { Controller, Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { MenuItem, TextField } from '@mui/material';

export interface Option {
    value: string | number;
    label: string;
}

interface DynamicSelectProps<T extends FieldValues> {
    name: Path<T>;
    label: string;
    control: Control<T>;
    loadOptions: () => Promise<Option[]>;
    required?: boolean;
    disabled?: boolean;
    defaultValue?: PathValue<T, Path<T>>;
}

export const DynamicSelect = <T extends FieldValues>({
    name,
    label,
    control,
    loadOptions,
    required = false,
    disabled = false,
    defaultValue = '' as PathValue<T, Path<T>>,
}: DynamicSelectProps<T>) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await loadOptions();
                setOptions(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load options');
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [loadOptions]);

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            rules={{ required: required ? 'This field is required' : false }}
            render={({ field, fieldState: { error: fieldError } }) => (
                <TextField
                    {...field}
                    select
                    fullWidth
                    label={label}
                    disabled={disabled || loading}
                    error={!!fieldError || !!error}
                    helperText={fieldError?.message || error}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '16px', // MD3 style
                            // '&.Mui-disabled': { // Если нужно изменить фон всего поля
                            //     backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            // },
                            '& .MuiOutlinedInput-input.Mui-disabled': { // Стили для текста внутри поля
                                color: 'rgba(0, 0, 0, 0.6)',
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)', // Для совместимости с Webkit
                            },
                        },
                        '& .MuiInputLabel-root.Mui-disabled': { // Стили для метки (label)
                            color: 'rgba(0, 0, 0, 0.6)',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            // borderColor: 'rgba(0, 0, 0, 0.23)', // Можно оставить или настроить, если нужно
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.87)',
                        },
                    }}
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            )}
        />
    );
}; 