// src/types/models.ts

export interface Department {
  department_id: number;
  department_name: string;
  description?: string | null;
}

export interface Position {
  position_id: number;
  position_name: string;
  description?: string | null;
}

export interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  hire_date: string; // Используем строку для простоты, можно Date
  department_id?: number | null;
  position_id?: number | null;
  manager_id?: number | null;
  salary?: number | string | null; // Строка для ввода, число для данных
  notes?: string | null;

  // Опционально: для отображения в таблицах (заполняется на клиенте или сервере)
  department_name?: string;
  position_name?: string;
  manager_name?: string; // Имя и фамилия руководителя
}

// Для фильтрации DataGrid
export interface GridFilterModel {
    items: {
        field: string;
        operator: string;
        value?: any;
    }[];
    logicOperator?: 'and' | 'or';
    quickFilterValues?: string[];
    quickFilterLogicOperator?: 'and' | 'or';
}

// Для сортировки DataGrid
export type GridSortModel = {
    field: string;
    sort: 'asc' | 'desc' | null | undefined;
}[];

// Для ответа API с пагинацией (пример)
export interface PaginatedData<T> {
    items: T[];
    total: number; // Общее количество записей для пагинации
}

// Для списков в выпадающих меню
export interface SimpleListItem {
    id: number;
    name: string;
}

