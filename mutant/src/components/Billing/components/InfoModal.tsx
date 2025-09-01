import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import InfoComponent from './InfoComponent';

// interface InfoModalProps {
//   open: boolean;
//   onClose: () => void;
// }

interface InfoModalProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const InfoModal: React.FC<InfoModalProps> = ({ open, onAccept, onCancel }) => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Подробная информация
        </Typography>
        <div id="modal-modal-description">
          <InfoComponent />
        </div>
        {/* <Button onClick={onClose} variant="contained" color="primary">
          Закрыть
        </Button> */}
        {/* Используем Stack для размещения кнопок горизонтально */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
          {/* Кнопка "Отмена" */}
          <Button onClick={onCancel} variant="outlined" color="secondary">
            Отмена
          </Button>
          
          {/* Кнопка "Принимаю" */}
          <Button onClick={onAccept} variant="contained" color="primary">
            Принимаю
          </Button>
        </Stack>      
        </Box>
    </Modal>
  );
};

export default InfoModal;