// src/common/api.ts
import axios from 'axios';

// const apiClient = axios.create({
//   baseURL: 'http://localhost:3001/api', // Универсальный базовый URL, можно переопределить через переменные окружения
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 5000, // 5-секундный таймаут
// });

/**
 * Универсальная функция для получения данных из бэкенда.
 * Возвращает данные "как есть", без преобразований.
 */
export const fetchDataSetFromBackend = async (endpoint: string): Promise<any> => {
  try {
    // const response = await apiClient.get<any>(endpoint);
    const response = await axios.get<any>(endpoint);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching data from ${endpoint}:`, error.message);
      throw new Error(`Failed to load data from ${endpoint}: ${error.message}`);
    } else {
      console.error(`An unexpected error occurred while fetching data from ${endpoint}:`, error);
      throw new Error('An unexpected error occurred');
    }
  }
};