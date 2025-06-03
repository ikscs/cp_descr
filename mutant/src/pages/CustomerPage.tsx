import React, { useState, useEffect } from 'react';
import { Container, Snackbar, Alert, Button, Stack, AlertColor, CircularProgress } from '@mui/material';
import { CustomerDetailsForm } from '../components/CustomerDetailsForm/CustomerDetailsForm';
import { FormManager } from '../components/FormManager/FormManager';
import { customerDetailsFormConfig } from '../forms/customerDetailsForm.config';
import { FormConfig } from '../types/form';
import { saveFormConfig, loadFormConfig } from '../api/data/formConfigApi';

interface CustomerData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    customerType: string;
    isActive: boolean;
    notes?: string;
}

interface NotificationType {
    message: string;
    type: AlertColor;
}

const FORM_ID = 'customer-details';

export const CustomerPage: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    const [formConfig, setFormConfig] = useState<FormConfig>(customerDetailsFormConfig);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSavedConfig = async () => {
            try {
                const savedConfig = await loadFormConfig(FORM_ID);
                if (savedConfig) {
                    setFormConfig(savedConfig);
                }
            } catch (error) {
                setNotification({
                    message: 'Error loading form configuration',
                    type: 'error'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadSavedConfig();
    }, []);

    const initialData: Partial<CustomerData> = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        customerType: 'individual',
        isActive: true
    };

    const handleSubmit = async (data: CustomerData) => {
        try {
            // Здесь будет отправка данных на сервер
            console.log('Submitting data:', data);

            // Имитация API запроса
            await new Promise(resolve => setTimeout(resolve, 1000));

            setNotification({
                message: 'Customer details saved successfully!',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: 'Error saving customer details',
                type: 'error'
            });
        }
    };

    const handleError = (error: Error) => {
        setNotification({
            message: error.message || 'An error occurred',
            type: 'error'
        });
    };

    const handleFormConfigSave = async (config: FormConfig) => {
        try {
            await saveFormConfig(FORM_ID, config);
            setFormConfig(config);
            setIsEditing(false);
            setNotification({
                message: 'Form configuration saved successfully!',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: 'Error saving form configuration',
                type: 'error'
            });
        }
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={2} direction="row" sx={{ mb: 4 }}>
                <Button
                    variant="outlined"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'View Form' : 'Edit Form'}
                </Button>
            </Stack>

            {isEditing ? (
                <FormManager
                    initialConfig={formConfig}
                    onSave={handleFormConfigSave}
                />
            ) : (
                <CustomerDetailsForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    onError={handleError}
                    formConfig={formConfig}
                />
            )}

            <Snackbar
                open={!!notification}
                autoHideDuration={6000}
                onClose={() => setNotification(null)}
            >
                <Alert
                    onClose={() => setNotification(null)}
                    severity={notification?.type}
                    sx={{ width: '100%' }}
                >
                    {notification?.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}; 