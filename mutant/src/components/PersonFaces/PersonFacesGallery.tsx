import React, { useState, useEffect, useCallback } from 'react';
import { PersonFace } from './personFace.types';
import { api, uint8ArrayToBase64_ as uint8ArrayToBase64 } from './personFaceApi';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Button,
  Modal,
  Backdrop,
  Fade,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import { GridCheckCircleIcon } from '@mui/x-data-grid';
// import ImageFromUint8Array from './__ImageFromUint8Array';

// Стили для модального окна
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'auto',
  maxWidth: '90vw',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  outline: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

interface PersonFacesGalleryProps {
  personId: number;
  columns?: number; // Количество колонок, по умолчанию 4
}

const PersonFacesGallery: React.FC<PersonFacesGalleryProps> = ({
  personId,
  columns = 4,
}) => {
  const [faces, setFaces] = useState<PersonFace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFaces, setSelectedFaces] = useState<Set<string>>(new Set());
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Ссылка на input для файла
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Функция, которая будет вызвана при клике на кнопку "Добавить лицо"
  // const handleAddFaceClick = () => {
  //   // Программно "кликаем" по скрытому input для выбора файла
  //   fileInputRef.current?.click();
  // };
  
  // --- Загрузка данных ---
  const fetchFaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(personId); // getFacesByPersonId
      setFaces(data);
    } catch (err) {
      setError('Не удалось загрузить лица. Пожалуйста, попробуйте еще раз.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchFaces();
  }, [fetchFaces]);

  // --- Обработчики выбора лиц ---
  const handleSelectFace = (faceUuid: string, isChecked: boolean) => {
    setSelectedFaces(prev => {
      const newSelection = new Set(prev);
      if (isChecked) {
        newSelection.add(faceUuid);
      } else {
        newSelection.delete(faceUuid);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedFaces.size === faces.length && faces.length > 0) {
      setSelectedFaces(new Set()); // Снять выбор со всех
    } else {
      setSelectedFaces(new Set(faces.map(face => face.faceUuid))); // Выбрать все
    }
  };

  const handleMarkAsMain = async () => {
    if (selectedFaces.size !== 1) {
      alert('Пожалуйста, выберите одно лицо для установки в качестве главного.');
      return;
    }

    let sortord = 2
    const faceUuid = Array.from(selectedFaces)[0];
    const updatedFaces = faces.map(face => (
      face.faceUuid === faceUuid 
      ? { ...face, sortord: 1 } 
      : { ...face, sortord: sortord++ }
    ));

    const patch = async (face: PersonFace) => {
        await api.patchSortord(face.faceUuid, face.sortord?? 0);
    }

    try {
      setLoading(true);
      updatedFaces.map(face => {
        patch(face);
      });
      // Обновляем список лиц после установки главного
      await fetchFaces();
      setSelectedFaces(new Set()); // Сбрасываем выбор
    } catch (err) {
      setError('Не удалось установить главное лицо.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения файла (вызывается после выбора файла)
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return; // Пользователь ничего не выбрал
    }

    const file = files[0]; // Берем первый выбранный файл

    try {
      setLoading(true);
      setError(null); // Сбрасываем предыдущие ошибки

      // Читаем файл как ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const photoUint8Array = new Uint8Array(arrayBuffer);

      const addedFace = await api.add({
        faceUuid: window.crypto.randomUUID(),
        personId,
        photo: photoUint8Array,
        comment: 'Загруженное фото',
        embedding: [],
      });

      setFaces(prev => [...prev, addedFace]);
      setLoading(false);
    } catch (err) {
      setError('Не удалось добавить лицо.');
      console.error(err);
      setLoading(false);
    } finally {
      // Очищаем выбранный файл после обработки
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // --- Обработчик добавления ---
  const handleAddFace = async () => {
    // Программно "кликаем" по скрытому input для выбора файла
    fileInputRef.current?.click();
    return
    
    const newComment = prompt('Введите комментарий для нового лица:');
    if (newComment === null) return; // Пользователь отменил ввод

    // Создаем фиктивное изображение (например, 1x1 прозрачный пиксель)
    // const dummyPhoto = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));

    // try {
    //   setLoading(true);
    //   const addedFace = await mockApi.addFace({
    //     personId,
    //     photo: dummyPhoto,
    //     comment: newComment || 'Новое лицо',
    //     embedding: [],
    //   });
    //   setFaces(prev => [...prev, addedFace]);
    //   setLoading(false);
    // } catch (err) {
    //   setError('Не удалось добавить лицо.');
    //   console.error(err);
    //   setLoading(false);
    // }
  };

  // --- Обработчик удаления ---
  const handleDeleteSelected = async () => {
    if (selectedFaces.size === 0) {
      alert('Пожалуйста, выберите лица для удаления.');
      return;
    }
    if (!window.confirm(`Вы уверены, что хотите удалить выбранные лица (${selectedFaces.size})?`)) {
      return;
    }

    try {
      setLoading(true);
      // await mockApi.deleteFaces(Array.from(selectedFaces));
      await api.deleteFaces(Array.from(selectedFaces));
      setSelectedFaces(new Set()); // Сбросить выбор
      await fetchFaces(); // Обновить список лиц
    } catch (err) {
      setError('Не удалось удалить лица.');
      console.error(err);
      setLoading(false);
    }
  };

  // --- Модальное окно для большого изображения ---
  const handleOpenModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedImage(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* <Typography variant="h4" component="h1" gutterBottom align="center">
        Лица человека (ID: {personId})
      </Typography> */}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={handleAddFace}
          disabled={loading}
        >
          {loading ? 'Загрузка фото...' : 'Добавить фото'}
        </Button>
        {/* Скрытый input для загрузки файла */}
        <input
          type="file"
          accept="image/*" // Принимать только изображения
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteSelected}
          disabled={selectedFaces.size === 0 || loading}
        >
          Удалить выбранные ({selectedFaces.size})
        </Button>
        <Button
          variant="outlined"
          startIcon={selectedFaces.size === faces.length && faces.length > 0 ? <DeselectIcon /> : <SelectAllIcon />}
          onClick={handleSelectAll}
          disabled={loading || faces.length === 0}
        >
          {selectedFaces.size === faces.length && faces.length > 0 ? 'Отменить все' : 'Выбрать все'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<GridCheckCircleIcon />}
          onClick={handleMarkAsMain}
          disabled={selectedFaces.size !== 1 || loading}
        >
          Главное фото
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Загрузка...</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" align="center" variant="h6">
          {error}
        </Typography>
      )}

      {!loading && !error && faces.length === 0 && (
        <Typography variant="h6" align="center" color="text.secondary">
          Нет лиц для отображения
        </Typography>
      )}

      {!loading && !error && faces.length > 0 && (
        <Grid container spacing={3} justifyContent="center">
          {faces.map((face) => {
            const imageUrl = uint8ArrayToBase64(face.photo);
            const isSelected = selectedFaces.has(face.faceUuid);
            return (
              <Grid item key={face.faceUuid} xs={12} sm={6} md={12 / columns} lg={12 / columns}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxShadow: isSelected ? '0 0 0 3px blue' : 'none', // Выделение
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectFace(face.faceUuid, e.target.checked)}
                        sx={{ position: 'relative', top: 5, right: 5, zIndex: 1 }}
                      />
                    }
                    label=""
                    sx={{ m: 0, p: 0 }} // Убрать лишние отступы
                  />
                  <Box
                    sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
                    onClick={() => handleOpenModal(imageUrl)}
                  >
                    <CardMedia
                      component="img"
                      image={imageUrl}
                      alt={face.comment || `Face ${face.faceUuid}`}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain', // Масштабирование изображения
                        cursor: 'pointer',
                        maxHeight: 200, // Ограничение высоты карточки
                      }}
                    />
                    {/* <ImageFromUint8Array
                        photoUint8Array={face.photo}
                        imageMimeType='image/png'
                    /> */}
                  </Box>
                  <CardContent sx={{ flexShrink: 0 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {face.comment + ' ' + face.sortord || 'Без комментария'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Модальное окно для большого изображения */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Большое изображение лица"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            )}
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                },
              }}
            >
              X {/* Можно использовать иконку CloseIcon от Material-UI */}
            </IconButton>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default PersonFacesGallery;