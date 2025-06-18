import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface ImageFromUint8ArrayProps {
  photoUint8Array: Uint8Array | null;
  imageMimeType?: string;
}

// не используется

const ImageFromUint8Array: React.FC<ImageFromUint8ArrayProps> = ({
  photoUint8Array,
  imageMimeType = 'image/png',
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (photoUint8Array) {
        if (!(photoUint8Array instanceof Uint8Array)) {
            throw new Error("photoUint8Array должен быть Uint8Array");
        }
        const hexString2 = [...photoUint8Array].map((byte: number) => byte.toString(16).padStart(2, '0')).join(' ');
        console.log("Создание URL для изображения из Uint8Array")
        console.log(hexString2)
        const blob = new Blob([photoUint8Array], { type: imageMimeType });
        const url = URL.createObjectURL(blob);
        console.log('Создан URL для изображения:', url);
        setImageUrl(url);

        // Функция очистки будет вызвана перед следующим запуском useEffect
        // (если изменится photoUint8Array или imageMimeType)
        // или при размонтировании компонента.
        return () => {
            URL.revokeObjectURL(url);
        };
    } else {
        // Если photoUint8Array становится null и у нас есть старый URL,
        // мы должны его отозвать.
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageUrl(null); // Важно установить в null, чтобы UI обновился
    }
  }, [photoUint8Array, imageMimeType]);

  return (
    <Card sx={{ maxWidth: 345 }}>
      {imageUrl ? (
        <CardMedia
          component="img"
          height="140"
          image={imageUrl}
          alt="Фотография из Uint8Array"
        />
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Загрузка изображения...
        </Typography>
      )}
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Моя фотография
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Это изображение было загружено как Uint8Array.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ImageFromUint8Array;