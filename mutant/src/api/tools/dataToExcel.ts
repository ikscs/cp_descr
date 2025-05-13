// src/api/tools/dataToExcel.ts (или другое подходящее место)

import { fetchData, type IFetchResponse } from '../data/fetchData';
import { toExcel, type IGridColumn } from './toExcel';
import { type IWhereClause } from '../data/genericApiTypes';

/**
 * Fetches data from a specified table and exports it to an Excel file.
 * Column definitions for Excel are automatically generated from the keys of the first data row.
 *
 * @param tableName The name of the table to fetch data from.
 * @param excelFilename Optional: The desired name for the output Excel file (without extension). Defaults to the table name.
 * @param fields Optional: Specific fields to fetch. Defaults to '*'.
 * @param where Optional: Conditions for fetching data using IWhereClause.
 * @param order Optional: Sorting order for the data.
 */
export const dataToExcel = async (
    tableName: string,
    excelFilename?: string,
    fields: string = '*',
    where?: IWhereClause, // Используем IWhereClause
    order?: string
): Promise<void> => {
    console.log(`Starting data export for table: ${tableName}`);

    try {
        // Подготовка параметров для fetchData
        const fetchParams: {
            from: string;
            fields: string;
            where?: IWhereClause;
            order?: string;
        } = {
            from: tableName,
            fields: fields,
        };

        // Добавляем опциональные параметры
        if (where && Object.keys(where).length > 0) { // Проверка, что where не пустой
            fetchParams.where = where;
        }
        if (order) {
            fetchParams.order = order;
        }

        console.log('Fetching data with params:', fetchParams);
        const data: IFetchResponse = await fetchData(fetchParams);

        // Проверяем, есть ли данные и хотя бы одна строка
        if (data && data.length > 0) {
            console.log(`Fetched ${data.length} rows. Generating columns and exporting to Excel...`);

            // Получаем первую строку для определения колонок
            const firstRow = data[0];
            // Генерируем массив IGridColumn из ключей первого объекта
            const generatedColumns: IGridColumn[] = Object.keys(firstRow).map(key => ({
                key: key, // Используем ключ объекта как key для доступа к данным
                name: key, // Используем ключ объекта как name для заголовка колонки
                // Можно добавить width или другие свойства по умолчанию, если нужно
                // width: 20,
            }));

            // Определяем имя файла (без расширения)
            const filename = excelFilename || tableName;

            // Вызываем toExcel с сгенерированными колонками, данными и именем файла
            await toExcel(generatedColumns, data, filename);

            console.log(`Successfully exported data to ${filename}.xlsx`);
        } else {
            console.log(`No data found for table ${tableName} with the specified criteria. Excel file not generated.`);
            // Можно добавить уведомление пользователю
        }
    } catch (error) {
        console.error(`Error exporting data for table ${tableName}:`, error);
        // Обработка ошибки (например, показать уведомление)
    }
};

// Пример использования остается прежним, но теперь не нужно передавать колонки вручную
/*
import React from 'react';
import { Button } from '@mui/material';
import { dataToExcel } from './api/tools/dataToExcel'; // Уточните путь

const MyComponent = () => {

    const handleExport = async () => {
        // Пример: Экспорт всех данных из 'users'
        await dataToExcel('users', 'all_users_export');

        // Пример: Экспорт активных продуктов с сортировкой
        // await dataToExcel(
        //     'products',
        //     'active_products',
        //     'product_id, name, price', // Указываем нужные поля
        //     { is_active: true },
        //     'price DESC'
        // );
    };

    return (
        <Button variant="contained" onClick={handleExport}>
            Export Data to Excel
        </Button>
    );
}

export default MyComponent;
*/
