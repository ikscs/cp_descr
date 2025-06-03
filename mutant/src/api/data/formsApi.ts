import {
    FormData,
    FormMetadata,
    FormConfig,
    FormSummary,
    // FormStatus,
    // FormCategory
} from '../../types/form';
import { formsApi } from '../forms/formsApi';

// Вспомогательные функции
export const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// API для работы с формами
export const getForms = async (): Promise<FormSummary[]> => {
    return await formsApi.getAllForms();
};

export const getFormById = async (formId: string): Promise<FormMetadata> => {
    return await formsApi.getFormMetadata(formId);
};

export const getFormConfig = async (formId: string): Promise<FormConfig> => {
    return await formsApi.getFormConfig(formId);
};

export const createForm = async (metadata: FormMetadata, config: FormConfig): Promise<FormSummary> => {
    return await formsApi.createForm(metadata, config);
};

export const updateFormMetadata = async (formId: string, metadata: FormMetadata): Promise<void> => {
    await formsApi.updateFormMetadata(formId, metadata);
};

export const updateFormConfig = async (formId: string, config: FormConfig): Promise<void> => {
    await formsApi.updateFormConfig(formId, config);
};

export const deleteForm = async (formId: string): Promise<void> => {
    await formsApi.deleteForm(formId);
};

export const getFormData = async (formId: string): Promise<FormData[]> => {
    return await formsApi.getFormData(formId);
};

export const saveFormData = async (formId: string, data: FormData): Promise<void> => {
    await formsApi.saveFormData(formId, data);
};

export const updateFormData = async (formId: string, dataId: string, data: FormData): Promise<void> => {
    await formsApi.updateFormData(formId, dataId, data);
};

export const deleteFormData = async (formId: string, dataId: string): Promise<void> => {
    await formsApi.deleteFormData(formId, dataId);
}; 