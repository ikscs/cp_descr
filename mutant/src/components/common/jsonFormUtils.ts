import { type JsonFormTemplate, type JsonFormField } from './JsonForm';

/**
 * Проверяет, является ли объект валидным полем JsonFormField.
 * @param field - Объект для проверки.
 * @returns True, если объект является валидным JsonFormField, иначе false.
 */
const isValidJsonFormField = (field: any): field is JsonFormField => {
  if (typeof field !== 'object' || field === null) {
    return false;
  }
  const hasRequiredStringProps =
    typeof field.name === 'string' &&
    typeof field.label === 'string' &&
    typeof field.type === 'string';

  if (!hasRequiredStringProps) return false;

  const validTypes: JsonFormField['type'][] = ['text', 'textarea', 'number', 'boolean', 'select', 'json'];
  if (!validTypes.includes(field.type)) return false;

  // Здесь можно добавить более строгие проверки для других свойств,
  // например, `options` для `select` или структуру `validation`.
  return true;
};

/**
 * Преобразует строку JSON в объект JsonFormTemplate.
 * Выбрасывает ошибку, если строка не является валидным JSON
 * или не соответствует ожидаемой структуре JsonFormTemplate.
 * @param templateString - Строка, содержащая JSON-шаблон.
 * @returns Распарсенный объект JsonFormTemplate.
 * @throws Error, если строка невалидна или не соответствует структуре.
 */
export const stringToJsonFormTemplate = (templateString: string): JsonFormTemplate => {
  let parsed: any;
  try {
    parsed = JSON.parse(templateString);
  } catch (error) {
    throw new Error(`Ошибка парсинга JSON строки: ${(error as Error).message}`);
  }

  if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.fields) || !parsed.fields.every(isValidJsonFormField)) {
    throw new Error('Строка не соответствует ожидаемой структуре JsonFormTemplate. Проверьте наличие массива "fields" и корректность его элементов.');
  }
  return parsed as JsonFormTemplate;
};