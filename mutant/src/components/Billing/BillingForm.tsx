import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Box, Modal } from '@mui/material';
import OrderForm from './OrderForm4';
import { api, Balance } from './api';
import { useTranslation } from 'react-i18next';

function calculateCurrentBalance(balance: Balance, currentDate: Date): number {
  if (typeof balance.value === 'string') {
    balance.value = parseFloat(balance.value);
  }
  if (typeof balance.value !== 'number' || isNaN(balance.value)) 
    return 0;

  if (!balance.startDate || !balance.endDate) {
    return balance.value;
  }
  const start = new Date(balance.startDate).getTime();
  const end = new Date(balance.endDate).getTime();
  const now = currentDate.getTime();

  if (now < start) {
    return balance.value;
  }
  if (now > end) {
    return 0;
  }

  const totalDuration = end - start;
  const elapsedDuration = now - start;

  const usedValue = balance.value * (elapsedDuration / totalDuration);
  const remainingBalance = balance.value - usedValue;
  
  return parseFloat(remainingBalance.toFixed(2));
}

function formatDateTime(date: Date | undefined) {
  
  if (!date) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const BalanceForm: React.FC = () => {
  const { t } = useTranslation();

  const [balance, setBalance] = useState<Balance | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const today = new Date(); 

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.getBalance();
        if (!res || res.value === undefined) {
          console.error(t('BalanceForm.NoBalanceError'));
          return;
        }
        setBalance(res);
      } catch (error) {
        console.error(t('BalanceForm.LoadingError'), error);
        setBalance(null);
      }
    };
    fetchBalance();
  }, [t]);

  useEffect(() => {
    if (!balance) return;
    setCurrentBalance(calculateCurrentBalance(balance, new Date()));
  }, [balance]);

  const handleReplenishClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!balance) return (<div>{t('BalanceForm.Loading')}</div>);

  return (
    <>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {t('BalanceForm.CardTitle')}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {t('BalanceForm.AsOf')} {formatDateTime(today)}
          </Typography>
          <Typography variant="h4" component="div">
            {currentBalance.toFixed(2)} {balance.crn}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {t('BalanceForm.PaidUntil')} {formatDateTime(balance.endDate)}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleReplenishClick}>
              {t('BalanceForm.ReplenishButton')}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: 400,
        }}>
          <OrderForm onClose={handleClose} />
        </Box>
      </Modal>
    </>
  );
};

export default BalanceForm;