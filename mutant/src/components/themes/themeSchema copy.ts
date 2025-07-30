import { z } from 'zod';

// Схема для типографики
export const typographySchema = z.object({
  fontFamily: z.string().min(1, 'Семейство шрифтов не может быть пустым').default('Arial, sans-serif'),
  fontSize: z.number().int().min(10, 'Размер шрифта должен быть не менее 10px').default(14),
});

// Схема для цвета палитры
export const paletteColorSchema = z.object({
  main: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета (например, #ffffff)').describe('color').default('#ffffff'),
  light: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
  dark: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
  contrastText: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
});

// Схема для палитры
export const paletteSchema = z.object({
  mode: z.enum(['light', 'dark']).default('light'), // Важно: default для enum
  primary: paletteColorSchema.default({ // Важно: default для вложенного объекта
    main: '#ffffff', light: '#ffffff', dark: '#ffffff', contrastText: '#ffffff'
  }),
  secondary: paletteColorSchema.default({ // Важно: default для вложенного объекта
    main: '#ffffff', light: '#ffffff', dark: '#ffffff', contrastText: '#ffffff'
  }),
  background: z.object({
    default: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
    paper: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
  }).default({ // Важно: default для вложенного объекта
    default: '#ffffff', paper: '#ffffff'
  }),
});

// Определяем пустой/стандартный объект для палитры
// Этот объект теперь будет использоваться как *значение* по умолчанию для paletteSchema,
// если оно понадобится, но важно, чтобы сама схема paletteSchema была самодостаточной с default
type PaletteType = z.infer<typeof paletteSchema>;
const emptyPalette: PaletteType = {
  mode: 'light',
  primary: { main: '#ffffff', light: '#ffffff', dark: '#ffffff', contrastText: '#ffffff' },
  secondary: { main: '#ffffff', light: '#ffffff', dark: '#ffffff', contrastText: '#ffffff' },
  background: { default: '#ffffff', paper: '#ffffff' },
};

// Определяем пустой/стандартный объект для типографики
type TypographyType = z.infer<typeof typographySchema>;
const emptyTypography: TypographyType = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 14,
};

// Основная схема для темы базы данных
export const dbThemeSchema = z.object({
  id: z.number().int().default(0), // Добавлен default для id
  app_id: z.string().min(1, 'app_id не может быть пустым').default('app_id'),
  name: z.string().min(3, 'Название темы должно быть не менее 3 символов').default('theme'),
  value: z.object({
    // Важно: здесь мы используем *сами схемы* typographySchema и paletteSchema.
    // Если они должны быть необязательными, но иметь дефолтные значения,
    // то .default() должен быть наложен на *результат* схемы.
    palette: paletteSchema.default(emptyPalette), // <-- Здесь указываем дефолтное значение для всего объекта palette
    typography: typographySchema.default(emptyTypography), // <-- Здесь указываем дефолтное значение для всего объекта typography
  }).default({ // <-- Важно: default для самого объекта 'value'
    palette: emptyPalette,
    typography: emptyTypography,
  }),
});

// Создаём TypeScript-тип на основе нашей схемы
export type DbThemeData = z.infer<typeof dbThemeSchema>;