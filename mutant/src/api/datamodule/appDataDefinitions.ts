// src/app/appDataDefinitions.ts
import { AllDataDefinitions, DataItem } from './types';

/**
 * Определение всех датасетов для данного приложения.
 * Ключи должны быть уникальными идентификаторами датасетов.
 */
export const APP_DATA_DEFINITIONS: AllDataDefinitions = {

  customers: {
    url: 'customer/',
    transformer: (rawData: any[]): DataItem[] => {
      // if (!Array.isArray(rawData)) {
      //   console.error("customer transformer expected an array, but got:", rawData);
      //   return [];
      // }
      return rawData.map(item => ({
        value: String(item.customer_id),
        label: item.legal_name,
      }));
    },
  },
  points: {
    url: 'point/',
    transformer: (rawData: any[]): DataItem[] => {
      return rawData.map(item => ({
        value: String(item.point_id),
        label: item.name,
      }));
    },
  },
};