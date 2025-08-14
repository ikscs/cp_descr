import { z } from 'zod';

// Константы для переиспользуемых значений
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const HEX_COLOR_MESSAGE = 'Неверный формат HEX-цвета (например, #ffffff)';
const DEFAULT_HEX = '#ffffff';

// Вспомогательная функция для создания схемы HEX-цвета с описанием
const hexColorSchema = (message = HEX_COLOR_MESSAGE, defaultValue = DEFAULT_HEX) =>
  z.string().regex(HEX_COLOR_REGEX, message).describe('color').default(defaultValue);

// Схема для типографики
export const typographySchema = z.object({
  fontFamily: z.string().min(1, 'Семейство шрифтов не может быть пустым').default('Arial, sans-serif'),
  fontSize: z.number().int().min(10, 'Размер шрифта должен быть не менее 10px').default(14),
});

// Схема для палитры цвета
export const paletteColorSchema = z.object({
  main: hexColorSchema(),
  light: hexColorSchema(),
  dark: hexColorSchema(),
  contrastText: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Неверный формат HEX-цвета').describe('color').default(DEFAULT_HEX),
});

// Создаём стандартные значения для палитры, чтобы избежать дублирования
const defaultPaletteColor = { main: DEFAULT_HEX, light: DEFAULT_HEX, dark: DEFAULT_HEX, contrastText: DEFAULT_HEX };
const defaultBackgroundColors = { default: DEFAULT_HEX, paper: DEFAULT_HEX };
const defaultSidebarColors = {
  background: DEFAULT_HEX,
  text: '#000000',
  items: { background: DEFAULT_HEX, text: '#000000' },
  selected: { background: DEFAULT_HEX, text: '#000000' },
  hover: { background: DEFAULT_HEX },
};

// Схема для палитры
export const paletteSchema = z.object({
  mode: z.enum(['light', 'dark']).default('light'),
  primary: paletteColorSchema.default(defaultPaletteColor),
  secondary: paletteColorSchema.default(defaultPaletteColor),
  background: z.object({
    default: hexColorSchema(),
    paper: hexColorSchema(),
  }).default(defaultBackgroundColors),
  sidebar: z.object({
    background: hexColorSchema(),
    text: hexColorSchema(undefined, '#000000'),
    items: z.object({
      background: hexColorSchema(),
      text: hexColorSchema(undefined, '#000000'),
    }).default({}),
    selected: z.object({
      background: hexColorSchema(),
      text: hexColorSchema(undefined, '#000000'),
    }).default({}),
    hover: z.object({
      background: hexColorSchema(),
    }).default({}),
  }).default({}),
});

// Основная схема для темы базы данных
export const dbThemeSchema = z.object({
  id: z.number().int().default(0),
  app_id: z.string().min(1, 'app_id не может быть пустым').default('app_id'),
  name: z.string().min(3, 'Название темы должно быть не менее 3 символов').default('theme'),
  value: z.object({
    palette: paletteSchema,
    typography: typographySchema,
  }).default({
    palette: paletteSchema.parse({}),
    typography: typographySchema.parse({}),
  }),
});

// Создаём TypeScript-тип на основе нашей схемы
export type DbThemeData = z.infer<typeof dbThemeSchema>;