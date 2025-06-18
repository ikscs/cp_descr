import React from 'react';
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonFacesGallery from '../PersonFaces/PersonFacesGallery';

interface PersonFacesProps {
  open: boolean;
  onClose: () => void;
  personId: number;
}

// Стили для модального окна (можно переиспользовать или адаптировать)
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'auto',
  maxWidth: '95vw', // Увеличим максимальную ширину
  maxHeight: '95vh', // Увеличим максимальную высоту
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  outline: 'none',
  display: 'flex',
  flexDirection: 'column', // Для размещения заголовка и галереи
  alignItems: 'center',
  borderRadius: 1,
};

const PersonFaces: React.FC<PersonFacesProps> = ({
  open,
  onClose,
  personId,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1, // Убедимся, что кнопка поверх контента
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Фото персоны (ID: {personId})
          </Typography>
          {/* PersonFacesGallery будет занимать оставшееся пространство */}
          <Box sx={{ flexGrow: 1, width: '100%', overflowY: 'auto' }}>
             <PersonFacesGallery personId={personId} columns={3} /> {/* Можно настроить количество колонок */}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default PersonFaces;