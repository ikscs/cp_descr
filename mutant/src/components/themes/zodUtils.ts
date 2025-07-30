import { z, ZodType } from 'zod';

/**
 * Вспомогательная функция для извлечения "внутреннего" типа из Zod-схемы.
 * Поле ZodDefault оборачивает другой тип, и нам нужен этот внутренний тип.
 *
 * @param schema Любая Zod-схема.
 * @returns Внутренний тип схемы (если это ZodDefault) или сама схема.
 */
export const getInnerSchema = (schema: z.ZodTypeAny): z.ZodTypeAny => {
  if (schema._def?.typeName === "ZodDefault") {
    return schema._def.innerType;
  }
  return schema;
};

/**
 * Рекурсивно генерирует объект с дефолтными значениями из Zod-схемы.
 * Для полей, не имеющих .default() и являющихся обязательными,
 * устанавливаются подходящие "нулевые" значения (пустые строки, нули, false, пустые массивы/объекты).
 *
 * @param schema Zod-схема объекта.
 * @returns Объект, заполненный дефолтными значениями.
 */
export const generateDefaultValuesFromZodSchema = <T extends z.AnyZodObject>(schema: T): z.infer<T> => {
  const defaults: Partial<z.infer<T>> = {};

  // Проверяем, что это объектная схема, иначе не сможем обойти shape
  if (schema._def?.typeName !== "ZodObject") {
    console.warn("generateDefaultValuesFromZodSchema ожидает ZodObject, но получил другой тип.");
    // Возвращаем пустой объект или выбрасываем ошибку, в зависимости от желаемого поведения
    return {} as z.infer<T>; // Приводим к ожидаемому типу
  }

    // DEBUG: Проверяем, есть ли defaultValue прямо здесь
    if (schema._def && 'defaultValue' in schema._def) {
      console.log(`generateDefaultValuesFromZodSchema: ${schema._def}`);
      return {} as z.infer<T>;
    }

  // Обходим каждое поле в схеме
  for (const key in schema.shape) {
    const fieldSchema = schema.shape[key];
    const innerSchema = getInnerSchema(fieldSchema); // Получаем внутреннюю схему (учитывая ZodDefault)

    // Если у поля есть явно заданный default, используем его
    // Проверяем defaultValue, но не вызываем его напрямую здесь.
    // Zod's safeParse уже сам применит эти дефолты.
    // Эта функция предназначена для полей БЕЗ default() в схеме.
    if (innerSchema._def && 'defaultValue' in innerSchema._def) {
        // Мы не должны устанавливать defaultValue здесь, так как
        // generateDefaultValuesFromZodSchema используется для "нулевых" значений
        // для полей БЕЗ явного .default() в схеме, либо когда .safeParse
        // не смог его применить из-за других ошибок.
        // Вместо этого, `parsedResult.data` в `getFormDefaultValues` уже будет содержать эти дефолты.
        // Если же мы дошли сюда, значит, мы генерируем "нулевые" дефолты для не-дефолтных полей.
        // Пропускаем поля с явным defaultValue, так как Zod их обработает.
        continue;
    }


    // Обработка различных типов Zod
    if (innerSchema instanceof z.ZodString) {
      if (innerSchema._def.description === 'color') {
        defaults[key as keyof typeof defaults] = '#FFFFFF' as any; // Устанавливаем белый цвет по умолчанию
      } else {
        defaults[key as keyof typeof defaults] = '' as any;
      }      
    } else if (innerSchema instanceof z.ZodNumber) {
      defaults[key as keyof typeof defaults] = 0 as any;
    } else if (innerSchema instanceof z.ZodBoolean) {
      defaults[key as keyof typeof defaults] = false as any;
    } else if (innerSchema instanceof z.ZodArray) {
      // Для массивов, если нет дефолта, используем пустой массив.
      // Элементы массива по умолчанию не инициализируются здесь.
      // Если нужен дефолт для элементов, потребуется рекурсивный вызов для `innerSchema._def.type`
      // но это усложнит логику, и обычно для форм достаточно пустого массива.
      defaults[key as keyof typeof defaults] = [] as any;
    } else if (innerSchema instanceof z.ZodObject) {
      // Рекурсивный вызов для вложенных объектов
      defaults[key as keyof typeof defaults] = generateDefaultValuesFromZodSchema(innerSchema) as any;
    } else if (innerSchema instanceof z.ZodEnum) {
      // Для enum, если нет default(), можно взять первый элемент
      if (innerSchema._def.values && innerSchema._def.values.length > 0) {
        defaults[key as keyof typeof defaults] = innerSchema._def.values[0] as any;
      } else {
        defaults[key as keyof typeof defaults] = '' as any; // Или null, в зависимости от предпочтений
      }
    } else if (innerSchema instanceof z.ZodDate) {
      defaults[key as keyof typeof defaults] = null as any; // Дефолт для даты (null или new Date())
    } else if (innerSchema instanceof z.ZodNullable || innerSchema instanceof z.ZodOptional) {
      // Для nullable/optional полей, если нет явного дефолта, устанавливаем null
      defaults[key as keyof typeof defaults] = null as any;
    }
    // TODO: Добавьте другие типы Zod, которые вы используете (e.g., z.union, z.literal, z.set, z.map и т.д.)
    // и определите для них подходящие "нулевые" значения по умолчанию.
    // Например, для z.union может быть сложно определить дефолт.
    // Для z.nullable() или z.optional() поле может быть null/undefined, но в форме
    // часто удобнее иметь явное "нулевое" значение для контролируемых полей.
  }

  return defaults as z.infer<T>;
};

/**
 * Универсальная утилита для подготовки defaultValues для React Hook Form
 * на основе Zod-схемы и необязательных начальных данных.
 *
 * @param schema Zod-схема объекта.
 * @param initialData Необязательные начальные данные.
 * @returns Объект defaultValues для React Hook Form.
 */
export const getFormDefaultValues = <T extends z.AnyZodObject>(
  schema: T,
  initialData: unknown = {} // Changed to `unknown` for better type safety
): z.infer<T> => {

  console.log('----------------------------------------------------');
  console.log('getFormDefaultValues START');
  console.log('Schema provided to getFormDefaultValues:', JSON.stringify(schema._def.shape(), null, 2)); // Логируем структуру схемы
  console.log('Initial Data received by getFormDefaultValues:', JSON.stringify(initialData, null, 2));
  console.log('----------------------------------------------------');

  // 1. Попытка валидировать initialData с помощью safeParse
  // Zod сам применит .default() значения из схемы в этом шаге.
  const parsedResult = schema.safeParse(initialData);

  if (parsedResult.success) {
    console.log('getFormDefaultValues: Данные успешно валидированы или применены дефолты из схемы. Используем их.');
    console.log('SUCCESS: Initial data parsed successfully by Zod (defaults applied if needed).');
    console.log('Parsed Data:', JSON.stringify(parsedResult.data, null, 2));
    console.log('getFormDefaultValues END (Success)');
    console.log('----------------------------------------------------');
    return parsedResult.data;
  } else {
    // 2. Если валидация не удалась (данные некорректны или отсутствуют обязательные поля без default()),
    // используем нашу функцию для генерации "нулевых" дефолтов для полей, которые не были заполнены или валидны.
    console.error('getFormDefaultValues: Ошибка валидации Zod:', parsedResult.error.issues);
    console.log('getFormDefaultValues: Инициализация формы сгенерированными дефолтными значениями для незаполненных полей.');

    const generatedDefaults = generateDefaultValuesFromZodSchema(schema);

    // Важный момент: мы хотим объединить *корректно спарсенные* данные из initialData
    // (даже если были ошибки в других полях) со сгенерированными дефолтами.
    // Для этого мы можем попытаться спарсить initialData еще раз, но с `passthrough`
    // или более аккуратно объединить.
    // Проще всего использовать подход, где `schema.parse(initialData)` (или `safeParse`)
    // уже дал нам максимально возможное валидное подмножество.

    // Для React Hook Form, когда `initialData` не полностью валидно,
    // нам нужно скомбинировать то, что Zod *смог* извлечь, с нашими "нулевыми" дефолтами.
    // Zod's `safeParse` уже возвращает `data` с примененными `.default()` значениями
    // для тех полей, которые были корректны.
    // Однако, если поле было *некорректным* и не имело `.default()`, оно будет отсутствовать
    // или быть `undefined` в `parsedResult.data` (если бы оно было доступно в случае ошибки).

    // Оптимальный подход:
    // 1. Сгенерировать полные "нулевые" дефолты на основе схемы.
    // 2. Затем "наложить" на них те данные из `initialData`, которые успешно прошли валидацию.
    // Это гарантирует, что мы всегда имеем полный объект, а валидные части `initialData` имеют приоритет.

    // Чтобы получить частичные валидные данные из `initialData` при ошибке,
    // Zod прямо не предоставляет легкий способ извлечь "частично валидный" объект.
    // Обычно `safeParse` возвращает `data` только при `success: true`.

    // Наиболее практичное решение для React Hook Form:
    // Мы уже знаем, что `parsedResult.success` == `false`.
    // Это означает, что `parsedResult.data` не существует.
    // Наша `generateDefaultValuesFromZodSchema` создает полный объект с "нулевыми" дефолтами.
    // Если нам нужно сохранить корректные части из `initialData`, нам придется делать это вручную:

    const combinedDefaults: z.infer<T> = { ...generatedDefaults };

    // Теперь, итерируем по `initialData` и пытаемся применить те поля, которые совпадают по типу
    // с ожидаемыми в `schema`, и которые могут быть присвоены без ошибок.
    // Это немного усложняет, поэтому давайте упростим до самого частого кейса:
    // Если `safeParse` НЕ УСПЕШЕН, то мы просто используем полностью сгенерированные дефолты.
    // Это гарантирует, что форма всегда инициализируется с полным и типобезопасным объектом.

    // Если же вам *действительно* нужно, чтобы `initialData` (даже некорректная) частично
    // переопределяла сгенерированные дефолты, то можно использовать:
    // return { ...generatedDefaults, ...initialData }; // ОПАСНО: initialData может быть некорректным!
    // Лучше:
    // return schema.parse({ ...generatedDefaults, ...initialData }); // Повторная попытка парсинга с дефолтами
    // Это заставит Zod снова применить дефолты и попытаться заполнить пропуски.
    // Однако, это вызовет исключение, если `initialData` содержит критические ошибки типов.

    // Самый безопасный подход для вашей ситуации (если safeParse не сработал):
    // возвращаем сгенерированные дефолты. Пользователь может потом сам ввести данные.
    // Это соответствует вашей логике "Ошибка валидации Zod -> Инициализация формы сгенерированными дефолтными значениями".
    return generatedDefaults;
  }
};

/**
 * Проверяет, является ли Zod-схема определенным базовым типом Zod (например, ZodString, ZodNumber),
 * учитывая обертку ZodDefault.
 *
 * @template T - Ожидаемый тип Zod-схемы (например, typeof z.ZodString).
 * @param {ZodType} schema - Zod-схема для проверки.
 * @param {T} expectedType - Ожидаемый класс Zod-типа (например, z.ZodString).
 * @returns {boolean} - true, если схема соответствует ожидаемому типу, false в противном случае.
 */
function _isFieldSchema<T extends ZodType>(schema: ZodType, expectedType: { new (...args: any[]): T }): boolean {
  // Если схема обернута в ZodDefault, получаем ее внутренний тип
  if (schema instanceof z.ZodDefault) {
    const innerSchema = schema._def.innerType;
    return innerSchema instanceof expectedType;
  }
  // В противном случае, проверяем саму схему
  return schema instanceof expectedType;
}

function isFieldSchema<T extends ZodType>(
  schema: ZodType,
  expectedType: new (...args: any[]) => T
): schema is T | z.ZodDefault<T> {
  if (schema instanceof z.ZodDefault) {
    return schema._def.innerType instanceof expectedType;
  }
  return schema instanceof expectedType;
}

export { isFieldSchema };

