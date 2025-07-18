import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Typography, Paper } from '@mui/material';
import { getCustomer, postCustomer, putCustomer } from '../../api/data/customerTools';
import { useCustomer } from '../../context/CustomerContext';
import { GenericSimpleForm } from '../generic/GenericSimpleForm'; // Import the new wrapper
import { GenericFormRenderer } from '../generic/GenericFormRenderer';
import { updateUserData } from '../../api/updateUserData';
import { apiKey, tenantId } from '../../globals_VITE';
import { useUserfront } from '@userfront/react';

// Define the data structure for the customer form
interface CustomerFormData {
    customer_id: number;
    legal_name: string;
    address: string;
    country: string;
    city: string;
}

const newCustomer: CustomerFormData = {
    customer_id: 0, // Assuming 0 is used for new customers
    legal_name: '',
    address: '',
    country: '',
    city: '',
};

export const CustomerDetailsForm = () => {
    const [initialData, setInitialData] = useState<CustomerFormData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const { customerData } = useCustomer();

    console.log(' isSubmitting:', isSubmitting);

    // Define form fields configuration
    // The type for 'fields' will be inferred by TypeScript based on the objects.
    // It's assumed GenericForm can handle these field type definitions.
    const fields = [
        {
            type: 'number' as const,
            name: 'customer_id',
            label: 'ID Клієнта',
            disabled: true, // Customer ID is usually not directly editable
        },
        {
            type: 'text' as const,
            name: 'legal_name',
            label: 'Юридична назвааа',
            required: true,
        },
        {
            type: 'text' as const,
            name: 'address',
            label: 'Адреса',
            multiline: true,
            rows: 3,
        },
        {
            type: 'text' as const,
            name: 'country',
            label: 'Країна',
        },
        {
            type: 'text' as const,
            name: 'city',
            label: 'Місто',
        },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setSubmitMessage(null);
            try {
                // In a real app, customerId might come from props, context, or URL params
                const data = await getCustomer(customerData?.customer || 0);
                if (data && data.length > 0) {
                    setInitialData(data[0]);
                } else {
                    setError(`Клієнта з ID ${customerData?.customer || 0} не знайдено.`);
                }
            } catch (err) {
                console.error('Failed to fetch customer data:', err);
                setError('Не вдалося завантажити дані клієнта. Будь ласка, спробуйте пізніше.');
            } finally {
                setIsLoading(false);
            }
        };
        if (customerData?.customer) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [customerData?.customer]); // Fetch data on component mount or when customerId changes

    const handleSubmit = async (formData: CustomerFormData) => {
        if (!initialData?.customer_id) {
            // setSubmitMessage({ type: 'error', text: 'Помилка: ID клієнта не визначено для оновлення.' });
            // 2025-07-17
            const success = await postCustomer(formData);
            if (success) {
                setSubmitMessage({ type: 'success', text: 'Дані клієнта успішно оновлено!' });
                // todo: extract new customer_id
                setInitialData(prevData => ({ ...prevData, ...formData }));
            } else {
                setSubmitMessage({ type: 'error', text: 'Не вдалося оновити дані клієнта.' });
                return;
            }

            if (initialData) {
                const user = useUserfront();
                await updateUserData(tenantId, apiKey, user.user, initialData.customer_id);
            }
            return;
        }
        setIsSubmitting(true);
        setSubmitMessage(null);
        // The isSubmitting state for GenericSimpleForm's button text will be handled internally by it.
        // This setIsSubmitting is for the overall page state if needed elsewhere.
        try {
            const dataToSubmit = {
                ...formData,
                customer_id: initialData.customer_id // Ensure customer_id is included
            };
            const success = await putCustomer(dataToSubmit);
            if (success) {
                setSubmitMessage({ type: 'success', text: 'Дані клієнта успішно оновлено!' });
                // Update initialData to reflect the saved state. This will also pass down to GenericSimpleForm.
                setInitialData(prevData => ({ ...prevData, ...dataToSubmit }));
            } else {
                setSubmitMessage({ type: 'error', text: 'Не вдалося оновити дані клієнта.' });
            }
        } catch (err) {
            console.error('Failed to submit customer data:', err);
            setSubmitMessage({ type: 'error', text: 'Помилка під час відправлення даних. Перевірте консоль.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ p: 3, minHeight: '200px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Завантаження даних клієнта...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    if (false) // 2025-07-17 trying to register new customer
        if (!initialData) {
            // This state should ideally be caught by the error above if API returns null
            return <Alert severity="warning" sx={{ m: 2 }}>Дані клієнта недоступні.</Alert>;
        }

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', m: 1 }}>
            <GenericSimpleForm<CustomerFormData>
                FormRenderer={GenericFormRenderer}
                title="Редагування деталей клієнта"
                fields={fields}
                onSubmit={handleSubmit}
                initialValues={initialData??newCustomer} // Use initialData or a newCustomer object
                layout={{ type: 'stack' }} // Basic stack layout
                // Optional: pass custom text if needed
                // savingButtonText="Збереження деталей..."
                // saveButtonText="Зберегти деталі"
            />
            {submitMessage && (
                <Alert severity={submitMessage.type} sx={{ mt: 2 }}>
                    {submitMessage.text}
                </Alert>
            )}
        </Paper>
    );
};