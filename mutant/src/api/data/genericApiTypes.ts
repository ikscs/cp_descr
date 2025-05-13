// src/api/data/genericApiTypes.ts (Новый файл или добавить в существующий)

// Общий интерфейс для условий WHERE
export interface IWhereClause {
    [key: string]: string | number | boolean | null;
  }
  
  // Параметры для SELECT
  export interface ISelectParams {
    from: string; // Имя таблицы или представления
    fields?: string; // Список полей через запятую, например 'id, name, description'
    where?: IWhereClause; // Условия фильтрации
    order?: string; // Поле и направление сортировки, например 'name ASC'
    // Дополнительные параметры, если нужны (limit, offset и т.д.)
    limit?: number;
    offset?: number;
  }
  
  // Параметры для INSERT
  export interface IInsertParams<T> {
    dest: string; // Имя таблицы
    // 'values' должен быть массивом объектов, где каждый объект - строка для вставки
    // Ключи объекта - имена полей, значения - соответствующие значения
    values: T[];
    // Опционально: если нужно вернуть вставленные данные или ID
    returning?: string; // Например, 'id'
  }
  
  // Параметры для UPDATE
  export interface IUpdateParams<T> {
    dest: string; // Имя таблицы
    // 'set' - объект с полями и новыми значениями для обновления
    set: Partial<T>; // Partial<T> позволяет передавать только изменяемые поля
    where: IWhereClause; // Условия для выбора строк для обновления (ОБЯЗАТЕЛЬНО!)
  }
  
  // Параметры для DELETE
  export interface IDeleteParams {
    dest: string; // Имя таблицы
    where: IWhereClause; // Условия для выбора строк для удаления (ОБЯЗАТЕЛЬНО!)
  }
  
  // Опционально: Интерфейс для маппинга полей (если имена полей в приложении отличаются от БД)
  export interface IFieldMapping {
    [appFieldName: string]: string; // { имяВПриложении: имяВБазеДанных }
  }
  