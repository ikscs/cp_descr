import * as React from 'react';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import locales, { LocaleKey } from './locales';

interface LocalizedGridProps extends DataGridProps {
  lang: LocaleKey;
}

export default function LocalizedGrid({ lang = 'uk', ...rest }: LocalizedGridProps) {
  const selectedLocale = locales[lang];

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      // Используем локаль для LocalizationProvider
      // localeText={selectedLocale.localizationProvider.components.MuiLocalizationProvider.localeText}
      localeText={selectedLocale.localizationProvider.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          {...rest}
          // Используем локаль для DataGrid
          localeText={selectedLocale.dataGrid.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[5, 10]}
        />
      </div>
    </LocalizationProvider>
  );
}