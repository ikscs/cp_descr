// src/common/DataModuleContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { DataSet, DataModuleContextType, DataItem, AllDataDefinitions } from './types';
import { fetchDataSetFromBackend } from './api';

// Создаем контекст
const DataModuleContext = createContext<DataModuleContextType | undefined>(undefined);

interface DataModuleProviderProps {
  children: ReactNode;
  // Универсальное свойство для передачи определений датасетов
  dataDefinitions: AllDataDefinitions;
}

/**
 * Провайдер для DataModuleContext.
 * Управляет состоянием загрузки данных и предоставляет функцию для их получения.
 */
export const DataModuleProvider: React.FC<DataModuleProviderProps> = ({ children, dataDefinitions }) => {
  const [data, setData] = useState<DataSet>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set()); // Отслеживает, какие ключи сейчас загружаются

  const fetchDataSet = useCallback(async (key: string) => {
    // Получаем определение датасета из переданных провайдеру определений
    const definition = dataDefinitions[key];
    if (!definition) {
      console.warn(`[DataModuleContext] No definition found for data set key: ${key}`);
      setError((prev) => (prev ? `${prev}; No definition for ${key}` : `No definition for ${key}`));
      return;
    }

    // Если данные уже есть или уже загружаются, выходим
    if (data[key] || loadingKeys.has(key)) {
      return;
    }

    // Устанавливаем статус загрузки для конкретного ключа и общий статус
    setLoadingKeys((prev) => new Set(prev).add(key));
    setIsLoading(true);
    setError(null); // Сбрасываем ошибку для нового запроса

    try {
      // Получаем сырые данные из бэкенда
      const rawData: any = await fetchDataSetFromBackend(definition.url);

      let processedItems: DataItem[];

      // Проверяем, является ли сырые данные массивом, если это не предусмотрено трансформатором
      if (definition.transformer) {
        // Если есть трансформатор, передаем ему сырые данные (он сам должен обработать их структуру)
        processedItems = definition.transformer(rawData);
      } else if (Array.isArray(rawData)) {
        // Если нет трансформатора, но данные - массив, пытаемся привести к DataItem[]
        processedItems = rawData.map(item => ({
            value: String(item.value || item.id),
            label: String(item.label || item.name || item.value || item.id || 'N/A')
        }));
      } else {
        // Если данные не массив и нет трансформатора, или трансформатор вернул не массив
        console.warn(`[DataModuleContext] Data for key '${key}' is not an array and no specific transformer provided or transformer did not return array. Setting to empty array. Raw data:`, rawData);
        processedItems = [];
      }

      // Обновляем состояние с новыми данными
      setData((prevData) => ({
        ...prevData,
        [key]: processedItems,
      }));
    } catch (err) {
      console.error(`[DataModuleContext] Failed to load data for ${key}:`, err);
      setError((prev) => (prev ? `${prev}; ${key}: ${(err as Error).message}` : `${key}: ${(err as Error).message}`));
    } finally {
      // Удаляем ключ из списка загружаемых
      setLoadingKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      // Если больше нет активных загрузок, сбрасываем общий статус isLoading
      if (loadingKeys.size === 1 && loadingKeys.has(key)) {
         setIsLoading(false);
      }
    }
  }, [data, loadingKeys, dataDefinitions]); // Зависимости для useCallback: `dataDefinitions` тоже важны

  const fetchDataSets = useCallback(async (keys: string[]) => {
    keys.forEach(async (key) => fetchDataSet(key));
  }, [fetchDataSet]); // Зависимость только от fetchDataSet, так как она уже включает логику загрузки

  // Общий индикатор загрузки - true, если есть хоть одна активная загрузка
  const contextIsLoading = isLoading || loadingKeys.size > 0;

  const contextValue: DataModuleContextType = {
    data,
    isLoading: contextIsLoading,
    error,
    fetchDataSet,
    fetchDataSets,
  };

  return (
    <DataModuleContext.Provider value={contextValue}>
      {children}
    </DataModuleContext.Provider>
  );
};

/**
 * Хук для использования DataModuleContext в компонентах.
 * Выбрасывает ошибку, если используется вне DataModuleProvider.
 */
export const useDataModule = () => {
  const context = useContext(DataModuleContext);
  if (context === undefined) {
    throw new Error('useDataModule must be used within a DataModuleProvider');
  }
  return context;
};