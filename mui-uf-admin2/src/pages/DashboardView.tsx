// yarn add react-responsive-carousel @mui/material @mui/system react react-dom
import React from 'react';
import Typography from '@mui/material/Typography';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
// Импортируем Grid из @mui/material
import { Box, Grid } from '@mui/material';
import './DashboardView.css'; // Убедитесь, что стили не конфликтуют с Grid
import VideoPlayer from '../components/VideoPlayer';

const images = [
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

const DashboardView: React.FC = () => {
  return (
    // Используем Box как основной контейнер страницы для отступов
    <Box sx={{ padding: 2 }}> {/* Добавим немного отступов */}
      <Typography variant="h4" gutterBottom>Панель управления</Typography>
      <Typography variant="body1" gutterBottom>Добро пожаловать на панель управления!</Typography>

      {/* Используем Grid контейнер */}
      {/* spacing={2} добавляет отступы между элементами сетки */}
      <Grid container spacing={2} sx={{ marginTop: '20px' }}>

        {/* Первый элемент сетки (например, для видео) */}
        {/* xs={12} - на маленьких экранах занимает всю ширину */}
        {/* md={6} - на средних и больших экранах занимает половину ширины (6 из 12 колонок) */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Видео 1</Typography>
          {/* Обернем видео в Box для возможного дополнительного стайлинга */}
          <Box sx={{ maxWidth: '100%', height: 'auto' }}>
             {/* Лучше использовать относительные пути или переменные окружения для путей к файлам */}
            <video src="/Google_Mio_SizzleGIF_3840x2160.mp4" autoPlay loop muted width="100%"  />
             {/* Добавил muted, чтобы видео не начинало играть со звуком автоматически */}
             {/* Установил width="100%", чтобы видео адаптировалось к ширине колонки */}
          </Box>
           <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Видео 2</Typography>
           <Box sx={{ maxWidth: '100%', height: 'auto' }}>
            {/* <video src="/Google_Mio_SizzleGIF_3840x2160.mp4" autoPlay loop muted width="100%" /> */}
            <VideoPlayer
              src="/Google_Mio_SizzleGIF_3840x2160.mp4"
              autoPlay
              loop
              muted
              width="100%"
              playbackRate={1.5} // <-- Передаем состояние скорости как проп
            />
          </Box>
        </Grid>

        {/* Второй элемент сетки (для карусели) */}
        <Grid item xs={12} md={6}>
           <Typography variant="h6" gutterBottom>Галерея</Typography>
          <Carousel
            axis='vertical'
            infiniteLoop={true}
            showThumbs={false} // Можно скрыть миниатюры для вертикальной карусели
            // Убрал className="half-screen-carousel", т.к. размер теперь контролируется Grid
            // Возможно, понадобятся стили для высоты карусели
            // style={{ height: '500px' }} // Пример задания высоты
          >
            {images.map((image, index) => (
              // Убедитесь, что у div нет стилей, мешающих отображению
              <div key={index}>
                {/* Добавим стиль для адаптивности изображения внутри карусели */}
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  // className="carousel-image" // Этот класс может быть не нужен или требовать адаптации
                  style={{ width: '100%', height: 'auto', display: 'block' }} // Адаптивное изображение
                />
              </div>
            ))}
          </Carousel>
        </Grid>

        {/* Сюда можно добавлять другие виджеты как <Grid item> */}
        {/* <Grid item xs={12} md={4}> */}
        {/*   <Typography variant="h6">Другой виджет</Typography> */}
        {/*   <Box sx={{ border: '1px dashed grey', padding: 2, minHeight: 100 }}> */}
        {/*     Содержимое виджета */}
        {/*   </Box> */}
        {/* </Grid> */}

      </Grid>
    </Box>
  );
};

export default DashboardView;
