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
    Paper
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface CameraType {
    type: 'IP' | 'ANALOG' | 'PTZ';
    count: number;
}

// параметри заказу (кількість місяців, кількість камер, їх типів
interface OrderParam {
    periodMon: number;
    config: CameraType[];
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

const cameraTypes: Array<CameraType['type']> = ['IP', 'ANALOG', 'PTZ'];
const currencyList: Array<string> = ['EUR', 'USD', 'UAH']; // renamed to avoid shadowing

interface OrderFormProps {
    onClose: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onClose }) => {
    const [periodMon, setPeriodMon] = useState(3);
    const [cameras, setCameras] = useState<CameraType[]>([
        { type: 'IP', count: 1 }
    ]);
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState('UAH'); // new state

    // Пример вычисления суммы (можно заменить своей логикой)
    useEffect(() => {
        let sum = 0;
        cameras.forEach(cam => {
            let price = cam.type === 'IP' ? 100 : cam.type === 'ANALOG' ? 80 : 150;
            sum += price * cam.count * periodMon;
        });
        setAmount(sum);
    }, [cameras, periodMon]);

    const handleCameraChange = (idx: number, field: keyof CameraType, value: any) => {
        setCameras(prev =>
            prev.map((cam, i) =>
                i === idx ? { ...cam, [field]: value } : cam
            )
        );
    };

    const addCamera = () => {
        setCameras([...cameras, { type: 'IP', count: 1 }]);
    };

    const removeCamera = (idx: number) => {
        setCameras(cameras.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Здесь можно отправить order на сервер или вызвать оплату
        alert('Оплата: ' + amount + ' ' + currency);
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 420, mx: "auto", p: 3, mt: 4 }}>
            <form onSubmit={handleSubmit}>
                <Typography variant="h5" gutterBottom>
                    Формування ордера
                </Typography>
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
                <Box mb={2}>
                    <Typography variant="subtitle1" gutterBottom>Камери:</Typography>
                    {cameras.map((cam, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                            <FormControl size="small" sx={{ minWidth: 110 }}>
                                <InputLabel>Тип</InputLabel>
                                <Select
                                    value={cam.type}
                                    label="Тип"
                                    onChange={e => handleCameraChange(idx, 'type', e.target.value as CameraType['type'])}
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
                            {cameras.length > 1 && (
                                <IconButton
                                    color="error"
                                    onClick={() => removeCamera(idx)}
                                    size="small"
                                    aria-label="Видалити"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    <Button
                        variant="outlined"
                        onClick={addCamera}
                        sx={{ mt: 1 }}
                    >
                        Додати камеру
                    </Button>
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
            </form>
        </Paper>
    );
};

export default OrderForm;