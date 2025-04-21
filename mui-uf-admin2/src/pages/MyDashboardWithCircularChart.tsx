// Пример компонента, который использует CircularChart напрямую

import React from 'react';
import CircularChart from './Charts/CircularChart';
import { Box, Typography } from '@mui/material';

const MyDashboardWithCircularChart: React.FC = () => {

    // 1. Определяем тестовые данные для круговой диаграммы
    const sampleLabels = ['Продукт А', 'Продукт Б', 'Продукт В', 'Продукт Г', 'Продукт Д'];
    const sampleData = [350, 120, 280, 90, 150];
    const sampleData2 = [50, 20, 280, 90, 150];

    // 2. Формируем структуру datasets (обычно один для круговой диаграммы)
    const sampleDatasets = [
        {
            label: 'Объем продаж', // Этот label может отображаться в легенде или тултипах
            data: sampleData,
            // Можно задать цвета явно, или компонент использует свои по умолчанию
            // backgroundColor: [
            //   'rgba(255, 99, 132, 0.7)',
            //   'rgba(54, 162, 235, 0.7)',
            //   'rgba(255, 206, 86, 0.7)',
            //   'rgba(75, 192, 192, 0.7)',
            //   'rgba(153, 102, 255, 0.7)',
            // ],
            // borderColor: [
            //   'rgba(255, 99, 132, 1)',
            //   'rgba(54, 162, 235, 1)',
            //   'rgba(255, 206, 86, 1)',
            //   'rgba(75, 192, 192, 1)',
            //   'rgba(153, 102, 255, 1)',
            // ],
            // borderWidth: 1,
        },
        {
            label: 'Объем продаж 2',
            data: sampleData2,
        }
    ];

    // 3. Определяем обработчики для кнопок (заглушки для примера)
    const handleCloseChart = () => {
        console.log('Нажата кнопка закрытия графика');
        // Здесь может быть логика скрытия графика или навигации
    };

    const handleReopenParams = () => {
        console.log('Нажата кнопка изменения параметров');
        // Здесь может быть логика открытия диалога с параметрами
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom>
                Пример круговой диаграммы
            </Typography>

            {/* Контейнер для графика с заданной высотой */}
            <Box sx={{ height: '450px', width: '100%', maxWidth: '600px', margin: 'auto' }}>
                <CircularChart
                    reportName="Продажи по продуктам"
                    labels={sampleLabels}
                    datasets={sampleDatasets}
                    onClose={handleCloseChart}
                    onReopenParamDialog={handleReopenParams}
                />
            </Box>

            {/* Можно добавить еще контент на страницу */}
            <Typography sx={{ marginTop: 2 }}>
                Другое содержимое дашборда...
            </Typography>
        </Box>
    );
};

export default MyDashboardWithCircularChart;

