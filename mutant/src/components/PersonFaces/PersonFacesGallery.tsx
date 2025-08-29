import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const [faces, setFaces] = useState<PersonFace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFaces, setSelectedFaces] = useState<Set<string>>(new Set());
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // --- Загрузка данных ---
  const fetchFaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(personId); // getFacesByPersonId
      setFaces(data);
    } catch (err) {
      setError(t('PersonFacesGallery.Error.FetchFaces'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [personId, t]);

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
      setSelectedFaces(new Set());
    } else {
      setSelectedFaces(new Set(faces.map(face => face.faceUuid)));
    }
  };

  const handleMarkAsMain = async () => {
    if (selectedFaces.size !== 1) {
      alert(t('PersonFacesGallery.Alert.SelectOneFace'));
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
      await fetchFaces();
      setSelectedFaces(new Set());
    } catch (err) {
      setError(t('PersonFacesGallery.Error.SetMainFace'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    try {
      setLoading(true);
      setError(null);
      const arrayBuffer = await file.arrayBuffer();
      const photoUint8Array = new Uint8Array(arrayBuffer);

      const addedFace = await api.add({
        faceUuid: window.crypto.randomUUID(),
        personId,
        photo: photoUint8Array,
        comment: t('PersonFacesGallery.Comment.UploadedPhoto'),
        embedding: [],
      });

      setFaces(prev => [...prev, addedFace]);
      setLoading(false);
    } catch (err) {
      setError(t('PersonFacesGallery.Error.AddFace'));
      console.error(err);
      setLoading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddFace = async () => {
    fileInputRef.current?.click();
  };

  const handleDeleteSelected = async () => {
    if (selectedFaces.size === 0) {
      alert(t('PersonFacesGallery.Alert.SelectFacesToDelete'));
      return;
    }
    if (!window.confirm(t('PersonFacesGallery.Confirm.DeleteFaces', { count: selectedFaces.size }))) {
      return;
    }

    try {
      setLoading(true);
      await api.deleteFaces(Array.from(selectedFaces));
      setSelectedFaces(new Set());
      await fetchFaces();
    } catch (err) {
      setError(t('PersonFacesGallery.Error.DeleteFaces'));
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
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={handleAddFace}
          disabled={loading}
        >
          {loading ? t('PersonFacesGallery.Button.LoadingPhoto') : t('PersonFacesGallery.Button.AddPhoto')}
        </Button>
        <input
          type="file"
          accept="image/*"
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
          {t('PersonFacesGallery.Button.DeleteSelected', { count: selectedFaces.size })}
        </Button>
        <Button
          variant="outlined"
          startIcon={selectedFaces.size === faces.length && faces.length > 0 ? <DeselectIcon /> : <SelectAllIcon />}
          onClick={handleSelectAll}
          disabled={loading || faces.length === 0}
        >
          {selectedFaces.size === faces.length && faces.length > 0 ? t('PersonFacesGallery.Button.DeselectAll') : t('PersonFacesGallery.Button.SelectAll')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<GridCheckCircleIcon />}
          onClick={handleMarkAsMain}
          disabled={selectedFaces.size !== 1 || loading}
        >
          {t('PersonFacesGallery.Button.SetMainPhoto')}
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>{t('PersonFacesGallery.Loading')}</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" align="center" variant="h6">
          {error}
        </Typography>
      )}

      {!loading && !error && faces.length === 0 && (
        <Typography variant="h6" align="center" color="text.secondary">
          {t('PersonFacesGallery.NoFaces')}
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
                    boxShadow: isSelected ? '0 0 0 3px blue' : 'none',
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
                    sx={{ m: 0, p: 0 }}
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
                        objectFit: 'contain',
                        cursor: 'pointer',
                        maxHeight: 200,
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexShrink: 0 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {face.comment ? face.comment + ' ' + face.sortord : t('PersonFacesGallery.NoComment')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

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
                alt={t('PersonFacesGallery.Alt.LargeImage')}
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
              X
            </IconButton>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default PersonFacesGallery;
