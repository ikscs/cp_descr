import axios from 'axios';
import { FormData, FormMetadata, FormConfig, FormSummary, FormCategory, FormStatus } from '../../types/form';
import { fetchData, getBackend, IFetchResponse, postData } from '../data/fetchData';
// import { report } from 'node:process';

const API_BASE_URL = 'http://localhost:3000/api'; // Замените на ваш базовый URL API

const q4 = (s: string) => s.replace(/'/g, "''''")

// API для работы с формами
export const formsApi = {
    // Получение списка всех форм
    getAllForms: async (): Promise<FormSummary[]> => {
        // const response = await axios.get(`${API_BASE_URL}/forms`);
        // return response.data;
        const response: IFetchResponse = (await fetchData({
            from: 'public.form',
            fields: '*',
        }));
        return response.map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            tags: row.tags,
            status: row.status,
            currentVersion: row.current_version,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
        }));
    },

    // Получение метаданных формы по ID
    getFormMetadata: async (formId: string): Promise<FormMetadata> => {
        // const response = await axios.get(`${API_BASE_URL}/forms/${formId}/metadata`);
        // return response.data;
        const response: IFetchResponse = (await fetchData({
            from: 'public.form',
            fields: '*',
            where: {
                id: formId,
            },
        }));

        if (!response || response.length === 0) {
            throw new Error(`Form with id ${formId} not found`);
        }

        const row = response[0];
        return {
            id: row.id as string,
            name: row.name as string,
            description: row.description as string,
            category: row.category as FormCategory,
            tags: row.tags as string[],
            status: row.status as FormStatus,
            currentVersion: row.current_version as number,
            versions: [], // This should be fetched separately if needed
            createdAt: row.created_at as string,
            createdBy: row.created_by as string,
            updatedAt: row.updated_at as string,
            updatedBy: row.updated_by as string,
        };
    },

    // Получение конфигурации формы по ID
    getFormConfig: async (formId: string): Promise<FormConfig> => {
        // const response = await axios.get(`${API_BASE_URL}/forms/${formId}/config`);
        // return response.data;
        const response: IFetchResponse = (await fetchData({
            from: 'public.form_version',
            fields: 'config',
            where: {
                form_id: formId,
            },
            order: 'version desc'
        }));

        if (!response || response.length === 0) {
            throw new Error(`Configuration for form ${formId} not found`);
        }

        return response[0].config as FormConfig;
    },

    // Создание новой формы
    createForm: async (metadata: FormMetadata, config: FormConfig): Promise<FormSummary> => {
        const response = await axios.post(`${API_BASE_URL}/forms`, {
            metadata,
            config
        });
        return response.data;
    },

    // Обновление метаданных формы
    updateFormMetadata: async (formId: string, metadata: FormMetadata): Promise<void> => {
        // await axios.put(`${API_BASE_URL}/forms/${formId}/metadata`, metadata);
        // return response.data;
        const updateQuery =
            `UPDATE public.form SET 
name = ''${metadata.name}'',
description = ''${metadata.description}'',
category = ''${metadata.category}'',
status = ''${metadata.status}'',
current_version = ${metadata.currentVersion},
updated_at = ''${metadata.updatedAt}'',
updated_by = ''${metadata.updatedBy}''
WHERE id = ''${formId}''`;
        const result = await postData({
            backend_point: getBackend().backend_point_query,
            query: updateQuery,
        })
        if (result.data == 0) {
            throw new Error(`Failed to update form metadata for form ${formId}`);
        }
    },

    // Обновление конфигурации формы
    updateFormConfig: async (formId: string, config: FormConfig): Promise<void> => {
        // await axios.put(`${API_BASE_URL}/forms/${formId}/config`, config);
        const sConfig = JSON.stringify(config);
        const updateQuery =
            `UPDATE public.form_version SET 
config = ''${q4(sConfig)}''
-- updated_at = ''${new Date().toISOString()}''
WHERE id = ''${formId}''`;
        const result = await postData({
            backend_point: getBackend().backend_point_query,
            query: updateQuery,
        })
        if (result.data == 0) {
            throw new Error(`Failed to update form metadata for form ${formId}`);
        }
    },

    // Удаление формы
    deleteForm: async (formId: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/forms/${formId}`);
    },

    // Получение данных формы
    getFormData: async (formId: string): Promise<FormData[]> => {
        const response = await axios.get(`${API_BASE_URL}/forms/${formId}/data`);
        return response.data;
    },

    // Сохранение данных формы
    saveFormData: async (formId: string, data: FormData): Promise<void> => {
        await axios.post(`${API_BASE_URL}/forms/${formId}/data`, data);
    },

    // Обновление данных формы
    updateFormData: async (formId: string, dataId: string, data: FormData): Promise<void> => {
        await axios.put(`${API_BASE_URL}/forms/${formId}/data/${dataId}`, data);
    },

    // Удаление данных формы
    deleteFormData: async (formId: string, dataId: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/forms/${formId}/data/${dataId}`);
    }
}; 