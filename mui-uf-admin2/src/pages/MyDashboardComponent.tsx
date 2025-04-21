import React from 'react';
import MiniReport from './Reports/MiniReport'; // Убедитесь, что путь правильный
import { ParsedReport } from './Reports/ReportList'; // Импортируем тип
import { Typography } from '@mui/material';

// Пример компонента, где используется MiniReport
const MyDashboardComponent: React.FC = () => {

    // 1. Определяем тестовые данные для отчета (ParsedReport)
    const sampleReportDefinition: ParsedReport = {
        id: 101, // Уникальный ID отчета
        name: 'Пример отчета: Продажи по месяцам',
        description: 'Показывает данные о продажах за определенный период.',
        query: 'SELECT month_name, sales_total, units_sold FROM monthly_sales WHERE year = :year AND region = :region', // Пример SQL-запроса (не используется напрямую в MiniReport, но является частью структуры)
        config: {
            // Параметры, которые ожидает отчет (не используются в MiniReport напрямую, но нужны для структуры)
            params: [
                { name: 'year', description: 'Год', type: 'number', notNull: true, defaultValue: 2024 },
                { name: 'region', description: 'Регион', type: 'string', notNull: false, defaultValue: 'All' }
            ],
            // Конфигурация колонок (не используется в MiniReport напрямую)
            columns: [
                { field: 'month_name', width: 120 },
                { field: 'sales_total', width: 100 },
                { field: 'units_sold', width: 100 }
            ],
            // Конфигурация для графика (важно для displayMode='chart')
            chart: {
                type: 'linear', // Тип графика (должен соответствовать используемому компоненту, например LineChart)
                x_axis: { field: 'month_name' }, // Поле из результата запроса для оси X
                y_axis: { field: 'Объем продаж,Продано штук' }, // Заголовки для линий (через запятую), если их несколько
                body_fields: ['sales_total', 'units_sold'] // Поля из результата запроса для данных (ось Y)
            }
        }
    };

    // 2. Определяем параметры, с которыми нужно выполнить отчет
    const reportParameters = [
        { name: 'year', value: 2024 },
        { name: 'region', value: 'North' }
    ];

    return (
        <div>
            <h2>Мини-отчеты на панели</h2>

            {/* Пример 1: Отображение в виде таблицы */}
            <div style={{ marginBottom: '20px' }}>
                <Typography variant="h6">Отчет в виде таблицы</Typography>
                <MiniReport
                    report={sampleReportDefinition}
                    parameters={reportParameters}
                    displayMode="table"
                    height="250px" // Задаем фиксированную высоту
                />
            </div>

            {/* Пример 2: Отображение в виде графика */}
            <div>
                <Typography variant="h6">Отчет в виде графика</Typography>
                <MiniReport
                    report={sampleReportDefinition}
                    parameters={reportParameters}
                    displayMode="chart"
                    height="300px" // Задаем фиксированную высоту
                />
            </div>

             {/* Пример 3: Другой отчет или те же данные с другими параметрами */}
             <div style={{ marginTop: '20px' }}>
                <Typography variant="h6">Отчет с другими параметрами (таблица)</Typography>
                <MiniReport
                    report={sampleReportDefinition} // Можно использовать то же определение
                    parameters={[ { name: 'year', value: 2023 }, { name: 'region', value: 'South' } ]} // Другие параметры
                    displayMode="table"
                    height="200px"
                />
            </div>
        </div>
    );
};

export default MyDashboardComponent;
