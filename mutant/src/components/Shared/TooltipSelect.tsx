/* 
Этот компонент TooltipSelect принимает стандартные пропсы 
для Select, а также массив options и пропсы для Tooltip. 
Он автоматически управляет скрытием тултипа при открытии 
выпадающего списка.
Используется для отображения подсказок при наведении 
на опции в выпадающем списке. 
*/

import React, { useState } from 'react';
import {
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  TooltipProps,
  SelectProps
} from '@mui/material';

// --- Type Definitions ---

interface SelectOption {
  value: string | number;
  label: string;
}

// Теперь TooltipSelectProps явно включает все деструктурируемые пропсы
// interface TooltipSelectProps<T = unknown> extends SelectProps<T> {
type TooltipSelectProps<T = unknown> = SelectProps<T> & {    
  options: SelectOption[];
  tooltipTitle: string;
  tooltipPlacement?: TooltipProps['placement'];
  // Добавляем остальные деструктурируемые пропсы явно
  label?: string;
  value: SelectProps<T>['value']; // Берем тип value из SelectProps<T>
  onChange: SelectProps<T>['onChange']; // Берем тип onChange из SelectProps<T>
  onOpen?: SelectProps<T>['onOpen']; // Берем тип onOpen из SelectProps<T>, делаем его опциональным, как в MUI
  onClose?: SelectProps<T>['onClose']; // Берем тип onClose из SelectProps<T>, делаем его опциональным, как в MUI
}

// --- TooltipSelect Component ---

const TooltipSelect = <T extends unknown>(
  {
    options,
    tooltipTitle,
    tooltipPlacement = 'top',
    label,
    value, // Теперь явно деструктурируется из TooltipSelectProps
    onChange, // Теперь явно деструктурируется из TooltipSelectProps
    onOpen, // Теперь явно деструктурируется из TooltipSelectProps
    onClose, // Теперь явно деструктурируется из TooltipSelectProps
    ...restSelectProps // Остальные пропсы для Select, которые не были деструктурированы
  }: TooltipSelectProps<T>
) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const handleSelectOpen = (event: React.SyntheticEvent<Element, Event>) => {
    setIsSelectOpen(true);
    setIsTooltipOpen(false);
    onOpen && onOpen(event);
  };

  const handleSelectClose = (event: React.SyntheticEvent<Element, Event>) => {
    setIsSelectOpen(false);
    onClose && onClose(event);
  };

  const handleSelectChange = (event: SelectChangeEvent<T>, child: React.ReactNode) => {
    setIsTooltipOpen(false);
    onChange && onChange(event as SelectChangeEvent<T>, child);
  };

  const handleMouseEnter = () => {
    if (!isSelectOpen) {
      setIsTooltipOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setIsTooltipOpen(false);
  };

  const selectId = restSelectProps.id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const inputLabelId = restSelectProps['aria-labelledby'] || `${selectId}-label`;

  return (
    <Tooltip
      title={tooltipTitle}
      open={isTooltipOpen}
      placement={tooltipPlacement}
    >
      <FormControl
        sx={{ m: 1, minWidth: 120 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label && <InputLabel id={inputLabelId}>{label}</InputLabel>}
        <Select<T>
          labelId={inputLabelId}
          value={value}
          onChange={handleSelectChange}
          onOpen={handleSelectOpen}
          onClose={handleSelectClose}
          label={label}
          {...restSelectProps}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
};

export default TooltipSelect;