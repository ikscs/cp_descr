import { FormConfig } from '../../types/form';
import { formsApi } from '../forms/formsApi';

// В реальном приложении это будет API-запрос к серверу
export const saveFormConfig = async (formId: string, config: FormConfig): Promise<void> => {
    try {
        await formsApi.updateFormConfig(formId, config);
        console.log(`Form configuration saved for form ${formId}:`, config);
    } catch (error) {
        console.error('Error saving form configuration:', error);
        throw error;
    }
};

export const loadFormConfig = async (formId: string): Promise<FormConfig | null> => {
    try {
        const config = await formsApi.getFormConfig(formId);
        return config;
    } catch (error) {
        console.error('Error loading form configuration:', error);
        throw error;
    }
}; 