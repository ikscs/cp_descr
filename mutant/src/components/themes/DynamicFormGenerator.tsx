import React from 'react';
import {
  useForm,
  useFormContext,
  FormProvider,
  SubmitHandler,
  FieldErrors, // Импортируем тип FieldErrors
  Controller,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodEnum } from 'zod';
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { isFieldSchema } from './zodUtils';

// Объявляем тип ошибок, который может быть проиндексирован строками
// Это решает проблему, так как TS теперь знает, что ошибки могут иметь
// динамические ключи.
type ErrorsType = FieldErrors & { [key: string]: any };

const getInnerSchema = (schema: any) => {
  // Если это ZodDefault, достаем innerType
  if (schema._def?.typeName === "ZodDefault") {
    return schema._def.innerType;
  }
  return schema;
};

// Функция для получения свойств input, если это поле цвета
const getInputProps = (
  fullPath: string,
  fieldValue: string,
  isColorField: boolean,
  setValue: (name: string, value: any) => void 
) => {
  if (!isColorField) {
    return {};
  }

  return {
    endAdornment: (
      <InputAdornment position="end">
        {/* Сам input type="color" для пипетки */}
        <input
          type="color"
          value={fieldValue || '#000000'} // Используем значение поля или дефолтный черный
          onChange={(e) => {
            // При изменении цвета в пипетке, обновляем поле формы
            setValue(fullPath, e.target.value);
          }}
          style={{
            width: '24px',
            height: '24px',
            padding: 0,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            marginRight: '8px' // Добавляем небольшой отступ от текстового поля
          }}
        />
        {/* Визуальный квадрат с текущим цветом */}
        {/* <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: fieldValue || '#000000', // Используем значение поля
          }}
        /> */}
      </InputAdornment>
    ),
  };
};

// Вспомогательный компонент для отображения полей
const FieldGenerator = ({
  schema,
  parentPath = '',
}: {
  schema: z.ZodObject<any>;
  parentPath?: string;
}) => {
  console.log('FieldGenerator called with parentPath', parentPath)
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useFormContext();

  const renderField = (fieldKey: string, fieldSchema: z.ZodType) => {
    const fullPath = parentPath ? `${parentPath}.${fieldKey}` : fieldKey;
    const schemaToCheck = getInnerSchema(fieldSchema);
    // console.log('renderField called with fieldKey', fieldKey);
    // console.log('fieldSchema', fieldSchema);
    // console.log('schemaToCheck._def?.typeName', (schemaToCheck as any)._def?.typeName);
    // console.log('fieldSchema._def?.typeName', (fieldSchema as any)._def?.typeName);

    // Безопасно получаем ошибку, используя наш новый тип ErrorsType
    const error = (errors as ErrorsType)[parentPath]?.[fieldKey];

    // if (fieldSchema instanceof z.ZodObject) {
    // if (fieldSchema.isZodType(z.ZodObject)) {
    if ((schemaToCheck as any)._def?.typeName === "ZodObject") {
      console.log('about to FieldGenerator');
      return (
        <Box
          key={fullPath}
          sx={{ ml: 2, mt: 2, borderLeft: '2px solid #ccc', pl: 2 }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {fieldKey}
          </Typography>
          <FieldGenerator schema={schemaToCheck as any} parentPath={fullPath} />
        </Box>
      );
    }

    // if (fieldSchema instanceof z.ZodString) {
    if (isFieldSchema(fieldSchema, z.ZodString)) {
      // const isColorField = fieldKey.toLowerCase().includes('color');
      const isColorField = (schemaToCheck as any)._def?.description === 'color';
      const fieldValue = watch(fullPath);
      return (
        <TextField
          key={fullPath}
          label={fieldKey}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          // type={isColorField ? 'color' : 'text'}
          type='text'
          {...register(fullPath)}
          error={!!error}
          helperText={error?.message as string}
          InputProps={getInputProps(fullPath, fieldValue, isColorField, setValue)}
        />
      );
    }

    // if (fieldSchema instanceof z.ZodNumber) {
    if (isFieldSchema(fieldSchema, z.ZodNumber)) {
      return (
        <TextField
          key={fullPath}
          label={fieldKey}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          type="number"
          {...register(fullPath, { valueAsNumber: true })}
          error={!!error}
          helperText={error?.message as string}
        />
      );
    }

    // if (fieldSchema instanceof z.ZodEnum) {
    if (isFieldSchema(fieldSchema, z.ZodEnum)) {
      const actualEnumSchema = fieldSchema instanceof z.ZodDefault
          ? fieldSchema._def.innerType as ZodEnum<[string, ...string[]]> // Приведение типа здесь, если ZodDefault
          : fieldSchema as ZodEnum<[string, ...string[]]>; // Приведение типа здесь, если просто ZodEnum
      return (
        <FormControl fullWidth key={fullPath} sx={{ mb: 2 }}>
          <InputLabel>{fieldKey}</InputLabel>
          <Controller
            name={fullPath}
            control={useFormContext().control}
            render={({ field }) => (
              <Select
                label={fieldKey}
                {...field}
                error={!!error}
              >
                {actualEnumSchema.options.map((option: string) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
      );
    }
    return null;
  };

  return (
    <>
      {Object.keys(schema.shape).map((fieldKey) => {
        const fieldSchema = schema.shape[fieldKey];
        return renderField(fieldKey, fieldSchema);
      })}
    </>
  );
};

// ... остальная часть компонента DynamicForm без изменений
export const DynamicForm = ({
  schema,
  initialData,
  onSave,
}: {
  schema: z.AnyZodObject;
  initialData: any;
  onSave: (data: any) => void;
}) => {

    // Шаг 1: Используем safeParse для валидации и применения значений по умолчанию.
    console.log('Initial data received by safeParse:', initialData); 
    const parsedResult = schema.safeParse(initialData);

    if (!parsedResult.success) {
        // Шаг 2: Если валидация не прошла, логируем ошибку и не рендерим форму.
        console.error('Ошибка валидации Zod:', parsedResult.error.issues);
        return (
            <Box>
                <Typography color="error">
                    Ошибка: Некорректные данные. Подробности в консоли.
                </Typography>
            </Box>
        );
    }

    // Шаг 3: Извлекаем уже валидированные и полные данные
    const parsedData = parsedResult.data;

    // Шаг 4: Передаем в useForm только данные, а не результат safeParse
    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: parsedData, // Теперь здесь валидный объект данных
    });

    console.log('Данные формы:', methods.getValues());

  const onSubmit: SubmitHandler<any> = (data) => {
    onSave(data);
  };

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '80vh', // фиксированная высота формы
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            mb: 2, // отступ снизу для кнопки
            pt: 2, // Add padding-top here
          }}
        >
          <FieldGenerator schema={schema} />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Сохранить изменения
        </Button>
      </Box>
    </FormProvider>
  );
};

export default DynamicForm;