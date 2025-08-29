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
import { useTranslation } from 'react-i18next'; // Імпортуємо useTranslation

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
  maxWidth: '95vw',
  maxHeight: '95vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: 1,
};

const PersonFaces: React.FC<PersonFacesProps> = ({
  open,
  onClose,
  personId,
}) => {
  const { t } = useTranslation(); // Викликаємо хук перекладу

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
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {t('PersonFaces.Title', { personId })} {/* Використовуємо ключ перекладу з динамічним значенням */}
          </Typography>
          <Box sx={{ flexGrow: 1, width: '100%', overflowY: 'auto' }}>
            <PersonFacesGallery personId={personId} columns={3} />
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};


export default PersonFaces;