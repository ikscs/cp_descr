// src/api/data/genericApi.ts

import { getBackend, fetchData, postData, escapeSingleQuotes} from './fetchData';
import type { IPostResponse, IFetchResponse,  } from './fetchData';
import type { ISelectParams, IInsertParams, IUpdateParams, IDeleteParams, IWhereClause } from './genericApiTypes';

const backend = getBackend(); // Получаем конфигурацию бэкенда

// --- Вспомогательные функции ---

// Преобразует объект 'where' в строку для SQL (простой вариант)
// ВНИМАНИЕ: Это упрощенная реализация. Для сложных случаев и безопасности
// лучше использовать параметризованные запросы на бэкенде или более надежный ORM/Query Builder.
// Эта функция НЕ защищает от SQL-инъекций, если значения приходят напрямую от пользователя без очистки!
// Функция escapeSingleQuotes помогает, но не является панацеей.
export const buildWhereClause = (where?: IWhereClause): string | undefined => {
  if (!where || Object.keys(where).length === 0) {
    return undefined;
  }
  return Object.entries(where)
    .map(([key, value]) => {
      if (value === null) {
        return `${key} IS NULL`;
      }
      if (typeof value === 'string') {
        // Используем escapeSingleQuotes для экранирования одинарных кавычек
        return `${key} = '${escapeSingleQuotes(value)}'`;
      }
      if (typeof value === 'boolean') {
        // Убедитесь, что ваш бэкенд правильно обрабатывает true/false
        // Возможно, потребуется 'TRUE'/'FALSE' или 1/0
        return `${key} = ${value}`;
      }
      // Числа и другие типы
      return `${key} = ${value}`;
    })
    .join(' AND ');
};

// Преобразует объект 'set' для UPDATE в строку
export const buildSetClause = <T>(set: Partial<T>): string => {
    return Object.entries(set)
      .map(([key, value]) => {
        if (value === null) {
          return `${key} = NULL`;
        }
        if (typeof value === 'string') {
          return `${key} = '${escapeSingleQuotes(value)}'`;
        }
        if (typeof value === 'boolean') {
          // Убедитесь, что ваш бэкенд правильно обрабатывает true/false
          return `${key} = ${value}`;
        }
        return `${key} = ${value}`;
      })
      .join(', ');
  };


// --- Основные функции CRUD ---

/**
 * Выполняет SELECT запрос.
 * @param params Параметры для SELECT (from, fields, where, order, limit, offset).
 * @returns Promise с массивом данных или пустой массив в случае ошибки.
 */
export const selectData = async <T = any>(params: ISelectParams): Promise<T[]> => {
  try {
    // Формируем параметры для fetchData
    // Определяем тип для fetchParams, чтобы TypeScript знал ключи
    const fetchParams: {
        backend_point: string;
        from: string;
        fields: string;
        where?: IWhereClause;
        order?: string;
        limit?: number;
        offset?: number;
    } = {
      backend_point: backend.backend_point_select,
      from: params.from,
      fields: params.fields || '*', // По умолчанию выбираем все поля
      where: params.where, // Передаем объект where как есть, если бэкенд его поддерживает
      order: params.order,
      limit: params.limit,
      offset: params.offset,
      // Если бэкенд не поддерживает объект where, его нужно преобразовать в строку здесь:
      // where_string: buildWhereClause(params.where),
    };

    // Убираем undefined поля перед отправкой
    Object.keys(fetchParams).forEach(key => {
        // Используем утверждение типа 'as keyof typeof fetchParams' для безопасности типа
        const typedKey = key as keyof typeof fetchParams;
        if (fetchParams[typedKey] === undefined) {
            delete fetchParams[typedKey];
        }
    });

    console.log('selectData params:', JSON.stringify(fetchParams));
    const response: IFetchResponse = await fetchData(fetchParams);

    // Добавим проверку, что response действительно массив, перед приведением типа
    if (!Array.isArray(response)) {
        console.error(`Error selecting data from ${params.from}: Response is not an array`, response);
        // Можно выбросить ошибку или вернуть пустой массив
        // throw new Error(`Invalid response format from backend for SELECT on ${params.from}`);
        return [];
    }
    return response as T[];
  } catch (error) {
    console.error(`Error selecting data from ${params.from}:`, error);
    // Возвращаем пустой массив при ошибке, чтобы не ломать интерфейсы, ожидающие массив
    return [];
  }
};

/**
 * Выполняет INSERT запрос.
 * @param params Параметры для INSERT (dest, values, returning).
 * @returns Promise с результатом операции от postData. Добавляет поле 'error' при неуспехе.
 */
export const insertData = async <T extends Record<string, any>>(params: IInsertParams<T>): Promise<IPostResponse & { error?: string }> => {
    if (!params.values || params.values.length === 0) {
      console.warn(`Attempted to insert zero records into ${params.dest}`);
      // Возвращаем успешный ответ с 0 затронутых строк
      return { ok: true, data: 0, count: 0 };
    }
  
    try {
      // Теперь TypeScript знает, что params.values[0] - это объект
      const fields = Object.keys(params.values[0]).join(',');
      const valuesArray = params.values.map(row =>
          Object.values(row).map(val => {
              // Экранируем строки, оставляем числа/boolean/null как есть
              if (typeof val === 'string') return escapeSingleQuotes(val);
              // Возможно, потребуется обработка null и boolean отдельно, если бэкенд требует 'NULL' или 'TRUE'/'FALSE'
              if (val === null) return 'NULL'; // Зависит от бэкенда
              // if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'; // Если бэкенд требует строки
              return val;
          })
      );
  
      // Определяем тип для postParams
      const postParams: {
          backend_point: string;
          dest: string;
          fields: string;
          values: any[][]; // Массив массивов
          returning?: string;
      } = {
        backend_point: backend.backend_point_insert,
        dest: params.dest,
        fields: fields,
        values: valuesArray,
        returning: params.returning // Передаем returning, если он есть
      };
  
      // Убираем undefined поля (например, returning)
      Object.keys(postParams).forEach(key => {
          const typedKey = key as keyof typeof postParams;
          if (postParams[typedKey] === undefined) {
              delete postParams[typedKey];
          }
      });
  
      console.log('insertData params:', JSON.stringify(postParams));
      const result = await postData(postParams);
      // Добавляем поле error: undefined при успехе для единообразия
      // и извлекаем возможное сообщение об ошибке из result при неуспехе
      return { ...result, error: result.ok ? undefined : (result as any).error || 'Unknown insert error' };
    } catch (error: any) { // Явно типизируем error
      console.error(`Error inserting data into ${params.dest}:`, error);
      // Возвращаем стандартизированный ответ об ошибке
      return { ok: false, data: null, count: 0, error: error.message || String(error) };
    }
  };

/**
 * Выполняет UPDATE запрос.
 * ВНИМАНИЕ: Убедитесь, что `where` всегда передается, чтобы избежать случайного обновления всех строк!
 * @param params Параметры для UPDATE (dest, set, where).
 * @returns Promise с результатом операции от postData. Добавляет поле 'error' при неуспехе.
 */
export const updateData = async <T>(params: IUpdateParams<T>): Promise<IPostResponse & { error?: string }> => {
  // Строгая проверка на наличие WHERE
  if (!params.where || Object.keys(params.where).length === 0) {
    const errorMsg = `CRITICAL: Attempted to update ${params.dest} without a WHERE clause! Operation blocked.`;
    console.error(errorMsg);
    // Блокируем операцию без WHERE для безопасности
    return { ok: false, data: null, count: 0, error: errorMsg };
  }
   // Проверка на наличие данных для обновления
   if (!params.set || Object.keys(params.set).length === 0) {
    console.warn(`Attempted to update ${params.dest} with empty set data.`);
    // Нет данных для обновления, считаем операцию условно успешной (0 строк обновлено)
    return { ok: true, data: 0, count: 0 };
  }

  try {
    // Формируем параметры для postData
    // Бэкенд ожидает 'set' и 'where' как объекты?
    // Судя по _updateReport в reportTools.ts, он ожидает их как объекты.
    const postParams = {
      backend_point: backend.backend_point_update,
      dest: params.dest,
      set: params.set, // Передаем объект set
      where: params.where, // Передаем объект where
      // Если бэкенд ожидает строки:
      // set_string: buildSetClause(params.set),
      // where_string: buildWhereClause(params.where),
    };

    console.log('updateData params:', JSON.stringify(postParams));
    const result = await postData(postParams);
    return { ...result, error: result.ok ? undefined : (result as any).error || 'Unknown update error' };
  } catch (error: any) {
    console.error(`Error updating data in ${params.dest}:`, error);
    return { ok: false, data: null, count: 0, error: error.message || String(error) };
  }
};

/**
 * Выполняет DELETE запрос.
 * ВНИМАНИЕ: Убедитесь, что `where` всегда передается, чтобы избежать случайного удаления всех строк!
 * @param params Параметры для DELETE (dest, where).
 * @returns Promise с результатом операции от postData. Добавляет поле 'error' при неуспехе.
 */
export const deleteData = async (params: IDeleteParams): Promise<IPostResponse & { error?: string }> => {
  // Строгая проверка на наличие WHERE
  if (!params.where || Object.keys(params.where).length === 0) {
    const errorMsg = `CRITICAL: Attempted to delete from ${params.dest} without a WHERE clause! Operation blocked.`;
    console.error(errorMsg);
    // Блокируем операцию без WHERE для безопасности
    return { ok: false, data: null, count: 0, error: errorMsg };
  }

  // Проверка наличия точки удаления в конфигурации
  if (!backend.backend_point_delete) {
      const errorMsg = "Backend endpoint for delete operation is not configured.";
      console.error(errorMsg);
      return { ok: false, data: null, count: 0, error: errorMsg };
  }

  try {
    // Формируем параметры для postData
    const postParams = {
      backend_point: backend.backend_point_delete,
      dest: params.dest,
      where: params.where, // Передаем объект where
      // Если бэкенд ожидает строку:
      // where_string: buildWhereClause(params.where),
    };

    console.log('deleteData params:', JSON.stringify(postParams));
    const result = await postData(postParams);
    return { ...result, error: result.ok ? undefined : (result as any).error || 'Unknown delete error' };
  } catch (error: any) {
    console.error(`Error deleting data from ${params.dest}:`, error);
    return { ok: false, data: null, count: 0, error: error.message || String(error) };
  }
};

// --- Пример использования маппинга полей (если нужно) ---

/*
// Опционально: Интерфейс для маппинга полей (если имена полей в приложении отличаются от БД)
export interface IFieldMapping {
  [appFieldName: string]: string; // { имяВПриложении: имяВБазеДанных }
}

// Функция для преобразования объекта данных приложения в объект для бэкенда
const mapToBackend = <T>(data: Partial<T>, mapping: IFieldMapping): any => {
  const backendData: { [key: string]: any } = {}; // Явно типизируем backendData
  for (const appField in data) {
    // Проверяем, что свойство принадлежит самому объекту, а не прототипу
    if (Object.prototype.hasOwnProperty.call(data, appField)) {
        const backendField = mapping[appField] || appField; // Используем имя из маппинга или оригинальное
        backendData[backendField] = data[appField as keyof T]; // Используем утверждение типа для доступа
    }
  }
  return backendData;
};

// Функция для преобразования объекта where приложения в объект для бэкенда
const mapWhereToBackend = (where: IWhereClause, mapping: IFieldMapping): IWhereClause => {
    const backendWhere: IWhereClause = {};
    for (const appField in where) {
        if (Object.prototype.hasOwnProperty.call(where, appField)) {
            const backendField = mapping[appField] || appField;
            backendWhere[backendField] = where[appField];
        }
    }
    return backendWhere;
}

// Пример использования маппинга в updateData
export const updateDataWithMapping = async <T>(
    params: IUpdateParams<T>,
    mapping: IFieldMapping
): Promise<IPostResponse & { error?: string }> => { // Сохраняем тип возвращаемого значения
    const backendSet = mapToBackend(params.set, mapping);
    const backendWhere = mapWhereToBackend(params.where, mapping);

    // Вызываем оригинальную функцию с преобразованными данными
    return updateData<any>({ // Используем <any> или более конкретный тип, если известен
        dest: params.dest,
        set: backendSet,
        where: backendWhere,
    });
}

// Аналогично можно создать selectDataWithMapping, insertDataWithMapping и т.д.
*/
