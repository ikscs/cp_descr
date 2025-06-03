import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { FormManager } from '../components/FormManager/FormManager';
import { FormConfig } from '../types/form';
import { formsApi } from '../api/forms/formsApi';
import { useParams } from 'react-router-dom';

export const FormEditorPage: React.FC = () => {
    const { formId } = useParams<{ formId: string }>();
    const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFormConfig = async () => {
            if (!formId) {
                setLoading(false);
                return;
            }

            try {
                const config = await formsApi.getFormConfig(formId);
                setFormConfig(config);
            } catch (err) {
                setError('Ошибка при загрузке конфигурации формы');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadFormConfig();
    }, [formId]);

    const handleSave = async (config: FormConfig) => {
        if (!formId) return;

        try {
            await formsApi.updateFormConfig(formId, config);
            console.log('Form configuration saved:', config);
        } catch (err) {
            console.error('Error saving form configuration:', err);
            // Здесь можно добавить отображение ошибки пользователю
        }
    };

    if (loading) {
        return <Container maxWidth="lg" sx={{ py: 4 }}>Loading...</Container>;
    }

    if (error) {
        return <Container maxWidth="lg" sx={{ py: 4 }}>{error}</Container>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <FormManager
                initialConfig={formConfig || undefined}
                onSave={handleSave}
            />
        </Container>
    );
}; 