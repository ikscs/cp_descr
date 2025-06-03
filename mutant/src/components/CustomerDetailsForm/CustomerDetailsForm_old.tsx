import React from 'react';
import { GenericForm } from '../generic/GenericForm';
import { customerDetailsFormConfig } from '../../forms/customerDetailsForm.config';
import { Box, Typography } from '@mui/material';

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
    onError?: (errors: any) => void;
}

export const __CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
    initialData,
    onSubmit,
    onError
}) => {
    const handleSubmit = (data: CustomerData) => {
        try {
            // Здесь можно добавить дополнительную валидацию
            if (!data.email.includes('@')) {
                throw new Error('Invalid email format');
            }

            onSubmit(data);
        } catch (error) {
            if (onError) {
                onError(error);
            }
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Customer Information
            </Typography>
            <GenericForm
                {...customerDetailsFormConfig}
                defaultValues={initialData}
                onSubmit={handleSubmit}
            />
        </Box>
    );
}; 