// src/common/types.ts

/**
 * Интерфейс для элемента данных, который будет использоваться в приложении.
 * Ожидаемый формат: { value: 'id', label: 'Название' }
 */
export interface DataItem {
  value: string;
  label: string;
}

/**
 * Интерфейс для объекта, хранящего все загруженные датасеты.
 * Ключ - это идентификатор датасета (например, 'ds1'), значение - массив DataItem.
 */
export interface DataSet {
  [key: string]: DataItem[];
}

/**
 * Интерфейс для контекста модуля данных, предоставляемого хуком useDataModule.
 */
export interface DataModuleContextType {
  data: DataSet; // Все загруженные данные
  isLoading: boolean; // Общий статус загрузки
  error: string | null; // Сообщение об ошибке, если есть
  fetchDataSet: (key: string) => Promise<void>; // Функция для загрузки конкретного датасета по ключу
  fetchDataSets: (keys: string[]) => Promise<void>; // Функция для загрузки нескольких датасетов по массиву ключей: (key: string) => Promise<void>; // Функция для загрузки конкретного датасета по ключу
}

/**
 * Тип для функции трансформации данных.
 * Принимает сырые данные (любого типа, обычно массив) и возвращает DataItem[].
 */
export type DataTransformer = (rawData: any) => DataItem[]; // rawData теперь может быть не массивом изначально

/**
 * Интерфейс для определения отдельного датасета.
 * Содержит URL эндпоинта и опциональную функцию трансформации.
 */
export interface DataSetDefinition {
  url: string;
  transformer?: DataTransformer;
}

/**
 * Интерфейс для объекта, хранящего определения всех датасетов.
 * Ключ - идентификатор датасета, значение - его определение.
 */
export interface AllDataDefinitions {
  [key: string]: DataSetDefinition;
}