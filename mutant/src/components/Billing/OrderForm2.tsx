// использовать типы аналитики
import { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    IconButton,
    Paper,
    FormControlLabel,
    Switch
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "./api";

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
    description: string; // сплата за послуги відеоаналізу
    param: OrderParam;
    liqpayData?: object; // Дополнительные данные для LiqPay
    dt: Date;
    type: 'liqpay'|'manual'|'bank';
}

const cameraTypes: Array<AnaliticType['type']> = ['Embedding', 'Face Detection', 'Demography',];
const currencyList: Array<string> = ['EUR', 'USD', 'UAH']; // renamed to avoid shadowing

interface OrderFormProps {
    onClose: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onClose }) => {
    const [periodMon, setPeriodMon] = useState(3);
    const [cameras, setCameras] = useState<AnaliticType[]>([
        { type: 'Embedding', count: 1 },
        { type: 'Face Detection', count: 1 },
        { type: 'Demography', count: 1 },
    ]);
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState('UAH'); // new state
    const [isApproximateCalculation, setIsApproximateCalculation] = useState(false);
    const [orderId, setOrderId] = useState('ORDER_ID_123');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Пример вычисления суммы (можно заменить своей логикой)
    useEffect(() => {
        if (!isApproximateCalculation) {
            setAmount(1800); // Фиксированная сумма для ориентировочного расчета
            // setCameras([]); // Очищаем камеры, чтобы не передавать лишние данные
        } else {
            let sum = 0;
            cameras.forEach(cam => {
                let price = cam.type === 'Embedding' 
                ? 100 : cam.type === 'Face Detection' 
                ? 80 : 150;
                sum += price * cam.count * periodMon;
            });
            setAmount(sum);
        }
    }, [cameras, periodMon, isApproximateCalculation]);

    const handleCameraChange = (idx: number, field: keyof AnaliticType, value: any) => {
        setCameras(prev =>
            prev.map((cam, i) =>
                i === idx ? { ...cam, [field]: value } : cam
            )
        );
    };

    // const addCamera = () => {
    //     setCameras([...cameras, { type: 'IP', count: 1 }]);
    // };

    const removeCamera = (idx: number) => {
        setCameras(cameras.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const order = api.createOrder(orderId, amount, currency, `Оплата за відеоаналіз ордер N ${orderId}`);

        if (!!order) {
            const url = `https://cnt.theweb.place/api/billing/pay_liqpay/?order_id=${orderId}`;
            window.open(url, '_blank'); // открывает в новой вкладке    
            setSuccessMessage('Оплата розпочата. Після завершення перевірте статус замовлення.'); 
            setIsChecking(true); // запускаем фоновую проверку
        } else {
            alert('Не удалось создать заказ');
        }
    };

    const RefreshStatus = async () => {
        try {
            const data = await api.getOrderStatus(orderId);
            setSuccessMessage(data.result || data.err_description);
        } catch (err) {
            console.error('Ошибка при получении статуса оплаты', err);
        }
    }

    // Периодический опрос статуса
    useEffect(() => {
        if (!isChecking) return;

        const intervalId = setInterval(async () => {
            try {
                const data = await api.getOrderStatus(orderId);
                if (data.result === 'ok') {
                    setSuccessMessage('✅ Оплата успішно завершена');
                    setIsChecking(false);
                    clearInterval(intervalId);
                }
                if (data.err_description) {
                    setSuccessMessage(data.err_description);
                    // setIsChecking(false);
                    // clearInterval(intervalId);
                }
            } catch (err) {
                console.error('Ошибка при получении статуса оплаты', err);
            }
        }, 5000); // проверяем каждые 5 сек

        return () => clearInterval(intervalId);
    }, [isChecking, orderId]);    

    return (
        <Paper elevation={3} sx={{ maxWidth: 420, mx: "auto", p: 3, mt: 4 }}>
            <form onSubmit={handleSubmit}>
                <Typography variant="h5" gutterBottom>
                    Формування ордера
                </Typography>
                <Box mb={2}>
                    <TextField
                        label="Ордер"
                        type="string"
                        size="small"
                        inputProps={{ min: 1 }}
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                        sx={{ width: 150 }}
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        label="Кількість місяців"
                        type="number"
                        size="small"
                        inputProps={{ min: 1 }}
                        value={periodMon}
                        onChange={e => setPeriodMon(Number(e.target.value))}
                        sx={{ width: 150 }}
                    />
                </Box>
                <Box mb={2}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Валюта</InputLabel>
                        <Select
                            value={currency}
                            label="Валюта"
                            onChange={e => setCurrency(e.target.value)}
                        >
                            {currencyList.map(cur => (
                                <MenuItem key={cur} value={cur}>{cur}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <FormControlLabel
                        control={
                            <Switch
                                checked={isApproximateCalculation}
                                onChange={e => setIsApproximateCalculation(e.target.checked)}
                            />
                        }
                        label="Орієнтовний розрахунок"
                        labelPlacement="start"
                />

                <Box mb={2}>
                    <Typography variant="subtitle1" gutterBottom>Камери:</Typography>
                    {cameras.map((cam, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Тип Аналітики</InputLabel>
                                <Select
                                    value={cam.type}
                                    label="Тип Аналітики"
                                    onChange={e => handleCameraChange(idx, 'type', e.target.value as AnaliticType['type'])}
                                >
                                    {cameraTypes.map(type => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Кількість"
                                type="number"
                                size="small"
                                inputProps={{ min: 1 }}
                                value={cam.count}
                                onChange={e => handleCameraChange(idx, 'count', Number(e.target.value))}
                                sx={{ width: 90 }}
                            />
                            {/* {cameras.length > 1 && (
                                <IconButton
                                    color="error"
                                    onClick={() => removeCamera(idx)}
                                    size="small"
                                    aria-label="Видалити"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )} */}
                        </Box>
                    ))}
                    {/* <Button
                        variant="outlined"
                        onClick={addCamera}
                        sx={{ mt: 1 }}
                    >
                        Додати камеру
                    </Button> */}
                </Box>
                <Box my={2}>
                    <Typography variant="h6">
                        Сума до сплати: {amount} {currency}
                    </Typography>
                </Box>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ fontWeight: "bold", px: 4 }}
                >
                    Оплатити
                </Button>
                <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    sx={{ fontWeight: "bold", px: 4 }}
                    onClick={onClose}
                    style={{ marginLeft: '10px' }}
                >
                    Вийти
                </Button>
                {/* <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    sx={{ fontWeight: "bold", px: 3 }}
                    onClick={RefreshStatus}
                    style={{ marginLeft: '10px' }}
                >
                    Статус
                </Button> */}

                {isChecking && !successMessage && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Перевіряємо оплату...
                    </Typography>
                )}              

                {successMessage && (
                <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
                    {successMessage}
                </Typography>
    )}
            </form>
        </Paper>
    );
};

export default OrderForm;