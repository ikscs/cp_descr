import React from 'react';
import { GenericForm } from '../generic/GenericForm';
import { Box, Typography } from '@mui/material';
import { FormConfig } from '../../types/form';

interface CustomerData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    customerType: string;
    isActive: boolean;
    notes?: string;
}

interface CustomerDetailsFormProps {
    initialData?: Partial<CustomerData>;
    onSubmit: (data: CustomerData) => void;
    onError?: (error: Error) => void;
    formConfig: FormConfig;
}

export const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
    initialData,
    onSubmit,
    onError,
    formConfig
}) => {
    const handleSubmit = (data: CustomerData) => {
        try {
            // Дополнительная валидация
            if (!data.email.includes('@')) {
                throw new Error('Invalid email format');
            }

            onSubmit(data);
        } catch (error) {
            if (onError && error instanceof Error) {
                onError(error);
            }
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                {formConfig.title || 'Customer Information'}
            </Typography>
            <GenericForm
                {...formConfig}
                defaultValues={initialData}
                onSubmit={handleSubmit}
            />
        </Box>
    );
}; 