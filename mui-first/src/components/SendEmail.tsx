import React, { useRef, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useForm, SubmitHandler } from 'react-hook-form';
import emailjs from 'emailjs-com';
import Typography from '@mui/material/Typography';

interface SendEmailProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  subject: string;
  message: string;
}

const SendEmail: React.FC<SendEmailProps> = ({ open, onClose }) => {
  const { register, handleSubmit } = useForm<FormValues>();
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    emailjs.init('YOUR_USER_ID'); // Замените на ваш USER ID
  }, []);

  const sendEmail = (data: FormValues) => {
    if (form.current) {
      emailjs
        .sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form.current) // Замените на ваши SERVICE ID и TEMPLATE ID
        .then(
          (result) => {
            console.log(result.text);
            onClose();
          },
          (error) => {
            console.log(error.text);
            setError('Ошибка отправки сообщения. Попробуйте позже.');
          }
        );
    }
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    sendEmail(data);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Обратная связь</DialogTitle>
      <DialogContent>
        <form ref={form} onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('subject')} label="Тема" variant="outlined" fullWidth margin="normal" />
          <TextareaAutosize {...register('message')} minRows={5} placeholder="Сообщение" style={{ width: '100%', marginTop: '16px' }} />
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Отмена
            </Button>
            <Button type="submit" color="primary">
              Отправить
            </Button>
          </DialogActions>
        </form>
        {error && <Typography color="error">{error}</Typography>} {/* Отображаем ошибку */}
      </DialogContent>
    </Dialog>
  );
};

export default SendEmail;