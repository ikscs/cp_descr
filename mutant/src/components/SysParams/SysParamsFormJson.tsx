import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { getParams, updateParam } from "./SysParamService";
import { SysParam } from "./SysParamsTypes";

// Вспомогательная функция для безопасного парсинга JSON строк.
// Возвращает распарсенный объект, если строка является корректным JSON,
// иначе возвращает null, чтобы избежать ошибок выполнения.
const safeParseJSON = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
};

/**
 * Рендерит поле ввода на основе display_type системного параметра.
 * Это универсальный механизм для отображения различных типов данных.
 *
 * Поддерживаемые display_type:
 * - "number": Поле для ввода числовых значений.
 * - "select": Выпадающий список для выбора одного из предопределенных значений (из enum_values).
 * - "checkbox": Переключатель (тумблер) для булевых значений (true/false).
 * - "radio": Группа радиокнопок для выбора одного из нескольких предопределенных значений (из enum_values).
 * - "json": Многострочное текстовое поле для ввода и редактирования JSON-объектов с базовой валидацией.
 * - default (text): Обычное текстовое поле для строковых значений.
 *
 * @param param Объект SysParam, содержащий метаданные о параметре (тип отображения, метка и т.д.).
 * @param value Текущее значение параметра, которое должно быть отображено в поле.
 * @param onChange Функция обратного вызова, которая вызывается при изменении значения поля.
 */
const renderField = (
  param: SysParam,
  value: any,
  onChange: (v: any) => void
) => {
  // Используем switch для выбора компонента рендеринга в зависимости от display_type.
  switch (param.display_type) {
    case "number":
      // Поле для ввода чисел.
      return (
        <TextField
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))} // Преобразуем значение в число.
          size="small"
          fullWidth
        />
      );
    case "select":
      // Выпадающий список (select) с предопределенными значениями.
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{param.display_label}</InputLabel>
          <Select
            value={value}
            label={param.display_label}
            onChange={e => onChange(e.target.value)}
          >
            {(param.enum_values?.split(",") || []).map(opt => (
              <MenuItem key={opt.trim()} value={opt.trim()}>
                {opt.trim()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case "checkbox":
      // Переключатель (switch) для булевых значений.
      return (
        <FormControlLabel
          control={
            <Switch
              checked={!!value} // Приводим значение к булевому типу.
              onChange={e => onChange(e.target.checked)}
            />
          }
          label=""
        />
      );
    case "radio":
      // Группа радиокнопок для выбора одного из нескольких предопределенных значений.
      return (
        <FormControl>
          <FormLabel>{param.display_label}</FormLabel>
          <RadioGroup
            row
            name={param.name}
            value={value}
            onChange={e => onChange(e.target.value)}
          >
            {(param.enum_values?.split(",") || []).map(opt => (
              <FormControlLabel
                key={opt.trim()}
                value={opt.trim()}
                control={<Radio />}
                label={opt.trim()}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
    case "json":
      // Поле для редактирования JSON-объектов.
      // Отображает JSON как форматированную строку, а при изменении пытается спарсить обратно в объект.

      // Преобразуем объект `value` в читабельную JSON-строку для отображения.
      // Если `value` не объект или null, отображаем его как есть или пустую строку.
      const jsonStringValue = typeof value === 'object' && value !== null
        ? JSON.stringify(value, null, 2) // Форматируем JSON с отступами.
        : value || "";

      // Проверяем, является ли текущее значение строки некорректным JSON.
      // Это используется для отображения ошибки валидации.
      const isInvalidJson = typeof value === 'string' && value.length > 0 && safeParseJSON(value) === null;

      return (
        <TextField
          type="text"
          value={jsonStringValue}
          onChange={e => {
            const newValue = e.target.value;
            // При изменении пытаемся спарсить введенную строку.
            const parsedValue = safeParseJSON(newValue);
            // Если парсинг успешен, передаем JS-объект, иначе - исходную строку.
            // Это позволяет полю отображать ошибку, если введен невалидный JSON.
            onChange(parsedValue !== null ? parsedValue : newValue);
          }}
          size="small"
          fullWidth
          multiline // Разрешаем многострочный ввод для удобства редактирования JSON.
          rows={4} // Устанавливаем начальную высоту поля.
          error={isInvalidJson} // Отображаем ошибку, если JSON некорректен.
          helperText={isInvalidJson ? "Некорректний формат JSON" : ""} // Текст ошибки.
          InputProps={{ style: { fontFamily: 'monospace' } }} // Используем моноширинный шрифт для лучшей читаемости JSON.
        />
      );
    default:
      // Поле по умолчанию для обычного текста (string).
      return (
        <TextField
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          size="small"
          fullWidth
        />
      );
  }
};

/**
 * Компонент формы для управления системными параметрами.
 * Загружает параметры, позволяет их редактировать и сохранять изменения.
 */
export default function SysParamsForm() {
  const [params, setParams] = useState<SysParam[]>([]); // Состояние для хранения списка системных параметров.
  const [form, setForm] = useState<Record<number, any>>({}); // Состояние для хранения текущих значений формы.
  const [initialForm, setInitialForm] = useState<Record<number, any>>({}); // Состояние для хранения исходных значений формы (для отслеживания изменений).
  const [loading, setLoading] = useState(true); // Состояние для индикации загрузки данных.
  const [error, setError] = useState<string | null>(null); // Состояние для хранения сообщений об ошибках.

  // Эффект для загрузки параметров при монтировании компонента.
  useEffect(() => {
    setError(null); // Сбрасываем предыдущие ошибки перед новой загрузкой.
    getParams() // Вызываем сервис для получения параметров.
      .then(data => {
        setParams(data); // Устанавливаем полученные параметры.
        const initial: Record<number, any> = {};
        // Инициализируем состояние формы и начальные значения.
        data.forEach((p: SysParam) => {
          if (p.display_type === "json") {
            // Для JSON полей, пытаемся спарсить строку из бэкенда в объект.
            // Если парсинг не удался, сохраняем исходную строку.
            try {
              initial[p.id] = typeof p.value?.value === 'string'
                ? JSON.parse(p.value.value)
                : p.value?.value;
            } catch (e) {
              initial[p.id] = p.value?.value || ""; // В случае ошибки используем исходное значение или пустую строку.
            }
          } else {
            initial[p.id] = p.value?.value ?? ""; // Для других типов просто берем значение.
          }
        });
        setForm(initial);
        setInitialForm(initial);
        setLoading(false); // Загрузка завершена.
      })
      .catch(_err => {
        setError("Не вдалося завантажити параметри"); // Устанавливаем сообщение об ошибке.
        setLoading(false); // Загрузка завершена с ошибкой.
      });
  }, []); // Пустой массив зависимостей означает, что эффект запустится один раз при монтировании.

  // Обработчик изменения значения поля в форме.
  const handleChange = (id: number, value: any) => {
    setForm(f => ({ ...f, [id]: value })); // Обновляем состояние формы.
  };

  // Проверяет, были ли внесены изменения в форму по сравнению с начальными значениями.
  const isChanged = () => {
    return Object.keys(form).some(
      key => {
        const currentVal = form[key as any];
        const initialVal = initialForm[key as any];

        // Специальная логика сравнения для JSON-полей.
        // Объекты сравниваются по ссылке, поэтому для JSON сравниваем их строковые представления.
        if (params.find(p => p.id === Number(key))?.display_type === "json") {
          return JSON.stringify(currentVal) !== JSON.stringify(initialVal);
        }
        // Для остальных типов простое сравнение.
        return currentVal !== initialVal;
      }
    );
  };

  // Обработчик отправки формы.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем стандартное поведение отправки формы.
    setError(null); // Сбрасываем предыдущие ошибки.
    try {
      // Отправляем изменения для каждого параметра.
      await Promise.all(
        params.map(param => {
          let valueToSave = form[param.id]; // Получаем текущее значение из формы.

          // Если это JSON-поле, убеждаемся, что отправляем его как строковое представление.
          if (param.display_type === "json") {
            // Дополнительная валидация перед сохранением:
            // Если значение является строкой (т.е. пользователь ввел что-то) и не является валидным JSON,
            // выбрасываем ошибку.
            const parsed = safeParseJSON(valueToSave);
            if (parsed === null && typeof valueToSave === 'string' && valueToSave.length > 0) {
                throw new Error(`Некоректний JSON для параметра ${param.display_label}`);
            }
            // Преобразуем JSON-объект обратно в строку для сохранения.
            valueToSave = JSON.stringify(valueToSave);
          }
          // Вызываем сервис для обновления параметра.
          return updateParam(param.id, { value: { value: valueToSave } });
        })
      );
      setInitialForm({ ...form }); // Обновляем начальные значения после успешного сохранения.
      alert("Параметри збережені"); // Уведомляем пользователя об успехе.
    } catch (err: any) {
      // Обработка ошибок при сохранении.
      setError(err.message || "Не вдалося зберегти параметри");
    }
  };

  // Отображение индикатора загрузки.
  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );

  // Основной рендеринг формы.
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: "auto" }}>
      <Typography variant="h5" align="center" gutterBottom>
        Параметри системи
      </Typography>
      {error && (
        // Отображение сообщения об ошибке, если она есть.
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {params
        .sort((a, b) => a.view_order - b.view_order) // Сортируем параметры по view_order.
        .map(param => (
          <Box key={param.id} mb={3}>
            <FormControl fullWidth>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  {param.display_label} {/* Отображаем метку параметра. */}
                  {param.eu && <span style={{ color: "#888" }}> ({param.eu})</span>} {/* Отображаем единицы измерения. */}
                </Typography>
              </Box>
              {/* Рендерим поле ввода, используя универсальную функцию renderField. */}
              {renderField(param, form[param.id], v => handleChange(param.id, v))}
              {param.description && (
                // Отображаем описание параметра, если оно есть.
                <Typography variant="caption" color="text.secondary">
                  {param.description}
                </Typography>
              )}
            </FormControl>
          </Box>
        ))}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!isChanged()} // Кнопка "Сохранить" отключена, пока нет изменений.
      >
        Зберегти
      </Button>
    </Box>
  );
}