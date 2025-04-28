// d:\dvl\ikscs\react\vp-descr\mui-uf-admin2\src\pages\DashboardView.tsx
// yarn add react-responsive-carousel @mui/material @mui/system react react-dom
import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Box, Grid, CircularProgress, Alert, Button, Stack } from '@mui/material';
import './DashboardView.css';
import VideoPlayer from '../components/VideoPlayer';
import { ParsedReport, ReportToParsedReport } from './Reports/ReportList';
import { getReports, /*Report*/ } from '../api/data/reportTools';
import MiniReport from './Reports/MiniReport';
import { dataToExcel } from '../api/tools/dataToExcel'; // <-- Уточните путь!
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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
const REPORT_ID_22 = 25; // Відвідувачі
const REPORT_ID_23 = 27; // Відвідувачі - Стать
const REPORT_ID_24 = 26; // Відвідувачі - Вік

// --- Константа для имени таблицы экспорта ---
const EXPORT_TABLE_NAME = 'pcnt.v_export'; // Имя таблицы для экспорта данных

// Определим возможные значения для mode
type ReportMode = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

// Определим тип для параметра отчета
type ReportParameter = {
    name: string;
    value: string | number | boolean;
};

const DashboardView: React.FC = () => {
    // Состояния для каждого отчета
    const [parsedReport22, setParsedReport22] = useState<ParsedReport | null>(null);
    const [parsedReport23, setParsedReport23] = useState<ParsedReport | null>(null);
    const [parsedReport24, setParsedReport24] = useState<ParsedReport | null>(null);

    // Состояние для параметров отчетов
    const [reportParams, setReportParams] = useState<ReportParameter[]>([
        { name: 'd1', value: '' },
        { name: 'd2', value: '' },
        { name: 'mode', value: 'MONTH' },
    ]);

    // Общие состояния загрузки и ошибок
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    // --- Состояние для индикации процесса экспорта ---
    const [isExporting, setIsExporting] = useState<boolean>(false);

    useEffect(() => {
        // Функция для загрузки одного отчета по ID
        const loadSingleReport = async (rid: number): Promise<ParsedReport> => {
            const fetchedReports = await getReports(rid);
            if (!fetchedReports || fetchedReports.length === 0) {
                throw new Error(`Звіт з ID ${rid} не знайдено.`);
            }
            return ReportToParsedReport(fetchedReports[0]);
        };

        // Асинхронная функция для загрузки всех необходимых отчетов
        const loadAllReports = async () => {
            setIsLoading(true);
            setFetchError(null);

            try {
                const results = await Promise.allSettled([
                    loadSingleReport(REPORT_ID_22),
                    loadSingleReport(REPORT_ID_23),
                    loadSingleReport(REPORT_ID_24),
                ]);

                let firstError: string | null = null;
                const handleResult = (
                    result: PromiseSettledResult<ParsedReport>,
                    setter: React.Dispatch<React.SetStateAction<ParsedReport | null>>,
                    reportId: number
                ) => {
                    if (result.status === 'fulfilled') {
                        setter(result.value);
                    } else {
                        const errorMsg = `Помилка завантаження звіту ${reportId}: ${result.reason?.message || result.reason}`;
                        console.error(errorMsg, result.reason);
                        if (!firstError) firstError = errorMsg;
                    }
                };

                handleResult(results[0], setParsedReport22, REPORT_ID_22);
                handleResult(results[1], setParsedReport23, REPORT_ID_23);
                handleResult(results[2], setParsedReport24, REPORT_ID_24);

                if (firstError) {
                    setFetchError(firstError);
                }

            } catch (err: any) {
                console.error('Непередбачена помилка під час завантаження звітів:', err);
                setFetchError(err.message || 'Сталася невідома помилка');
            } finally {
                setIsLoading(false);
            }
        };

        loadAllReports();
    }, []);

    // Обработчик изменения режима (Неделя/Месяц/Год)
    const handleModeChange = (newMode: ReportMode) => {
        setReportParams(currentParams =>
            currentParams.map(param =>
                param.name === 'mode'
                    ? { ...param, value: newMode }
                    : param
            )
        );
    };

    // --- Упрощенный обработчик для кнопки Экспорт ---
    const handleExport = async () => {
        setIsExporting(true); // Начинаем экспорт
        console.log(`Exporting data from table: ${EXPORT_TABLE_NAME}`);

        // Простое имя файла, основанное только на имени таблицы
        const filename = `export_${EXPORT_TABLE_NAME}`;

        try {
            // Вызываем dataToExcel без параметров фильтрации (where)
            await dataToExcel(
                EXPORT_TABLE_NAME,
                filename // Имя файла без расширения
                // Поля по умолчанию '*'
                // where не передаем
                // order не передаем
            );
            console.log('Export successful');
            // Можно добавить уведомление об успехе
        } catch (error) {
            console.error('Export failed:', error);
            // Можно добавить уведомление об ошибке
        } finally {
            setIsExporting(false); // Завершаем экспорт (даже если была ошибка)
        }
    };

    // Получаем текущее значение mode для выделения активной кнопки
    const currentMode = reportParams.find(p => p.name === 'mode')?.value;

    return (
        <Box sx={{ padding: 2 }}>
            {/* Заголовок и кнопка Экспорт были здесь, теперь кнопка перенесена ниже */}
            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}> ... </Box> */}

            {/* Отображение состояния загрузки или ошибки */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Завантаження даних звітів...</Typography>
                </Box>
            )}
            {fetchError && !isLoading && (
                <Alert severity="error" sx={{ my: 2 }}>{fetchError}</Alert>
            )}

            {/* Кнопки управления режимом И Кнопка Экспорт в одной строке */}
            {!isLoading && !fetchError && (
                <Stack
                    direction="row"
                    spacing={2} // Spacing для элементов внутри Stack (если их несколько в потоке)
                    sx={{
                        my: 2,
                        justifyContent: 'center', // Центрируем основной контент (кнопки режима)
                        alignItems: 'center',
                        width: '100%',
                        position: 'relative', // Делаем Stack относительным для позиционирования кнопки Экспорт
                    }}
                >
                    {/* Кнопки режима теперь центрируются относительно всей ширины Stack */}
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant={currentMode === 'DAY' ? 'contained' : 'outlined'}
                            onClick={() => handleModeChange('DAY')}
                        >
                            День
                        </Button>
                        <Button
                            variant={currentMode === 'WEEK' ? 'contained' : 'outlined'}
                            onClick={() => handleModeChange('WEEK')}
                        >
                            Тиждень
                        </Button>
                        <Button
                            variant={currentMode === 'MONTH' ? 'contained' : 'outlined'}
                            onClick={() => handleModeChange('MONTH')}
                        >
                            Місяць
                        </Button>
                        <Button
                            variant={currentMode === 'YEAR' ? 'contained' : 'outlined'}
                            onClick={() => handleModeChange('YEAR')}
                        >
                            Рік
                        </Button>
                    </Stack>

                    {/* Кнопка Экспорт - абсолютно позиционирована */}
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleExport}
                        disabled={isExporting}
                        startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                        sx={{
                            position: 'absolute', // Абсолютное позиционирование
                            right: 0, // Прижимаем к правому краю родительского Stack
                            // top: '50%', // Вертикально по центру относительно Stack
                            // transform: 'translateY(-50%)' // Коррекция для точного центрирования по вертикали
                        }}
                    >
                        {isExporting ? 'Экспорт...' : 'Експорт в Excel'}
                    </Button>
                </Stack>
            )}


            {/* Секция с отчетами spacing={0} */}
            {!isLoading && !fetchError && (
                <Grid container spacing={0} sx={{ my: 2 }}>
                    {/* Отчет 22: Відвідувачі */}
                    {parsedReport22 && (
                        <Grid item xs={12} md={12}>
                            <MiniReport
                                report={parsedReport22}
                                parameters={reportParams}
                                displayMode="chart"
                                height="300px"
                            />
                        </Grid>
                    )}

                    {/* Отчет 24: Відвідувачі - Вік */}
                    {parsedReport24 && (
                        <Grid item xs={12} md={6}>
                            <MiniReport
                                report={parsedReport24}
                                parameters={reportParams}
                                displayMode="chart"
                                height="250px"
                            />
                        </Grid>
                    )}

                     {/* Отчет 23: Відвідувачі - Стать */}
                     {parsedReport23 && (
                        <Grid item xs={12} md={6}>
                            <MiniReport
                                report={parsedReport23}
                                parameters={reportParams}
                                displayMode="chart"
                                height="250px"
                            />
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Секция с видео и галереей (остается как была, но скрыта через false) */}
            {false && (
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
            )}
        </Box>
    );
};

export default DashboardView;
