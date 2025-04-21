// yarn add react-responsive-carousel @mui/material @mui/system react react-dom
import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Box, Grid, CircularProgress, Alert } from '@mui/material'; // Добавили CircularProgress и Alert
import './DashboardView.css';
import VideoPlayer from '../components/VideoPlayer';
import { ParsedReport, ReportToParsedReport } from './Reports/ReportList';
import { getReports, /*Report*/ } from '../api/data/reportTools';
import MiniReport from './Reports/MiniReport';

const images = [
    // ... (оставляем массив images как есть) ...
    'https://picsum.photos/640/480?random=111',
    'https://loremflickr.com/640/480?random=1111',
    'https://picsum.photos/640/480?random=2233',
    'https://loremflickr.com/640/480?random=3344',
    'https://picsum.photos/640/480?random=22331',
    'https://loremflickr.com/640/480?random=4455',
    'https://picsum.photos/640/480?random=22332',
    'https://loremflickr.com/640/480?random=5665',
    'https://picsum.photos/640/480?random=22333',
    'https://loremflickr.com/640/480?random=6677',
    'https://picsum.photos/640/480?random=22334',
    'https://loremflickr.com/640/480?random=7887',
    'https://picsum.photos/640/480?random=22335',
    'https://loremflickr.com/640/480?random=8998',
    'https://picsum.photos/640/480?random=22336',
    'https://loremflickr.com/640/480?random=9009',
    'https://picsum.photos/640/480?random=22337',
    'https://loremflickr.com/640/480?random=10110',
];

// Определим ID отчетов, которые хотим загрузить
const REPORT_ID_7 = 7;
const REPORT_ID_17 = 17;

const DashboardView: React.FC = () => {
    // Состояния для каждого отчета
    const [parsedReport7, setParsedReport7] = useState<ParsedReport | null>(null);
    const [parsedReport17, setParsedReport17] = useState<ParsedReport | null>(null);

    // Общие состояния загрузки и ошибок
    const [isLoading, setIsLoading] = useState<boolean>(true); // Начинаем с true
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        // Функция для загрузки одного отчета по ID
        const loadSingleReport = async (rid: number): Promise<ParsedReport> => {
            const fetchedReports = await getReports(rid);
            if (!fetchedReports || fetchedReports.length === 0) {
                throw new Error(`Отчет с ID ${rid} не найден.`);
            }
            // Возвращаем *распарсенный* отчет
            return ReportToParsedReport(fetchedReports[0]);
        };

        // Асинхронная функция для загрузки всех необходимых отчетов
        const loadAllReports = async () => {
            setIsLoading(true);
            setFetchError(null); // Сбрасываем ошибку перед новой загрузкой

            try {
                // Используем Promise.allSettled для выполнения всех запросов параллельно
                // и получения результата каждого (успех или ошибка)
                const results = await Promise.allSettled([
                    loadSingleReport(REPORT_ID_7),
                    loadSingleReport(REPORT_ID_17),
                    // Добавьте сюда другие вызовы loadSingleReport, если нужно больше отчетов
                ]);

                // Обрабатываем результаты
                let firstError: string | null = null;

                if (results[0].status === 'fulfilled') {
                    setParsedReport7(results[0].value);
                } else {
                    console.error(`Ошибка загрузки отчета ${REPORT_ID_7}:`, results[0].reason);
                    if (!firstError) firstError = `Ошибка загрузки отчета ${REPORT_ID_7}: ${results[0].reason?.message || results[0].reason}`;
                }

                if (results[1].status === 'fulfilled') {
                    setParsedReport17(results[1].value);
                } else {
                    console.error(`Ошибка загрузки отчета ${REPORT_ID_17}:`, results[1].reason);
                    if (!firstError) firstError = `Ошибка загрузки отчета ${REPORT_ID_17}: ${results[1].reason?.message || results[1].reason}`;
                }

                // Устанавливаем первую возникшую ошибку
                if (firstError) {
                    setFetchError(firstError);
                }

            } catch (err: any) {
                // Эта ошибка маловероятна при использовании allSettled, но оставим на всякий случай
                console.error('Непредвиденная ошибка при загрузке отчетов:', err);
                setFetchError(err.message || 'Произошла неизвестная ошибка');
            } finally {
                setIsLoading(false); // Завершаем загрузку в любом случае
            }
        };

        loadAllReports(); // Запускаем загрузку при монтировании
    }, []); // Пустой массив зависимостей - выполнить один раз

    // Параметры для отчета 17 (пример)
    const reportParams7 = [
      { name: 'd1', value: '2025-01-01' },
      { name: 'd2', value: '2025-12-31' },
      { name: 'crn', value: 'EUR' },
  ];
  const reportParams17_1 = [
    { name: 'd1', value: '2025-01-01' },
    { name: 'd2', value: '2025-12-31' },
    { name: 'crn', value: 'EUR' },
];
const reportParams17_2 = [
        { name: 'd1', value: '2025-04-01' },
        { name: 'd2', value: '2025-12-31' },
        { name: 'crn', value: 'EUR' },
    ];

    // Параметры для отчета 7 (пример, если они нужны)
    // const reportParams7 = [ { name: 'someParam', value: 'someValue' } ];

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>Панель управления</Typography>
            <Typography variant="body1" gutterBottom>Добро пожаловать на панель управления!</Typography>

            {/* Отображение состояния загрузки или ошибки */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Загрузка данных отчетов...</Typography>
                </Box>
            )}
            {fetchError && !isLoading && ( // Показываем ошибку только если не идет загрузка
                <Alert severity="error" sx={{ my: 2 }}>{fetchError}</Alert>
            )}

            {/* Секция с отчетами */}
            {!isLoading && !fetchError && ( // Показываем отчеты только если нет загрузки и ошибок
                <Grid container spacing={3} sx={{ my: 2 }}>
                    {/* Отчет 7 */}
                    {parsedReport7 && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>{parsedReport7.name || `Отчет ID ${REPORT_ID_7}`}</Typography>
                            <MiniReport
                                report={parsedReport7}
                                // parameters={reportParams7} // Используйте нужные параметры
                                parameters={reportParams7} 
                                displayMode="chart"
                                height="300px"
                            />
                        </Grid>
                    )}

                    {/* Отчет 17 - Таблица */}
                    {parsedReport17 && (
                        <Grid item xs={12} md={6}>
                             <Typography variant="h6" gutterBottom>{parsedReport17.name || `Отчет ID ${REPORT_ID_17}`} (Таблица)</Typography>
                            <MiniReport
                                report={parsedReport17}
                                parameters={reportParams17_1}
                                displayMode="table"
                                height="300px"
                            />
                        </Grid>
                    )}

                     {/* Отчет 17 - График */}
                     {parsedReport17 && (
                        <Grid item xs={12} md={6}>
                             <Typography variant="h6" gutterBottom>{parsedReport17.name || `Отчет ID ${REPORT_ID_17}`} (График)</Typography>
                            <MiniReport
                                report={parsedReport17}
                                parameters={reportParams17_2}
                                displayMode="chart"
                                height="400px"
                            />
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Секция с видео и галереей (остается как была) */}
            <Grid container spacing={2} sx={{ marginTop: '20px' }}>
                {/* Видео */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Видео 1</Typography>
                    <Box sx={{ maxWidth: '100%', height: 'auto' }}>
                        <video src="/Google_Mio_SizzleGIF_3840x2160.mp4" autoPlay loop muted width="100%" />
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Видео 2</Typography>
                    <Box sx={{ maxWidth: '100%', height: 'auto' }}>
                        <VideoPlayer
                            src="/Google_Mio_SizzleGIF_3840x2160.mp4"
                            autoPlay
                            loop
                            muted
                            width="100%"
                            playbackRate={1.5}
                        />
                    </Box>
                </Grid>

                {/* Галерея */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Галерея</Typography>
                    <Carousel
                        axis='vertical'
                        infiniteLoop={true}
                        showThumbs={false}
                    >
                        {images.map((image, index) => (
                            <div key={index}>
                                <img
                                    src={image}
                                    alt={`Image ${index + 1}`}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </div>
                        ))}
                    </Carousel>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardView;
