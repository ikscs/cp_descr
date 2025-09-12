import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    Checkbox,
    FormControlLabel,
    Stack,
} from "@mui/material";
import { api, BasePrice, CameraCatg } from "./api";
import { useFetch } from "../../hooks/useFetch";
import InfoModal from './components/InfoModal';
import { useTranslation } from 'react-i18next';

interface AnaliticType {
    type: 'Embedding' | 'Face Detection' | 'Demography';
    count: number;
}

interface OrderParam {
    periodMon: number;
    config: AnaliticType[];
}

interface Order {
    app_id: string;
    order_id: string;
    amount: number;
    currency: string;
    description: string;
    param: OrderParam;
    liqpayData?: object;
    dt: Date;
    type: 'liqpay'|'manual'|'bank';
}

interface OrderFormProps {
    onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [periodMon, setPeriodMon] = useState(3);
    const [camerasAnalitic, setCamerasAnalitic] = useState<number>(1);
    const [camerasSimple, setCamerasSimple] = useState<number>(0);
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState('UAH');
    const [orderId, setOrderId] = useState('ORDER_ID_123');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const { data: cameraCatg, loading: cameraCatgLoading, error: cameraCatgError } = useFetch<CameraCatg[]>(api.getCameraCatg, []);
    const { data: basePrice, loading: basePriceLoading, error: basePriceError } = useFetch<BasePrice[]>(api.getBasePrice, []);
    const [ analiticCoeff, setAnaliticCoeff ] = useState(1.0);
    const [ simpleCoeff, setSimpleCoeff ] = useState(0.5);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);

    const handleOpen = () => setIsModalOpen(true);
    const handleAccept = () => {
        setIsAgreementAccepted(true);
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsAgreementAccepted(false);
        setIsModalOpen(false);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsAgreementAccepted(event.target.checked);
    };

    useEffect(() => {
        cameraCatg.forEach(rec => {
            if (rec.type === 'analitic') {
                setAnaliticCoeff(rec.coeff);
            }
            if (rec.type === 'simple') {
                setSimpleCoeff(rec.coeff);
            }
        });
    }, [cameraCatg]);

    useEffect(() => {
        const basePriceRecord = basePrice.find(rec => rec.crn === currency);
        if (basePriceRecord?.value) {
            const sum = (camerasAnalitic * analiticCoeff + camerasSimple * simpleCoeff) * basePriceRecord.value;
            setAmount(sum * periodMon);
        } else {
            setAmount(0);
        }
    }, [camerasAnalitic, camerasSimple, periodMon, currency, basePrice, analiticCoeff, simpleCoeff]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isAgreementAccepted) {
            alert(t('OrderForm.PleaseAcceptAgreement'));
            return;
        }

        const param = {periodMon, camerasAnalitic, camerasSimple, currency};
        const _orderId = 1;
        const order = await api.createOrder(amount, currency, t('OrderForm.Description', { orderId: _orderId }), param);

        if (!!order) {
            const url = `https://cnt.theweb.place/api/billing/pay_liqpay/?order_id=${order.order_id}`;
            window.open(url, '_blank');
            setSuccessMessage(t('OrderForm.PaymentStartedMessage')); 
            setIsChecking(true);
            setOrderId(order.order_id);
        } else {
            alert(t('OrderForm.FailedToCreateOrder'));
        }
    };

    useEffect(() => {
        if (!isChecking) return;
        const intervalId = setInterval(async () => {
            try {
                const data = await api.getOrderStatus(orderId);
                if (data.result === 'ok') {
                    setSuccessMessage(t('OrderForm.PaymentSuccessMessage', { orderId }));
                    setIsChecking(false);
                    clearInterval(intervalId);
                    setPaymentDone(true);
                    onClose();
                }
                if (data.err_description) {
                    setSuccessMessage(data.err_description);
                }
            } catch (err) {
                console.error(t('OrderForm.ErrorFetchingStatus'), err);
            }
        }, 5000);
        return () => clearInterval(intervalId);
    }, [isChecking, orderId, t, onClose]);

    return (
        <Paper elevation={3} sx={{ maxWidth: 420, mx: "auto", p: 3, mt: 4 }}>
            <form onSubmit={handleSubmit}>
                <Typography variant="h5" gutterBottom>
                    {t('OrderForm.Title')}
                </Typography>
                <Box mb={2} mt={4} >
                    <TextField
                        label={t('OrderForm.PeriodLabel')}
                        type="number"
                        size="small"
                        inputProps={{ min: 1 }}
                        value={periodMon}
                        onChange={e => setPeriodMon(Number(e.target.value || '0'))}
                        sx={{ width: 150 }}
                    />
                </Box>
                <Box mb={2}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>{t('OrderForm.CurrencyLabel')}</InputLabel>
                        <Select
                            value={currency}
                            label={t('OrderForm.CurrencyLabel')}
                            onChange={e => setCurrency(e.target.value)}
                        >
                            {basePrice.map(rec => (
                                <MenuItem key={rec.crn} value={rec.crn}>{rec.crn}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box mb={2} p={2} border={1} borderRadius={2} borderColor="grey.400">
                    <Typography variant="subtitle1" mb={2}>
                        {t('OrderForm.CamerasTitle')}
                    </Typography>
                    <Box mb={2}>
                        <TextField
                            label={t('OrderForm.AnaliticCamerasLabel')}
                            type="number"
                            size="small"
                            inputProps={{ min: 0 }}
                            value={camerasAnalitic}
                            onChange={e => setCamerasAnalitic(Number(e.target.value))}
                            sx={{ width: 150 }}
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label={t('OrderForm.SimpleCamerasLabel')}
                            type="number"
                            size="small"
                            inputProps={{ min: 0 }}
                            value={camerasSimple}
                            onChange={e => setCamerasSimple(Number(e.target.value))}
                            sx={{ width: 150 }}
                        />
                    </Box>
                </Box>
                <Box my={2}>
                    <Typography variant="h6">
                        {t('OrderForm.TotalAmount', { amount, currency })}
                    </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isAgreementAccepted}
                                onChange={handleCheckboxChange}
                            />
                        }
                        label={
                            <Typography
                                onClick={handleOpen}
                                sx={{
                                    cursor: 'pointer',
                                    color: 'primary.main',
                                    textDecoration: 'underline',
                                    '&:hover': {
                                        textDecoration: 'none',
                                    },
                                }}
                            >
                                {t('OrderForm.AgreementLink')}
                            </Typography>
                        }
                    />
                </Box>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ fontWeight: "bold", px: 4 }}
                        disabled={!isAgreementAccepted || paymentDone}
                    >
                        {t('OrderForm.PayButton')}
                    </Button>
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="outlined"
                        color="secondary"
                    >
                        {t('OrderForm.ExitButton')}
                    </Button>
                </Stack>

                {isChecking && !successMessage && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {t('OrderForm.CheckingPayment')}
                    </Typography>
                )}
                {successMessage && (
                    <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
                        {successMessage}
                    </Typography>
                )}
            </form>
            
            <InfoModal
                open={isModalOpen}
                onCancel={handleCancel}
                onAccept={handleAccept}
            />
        </Paper>
    );
};

export default OrderForm;
