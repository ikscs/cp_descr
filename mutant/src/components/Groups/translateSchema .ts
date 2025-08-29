import { TFunction } from 'i18next';

type JSONSchemaBasicType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
type JSONSchemaType = JSONSchemaBasicType | JSONSchemaBasicType[];

// TODO: требуется более строгий тип
interface TranslatableSchema {
  [key: string]: any; // TypeScript проверяет только, что это объект с ключами-строками
  title?: string;
  description?: string;
}


// перевод RJSFSchema с помощью i18next в default namespace
const translateSchema = (t: TFunction, schema: TranslatableSchema): TranslatableSchema => {
  // Создаем глубокую копию, чтобы избежать изменения оригинальной схемы
  const translatedSchema = JSON.parse(JSON.stringify(schema));

  // Переводим заголовок и описание на верхнем уровне
  if (translatedSchema.title) {
    translatedSchema.title = t(translatedSchema.title);
  }
  if (translatedSchema.description) {
    translatedSchema.description = t(translatedSchema.description);
  }

  // Проходим по всем свойствам и переводим их заголовки
  if (translatedSchema.properties) {
    for (const key in translatedSchema.properties) {
      if (Object.prototype.hasOwnProperty.call(translatedSchema.properties, key)) {
        const property = translatedSchema.properties[key];
        if (property.title) {
          property.title = t(property.title);
        }
        // Переводим ui:enumNames, если они есть
        if (property.ui && property.ui.enumNames) {
            property.ui.enumNames = property.ui.enumNames.map((name: string) => t(name));
        }
      }
    }
  }

  return translatedSchema;
};

export default translateSchema;