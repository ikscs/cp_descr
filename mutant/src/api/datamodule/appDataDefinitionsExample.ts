// src/app/appDataDefinitions.ts
import { AllDataDefinitions, DataItem } from './types';

/**
 * Определение всех датасетов для данного приложения.
 * Ключи должны быть уникальными идентификаторами датасетов.
 */
export const APP_DATA_DEFINITIONS: AllDataDefinitions = {
  // Пример датасета 'ds1'
  ds1: {
    url: '/ds1', // Эндпоинт для получения данных 'ds1'
    transformer: (rawData: any): DataItem[] => {
      // Пример: бэкенд возвращает массив объектов с полями 'id' и 'name'
      // [{ id: 1, name: 'Test A' }, { id: 2, name: 'Test B' }]
      if (!Array.isArray(rawData)) {
        console.error("DS1 transformer expected an array, but got:", rawData);
        return [];
      }
      return rawData.map(item => ({
        value: String(item.id),
        label: item.name,
      }));
    },
  },
  // Пример датасета 'ds2'
  ds2: {
    url: '/ds2', // Эндпоинт для получения данных 'ds2'
    transformer: (rawData: any): DataItem[] => {
      // Пример: бэкенд возвращает массив объектов, уже близких к DataItem
      // [{ value: 'itemX', label: 'Item X' }, { value: 'itemY', label: 'Item Y' }]
      if (!Array.isArray(rawData)) {
        console.error("DS2 transformer expected an array, but got:", rawData);
        return [];
      }
      return rawData.map(item => ({
        value: String(item.value),
        label: String(item.label),
      }));
    },
  },
  // Пример датасета 'ds3', который будет загружаться по клику
  ds3: {
    url: '/ds3', // Эндпоинт для получения данных 'ds3'
    transformer: (rawData: any): DataItem[] => {
      // Пример: бэкенд возвращает простой массив строк
      // ["Option Alpha", "Option Beta", "Option Gamma"]
      if (!Array.isArray(rawData)) {
        console.error("DS3 transformer expected an array, but got:", rawData);
        return [];
      }
      return rawData.map(str => ({
        value: String(str).toLowerCase().replace(/\s/g, ''), // Преобразуем строку в slug для value
        label: String(str),
      }));
    },
  },
  // Добавьте здесь другие датасеты, которые нужны вашему приложению
  // myCustomList: {
  //   url: '/custom-data',
  //   transformer: (data: any) => data.map((item: any) => ({ value: item.code, label: item.description })),
  // },
};