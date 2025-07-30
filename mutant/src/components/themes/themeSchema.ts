import { z } from 'zod';

export const typographySchema = z.object({
  fontFamily: z.string().min(1, 'Семейство шрифтов не может быть пустым').default('Arial, sans-serif'),
  fontSize: z.number().int().min(10, 'Размер шрифта должен быть не менее 10px').default(14),
});

export const paletteColorSchema = z.object({
  main: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета (например, #ffffff)').describe('color').default('#ffffff'),
  light: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
  dark: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
  contrastText: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
});

export const paletteSchema = z.object({
  mode: z.enum(['light', 'dark']), // Режим темы: 'light' или 'dark'
  primary: paletteColorSchema,
  secondary: paletteColorSchema,
  background: z.object({
    default: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
    paper: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат HEX-цвета').describe('color').default('#ffffff'),
  }),
});

// Получаем TypeScript-тип для палитры из Zod-схемы
type PaletteType = z.infer<typeof paletteSchema>;

// Определяем пустой/стандартный объект для палитры
const emptyPalette: PaletteType = {
  mode: 'light',
  primary: { main: '', light: '', dark: '', contrastText: '' },
  secondary: { main: '', light: '', dark: '', contrastText: '' },
  background: { default: '', paper: '' },
};

// Определяем пустой/стандартный объект для типографики
const emptyTypography = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 14,
};

// Основная схема, которая соответствует таблице
export const dbThemeSchema = z.object({
  id: z.number().int().default(0), // int4 из PostgreSQL
  app_id: z.string().min(1, 'app_id не может быть пустым').default('mutant'), 
  name: z.string().min(3, 'Название темы должно быть не менее 3 символов').default('theme'), // text из PostgreSQL
  value: z.object({
    palette: paletteSchema.default(emptyPalette),
    typography: typographySchema.default(emptyTypography),
  }).default({ palette: emptyPalette, typography: emptyTypography, }), // partial().catchall(z.any()), 
});

// Создаём TypeScript-тип на основе нашей схемы
export type DbThemeData = z.infer<typeof dbThemeSchema>;