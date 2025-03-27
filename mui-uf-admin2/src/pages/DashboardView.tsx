// yarn add react-responsive-carousel
import React from 'react';
import Typography from '@mui/material/Typography';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Box } from '@mui/system';
import './DashboardView.css';

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
    <div>
      <Typography variant="h4">Панель управления</Typography>
      <Typography variant="body1">Добро пожаловать на панель управления!</Typography>
      <Box sx={{ marginTop: '20px' }}>
      <video src="/Google_Mio_SizzleGIF_3840x2160.mp4" autoPlay loop width="640" height="360" />
      <video src="/Google_Mio_SizzleGIF_3840x2160.mp4" autoPlay loop width="640" height="360" />
      </Box>
      <Carousel
        axis='vertical'
        infiniteLoop={true}
        className="half-screen-carousel"
      >
        {images.map((image, index) => (
          <div key={index}>
            <img src={image} alt={`Image ${index + 1}`} className="carousel-image" />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default DashboardView;